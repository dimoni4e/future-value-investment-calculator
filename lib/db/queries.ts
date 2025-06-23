import { eq, and, sql } from 'drizzle-orm'
import { db } from './index'
import { homeContent, pages, scenarios } from './schema'
import type { HomeContent, Page, Scenario } from './schema'

/**
 * HOME CONTENT QUERIES
 */

// Get all home content for a specific locale
export async function getHomeContent(locale: string): Promise<HomeContent[]> {
  return await db
    .select()
    .from(homeContent)
    .where(eq(homeContent.locale, locale as any))
}

// Get home content by locale and section
export async function getHomeContentBySection(
  locale: string,
  section: string
): Promise<HomeContent[]> {
  return await db
    .select()
    .from(homeContent)
    .where(
      and(
        eq(homeContent.locale, locale as any),
        eq(homeContent.section, section)
      )
    )
}

// Get specific home content value
export async function getHomeContentValue(
  locale: string,
  section: string,
  key: string
): Promise<string | null> {
  const result = await db
    .select({ value: homeContent.value })
    .from(homeContent)
    .where(
      and(
        eq(homeContent.locale, locale as any),
        eq(homeContent.section, section),
        eq(homeContent.key, key)
      )
    )
    .limit(1)

  return result[0]?.value || null
}

/**
 * PAGES QUERIES
 */

// Get all published pages for a locale
export async function getPages(locale: string): Promise<Page[]> {
  return await db
    .select()
    .from(pages)
    .where(and(eq(pages.locale, locale as any), eq(pages.published, true)))
}

// Get a specific page by slug and locale
export async function getPageBySlug(
  slug: string,
  locale: string
): Promise<Page | null> {
  const result = await db
    .select()
    .from(pages)
    .where(
      and(
        eq(pages.slug, slug),
        eq(pages.locale, locale as any),
        eq(pages.published, true)
      )
    )
    .limit(1)

  return result[0] || null
}

/**
 * SCENARIOS QUERIES
 */

// Get all predefined scenarios for a locale
export async function getPredefinedScenarios(
  locale: string
): Promise<Scenario[]> {
  return await db
    .select()
    .from(scenarios)
    .where(
      and(
        eq(scenarios.locale, locale as any),
        eq(scenarios.isPredefined, true),
        eq(scenarios.isPublic, true)
      )
    )
    .orderBy(scenarios.viewCount)
}

// Get a specific scenario by slug and locale
export async function getScenarioBySlug(
  slug: string,
  locale: string
): Promise<Scenario | null> {
  const result = await db
    .select()
    .from(scenarios)
    .where(
      and(
        eq(scenarios.slug, slug),
        eq(scenarios.locale, locale as any),
        eq(scenarios.isPublic, true)
      )
    )
    .limit(1)

  return result[0] || null
}

// Get popular public scenarios
export async function getPopularScenarios(
  locale: string,
  limit: number = 10
): Promise<Scenario[]> {
  return await db
    .select()
    .from(scenarios)
    .where(
      and(eq(scenarios.locale, locale as any), eq(scenarios.isPublic, true))
    )
    .orderBy(scenarios.viewCount)
    .limit(limit)
}

// Increment view count for a scenario
export async function incrementScenarioViews(
  scenarioId: string
): Promise<void> {
  await db
    .update(scenarios)
    .set({
      viewCount: sql`${scenarios.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(scenarios.id, scenarioId))
}

/**
 * UTILITY FUNCTIONS
 */

// Get all supported locales
export function getSupportedLocales(): string[] {
  return ['en', 'pl', 'es']
}

// Transform home content array into a nested object for easier use
export function transformHomeContent(
  content: HomeContent[]
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {}

  content.forEach((item) => {
    if (!result[item.section]) {
      result[item.section] = {}
    }
    result[item.section][item.key] = item.value
  })

  return result
}
