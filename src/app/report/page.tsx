'use client'

import { useState, useTransition, use } from 'react'
import Link from 'next/link'
import { ShieldAlert, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface ReportPageProps {
  searchParams: Promise<{
    slug?: string
  }>
}

export default function ReportPage({ searchParams }: ReportPageProps) {
  const resolvedParams = use(searchParams)
  const initialSlug = resolvedParams.slug || ''

  const [slug, setSlug] = useState(initialSlug)
  const [reason, setReason] = useState<'spam' | 'phishing' | 'malware' | 'scam' | 'illegal' | 'other'>('phishing')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!slug.trim()) {
      setError('Please provide the short link or slug')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: slug.trim(),
            reason,
            description: description.trim() || undefined,
          }),
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.error || 'Failed to submit abuse report')
          return
        }

        setSubmitted(true)
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Homepage
        </Link>

        {submitted ? (
          <div className="text-center py-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Report Submitted</h2>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Thank you for keeping the web safe. Our trust & safety team will review this link and take immediate action if it violates our policies.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Report Abuse</h1>
                <p className="text-xs text-slate-500 mt-0.5">Report malicious, phishing, or scam short links</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Short Link or Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. x7Kd2 or https://domain.com/x7Kd2"
                  disabled={isPending}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Abuse Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as any)}
                  disabled={isPending}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                >
                  <option value="phishing">Phishing / Credential Theft</option>
                  <option value="malware">Malware / Virus Distribution</option>
                  <option value="scam">Fraud / Scam / Financial deception</option>
                  <option value="spam">Spam / Unsolicited advertising</option>
                  <option value="illegal">Illegal Content</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain why this link is dangerous or violates terms..."
                  disabled={isPending}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    Submit Abuse Report
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
