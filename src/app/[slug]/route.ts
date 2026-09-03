import { NextResponse, type NextRequest, after } from 'next/server'
import { isReservedSlug } from '@/lib/security/reserved-slugs'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseClientInfo } from '@/lib/analytics/ua-parser'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface RouteContext {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params

  if (!slug) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Pass through if the slug matches reserved keywords (system routes, assets)
  if (isReservedSlug(slug)) {
    return NextResponse.redirect(new URL(`/error?type=not-found&slug=${encodeURIComponent(slug)}`, request.url))
  }

  const supabase = createAdminClient()

  // High-performance lean projection: fetch only redirect-critical columns
  const { data: link, error } = await supabase
    .from('links')
    .select('id, destination_url, is_active, expires_at, max_clicks, click_count, redirect_type, password_hash')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !link) {
    return NextResponse.redirect(
      new URL(`/error?type=not-found&slug=${encodeURIComponent(slug)}`, request.url)
    )
  }

  // Guard 1: Disabled / Inactive link
  if (!link.is_active) {
    return NextResponse.redirect(new URL('/error?type=disabled', request.url))
  }

  // Guard 2: Expired link
  if (link.expires_at) {
    const expireDate = new Date(link.expires_at)
    if (expireDate.getTime() <= Date.now()) {
      return NextResponse.redirect(new URL('/error?type=expired', request.url))
    }
  }

  // Guard 3: Click limit reached
  if (link.max_clicks !== null && link.click_count >= link.max_clicks) {
    return NextResponse.redirect(new URL('/error?type=max-clicks', request.url))
  }

  // Guard 4: Password protection
  if (link.password_hash) {
    // Intermediate password verification without exposing destination URL
    return NextResponse.redirect(
      new URL(`/verify-password?slug=${encodeURIComponent(slug)}`, request.url)
    )
  }

  // Determine redirect HTTP status (301, 302, 307 - default 307)
  const redirectStatus = (link.redirect_type === 301 || link.redirect_type === 302 || link.redirect_type === 307)
    ? link.redirect_type
    : 307

  // Extract client analytics info from headers
  const clientInfo = parseClientInfo(request.headers)

  // Non-blocking background analytics execution via Next.js `after`
  // Ensures user gets redirected instantly without waiting for DB writes
  after(async () => {
    try {
      // 1. Atomic click increment via Postgres RPC (eliminates race conditions)
      await supabase.rpc('increment_link_clicks', { target_link_id: link.id })

      // 2. Insert privacy-safe click event record
      await supabase.from('click_events').insert({
        link_id: link.id,
        country: clientInfo.country,
        city: clientInfo.city,
        device: clientInfo.device,
        browser: clientInfo.browser,
        os: clientInfo.os,
        referrer: clientInfo.referrer,
      })
    } catch (err) {
      console.error(`[Analytics Error for link ${link.id}]:`, err)
    }
  })

  // Fast redirect with no-cache headers to ensure accurate dynamic analytics
  return NextResponse.redirect(link.destination_url, {
    status: redirectStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  })
}
