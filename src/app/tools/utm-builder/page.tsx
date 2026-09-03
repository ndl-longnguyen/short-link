'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import NavbarAuth from '@/components/navigation/NavbarAuth'
import { Target, Copy, Check, ArrowLeft, ExternalLink, Sparkles, ArrowRight, Loader2 } from 'lucide-react'

export default function UTMBuilderPage() {
  const [url, setUrl] = useState('')
  const [source, setSource] = useState('')
  const [medium, setMedium] = useState('')
  const [campaign, setCampaign] = useState('')
  const [term, setTerm] = useState('')
  const [content, setContent] = useState('')

  const [copied, setCopied] = useState(false)
  const [isShortening, setIsShortening] = useState(false)
  const [shortResult, setShortResult] = useState<{ slug: string; shortUrl: string } | null>(null)
  const [shortError, setShortError] = useState<string | null>(null)

  // Generate the full UTM tagged URL dynamically
  const generatedUrl = useMemo(() => {
    if (!url.trim()) return ''
    try {
      let targetUrl = url.trim()
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl
      }
      const parsed = new URL(targetUrl)

      if (source.trim()) parsed.searchParams.set('utm_source', source.trim())
      if (medium.trim()) parsed.searchParams.set('utm_medium', medium.trim())
      if (campaign.trim()) parsed.searchParams.set('utm_campaign', campaign.trim())
      if (term.trim()) parsed.searchParams.set('utm_term', term.trim())
      if (content.trim()) parsed.searchParams.set('utm_content', content.trim())

      return parsed.toString()
    } catch {
      return ''
    }
  }, [url, source, medium, campaign, term, content])

  const handleCopy = () => {
    if (!generatedUrl) return
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShortenNow = async () => {
    if (!generatedUrl) return
    setIsShortening(true)
    setShortError(null)

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_url: generatedUrl }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setShortError(data.error || 'Failed to shorten URL')
        return
      }

      const host = window.location.origin
      setShortResult({
        slug: data.data.slug,
        shortUrl: `${host}/${data.data.slug}`,
      })
    } catch {
      setShortError('Network error while creating short link')
    } finally {
      setIsShortening(false)
    }
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
            <span className="font-bold text-slate-900 text-sm">UTM Builder</span>
          </div>
          <NavbarAuth loginText="Sign In" dashboardText="Dashboard" />
        </div>
      </header>

      {/* Main Studio */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Campaign UTM Tagging Tool
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Add standard Google Analytics UTM parameters to track marketing channels, newsletters, and social ads. Shorten in 1 click.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Website URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/product-page"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campaign Source (utm_source) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="e.g. google, newsletter, facebook"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campaign Medium (utm_medium)
                </label>
                <input
                  type="text"
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  placeholder="e.g. cpc, email, social, banner"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campaign Name (utm_campaign)
                </label>
                <input
                  type="text"
                  value={campaign}
                  onChange={e => setCampaign(e.target.value)}
                  placeholder="e.g. summer_sale, black_friday"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Campaign Term (utm_term)
                </label>
                <input
                  type="text"
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  placeholder="Keywords (optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Campaign Content (utm_content)
              </label>
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Ad variation, CTA button (optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Generated Result Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Generated UTM URL
                </span>
                {generatedUrl && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 min-h-[110px] break-all font-mono text-xs text-slate-700 flex items-center justify-center text-center">
                {generatedUrl ? (
                  <span className="text-left select-all text-slate-900">{generatedUrl}</span>
                ) : (
                  <span className="text-slate-400 font-sans">
                    Enter your Website URL and campaign source to generate the UTM link.
                  </span>
                )}
              </div>
            </div>

            {/* Shorten Action */}
            {generatedUrl && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <button
                  type="button"
                  onClick={handleShortenNow}
                  disabled={isShortening}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isShortening ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Short Link...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Shorten This UTM Link
                    </>
                  )}
                </button>

                {shortError && (
                  <p className="text-xs text-rose-600 font-medium text-center">{shortError}</p>
                )}

                {shortResult && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in zoom-in-95">
                    <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                      Short Link Created!
                    </p>
                    <a
                      href={shortResult.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-bold text-sm text-emerald-900 underline hover:text-emerald-700 break-all"
                    >
                      {shortResult.shortUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
