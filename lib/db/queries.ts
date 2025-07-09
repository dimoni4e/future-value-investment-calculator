import { eq, and, sql, desc } from 'drizzle-orm'
import { db } from './index'
import { homeContent, pages, scenario } from './schema'
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
 * SCENARIO QUERIES
 */

// Create a new scenario
export async function createScenario(scenarioData: {
  slug: string
  locale: string
  name: string
  description?: string
  initialAmount: number
  monthlyContribution: number
  annualReturn: number
  timeHorizon: number
  tags?: string[]
  isPredefined?: boolean
  isPublic?: boolean
  createdBy?: string
}): Promise<Scenario> {
  const [newScenario] = await db
    .insert(scenario)
    .values({
      slug: scenarioData.slug,
      locale: scenarioData.locale as 'en' | 'es' | 'pl',
      name: scenarioData.name,
      description: scenarioData.description,
      initialAmount: scenarioData.initialAmount.toString(),
      monthlyContribution: scenarioData.monthlyContribution.toString(),
      annualReturn: scenarioData.annualReturn.toString(),
      timeHorizon: scenarioData.timeHorizon,
      tags: scenarioData.tags || [],
      isPredefined: scenarioData.isPredefined || false,
      isPublic: scenarioData.isPublic || true,
      createdBy: scenarioData.createdBy || 'system',
    })
    .onConflictDoUpdate({
      target: [scenario.slug, scenario.locale],
      set: {
        name: scenarioData.name,
        description: scenarioData.description,
        initialAmount: scenarioData.initialAmount.toString(),
        monthlyContribution: scenarioData.monthlyContribution.toString(),
        annualReturn: scenarioData.annualReturn.toString(),
        timeHorizon: scenarioData.timeHorizon,
        tags: scenarioData.tags || [],
        isPublic: scenarioData.isPublic || true,
        updatedAt: new Date(),
      },
    })
    .returning()

  return newScenario
}

// Get scenario by slug and locale
export async function getScenarioBySlug(
  slug: string,
  locale: string
): Promise<Scenario | null> {
  const result = await db
    .select()
    .from(scenario)
    .where(and(eq(scenario.slug, slug), eq(scenario.locale, locale as any)))
    .limit(1)

  return result[0] || null
}

// Update scenario view count
export async function updateScenarioViews(
  slug: string,
  locale: string
): Promise<void> {
  await db
    .update(scenario)
    .set({
      viewCount: sql`${scenario.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(scenario.slug, slug), eq(scenario.locale, locale as any)))
}

// Update scenario
export async function updateScenario(
  slug: string,
  locale: string,
  updates: {
    name?: string
    description?: string
    initialAmount?: number
    monthlyContribution?: number
    annualReturn?: number
    timeHorizon?: number
    tags?: string[]
    isPublic?: boolean
  }
): Promise<Scenario> {
  const [updatedScenario] = await db
    .update(scenario)
    .set({
      name: updates.name,
      description: updates.description,
      initialAmount: updates.initialAmount?.toString(),
      monthlyContribution: updates.monthlyContribution?.toString(),
      annualReturn: updates.annualReturn?.toString(),
      timeHorizon: updates.timeHorizon,
      tags: updates.tags,
      isPublic: updates.isPublic,
      updatedAt: new Date(),
    })
    .where(and(eq(scenario.slug, slug), eq(scenario.locale, locale as any)))
    .returning()

  return updatedScenario
}

// Get predefined scenarios for a locale
export async function getPredefinedScenarios(
  locale: string
): Promise<Scenario[]> {
  return await db
    .select()
    .from(scenario)
    .where(
      and(eq(scenario.locale, locale as any), eq(scenario.isPredefined, true))
    )
}

// Get all user-generated (non-predefined) public scenarios for sitemap
export async function getUserGeneratedScenarios(): Promise<Scenario[]> {
  return await db
    .select()
    .from(scenario)
    .where(and(eq(scenario.isPredefined, false), eq(scenario.isPublic, true)))
    .orderBy(desc(scenario.createdAt))
}

// Get user-generated scenarios for a specific locale
export async function getUserGeneratedScenariosByLocale(
  locale: string
): Promise<Scenario[]> {
  return await db
    .select()
    .from(scenario)
    .where(
      and(eq(scenario.locale, locale as any), eq(scenario.isPredefined, false))
    )
    .orderBy(desc(scenario.createdAt))
}

// Get recent user-generated scenarios for homepage
export async function getRecentScenarios(
  locale: string,
  limit: number = 6
): Promise<Scenario[]> {
  return await db
    .select()
    .from(scenario)
    .where(
      and(
        eq(scenario.locale, locale as any),
        eq(scenario.isPublic, true),
        eq(scenario.isPredefined, false)
      )
    )
    .orderBy(desc(scenario.createdAt))
    .limit(limit)
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
