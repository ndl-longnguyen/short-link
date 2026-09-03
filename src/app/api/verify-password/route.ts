import { NextResponse, type NextRequest, after } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/security/password'
import { rateLimit, getClientIp } from '@/lib/security/rate-limit'
import { parseClientInfo } from '@/lib/analytics/ua-parser'

const verifySchema = z.object({
  slug: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request.headers)
  const rl = rateLimit(`verify-pw:${clientIp}`, 5, 60) // 5 attempts per minute per IP

  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed password attempts. Please wait ${rl.resetInSeconds} seconds.`,
      },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parseResult = verifySchema.safeParse(body)
  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: 'Slug and password are required' },
      { status: 400 }
    )
  }

  const { slug, password } = parseResult.data
  const supabase = createAdminClient()

  const { data: link, error } = await supabase
    .from('links')
    .select('id, destination_url, is_active, expires_at, max_clicks, click_count, password_hash')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !link) {
    return NextResponse.json({ success: false, error: 'Link not found' }, { status: 404 })
  }

  if (!link.is_active) {
    return NextResponse.json({ success: false, error: 'This link is currently disabled' }, { status: 410 })
  }

  if (link.expires_at && new Date(link.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ success: false, error: 'This link has expired' }, { status: 410 })
  }

  if (link.max_clicks !== null && link.click_count >= link.max_clicks) {
    return NextResponse.json({ success: false, error: 'This link has reached its maximum click limit' }, { status: 410 })
  }

  if (!link.password_hash) {
    return NextResponse.json({ success: true, destination_url: link.destination_url })
  }

  const isMatch = verifyPassword(password, link.password_hash)
  if (!isMatch) {
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
  }

  const clientInfo = parseClientInfo(request.headers)

  // Asynchronously record click
  after(async () => {
    try {
      await supabase.rpc('increment_link_clicks', { target_link_id: link.id })
      await supabase.from('click_events').insert({
        link_id: link.id,
        country: clientInfo.country,
        city: clientInfo.city,
        device: clientInfo.device,
        browser: clientInfo.browser,
        os: clientInfo.os,
        referrer: clientInfo.referrer,
      })
    } catch (e) {
      console.error('Password verify click track error:', e)
    }
  })

  return NextResponse.json({
    success: true,
    destination_url: link.destination_url,
  })
}
