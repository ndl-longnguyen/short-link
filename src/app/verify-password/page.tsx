'use client'

import { useState, useTransition, use } from 'react'
import { Lock, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'

interface VerifyPasswordPageProps {
  searchParams: Promise<{
    slug?: string
  }>
}

export default function VerifyPasswordPage({ searchParams }: VerifyPasswordPageProps) {
  const resolvedParams = use(searchParams)
  const slug = resolvedParams.slug || ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter the password')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, password }),
        })

        const data = await res.json()
        if (!res.ok || !data.success) {
          setError(data.error || 'Incorrect password')
          return
        }

        // Redirect directly to destination URL
        window.location.href = data.destination_url
      } catch {
        setError('Network error. Please try again.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/70 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 p-8">
        <div className="flex justify-center mb-5">
          <Logo size="sm" />
        </div>
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Password Protected Link
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            The creator of <span className="font-mono font-medium text-slate-800">/{slug}</span> has secured this link with a password.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Passcode
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter link password"
              disabled={isPending}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 active:scale-[0.99] transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Access Destination
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          End-to-End Encrypted Verification
        </div>
      </div>
    </div>
  )
}
