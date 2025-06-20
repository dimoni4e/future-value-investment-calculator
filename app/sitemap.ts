import { MetadataRoute } from 'next'
import { locales } from '@/i18n/request'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const currentDate = new Date()

  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add home page for each locale
  locales.forEach((locale) => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    })
  })

  // Add future pages that will be implemented
  const futurePages = ['about', 'legal', 'legal/privacy', 'legal/terms']

  futurePages.forEach((page) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/${page}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: page === 'about' ? 0.8 : 0.6,
      })
    })
  })

  return sitemapEntries
}
