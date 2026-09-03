'use client'

import { useState, useEffect, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Link2,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  QrCode,
  BarChart3,
  Edit2,
  Trash2,
  Pause,
  Play,
  Download,
  Lock,
  X,
  Clock,
  MousePointer,
  Sparkles,
  Loader2,
  CopyPlus,
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
  redirect_type: 301 | 302 | 307
  is_password_protected: boolean
  created_at: string
}

function LinksManagementContent() {
  const searchParams = useSearchParams()
  const openCreateParam = searchParams.get('create') === 'true'

  const [links, setLinks] = useState<LinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'disabled' | 'expired'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'clicks'>('newest')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(openCreateParam)
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [activeQr, setActiveQr] = useState<{ slug: string; url: string; dataUrl: string } | null>(null)

  // Create Form State
  const [createUrl, setCreateUrl] = useState('')
  const [createSlug, setCreateSlug] = useState('')
  const [createTitle, setCreateTitle] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createMaxClicks, setCreateMaxClicks] = useState('')
  const [createExpiresAt, setCreateExpiresAt] = useState('')
  const [createRedirectType, setCreateRedirectType] = useState<301 | 302 | 307>(307)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isSubmitting, startSubmitting] = useTransition()

  // Edit Form State
  const [editUrl, setEditUrl] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editMaxClicks, setEditMaxClicks] = useState('')
  const [editExpiresAt, setEditExpiresAt] = useState('')
  const [editRedirectType, setEditRedirectType] = useState<301 | 302 | 307>(307)
  const [editError, setEditError] = useState<string | null>(null)

  const fetchLinks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (status !== 'all') params.set('status', status)
      params.set('sort', sort)

      const res = await fetch(`/api/links?${params.toString()}`)
      const json = await res.json()
      if (json.success) {
        setLinks(json.data || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [status, sort])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLinks()
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createUrl.trim()) return

    setCreateError(null)
    startSubmitting(async () => {
      try {
        const payload: any = {
          destination_url: createUrl.trim(),
          redirect_type: createRedirectType,
        }
        if (createSlug.trim()) payload.custom_slug = createSlug.trim()
        if (createTitle.trim()) payload.title = createTitle.trim()
        if (createPassword.trim()) payload.password = createPassword.trim()
        if (createMaxClicks) payload.max_clicks = parseInt(createMaxClicks, 10)
        if (createExpiresAt) payload.expires_at = new Date(createExpiresAt).toISOString()

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

        // Reset and close
        setCreateUrl('')
        setCreateSlug('')
        setCreateTitle('')
        setCreatePassword('')
        setCreateMaxClicks('')
        setCreateExpiresAt('')
        setCreateModalOpen(false)
        fetchLinks()
      } catch {
        setCreateError('Network error')
      }
    })
  }

  const handleOpenEdit = (link: LinkItem) => {
    setEditingLink(link)
    setEditUrl(link.destination_url)
    setEditSlug(link.slug)
    setEditTitle(link.title || '')
    setEditPassword('')
    setEditMaxClicks(link.max_clicks ? String(link.max_clicks) : '')
    setEditExpiresAt(link.expires_at ? link.expires_at.slice(0, 16) : '')
    setEditRedirectType(link.redirect_type as any)
    setEditError(null)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLink) return

    setEditError(null)
    startSubmitting(async () => {
      try {
        const payload: any = {
          destination_url: editUrl.trim(),
          slug: editSlug.trim(),
          title: editTitle.trim() || null,
          redirect_type: editRedirectType,
          max_clicks: editMaxClicks ? parseInt(editMaxClicks, 10) : null,
          expires_at: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
        }
        if (editPassword.trim()) {
          payload.password = editPassword.trim()
        }

        const res = await fetch(`/api/links/${editingLink.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const json = await res.json()
        if (!res.ok || !json.success) {
          setEditError(json.error || 'Failed to update link')
          return
        }

        setEditingLink(null)
        fetchLinks()
      } catch {
        setEditError('Network error')
      }
    })
  }

  const handleDuplicate = async (link: LinkItem) => {
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination_url: link.destination_url,
          title: link.title ? `${link.title} (Copy)` : undefined,
          redirect_type: link.redirect_type,
        }),
      })
      if (res.ok) fetchLinks()
    } catch (e) {
      console.error(e)
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
    if (!confirm('Are you sure you want to permanently delete this short link?')) return
    try {
      const res = await fetch(`/api/links/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Links Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, customize aliases, and monitor performance
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm shadow-indigo-600/20 active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Short Link
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by slug, title, or destination URL..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </form>

        {/* Filter dropdowns */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="clicks">Most Clicks</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            Loading links...
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Link2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">No links found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search filters or click create to generate a new short link.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Short Link</th>
                  <th className="py-3.5 px-6">Destination</th>
                  <th className="py-3.5 px-6">Clicks</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-sm">
                          <span>/{link.slug}</span>
                          {link.is_password_protected && (
                          <span title="Password protected">
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                        </div>
                        {link.title && (
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5 truncate max-w-[200px]">
                            {link.title}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 max-w-xs truncate text-slate-500 font-sans" title={link.destination_url}>
                      {link.destination_url}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {formatNumber(link.click_count)}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          link.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                        }`}
                      >
                        {link.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-[11px]">
                      {formatDate(link.created_at)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(link.id, link.slug)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Copy Link"
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
                          onClick={() => handleOpenEdit(link)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit link"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicate(link)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                          title="Duplicate link"
                        >
                          <CopyPlus className="w-3.5 h-3.5" />
                        </button>

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
                          title="Delete link"
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

      {/* CREATE LINK MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Create New Short Link</h2>
                <p className="text-xs text-slate-500">Configure destination and advanced options</p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Destination URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={createUrl}
                  onChange={e => setCreateUrl(e.target.value)}
                  placeholder="https://example.com/target-page"
                  required
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Custom Alias (Optional)
                </label>
                <input
                  type="text"
                  value={createSlug}
                  onChange={e => setCreateSlug(e.target.value)}
                  placeholder="e.g. spring-sale"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Title / Campaign Note (Optional)
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={e => setCreateTitle(e.target.value)}
                  placeholder="e.g. Facebook ad promotion"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Passcode Protection
                  </label>
                  <input
                    type="password"
                    value={createPassword}
                    onChange={e => setCreatePassword(e.target.value)}
                    placeholder="Require password"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <MousePointer className="w-3.5 h-3.5 text-slate-400" />
                    Max Clicks Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createMaxClicks}
                    onChange={e => setCreateMaxClicks(e.target.value)}
                    placeholder="e.g. 100"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Expiration Date
                  </label>
                  <input
                    type="datetime-local"
                    value={createExpiresAt}
                    onChange={e => setCreateExpiresAt(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Redirect Code
                  </label>
                  <select
                    value={createRedirectType}
                    onChange={e => setCreateRedirectType(parseInt(e.target.value, 10) as any)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value={307}>307 Temporary (Default)</option>
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Found</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LINK MODAL */}
      {editingLink && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Short Link</h2>
                <p className="text-xs text-slate-500 font-mono">/{editingLink.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingLink(null)}
                className="p-1 text-slate-400 hover:text-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Custom Slug
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={e => setEditSlug(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Optional title"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Update Password
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Max Clicks Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editMaxClicks}
                    onChange={e => setEditMaxClicks(e.target.value)}
                    placeholder="Unlimited if empty"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Expiration Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editExpiresAt}
                    onChange={e => setEditExpiresAt(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Redirect Code
                  </label>
                  <select
                    value={editRedirectType}
                    onChange={e => setEditRedirectType(parseInt(e.target.value, 10) as any)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value={307}>307 Temporary</option>
                    <option value={301}>301 Permanent</option>
                    <option value={302}>302 Found</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingLink(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR MODAL */}
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
              Encodes short link: <span className="font-mono">{activeQr.url}</span>
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

export default function LinksManagementPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-slate-400">Loading links...</div>}>
      <LinksManagementContent />
    </Suspense>
  )
}
