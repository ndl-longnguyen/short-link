import { Database } from './database'

export type LinkRow = Database['public']['Tables']['links']['Row']
export type LinkInsert = Database['public']['Tables']['links']['Insert']
export type LinkUpdate = Database['public']['Tables']['links']['Update']

export type ClickEventRow = Database['public']['Tables']['click_events']['Row']
export type ReportRow = Database['public']['Tables']['reports']['Row']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface LinkWithStats extends LinkRow {
  clicks_today?: number
  clicks_7d?: number
  clicks_30d?: number
}

export interface AnalyticsSummary {
  total_clicks: number
  clicks_today: number
  clicks_7d: number
  clicks_30d: number
  timeline: Array<{
    date: string
    clicks: number
  }>
  top_referrers: Array<{
    referrer: string
    count: number
    percentage: number
  }>
  top_countries: Array<{
    country: string
    count: number
    percentage: number
  }>
  devices: Array<{
    device: string
    count: number
    percentage: number
  }>
  browsers: Array<{
    browser: string
    count: number
    percentage: number
  }>
  operating_systems: Array<{
    os: string
    count: number
    percentage: number
  }>
}

export interface CreateLinkInput {
  destination_url: string
  custom_slug?: string
  title?: string
  description?: string
  expires_at?: string | null
  max_clicks?: number | null
  password?: string | null
  redirect_type?: 301 | 302 | 307
}

export interface UpdateLinkInput {
  destination_url?: string
  slug?: string
  title?: string
  description?: string
  is_active?: boolean
  expires_at?: string | null
  max_clicks?: number | null
  password?: string | null
  redirect_type?: 301 | 302 | 307
}

export interface UTMParams {
  url: string
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
}

export type RateLimitResult = {
  success: boolean
  remaining: number
  resetInSeconds: number
}
