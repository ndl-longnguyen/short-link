export type Locale = 'en' | 'vi'

export interface Dictionary {
  common: {
    loading: string
    copied: string
    copy: string
    download: string
    save: string
    cancel: string
    delete: string
    edit: string
    back: string
    view: string
    open: string
    error: string
    success: string
  }
  nav: {
    freeTools: string
    qrStudio: string
    utmBuilder: string
    faq: string
    reportAbuse: string
    signIn: string
    signUp: string
    dashboard: string
    goToDashboard: string
    signOut: string
  }
  hero: {
    badge: string
    titlePart1: string
    titlePart2: string
    subtitle: string
    inputPlaceholder: string
    shortenBtn: string
    shortening: string
    customAliasToggleShow: string
    customAliasToggleHide: string
    noSignUpNotice: string
    successTitle: string
    copyShortLink: string
    copiedShortLink: string
    openLink: string
    qrTitle: string
    qrSubtitle: string
    downloadQr: string
    analyticsNotice: string
    createFreeAccount: string
  }
  benefits: {
    sectionBadge: string
    sectionTitle: string
    sectionSubtitle: string
    speedTitle: string
    speedDesc: string
    qrTitle: string
    qrDesc: string
    securityTitle: string
    securityDesc: string
    analyticsTitle: string
    analyticsDesc: string
  }
  faqSection: {
    badge: string
    title: string
    subtitle: string
  }
  cta: {
    title: string
    subtitle: string
    buttonCreate: string
    buttonSignIn: string
  }
  dashboardNav: {
    dashboard: string
    links: string
    analytics: string
    qrCodes: string
    marketingTools: string
    settings: string
    signOut: string
    quickShorten: string
    userRole: string
  }
}
