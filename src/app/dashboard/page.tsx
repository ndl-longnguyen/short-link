'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import {
  Link2,
  MousePointerClick,
  Calendar,
  TrendingUp,
  Plus,
  Copy,
  Check,
  QrCode,
  BarChart3,
  ExternalLink,
  MoreVertical,
  Trash2,
  Lock,
  Pause,
  Play,
  Download,
  X,
  Clock,
  Loader2,
} from 'lucide-react'
import { formatNumber, formatDate } from '@/lib/utils'
import QRCode from 'qrcode'

interface LinkItem {
  id: string
  slug: string
  destination_url: string
  title: string | null
  description: string | null
  is_active: boolean
  expires_at: string | null
  max_clicks: number | null
  click_count: number
  redirect_type: number
  is_password_protected: boolean
  created_at: string
}

export default function DashboardOverviewPage() {
  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Quick shorten form
  const [newUrl, setNewUrl] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [shortening, setShortening] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // QR Modal
  const [activeQr, setActiveQr] = useState<{ slug: string; url: string; dataUrl: string } | null>(null)

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links?limit=10&sort=newest')
      const json = await res.json()
      if (json.success) {
        setLinks(json.data || [])
      }
    } catch (err) {
      console.error('Failed to load dashboard links:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return
    setShortening(true)
    setCreateError(null)

    try {
      const payload: any = { destination_url: newUrl.trim() }
      if (newSlug.trim()) payload.custom_slug = newSlug.trim()

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setCreateError(json.error || 'Failed to create link')
        return
      }

      setNewUrl('')
      setNewSlug('')
      fetchLinks()
    } catch {
      setCreateError('Network error')
    } finally {
      setShortening(false)
    }
  }

  const handleCopy = (id: string, slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenQr = async (slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`
    try {
      const dataUrl = await QRCode.toDataURL(fullUrl, { width: 300, margin: 2 })
      setActiveQr({ slug, url: fullUrl, dataUrl })
    } catch (e) {
      console.error(e)
    }
  }

  const handleToggleActive = async (link: LinkItem) => {
    try {
      const res = await fetch(`/api/links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !link.is_active }),
      })
      if (res.ok) {
        setLinks(prev =>
          prev.map(l => (l.id === link.id ? { ...l, is_active: !l.is_active } : l))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this short link? All click analytics will be removed.')) return
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Calculate high-level stats
  const totalLinks = links.length
  const totalClicks = links.reduce((acc, curr) => acc + (curr.click_count || 0), 0)
  const topLink = [...links].sort((a, b) => b.click_count - a.click_count)[0]

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-1">Manage, monitor, and create branded short URLs</p>
        </div>
        <Link
          href="/dashboard/links?create=true"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm shadow-indigo-600/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create New Link
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Links</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? '-' : formatNumber(totalLinks)}
          </p>
          <span className="text-[11px] text-slate-400">Active tracked URLs</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clicks</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {loading ? '-' : formatNumber(totalClicks)}
          </p>
          <span className="text-[11px] text-slate-400">All-time redirects</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Performing</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 truncate">
            {loading ? '-' : topLink ? `/${topLink.slug}` : 'None yet'}
          </p>
          <span className="text-[11px] text-slate-400">
            {topLink ? `${topLink.click_count} clicks` : 'Create your first link'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan Status</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">Unlimited</p>
          <span className="text-[11px] text-slate-400">Free Community Tier</span>
        </div>
      </div>

      {/* Quick Shorten Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Link Creator</h2>
        <form onSubmit={handleQuickCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="Paste destination URL https://..."
            required
            disabled={shortening}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <input
            type="text"
            value={newSlug}
            onChange={e => setNewSlug(e.target.value)}
            placeholder="Custom alias (optional)"
            disabled={shortening}
            className="sm:w-48 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={shortening}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
          >
            {shortening ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Shorten
          </button>
        </form>
        {createError && <p className="text-xs text-rose-600 font-medium">{createError}</p>}
      </div>

      {/* Recent Links Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Links</h2>
          <Link
            href="/dashboard/links"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            View all links &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            Loading links...
          </div>
        ) : links.length === 0 ? (
          <div className="py-14 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Link2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">You haven&apos;t created any links yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Paste a destination URL in the box above or click create to generate your first trackable short link.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-6">Short Link</th>
                  <th className="py-3 px-6">Destination</th>
                  <th className="py-3 px-6">Clicks</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-900">
                        <span>/{link.slug}</span>
                        {link.is_password_protected && (
                          <span title="Password protected">
                            <Lock className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 max-w-xs truncate text-slate-500" title={link.destination_url}>
                      {link.destination_url}
                    </td>

                    <td className="py-3.5 px-6 font-semibold text-slate-900">
                      {formatNumber(link.click_count)}
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          link.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {link.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-slate-400 text-[11px]">
                      {formatDate(link.created_at)}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.id, link.slug)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Copy short link"
                        >
                          {copiedId === link.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenQr(link.slug)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/dashboard/links/${link.id}/analytics`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Analytics"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(link)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title={link.is_active ? 'Disable' : 'Enable'}
                        >
                          {link.is_active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Preview Modal */}
      {activeQr && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 font-mono">/{activeQr.slug}</span>
              <button
                type="button"
                onClick={() => setActiveQr(null)}
                className="p-1 text-slate-400 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-center">
              <img src={activeQr.dataUrl} alt="QR Code" className="w-48 h-48 rounded-xl shadow-xs" />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This QR code directly encodes <span className="font-mono">{activeQr.url}</span>.
            </p>

            <a
              href={activeQr.dataUrl}
              download={`qr-${activeQr.slug}.png`}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
