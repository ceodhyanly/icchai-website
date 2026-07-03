import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/dashboard', '/login'],
      },
    ],
    sitemap: 'https://icchai2026.org/sitemap.xml',
  }
}
