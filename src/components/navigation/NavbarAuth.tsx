'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

interface NavbarAuthProps {
  loginText?: string
  signupText?: string
  dashboardText?: string
  hideSwitcher?: boolean
}

export default function NavbarAuth({
  loginText,
  signupText,
  dashboardText,
  hideSwitcher = false,
}: NavbarAuthProps) {
  const { t } = useTranslation()
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const finalLoginText = loginText || t.nav.signIn
  const finalSignupText = signupText || t.nav.signUp
  const finalDashboardText = dashboardText || t.nav.goToDashboard

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
      <div className="flex items-center gap-2.5">
        {!hideSwitcher && <div className="w-16 h-7 bg-slate-100 animate-pulse rounded-xl" />}
        <div className="w-16 h-7 bg-slate-100 animate-pulse rounded-xl" />
        <div className="w-20 h-7 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
      {!hideSwitcher && <LanguageSwitcher variant="pill" />}

      {user ? (
        <>
          {user.email && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="max-w-[120px] truncate">{user.email}</span>
            </div>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 sm:px-3.5 py-2 rounded-xl transition shadow-xs active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{finalDashboardText}</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-slate-100 transition whitespace-nowrap shrink-0"
          >
            {finalLoginText}
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3 sm:px-3.5 py-2 rounded-xl transition shadow-xs active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            {finalSignupText}
          </Link>
        </>
      )}
    </div>
  )
}
