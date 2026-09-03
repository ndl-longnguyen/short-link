import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { validateDestinationUrl } from '@/lib/security/url-validator'
import { validateSlug } from '@/lib/security/slug-generator'
import { hashPassword } from '@/lib/security/password'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

const updateLinkSchema = z.object({
  destination_url: z.string().min(1).optional(),
  slug: z.string().optional(),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().optional(),
  expires_at: z.string().nullable().optional(),
  max_clicks: z.number().int().positive().nullable().optional(),
  password: z.string().nullable().optional(),
  redirect_type: z.union([z.literal(301), z.literal(302), z.literal(307)]).optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { data: link, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !link) {
    return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 })
  }

  const linkRow = link as Database['public']['Tables']['links']['Row']
  return NextResponse.json({
    success: true,
    data: {
      ...linkRow,
      is_password_protected: !!linkRow.password_hash,
      password_hash: undefined,
    },
  })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parseResult = updateLinkSchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: parseResult.error.issues[0]?.message || 'Invalid update parameters' },
      { status: 400 }
    )
  }

  const adminClient = createAdminClient()

  // Verify ownership
  const { data: currentLink } = await adminClient
    .from('links')
    .select('id, slug, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!currentLink) {
    return NextResponse.json({ success: false, error: 'Link not found or access denied' }, { status: 404 })
  }

  const updates: Partial<Database['public']['Tables']['links']['Update']> = {
    updated_at: new Date().toISOString(),
  }

  const {
    destination_url,
    slug,
    title,
    description,
    is_active,
    expires_at,
    max_clicks,
    password,
    redirect_type,
  } = parseResult.data

  // Validate destination_url if changed
  if (destination_url !== undefined) {
    const { data: blockedDomains } = await adminClient.from('blocked_domains').select('domain')
    const extraBlocked = (blockedDomains || []).map(b => b.domain)
    const urlValidation = validateDestinationUrl(destination_url, extraBlocked)
    if (!urlValidation.isValid || !urlValidation.normalizedUrl) {
      return NextResponse.json({ success: false, error: urlValidation.error }, { status: 400 })
    }
    updates.destination_url = urlValidation.normalizedUrl
  }

  // Validate custom slug if changed
  if (slug !== undefined && slug !== currentLink.slug) {
    const slugValidation = validateSlug(slug)
    if (!slugValidation.isValid || !slugValidation.normalizedSlug) {
      return NextResponse.json({ success: false, error: slugValidation.error }, { status: 400 })
    }

    const { data: existing } = await adminClient
      .from('links')
      .select('id')
      .eq('slug', slugValidation.normalizedSlug)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, error: `Slug "${slugValidation.normalizedSlug}" is already taken` }, { status: 409 })
    }

    updates.slug = slugValidation.normalizedSlug
  }

  if (title !== undefined) updates.title = title
  if (description !== undefined) updates.description = description
  if (is_active !== undefined) updates.is_active = is_active
  if (expires_at !== undefined) updates.expires_at = expires_at ? new Date(expires_at).toISOString() : null
  if (max_clicks !== undefined) updates.max_clicks = max_clicks
  if (redirect_type !== undefined) updates.redirect_type = redirect_type

  if (password !== undefined) {
    if (password === null || password.trim() === '') {
      updates.password_hash = null
    } else {
      updates.password_hash = hashPassword(password)
    }
  }

  const { data: updatedLink, error: updateError } = await adminClient
    .from('links')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError || !updatedLink) {
    console.error('Update link error:', updateError)
    return NextResponse.json({ success: false, error: 'Failed to update link' }, { status: 500 })
  }

  const updatedRow = updatedLink as Database['public']['Tables']['links']['Row']
  return NextResponse.json({
    success: true,
    data: {
      ...updatedRow,
      is_password_protected: !!updatedRow.password_hash,
      password_hash: undefined,
    },
  })
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500 })
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {},
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Delete link error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete link' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Link deleted successfully' })
}
