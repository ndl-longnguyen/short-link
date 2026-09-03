'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { QrCode, Download, Copy, Check, ArrowLeft, RefreshCw } from 'lucide-react'
import QRCode from 'qrcode'

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState('https://shortlink.dev')
  const [fgColor, setFgColor] = useState('#0f172a')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate QR on canvas whenever options change
  useEffect(() => {
    if (!canvasRef.current || !text.trim()) return

    QRCode.toCanvas(
      canvasRef.current,
      text.trim(),
      {
        width: 320,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      },
      (error) => {
        if (error) console.error('QR generation error:', error)
      }
    )
  }, [text, fgColor, bgColor, errorCorrection])

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'shortlink-qr.png'
    a.click()
  }

  const handleDownloadSVG = async () => {
    if (!text.trim()) return
    try {
      const svgString = await QRCode.toString(text.trim(), {
        type: 'svg',
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: errorCorrection,
      })
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'shortlink-qr.svg'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate SVG:', err)
    }
  }

  const handleCopyText = () => {
    navigator.clipboard.writeText(text)
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
            <span className="font-bold text-slate-900 text-sm">QR Code Studio</span>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition"
          >
            Create Short Link
          </Link>
        </div>
      </header>

      {/* Main Studio */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Free QR Code Generator
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Create high-quality, customizable QR codes for links, text, or landing pages. Instant download in PNG and SVG formats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                QR Code Content (URL or Text)
              </label>
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="https://example.com or any text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pattern Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={e => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={e => setFgColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Error correction */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Error Correction Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['L', 'M', 'Q', 'H'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setErrorCorrection(lvl)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                      errorCorrection === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Level {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Higher levels allow the QR code to be readable even if partially damaged or obscured.
              </p>
            </div>
          </div>

          {/* Preview & Download */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-5 rounded-2xl border border-slate-100 shadow-inner bg-slate-50/50 mb-6 max-w-[280px] w-full flex items-center justify-center">
              <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto shadow-xs" />
            </div>

            <div className="w-full space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download SVG
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Content!' : 'Copy Encoded URL'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
