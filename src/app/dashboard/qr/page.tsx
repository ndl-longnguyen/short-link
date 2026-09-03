'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { QrCode, Download, Copy, Check, ExternalLink, Loader2, ArrowUpRight } from 'lucide-react'
import QRCode from 'qrcode'

interface LinkItem {
  id: string
  slug: string
  destination_url: string
  title: string | null
  click_count: number
}

interface QRCardData extends LinkItem {
  qrDataUrl?: string
}

export default function DashboardQRCodesPage() {
  const [links, setLinks] = useState<QRCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/links?limit=50&sort=newest')
      .then(res => res.json())
      .then(async (json) => {
        if (json.success && json.data) {
          const linksWithQr: QRCardData[] = []
          const origin = window.location.origin
          for (const item of json.data) {
            const shortUrl = `${origin}/${item.slug}`
            try {
              const qrDataUrl = await QRCode.toDataURL(shortUrl, { width: 240, margin: 2 })
              linksWithQr.push({ ...item, qrDataUrl })
            } catch {
              linksWithQr.push(item)
            }
          }
          setLinks(linksWithQr)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = (slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`
    navigator.clipboard.writeText(fullUrl)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const handleDownloadSVG = async (slug: string) => {
    const fullUrl = `${window.location.origin}/${slug}`
    try {
      const svg = await QRCode.toString(fullUrl, { type: 'svg', margin: 2 })
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-${slug}.svg`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">QR Codes Library</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic QR codes automatically generated for each of your tracked short links
          </p>
        </div>
        <Link
          href="/tools/qr-code-generator"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          Standalone QR Studio
        </Link>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          Rendering QR codes...
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <QrCode className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800">No QR codes yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first short link from the dashboard to automatically receive a dynamic QR code.
          </p>
          <Link
            href="/dashboard/links?create=true"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Create Link
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div
              key={link.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-sm text-slate-900">
                    /{link.slug}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {link.click_count} scans/clicks
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-center mb-3">
                  {link.qrDataUrl ? (
                    <img
                      src={link.qrDataUrl}
                      alt={`QR for /${link.slug}`}
                      className="w-36 h-36 rounded-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-slate-300">
                      Generating...
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 truncate" title={link.destination_url}>
                  {link.destination_url}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  {link.qrDataUrl && (
                    <a
                      href={link.qrDataUrl}
                      download={`qr-${link.slug}.png`}
                      className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <Download className="w-3 h-3" />
                      PNG
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDownloadSVG(link.slug)}
                    className="py-2 px-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    SVG
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(link.slug)}
                  className="w-full py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  {copiedSlug === link.slug ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copiedSlug === link.slug ? 'Copied short URL!' : 'Copy short URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
