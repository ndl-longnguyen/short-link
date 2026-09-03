import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { getSiteUrl } from '@/lib/utils'

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
    default: 'ShortLink | Enterprise Link Management & URL Shortener',
    template: '%s | ShortLink',
  },
  description:
    'Blazing-fast URL shortener, dynamic QR code studio, and privacy-safe link analytics built with Next.js and Supabase.',
  keywords: [
    'URL Shortener',
    'Link Management',
    'Custom Alias',
    'QR Code Generator',
    'UTM Builder',
    'Link Analytics',
    'Vercel Next.js',
  ],
  authors: [{ name: 'ShortLink Platform' }],
  creator: 'ShortLink',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: getSiteUrl(),
    title: 'ShortLink | Enterprise Link Management & URL Shortener',
    description:
      'Blazing-fast URL shortener, dynamic QR code studio, and privacy-safe link analytics.',
    siteName: 'ShortLink',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShortLink | Enterprise Link Management & URL Shortener',
    description:
      'Blazing-fast URL shortener, dynamic QR code studio, and privacy-safe link analytics.',
  },
  robots: {
    index: true,
    follow: true,
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
        {children}
      </body>
    </html>
  )
}
