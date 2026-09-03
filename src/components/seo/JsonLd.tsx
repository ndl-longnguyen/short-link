import { getSiteUrl } from '@/lib/utils'

interface JsonLdProps {
  type?: 'website' | 'tool'
  toolName?: string
  toolDescription?: string
}

export default function JsonLd({
  type = 'website',
  toolName,
  toolDescription,
}: JsonLdProps) {
  const siteUrl = getSiteUrl()

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'ShortLink',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/icon.png`,
      width: 512,
      height: 512,
    },
    sameAs: [],
  }

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': `${siteUrl}/#webapp`,
    name: 'ShortLink - URL Shortener & QR Code Studio',
    alternateName: ['Rút Gọn Link ShortLink', 'ShortLink Platform'],
    url: siteUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    featureList: [
      'Fast URL Shortener / Rút gọn liên kết siêu tốc',
      'Dynamic QR Code Generator (PNG/SVG) / Tạo mã QR động',
      'Privacy-safe Click Analytics / Thống kê lượt click',
      'Password Protected Short Links / Đặt mật khẩu bảo vệ link',
      'Campaign UTM Builder / Công cụ gắn UTM chiến dịch',
      'Custom Alias Support / Tùy chỉnh đuôi liên kết',
    ],
    creator: {
      '@id': `${siteUrl}/#organization`,
    },
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is a URL Shortener? / Rút gọn link là gì?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A URL shortener converts long, cumbersome web addresses into neat, memorable short links (e.g. shortlink.dev/sale). In Vietnamese: Rút gọn link là công cụ chuyển đổi các đường dẫn dài phức tạp thành các liên kết ngắn gọn, dễ nhớ và thẩm mỹ.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are short links permanent and free? / Link rút gọn có miễn phí và hoạt động vĩnh viễn không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! All links created on ShortLink are 100% free with unlimited redirects unless you intentionally set an expiration date or click quota. Link được tạo hoàn toàn miễn phí và hoạt động vĩnh viễn, trừ khi bạn chủ động cấu hình ngày hết hạn hoặc giới hạn số lượt click.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do dynamic QR codes work? / Mã QR động hoạt động như thế nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dynamic QR codes encode your short link URL rather than the raw destination. This means you can update your destination link anytime from your dashboard without having to re-print your physical QR codes. Mã QR mã hóa đường dẫn rút gọn giúp bạn có thể thay đổi link đích bất kỳ lúc nào mà không cần in lại mã QR.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I protect my short links with a password? / Tôi có thể cài mật khẩu bảo vệ link không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can add a passcode to any short link during or after creation. Visitors will be prompted with a secure verification page before redirecting. Bạn có thể thiết lập mật khẩu bảo vệ cho bất kỳ liên kết nào để kiểm soát quyền truy cập.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is ShortLink safe from malware and phishing? / Nền tảng có an toàn không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ShortLink employs automated SSRF guards, private IP address blocking, suspicious protocol filters, and a community abuse reporting system to ensure all redirects remain safe. Nền tảng áp dụng các bộ lọc bảo mật tự động chặn các liên kết độc hại, IP nội bộ và lừa đảo.',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      {type === 'website' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  )
}
