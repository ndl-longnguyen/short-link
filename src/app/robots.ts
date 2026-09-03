import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tools', '/tools/*', '/report'],
        disallow: ['/dashboard/*', '/api/*', '/auth/*', '/verify-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
