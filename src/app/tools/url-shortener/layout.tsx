import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free URL Shortener | Rút Gọn Link Nhanh Miễn Phí',
  description:
    'Fast, secure, distraction-free URL shortener. Shorten long links with custom slugs, password protection, and click limits. Không cần đăng ký tài khoản.',
  keywords: [
    'URL Shortener',
    'Free Link Shortener',
    'Short URL',
    'Custom URL Alias',
    'Rút gọn link',
    'Rút gọn link miễn phí',
    'Rút gọn liên kết',
    'Tạo link rút gọn',
    'Rút gọn link an toàn',
  ],
  alternates: {
    canonical: '/tools/url-shortener',
  },
  openGraph: {
    title: 'Free URL Shortener | Rút Gọn Link Nhanh Miễn Phí',
    description:
      'Fast, distraction-free URL shortener with custom slugs and password protection.',
  },
}

export default function UrlShortenerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
