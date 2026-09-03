'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import FaqSection from '@/components/landing/FaqSection'
import {
  Link2,
  Copy,
  Check,
  QrCode,
  Download,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Lock,
  Target,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import QRCode from 'qrcode'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [showAlias, setShowAlias] = useState(false)
  const [result, setResult] = useState<{ slug: string; shortUrl: string } | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [domainPrefix, setDomainPrefix] = useState('ndllink.vercel.app/')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomainPrefix(`${window.location.host}/`)
    }
  }, [])

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setError(null)
    startTransition(async () => {
      try {
        const payload: any = { destination_url: url.trim() }
        if (customSlug.trim()) payload.custom_slug = customSlug.trim()

        const res = await fetch('/api/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.error || 'Could not shorten link. Please check your URL.')
          return
        }

        const shortUrl = `${window.location.origin}/${data.data.slug}`
        setResult({
          slug: data.data.slug,
          shortUrl,
        })

        // Generate QR code
        const qr = await QRCode.toDataURL(shortUrl, { width: 260, margin: 2 })
        setQrDataUrl(qr)
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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/tools" className="hover:text-slate-900 transition">Free Tools</Link>
            <Link href="/tools/qr-code-generator" className="hover:text-slate-900 transition">QR Studio</Link>
            <Link href="/tools/utm-builder" className="hover:text-slate-900 transition">UTM Builder</Link>
            <Link href="#faq" className="hover:text-slate-900 transition">Hỏi & Đáp (FAQ)</Link>
            <Link href="/report" className="hover:text-slate-900 transition">Report Abuse</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl transition shadow-xs active:scale-[0.98]"
            >
              Dashboard Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 sm:pt-24 sm:pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Production-Ready Next.js Link Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Shorten, track, and optimize <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
              every link you share
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Blazing fast redirects, built-in dynamic QR codes, privacy-safe analytics, and bulletproof security — without the bloat.
          </p>

          {/* Shorten Box */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
              <form onSubmit={handleShorten} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="Paste your long URL here... https://example.com/..."
                      required
                      disabled={isPending}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="py-3.5 px-7 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Shortening...
                      </>
                    ) : (
                      <>
                        Shorten URL
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Optional Custom Alias toggle */}
                <div className="flex items-center justify-between px-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowAlias(!showAlias)}
                    className="text-slate-500 hover:text-indigo-600 font-medium transition cursor-pointer"
                  >
                    {showAlias ? '- Hide Custom Alias' : '+ Add Custom Alias (optional)'}
                  </button>
                  <span className="text-slate-400">No sign up required for instant links</span>
                </div>

                {showAlias && (
                  <div className="pt-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center">
                      <span className="px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono select-none">
                        {domainPrefix}
                      </span>
                      <input
                        type="text"
                        value={customSlug}
                        onChange={e => setCustomSlug(e.target.value)}
                        placeholder="summer-sale"
                        disabled={isPending}
                        className="flex-1 px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                )}
              </form>

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
                  {error}
                </div>
              )}

              {/* Instant Result Card */}
              {result && (
                <div className="mt-4 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-left space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="truncate">
                      <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">
                        Your Ready-To-Use Short Link:
                      </span>
                      <a
                        href={result.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-bold text-base sm:text-lg text-indigo-950 hover:underline break-all"
                      >
                        {result.shortUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  {/* QR Code Preview */}
                  {qrDataUrl && (
                    <div className="pt-3 border-t border-indigo-200/60 flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={qrDataUrl}
                        alt="Short link QR"
                        className="w-24 h-24 rounded-xl border border-indigo-200 bg-white p-1"
                      />
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="text-xs font-semibold text-slate-800">
                          Built-in Short Link QR Code
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Encodes your short link. You can safely print or share this anywhere.
                        </p>
                        <a
                          href={qrDataUrl}
                          download={`qr-${result.slug}.png`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PNG
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-indigo-700 border-t border-indigo-200/50">
                    <span>Want to view analytics and edit this destination later?</span>
                    <Link href="/signup" className="font-bold underline hover:text-indigo-900">
                      Create free account &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Grid */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for Speed, Reliability, and Safety
            </h2>
            <p className="mt-2 text-slate-600 text-sm">
              Built from scratch with modern Vercel Serverless and Supabase PostgreSQL architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Instant Redirects</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Zero client execution lag. Route handlers project only essential columns and process analytics asynchronously.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Dynamic QR Codes</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Every short link is automatically encoded into a scalable QR code. Change the destination anytime without reprinting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Privacy-Safe Analytics</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Track click timelines, referrers, countries, and devices without tracking or permanently persisting personal IP addresses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Password & Expiration</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Protect sensitive links with salted PBKDF2 passwords, click thresholds, and exact expiration schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Free Tools Preview */}
      <section className="py-16 px-4 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Complementary Link Utilities
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Free web tools to supercharge your marketing campaigns.
            </p>
          </div>
          <Link
            href="/tools"
            className="mt-4 sm:mt-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Explore all tools &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/tools/qr-code-generator"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition group"
          >
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition">
              QR Code Studio
            </h3>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
              Export high-resolution PNG and SVG QR codes with custom color palettes and error recovery.
            </p>
          </Link>

          <Link
            href="/tools/utm-builder"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition group"
          >
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition">
              UTM Campaign Builder
            </h3>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
              Structure Google Analytics tags with source, medium, and campaign. 1-click auto shorten.
            </p>
          </Link>

          <Link
            href="/tools/url-shortener"
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition group"
          >
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4">
              <Link2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition">
              Standalone Shortener
            </h3>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
              Clean distraction-free interface for generating random or custom short links.
            </p>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection />

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to take control of your links?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Create your free account today to track performance, manage custom slugs, set passwords, and inspect real-time audience analytics.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition shadow-lg shadow-white/10 active:scale-[0.98]"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800 text-slate-200 font-bold text-sm hover:bg-slate-700 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5 font-bold text-slate-800">
            <Logo size="xs" showText={false} />
            <span>ShortLink Platform</span>
            <span>&bull;</span>
            <span className="font-normal text-slate-400">Production-Ready Vercel + Supabase</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/tools" className="hover:text-slate-900 transition">Free Tools</Link>
            <Link href="/report" className="hover:text-slate-900 transition">Report Abuse</Link>
            <Link href="/login" className="hover:text-slate-900 transition">Login</Link>
            <Link href="/signup" className="hover:text-slate-900 transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
