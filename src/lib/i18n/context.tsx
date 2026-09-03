'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { Locale, Dictionary } from './types'
import { enDictionary } from './dictionaries/en'
import { viDictionary } from './dictionaries/vi'

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Dictionary
  isVi: boolean
  isEn: boolean
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  vi: viDictionary,
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'

  // 1. Check URL param ?lang=
  const params = new URLSearchParams(window.location.search)
  const langParam = params.get('lang')
  if (langParam === 'vi' || langParam === 'en') {
    return langParam
  }

  // 2. Check Cookie
  const match = document.cookie.match(/(^|;)\s*NEXT_LOCALE\s*=\s*([^;]+)/)
  if (match && (match[2] === 'vi' || match[2] === 'en')) {
    return match[2] as Locale
  }

  // 3. Check localStorage
  try {
    const stored = localStorage.getItem('NEXT_LOCALE')
    if (stored === 'vi' || stored === 'en') return stored as Locale
  } catch {}

  // 4. Check navigator.language
  if (navigator.language && navigator.language.toLowerCase().startsWith('vi')) {
    return 'vi'
  }

  return 'en'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = getInitialLocale()
    setLocaleState(initial)
    setMounted(true)
    document.documentElement.lang = initial
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)

    // Save to document.cookie (1 year expiry)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`

    // Save to localStorage
    try {
      localStorage.setItem('NEXT_LOCALE', newLocale)
    } catch {}

    // Update <html lang="...">
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }

    // Optionally update URL param cleanly without reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('lang', newLocale)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const value = useMemo<LanguageContextValue>(() => {
    return {
      locale,
      setLocale,
      t: dictionaries[locale] || dictionaries.en,
      isVi: locale === 'vi',
      isEn: locale === 'en',
    }
  }, [locale])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    // Fallback safe dictionary if used outside provider
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: dictionaries.en,
      isVi: false,
      isEn: true,
    }
  }
  return context
}
