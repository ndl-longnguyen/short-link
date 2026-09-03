'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { Globe, Check, ChevronDown } from 'lucide-react'

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown'
  className?: string
}

export default function LanguageSwitcher({
  variant = 'pill',
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale, isVi } = useTranslation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-xl bg-slate-100/90 border border-slate-200/80 shadow-2xs ${className}`}
      >
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            locale === 'en'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Switch to English"
        >
          <span>🇬🇧</span>
          <span>EN</span>
        </button>
        <button
          type="button"
          onClick={() => setLocale('vi')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            locale === 'vi'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
          title="Chuyển sang Tiếng Việt"
        >
          <span>🇻🇳</span>
          <span>VI</span>
        </button>
      </div>
    )
  }

  // Dropdown style
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-2xs cursor-pointer"
        aria-expanded={open}
      >
        <span>{isVi ? '🇻🇳' : '🇬🇧'}</span>
        <span>{isVi ? 'Tiếng Việt' : 'English'}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={() => {
              setLocale('en')
              setOpen(false)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              locale === 'en' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🇬🇧</span>
              <span>English</span>
            </div>
            {locale === 'en' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setLocale('vi')
              setOpen(false)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              locale === 'vi' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🇻🇳</span>
              <span>Tiếng Việt</span>
            </div>
            {locale === 'vi' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
          </button>
        </div>
      )}
    </div>
  )
}
