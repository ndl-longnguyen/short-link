'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  MousePointerClick,
  Calendar,
  Globe,
  Monitor,
  Compass,
  Layers,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { formatNumber } from '@/lib/utils'
import { AnalyticsSummary } from '@/types'

interface AnalyticsViewProps {
  linkId?: string
  linkSlug?: string
  backHref?: string
}

export default function AnalyticsDashboardView({
  linkId,
  linkSlug,
  backHref,
}: AnalyticsViewProps) {
  const [range, setRange] = useState<'24h' | '7d' | '30d'>('7d')
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = linkId
      ? `/api/analytics?link_id=${linkId}&range=${range}`
      : `/api/analytics?range=${range}`

    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.success) setSummary(json.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [linkId, range])

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {backHref && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Links
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {linkSlug ? `Analytics for /${linkSlug}` : 'Aggregate Account Analytics'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time traffic patterns, device breakdown, and referrer attribution
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
          {(['24h', '7d', '30d'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                range === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === '24h' ? 'Last 24 Hours' : r === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          Aggregating click metrics...
        </div>
      ) : !summary ? (
        <div className="py-20 text-center text-xs text-slate-400">
          No analytics available yet.
        </div>
      ) : (
        <>
          {/* Top High-Level Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Total Clicks</span>
                <MousePointerClick className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatNumber(summary.total_clicks)}
              </p>
              <span className="text-[11px] text-slate-400">All-time redirects</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Clicks Today</span>
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatNumber(summary.clicks_today)}
              </p>
              <span className="text-[11px] text-slate-400">Since midnight</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Last 7 Days</span>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatNumber(summary.clicks_7d)}
              </p>
              <span className="text-[11px] text-slate-400">Trailing 7 days</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                <span>Last 30 Days</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatNumber(summary.clicks_30d)}
              </p>
              <span className="text-[11px] text-slate-400">Trailing 30 days</span>
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Click Timeline</h2>
            {summary.timeline.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No clicks recorded in this time range yet.
              </div>
            ) : (
              <div className="space-y-2">
                {/* SVG Visual Bar Chart */}
                <div className="h-44 flex items-end gap-2 pt-4 border-b border-slate-100">
                  {summary.timeline.map((point) => {
                    const maxClicks = Math.max(...summary.timeline.map(p => p.clicks), 1)
                    const heightPercent = Math.max(10, Math.round((point.clicks / maxClicks) * 100))
                    return (
                      <div key={point.date} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div
                          className="w-full max-w-[36px] bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-all duration-200"
                          style={{ height: `${heightPercent}%` }}
                        />
                        <span className="text-[10px] text-slate-400 truncate max-w-[48px]">
                          {point.date}
                        </span>

                        {/* Tooltip */}
                        <div className="absolute -top-8 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                          {point.clicks} clicks
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Referrers */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Top Referrers</h3>
              </div>

              {summary.top_referrers.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No referrers recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {summary.top_referrers.map((ref) => (
                    <div key={ref.referrer} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800 truncate">{ref.referrer}</span>
                        <span className="text-slate-500 font-mono">{ref.count} ({ref.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ref.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Top Countries</h3>
              </div>

              {summary.top_countries.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No country data recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {summary.top_countries.map((c) => (
                    <div key={c.country} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{c.country}</span>
                        <span className="text-slate-500 font-mono">{c.count} ({c.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">Devices</h3>
              </div>

              {summary.devices.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No device data</p>
              ) : (
                <div className="space-y-3">
                  {summary.devices.map((d) => (
                    <div key={d.device} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-800">{d.device}</span>
                        <span className="text-slate-500 font-mono">{d.count} ({d.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Operating Systems & Browsers */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Browsers & OS</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Browsers
                  </span>
                  <div className="space-y-2">
                    {summary.browsers.slice(0, 5).map((b) => (
                      <div key={b.browser} className="text-xs flex justify-between">
                        <span className="truncate text-slate-700">{b.browser}</span>
                        <span className="text-slate-400 font-mono">{b.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Operating Systems
                  </span>
                  <div className="space-y-2">
                    {summary.operating_systems.slice(0, 5).map((o) => (
                      <div key={o.os} className="text-xs flex justify-between">
                        <span className="truncate text-slate-700">{o.os}</span>
                        <span className="text-slate-400 font-mono">{o.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
