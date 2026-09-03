import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Campaign UTM Builder | Công Cụ Tạo Link UTM Chiến Dịch',
  description:
    'Easily build and structure Google Analytics UTM campaign tracking URLs with source, medium, campaign, term, and content. Shorten in 1 click.',
  keywords: [
    'UTM Builder',
    'Campaign URL Builder',
    'Google Analytics UTM',
    'UTM Generator',
    'Công cụ tạo UTM',
    'Gắn link UTM',
    'Đo lường chiến dịch marketing',
    'Theo dõi chuyển đổi',
  ],
  alternates: {
    canonical: '/tools/utm-builder',
  },
  openGraph: {
    title: 'Campaign UTM Builder | Công Cụ Tạo Link UTM',
    description:
      'Structure Google Analytics UTM parameters and shorten campaign links in 1 click.',
  },
}

export default function UtmBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
