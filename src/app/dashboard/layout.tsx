'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  QrCode,
  Wrench,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  User,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/context'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useTranslation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const navigation = useMemo(() => [
    { name: t.dashboardNav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.dashboardNav.links, href: '/dashboard/links', icon: Link2 },
    { name: t.dashboardNav.analytics, href: '/dashboard/analytics', icon: BarChart3 },
    { name: t.dashboardNav.qrCodes, href: '/dashboard/qr', icon: QrCode },
    { name: t.dashboardNav.marketingTools, href: '/dashboard/tools', icon: Wrench },
    { name: t.dashboardNav.settings, href: '/dashboard/settings', icon: Settings },
  ], [t])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || 'User')
      }
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200/80 p-5 shrink-0 justify-between">
        <div className="space-y-6">
          <Logo size="sm" className="px-2" />

          <div className="pt-2">
            <Link
              href="/dashboard/links?create=true"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.dashboardNav.quickShorten}</span>
            </Link>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User profile, Language Switcher & Logout */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-center">
            <LanguageSwitcher variant="pill" className="w-full justify-center" />
          </div>

          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {userEmail || 'Account'}
              </p>
              <span className="text-[10px] text-slate-400">{t.dashboardNav.userRole}</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {t.dashboardNav.signOut}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
          <Logo size="xs" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="pill" />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-3 animate-in slide-in-from-top-2">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 truncate">{userEmail}</span>
              <button
                onClick={handleSignOut}
                className="text-xs text-rose-600 font-semibold cursor-pointer"
              >
                {t.dashboardNav.signOut}
              </button>
            </div>
          </div>
        )}

        {/* Dynamic page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
