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
      'Fast URL Shortener',
      'Dynamic QR Code Generator (PNG/SVG)',
      'Privacy-safe Click Analytics',
      'Password Protected Short Links',
      'Campaign UTM Builder',
      'Custom Alias Support',
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
        name: 'What is a URL Shortener and why should I use it?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A URL shortener transforms long, clunky URLs with complex UTM tracking parameters into short, elegant links (e.g. ndllink.vercel.app/sale). It makes your links cleaner for social sharing, print materials, SMS campaigns, and provides in-depth click analytics.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are short links permanent and 100% free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! ShortLink provides free, permanent link shortening with unlimited redirects. You can optionally configure an expiration date or click limit quota if you are running a limited-time marketing promotion.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do dynamic QR codes work with short links?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every short link you generate automatically creates a dynamic QR code. Because the QR code encodes your short link rather than the raw destination, you can update your destination URL anytime from your dashboard without having to re-print your promotional brochures, menus, or packaging.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I protect sensitive links with a password?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. You can enable password protection on any link during creation or anytime later. Visitors will be greeted with a modern passcode screen before being redirected to the final destination.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does ShortLink protect against malware and phishing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We implement strict Server-Side Request Forgery (SSRF) validation, automatically block private IP addresses (127.0.0.1, 10.x, 192.168.x), filter dangerous schemes (javascript:, data:), and maintain a community abuse reporting system to promptly review flagged links.',
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
