import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { AnalyticsSummary } from '@/types'

export async function GET(request: NextRequest) {
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const linkId = searchParams.get('link_id') // Optional: if provided, filters for single link
  const range = searchParams.get('range') || '7d' // 24h, 7d, 30d

  // Verify ownership of the requested link if linkId is specified
  if (linkId) {
    const { data: linkOwner } = await supabase
      .from('links')
      .select('id')
      .eq('id', linkId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!linkOwner) {
      return NextResponse.json({ success: false, error: 'Link not found or access denied' }, { status: 404 })
    }
  }

  // Calculate start timestamp based on range
  const now = new Date()
  let startTime: Date
  let groupFormat: 'hour' | 'day' = 'day'

  if (range === '24h') {
    startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    groupFormat = 'hour'
  } else if (range === '30d') {
    startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    groupFormat = 'day'
  } else {
    // default 7d
    startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    groupFormat = 'day'
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Fetch click events within the 30d window
  // Note: RLS ensures users only query events for links they own
  let query = supabase
    .from('click_events')
    .select('id, link_id, created_at, country, device, browser, os, referrer')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  if (linkId) {
    query = query.eq('link_id', linkId)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Analytics query error:', error)
    return NextResponse.json({ success: false, error: 'Failed to query analytics' }, { status: 500 })
  }

  const allEvents = (events as unknown as Database['public']['Tables']['click_events']['Row'][]) || []

  // Aggregate metrics
  let clicksToday = 0
  let clicks7d = 0
  let clicks30d = 0

  const timelineMap = new Map<string, number>()
  const referrerMap = new Map<string, number>()
  const countryMap = new Map<string, number>()
  const deviceMap = new Map<string, number>()
  const browserMap = new Map<string, number>()
  const osMap = new Map<string, number>()

  for (const ev of allEvents) {
    const evTime = new Date(ev.created_at)

    // Window counts
    if (evTime >= todayStart) clicksToday++
    if (evTime >= sevenDaysAgo) clicks7d++
    if (evTime >= thirtyDaysAgo) clicks30d++

    // Only include in breakdown if within selected range
    if (evTime >= startTime) {
      // Timeline key
      let timelineKey: string
      if (groupFormat === 'hour') {
        timelineKey = evTime.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }) + ':00'
      } else {
        timelineKey = evTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      timelineMap.set(timelineKey, (timelineMap.get(timelineKey) || 0) + 1)

      // Referrer
      const ref = ev.referrer || 'Direct / None'
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1)

      // Country
      const country = ev.country || 'Unknown'
      countryMap.set(country, (countryMap.get(country) || 0) + 1)

      // Device
      const device = ev.device || 'Desktop'
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1)

      // Browser
      const browser = ev.browser || 'Other'
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1)

      // OS
      const os = ev.os || 'Other'
      osMap.set(os, (osMap.get(os) || 0) + 1)
    }
  }

  // Get total clicks from links table (so it reflects overall link count accurately)
  let totalClicks = allEvents.length
  if (linkId) {
    const { data: link } = await supabase.from('links').select('click_count').eq('id', linkId).maybeSingle()
    if (link) totalClicks = (link as { click_count: number }).click_count
  } else {
    const { data: userLinks } = await supabase.from('links').select('click_count').eq('user_id', user.id)
    if (userLinks) {
      totalClicks = (userLinks as Array<{ click_count: number }>).reduce((acc, curr) => acc + (curr.click_count || 0), 0)
    }
  }

  // Build sorted breakdowns helper
  const toSortedBreakdown = (map: Map<string, number>, keyName: string) => {
    const totalInRange = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1
    return Array.from(map.entries())
      .map(([key, count]) => ({
        [keyName]: key,
        count,
        percentage: Math.round((count / totalInRange) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  const timeline = Array.from(timelineMap.entries()).map(([date, clicks]) => ({
    date,
    clicks,
  }))

  const analyticsSummary: AnalyticsSummary = {
    total_clicks: totalClicks,
    clicks_today: clicksToday,
    clicks_7d: clicks7d,
    clicks_30d: clicks30d,
    timeline,
    top_referrers: toSortedBreakdown(referrerMap, 'referrer') as AnalyticsSummary['top_referrers'],
    top_countries: toSortedBreakdown(countryMap, 'country') as AnalyticsSummary['top_countries'],
    devices: toSortedBreakdown(deviceMap, 'device') as AnalyticsSummary['devices'],
    browsers: toSortedBreakdown(browserMap, 'browser') as AnalyticsSummary['browsers'],
    operating_systems: toSortedBreakdown(osMap, 'os') as AnalyticsSummary['operating_systems'],
  }

  return NextResponse.json({
    success: true,
    data: analyticsSummary,
    range,
  })
}
