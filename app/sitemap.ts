import { MetadataRoute } from 'next'
import { locales } from '@/i18n/request'
import { getPredefinedScenarios } from '@/lib/db/queries'

// This function fetches user-generated scenarios for the sitemap
async function getUserGeneratedScenarios() {
  try {
    // In production, this would fetch from your database
    // For now, we'll return an empty array since we're using in-memory storage
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scenarios`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    )

    if (response.ok) {
      const data = await response.json()
      return data.scenarios || []
    }
  } catch (error) {
    console.error('Error fetching user scenarios for sitemap:', error)
  }

  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const currentDate = new Date()

  const sitemapEntries: MetadataRoute.Sitemap = []

  // 1. Core pages - highest priority
  locales.forEach((locale) => {
    // Homepage
    sitemapEntries.push({
      url: locale === 'en' ? baseUrl : `${baseUrl}/${locale}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    })
  })

  // 2. Static pages
  const staticPages = [
    { path: 'about', priority: 0.8 },
    { path: 'legal/privacy', priority: 0.6 },
    { path: 'legal/terms', priority: 0.6 },
    { path: 'legal/cookies', priority: 0.5 },
  ]

  staticPages.forEach((page) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url:
          locale === 'en'
            ? `${baseUrl}/${page.path}`
            : `${baseUrl}/${locale}/${page.path}`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: page.priority,
      })
    })
  })

  // 3. Database scenarios - high priority for SEO
  for (const locale of locales) {
    try {
      const scenarios = await getPredefinedScenarios(locale)
      scenarios.forEach((scenario) => {
        sitemapEntries.push({
          url:
            locale === 'en'
              ? `${baseUrl}/scenario/${scenario.slug}`
              : `${baseUrl}/${locale}/scenario/${scenario.slug}`,
          lastModified: scenario.updatedAt || currentDate,
          changeFrequency: 'weekly',
          priority: 0.9, // High priority for predefined scenarios
        })
      })
    } catch (error) {
      console.error(`Error fetching scenarios for sitemap (${locale}):`, error)
    }
  }

  // 4. User-generated scenarios - programmatic SEO gold mine
  try {
    const userScenarios = await getUserGeneratedScenarios()

    userScenarios.forEach((scenario: any) => {
      locales.forEach((locale) => {
        sitemapEntries.push({
          url:
            locale === 'en'
              ? `${baseUrl}/scenario/${scenario.slug}`
              : `${baseUrl}/${locale}/scenario/${scenario.slug}`,
          lastModified: new Date(scenario.createdAt),
          changeFrequency: 'monthly',
          priority: 0.7, // Good priority for user scenarios
        })
      })
    })
  } catch (error) {
    console.error('Error adding user scenarios to sitemap:', error)
  }

  // 5. Scenario discovery pages
  locales.forEach((locale) => {
    sitemapEntries.push({
      url:
        locale === 'en'
          ? `${baseUrl}/scenario`
          : `${baseUrl}/${locale}/scenario`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    })
  })

  return sitemapEntries
}
