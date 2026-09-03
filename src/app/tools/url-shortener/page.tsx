'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { Link2, Copy, Check, ArrowLeft, Sparkles, Shield, Clock, MousePointer, Lock, Loader2, QrCode, Download } from 'lucide-react'
import QRCode from 'qrcode'

export default function StandaloneURLShortenerPage() {
  const [destinationUrl, setDestinationUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [password, setPassword] = useState('')
  const [maxClicks, setMaxClicks] = useState<string>('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [redirectType, setRedirectType] = useState<301 | 302 | 307>(307)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [result, setResult] = useState<{ slug: string; shortUrl: string } | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destinationUrl.trim()) return

    setError(null)
    startTransition(async () => {
      try {
        const payload: any = {
          destination_url: destinationUrl.trim(),
          redirect_type: redirectType,
        }
        if (customSlug.trim()) payload.custom_slug = customSlug.trim()
        if (password.trim()) payload.password = password.trim()
        if (maxClicks) payload.max_clicks = parseInt(maxClicks, 10)
        if (expiresAt) payload.expires_at = new Date(expiresAt).toISOString()

        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to shorten link')
          return
        }

        const shortUrl = `${window.location.origin}/${data.data.slug}`
        setResult({
          slug: data.data.slug,
          shortUrl,
        })

        // Generate QR code for the short URL
        const qrUrl = await QRCode.toDataURL(shortUrl, { width: 250, margin: 2 })
        setQrDataUrl(qrUrl)
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  const handleCopy = () => {
    if (!result) return
    navigator.clipboard.writeText(result.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Back to Tools"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Logo size="xs" />
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 text-sm">URL Shortener</span>
          </div>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            Dashboard Login
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Shorten Any Long URL
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Clean, fast, and security-tested short links with optional custom alias and password protection.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <form onSubmit={handleShorten} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Destination URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={destinationUrl}
                onChange={e => setDestinationUrl(e.target.value)}
                placeholder="https://example.com/long-landing-page-url?ref=summer_campaign"
                required
                disabled={isPending}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Custom slug */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Custom Alias (Optional)
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono">
                  shortlink.dev/
                </span>
                <input
                  type="text"
                  value={customSlug}
                  onChange={e => setCustomSlug(e.target.value)}
                  placeholder="my-custom-link"
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 rounded-r-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-mono"
                />
              </div>
            </div>

            {/* Toggle Advanced */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer flex items-center gap-1.5"
              >
                {showAdvanced ? 'Hide Advanced Options' : '+ Show Advanced Security & Expiration Settings'}
              </button>
            </div>

            {showAdvanced && (
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-4 animate-in fade-in zoom-in-95">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Password Protection
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Require passcode"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MousePointer className="w-3.5 h-3.5 text-slate-400" />
                      Maximum Clicks Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxClicks}
                      onChange={e => setMaxClicks(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Expiration Date
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={e => setExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Redirect HTTP Status
                    </label>
                    <select
                      value={redirectType}
                      onChange={e => setRedirectType(parseInt(e.target.value, 10) as any)}
                      className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
                    >
                      <option value={307}>307 Temporary Redirect (Default - Best for dynamic analytics)</option>
                      <option value={301}>301 Permanent Redirect</option>
                      <option value={302}>302 Found Redirect</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Short Link...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Shorten URL
                </>
              )}
            </button>
          </form>

          {/* Result Card */}
          {result && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in zoom-in-95 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                <div className="truncate w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                    Your Short Link
                  </span>
                  <a
                    href={result.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base sm:text-lg font-mono font-bold text-blue-900 underline hover:text-blue-700 break-all"
                  >
                    {result.shortUrl}
                  </a>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* QR Preview */}
              {qrDataUrl && (
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-white border border-slate-200">
                  <img
                    src={qrDataUrl}
                    alt="Short Link QR Code"
                    className="w-32 h-32 rounded-xl border border-slate-100 shadow-inner"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-900">Embedded QR Code</h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      This QR code directly encodes your short link. If you change the destination in the future, the QR code remains valid!
                    </p>
                    <a
                      href={qrDataUrl}
                      download={`qr-${result.slug}.png`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition pt-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PNG QR Code
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
