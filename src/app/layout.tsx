import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { getSiteUrl } from '@/lib/utils'
import JsonLd from '@/components/seo/JsonLd'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'ShortLink | URL Shortener & Dynamic QR Studio | Rút Gọn Link Miễn Phí',
    template: '%s | ShortLink',
  },
  description:
    'Blazing-fast URL shortener, dynamic QR code generator, and privacy-safe link analytics. Nền tảng rút gọn liên kết siêu tốc, tạo mã QR động và đo lường click miễn phí.',
  keywords: [
    // International Keywords
    'URL Shortener',
    'Free URL Shortener',
    'Link Management',
    'Custom Short Link',
    'Custom Alias',
    'Dynamic QR Code Generator',
    'UTM Campaign Builder',
    'Link Analytics',
    'Password Protected Link',
    'Vercel Next.js URL Shortener',
    // Vietnam Targeted Keywords
    'Rút gọn link',
    'Rút gọn link miễn phí',
    'Rút gọn liên kết',
    'Tạo link rút gọn',
    'Tạo mã QR',
    'Tạo mã QR động',
    'Rút gọn link có mật khẩu',
    'Đo lường click liên kết',
    'Công cụ gắn link UTM',
  ],
  authors: [{ name: 'ShortLink Platform' }],
  creator: 'ShortLink',
  publisher: 'ShortLink',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'vi-VN': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['vi_VN'],
    url: getSiteUrl(),
    title: 'ShortLink | URL Shortener & Dynamic QR Studio | Rút Gọn Link',
    description:
      'Fast URL shortener, dynamic QR codes, and privacy-safe link analytics. Rút gọn link siêu tốc và tạo mã QR miễn phí.',
    siteName: 'ShortLink',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShortLink | URL Shortener & Dynamic QR Studio',
    description:
      'Fast URL shortener, dynamic QR codes, and privacy-safe link analytics.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: '2n_hKWDM5r9dlRixMDRAsSCW6hbadPKFb5ccKFfG3i0',
  },
  other: {
    'google-adsense-account': 'ca-pub-9166964727480227',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <JsonLd type="website" />
        {children}
      </body>
    </html>
  )
}
