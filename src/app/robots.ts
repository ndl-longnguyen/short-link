import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/tools/*', '/report', '/verify-password'],
        disallow: ['/dashboard/*', '/api/*', '/auth/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
