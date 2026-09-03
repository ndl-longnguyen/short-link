import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateDestinationUrl } from '@/lib/security/url-validator'
import { generateRandomSlug, validateSlug } from '@/lib/security/slug-generator'
import { hashPassword } from '@/lib/security/password'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

const createLinkSchema = z.object({
  destination_url: z.string().min(1, 'Destination URL is required'),
  custom_slug: z.string().optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  expires_at: z.string().nullable().optional(),
  max_clicks: z.number().int().positive().nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  redirect_type: z.union([z.literal(301), z.literal(302), z.literal(307)]).optional().default(307),
})

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers)

  // 1. Identify user via session cookies
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  let userId: string | null = null

  if (supabaseUrl && supabaseAnonKey) {
    const supabaseUserClient = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })
    const { data: { user } } = await supabaseUserClient.auth.getUser()
    if (user) {
      userId = user.id
    }
  }

  // 2. Rate limiting: stricter for anonymous users (15/hr) than logged-in (120/hr)
  const limit = userId ? 120 : 15
  const windowSeconds = 3600
  const rl = rateLimit(`shorten:${userId || clientIp}`, limit, windowSeconds)

  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Rate limit reached. Please wait ${rl.resetInSeconds} seconds before creating more links.`,
      },
      { status: 429 }
    )
  }

  // 3. Parse and validate JSON payload
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON request payload' }, { status: 400 })
  }

  const parseResult = createLinkSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'Invalid input data' },
      { status: 400 }
    )
  }

  const {
    destination_url,
    custom_slug,
    title,
    description,
    expires_at,
    max_clicks,
    password,
    redirect_type,
  } = parseResult.data

  const adminClient = createAdminClient()

  // 4. Fetch custom blocked domains to enforce safety
  const { data: blockedDomainsData } = await adminClient
    .from('blocked_domains')
    .select('domain')

  const extraBlockedDomains = (blockedDomainsData || []).map(b => b.domain)

  // 5. Strict URL and SSRF validation
  const urlValidation = validateDestinationUrl(destination_url, extraBlockedDomains)
  if (!urlValidation.isValid || !urlValidation.normalizedUrl) {
    return NextResponse.json(
      { success: false, error: urlValidation.error || 'Destination URL is not valid or allowed' },
      { status: 400 }
    )
  }

  const normalizedUrl = urlValidation.normalizedUrl

  // 6. Handle slug (custom or auto-generated)
  let chosenSlug: string

  if (custom_slug && custom_slug.trim().length > 0) {
    const slugValidation = validateSlug(custom_slug)
    if (!slugValidation.isValid || !slugValidation.normalizedSlug) {
      return NextResponse.json(
        { success: false, error: slugValidation.error || 'Invalid custom slug' },
        { status: 400 }
      )
    }

    chosenSlug = slugValidation.normalizedSlug

    // Check if custom slug is already taken
    const { data: existing } = await adminClient
      .from('links')
      .select('id')
      .eq('slug', chosenSlug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { success: false, error: `The custom slug "${chosenSlug}" is already in use` },
        { status: 409 }
      )
    }
  } else {
    // Generate unique random slug with collision safety loop
    let attempts = 0
    let uniqueSlug = ''
    while (attempts < 5) {
      const candidate = generateRandomSlug(6)
      const { data: existing } = await adminClient
        .from('links')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()

      if (!existing) {
        uniqueSlug = candidate
        break
      }
      attempts++
    }

    if (!uniqueSlug) {
      return NextResponse.json(
        { success: false, error: 'Could not allocate unique slug. Please try again.' },
        { status: 500 }
      )
    }
    chosenSlug = uniqueSlug
  }

  // 7. Password hash if provided
  let passwordHash: string | null = null
  if (password && password.trim().length > 0) {
    passwordHash = hashPassword(password)
  }

  // 8. Insert into links table
  const insertPayload = {
    user_id: userId,
    slug: chosenSlug,
    destination_url: normalizedUrl,
    title: title?.trim() || null,
    description: description?.trim() || null,
    is_active: true,
    expires_at: expires_at ? new Date(expires_at).toISOString() : null,
    max_clicks: max_clicks ?? null,
    click_count: 0,
    redirect_type,
    password_hash: passwordHash,
  }

  const { data: newLink, error: insertError } = await adminClient
    .from('links')
    .insert(insertPayload)
    .select('id, user_id, slug, destination_url, title, description, is_active, expires_at, max_clicks, click_count, redirect_type, created_at, updated_at')
    .single()

  if (insertError || !newLink) {
    console.error('Failed to insert link:', insertError)
    return NextResponse.json(
      { success: false, error: 'Failed to create short link in database' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    data: newLink,
    is_password_protected: !!passwordHash,
  }, { status: 201 })
}

export async function GET(request: NextRequest) {
  // Query user's links with filtering and pagination
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, error: 'Supabase credentials missing' }, { status: 500 })
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')?.trim().toLowerCase()
  const status = searchParams.get('status') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  let query = supabase
    .from('links')
    .select('id, user_id, slug, destination_url, title, description, is_active, expires_at, max_clicks, click_count, redirect_type, password_hash, created_at, updated_at', { count: 'exact' })
    .eq('user_id', user.id)

  // Status filters
  const nowIso = new Date().toISOString()
  if (status === 'active') {
    query = query.eq('is_active', true).or(`expires_at.is.null,expires_at.gt.${nowIso}`)
  } else if (status === 'disabled') {
    query = query.eq('is_active', false)
  } else if (status === 'expired') {
    query = query.not('expires_at', 'is', null).lte('expires_at', nowIso)
  }

  // Search filter across slug, destination_url, title
  if (search) {
    query = query.or(`slug.ilike.%${search}%,destination_url.ilike.%${search}%,title.ilike.%${search}%`)
  }

  // Sorting
  if (sort === 'clicks') {
    query = query.order('click_count', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data: links, count, error } = await query

  if (error) {
    console.error('Error fetching user links:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch links' }, { status: 500 })
  }

  // Mask password hash before sending to client
  const linkRows = (links as unknown as Database['public']['Tables']['links']['Row'][]) || []
  const sanitizedLinks = linkRows.map(link => ({
    ...link,
    is_password_protected: !!link.password_hash,
    password_hash: undefined,
  }))

  return NextResponse.json({
    success: true,
    data: sanitizedLinks,
    total: count ?? 0,
    limit,
    offset,
  })
}
