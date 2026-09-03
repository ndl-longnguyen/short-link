'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ArrowRight, User } from 'lucide-react'

interface NavbarAuthProps {
  loginText?: string
  signupText?: string
  dashboardText?: string
}

export default function NavbarAuth({
  loginText = 'Sign In',
  signupText = 'Get Started Free',
  dashboardText = 'Dashboard',
}: NavbarAuthProps) {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user || null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-16 h-8 bg-slate-100 animate-pulse rounded-xl" />
        <div className="w-24 h-8 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {user.email && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-[130px] truncate">{user.email}</span>
          </div>
        )}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition shadow-xs active:scale-[0.98]"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
          <span>{dashboardText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login"
        className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
      >
        {loginText}
      </Link>
      <Link
        href="/signup"
        className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition shadow-xs active:scale-[0.98]"
      >
        {signupText}
      </Link>
    </div>
  )
}
