import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Do not disallow /_next to ensure ad scripts and assets are discoverable.
        disallow: ['/api/', '/admin/'],
      },
      // Explicitly allow AdSense crawler
      {
        userAgent: 'Mediapartners-Google',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/en/',
          '/es/',
          '/pl/',
          '/scenario/', // Allow all scenario pages and discovery
        ],
        crawlDelay: 1, // Be nice to Google
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
