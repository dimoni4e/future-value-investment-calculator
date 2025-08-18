import { eq, and, sql, desc } from 'drizzle-orm'
import { db } from './index'
import { homeContent, pages, scenario } from './schema'
import type { HomeContent, Page, Scenario } from './schema'
import { revalidateTag } from 'next/cache'

/**
 * In-memory cache + batched view updates (per runtime instance)
 */
interface CacheEntry<T> {
  value: T
  expires: number
}
const cache = new Map<string, CacheEntry<any>>()
const now = () => Date.now()
const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes
const SHORT_TTL = 1000 * 30 // 30 seconds

function getCache<T>(key: string): T | undefined {
  const e = cache.get(key)
  if (!e) return undefined
  if (e.expires < now()) {
    cache.delete(key)
    return undefined
  }
  return e.value as T
}
function setCache<T>(key: string, value: T, ttl: number = DEFAULT_TTL) {
  cache.set(key, { value, expires: now() + ttl })
}
function invalidatePrefix(prefix: string) {
  Array.from(cache.keys()).forEach((k) => {
    if (k.startsWith(prefix)) cache.delete(k)
  })
}

// Batched view counter
interface PendingView {
  slug: string
  locale: string
  count: number
}
const viewBuffer = new Map<string, PendingView>()
let flushScheduled = false
const VIEW_FLUSH_INTERVAL = 5000
let lastFlush = now()
async function flushViews() {
  flushScheduled = false
  if (!viewBuffer.size) return
  const items = Array.from(viewBuffer.values())
  viewBuffer.clear()
  lastFlush = now()
  try {
    await db.transaction(async (tx) => {
      for (const { slug, locale, count } of items) {
        await tx
          .update(scenario)
          .set({
            viewCount: sql`${scenario.viewCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(
            and(eq(scenario.slug, slug), eq(scenario.locale, locale as any))
          )
      }
    })
    const locs = new Set(items.map((i) => i.locale))
    locs.forEach((l) => {
      invalidatePrefix(`trending:${l}`)
      invalidatePrefix(`recent:${l}`)
    })
  } catch {
    // Best-effort fallback
    for (const { slug, locale, count } of items) {
      try {
        await db
          .update(scenario)
          .set({
            viewCount: sql`${scenario.viewCount} + ${count}`,
            updatedAt: new Date(),
          })
          .where(
            and(eq(scenario.slug, slug), eq(scenario.locale, locale as any))
          )
      } catch {}
    }
  }
}
function scheduleFlush() {
  if (!flushScheduled) {
    flushScheduled = true
    setTimeout(() => flushViews(), VIEW_FLUSH_INTERVAL).unref?.()
  }
  if (now() - lastFlush > VIEW_FLUSH_INTERVAL * 3) flushViews()
}
async function bufferViewIncrement(slug: string, locale: string) {
  const key = `${slug}::${locale}`
  const existing = viewBuffer.get(key)
  if (existing) existing.count += 1
  else viewBuffer.set(key, { slug, locale, count: 1 })
  scheduleFlush()
}

/**
 * HOME CONTENT QUERIES
 */

// Explicit column selections (avoid SELECT *)
const homeContentSelection = {
  id: homeContent.id,
  locale: homeContent.locale,
  section: homeContent.section,
  key: homeContent.key,
  value: homeContent.value,
  createdAt: homeContent.createdAt,
  updatedAt: homeContent.updatedAt,
}

const pageSelection = {
  id: pages.id,
  slug: pages.slug,
  locale: pages.locale,
  title: pages.title,
  content: pages.content,
  metaDescription: pages.metaDescription,
  metaKeywords: pages.metaKeywords,
  published: pages.published,
  createdAt: pages.createdAt,
  updatedAt: pages.updatedAt,
}

const scenarioSelection = {
  id: scenario.id,
  slug: scenario.slug,
  locale: scenario.locale,
  name: scenario.name,
  description: scenario.description,
  initialAmount: scenario.initialAmount,
  monthlyContribution: scenario.monthlyContribution,
  annualReturn: scenario.annualReturn,
  timeHorizon: scenario.timeHorizon,
  tags: scenario.tags,
  isPredefined: scenario.isPredefined,
  isPublic: scenario.isPublic,
  createdBy: scenario.createdBy,
  viewCount: scenario.viewCount,
  createdAt: scenario.createdAt,
  updatedAt: scenario.updatedAt,
}

// Get all home content for a specific locale
export async function getHomeContent(locale: string): Promise<HomeContent[]> {
  const cacheKey = `home_content:${locale}`
  const cached = getCache<HomeContent[]>(cacheKey)
  if (cached) return cached
  const rows = await db
    .select(homeContentSelection)
    .from(homeContent)
    .where(eq(homeContent.locale, locale as any))
  setCache(cacheKey, rows, DEFAULT_TTL)
  return rows
}

// Get home content by locale and section
export async function getHomeContentBySection(
  locale: string,
  section: string
): Promise<HomeContent[]> {
  return await db
    .select(homeContentSelection)
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
    .select(pageSelection)
    .from(pages)
    .where(and(eq(pages.locale, locale as any), eq(pages.published, true)))
}

// Get a specific page by slug and locale
export async function getPageBySlug(
  slug: string,
  locale: string
): Promise<Page | null> {
  const result = await db
    .select(pageSelection)
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

  // Revalidate caches for this scenario and related lists
  try {
    revalidateTag(`scenario:${scenarioData.slug}:${scenarioData.locale}`)
    revalidateTag(`scenarios:search:${scenarioData.locale}`)
    revalidateTag(`scenarios:trending:${scenarioData.locale}`)
    revalidateTag(`scenarios:categories:${scenarioData.locale}`)
  } catch {}
  // Invalidate in-memory caches
  invalidatePrefix(`recent:${scenarioData.locale}`)
  invalidatePrefix(`trending:${scenarioData.locale}`)
  invalidatePrefix(`categories:${scenarioData.locale}`)
  cache.delete(`scenario:${scenarioData.locale}:${scenarioData.slug}`)
  return newScenario
}

// Get scenario by slug and locale
export async function getScenarioBySlug(
  slug: string,
  locale: string
): Promise<Scenario | null> {
  const result = await db
    .select(scenarioSelection)
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
  // Buffer increment to reduce write frequency
  await bufferViewIncrement(slug, locale)
  // Invalidate per-scenario cache quickly so subsequent reads refetch
  cache.delete(`scenario:${locale}:${slug}`)
  revalidateTag(`scenarios:trending:${locale}`)
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

  // Revalidate caches for this scenario and related lists
  try {
    revalidateTag(`scenario:${slug}:${locale}`)
    revalidateTag(`scenarios:search:${locale}`)
    revalidateTag(`scenarios:trending:${locale}`)
    revalidateTag(`scenarios:categories:${locale}`)
  } catch {}
  // Invalidate in-memory caches
  invalidatePrefix(`recent:${locale}`)
  invalidatePrefix(`trending:${locale}`)
  invalidatePrefix(`categories:${locale}`)
  cache.delete(`scenario:${locale}:${slug}`)
  return updatedScenario
}

// Get predefined scenarios for a locale
export async function getPredefinedScenarios(
  locale: string
): Promise<Scenario[]> {
  return await db
    .select(scenarioSelection)
    .from(scenario)
    .where(
      and(eq(scenario.locale, locale as any), eq(scenario.isPredefined, true))
    )
}

// Get all user-generated (non-predefined) public scenarios for sitemap
export async function getUserGeneratedScenarios(): Promise<Scenario[]> {
  return await db
    .select(scenarioSelection)
    .from(scenario)
    .where(and(eq(scenario.isPredefined, false), eq(scenario.isPublic, true)))
    .orderBy(desc(scenario.createdAt))
}

// Get user-generated scenarios for a specific locale
export async function getUserGeneratedScenariosByLocale(
  locale: string
): Promise<Scenario[]> {
  return await db
    .select(scenarioSelection)
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
    .select(scenarioSelection)
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

// Get scenarios with filtering and search capabilities
export async function getScenariosWithFilters(
  locale: string,
  filters: {
    search?: string
    category?: string[]
    minAmount?: number
    maxAmount?: number
    minTimeHorizon?: number
    maxTimeHorizon?: number
    minReturn?: number
    maxReturn?: number
    isPredefined?: boolean
    sortBy?: 'newest' | 'popular' | 'return' | 'amount'
    limit?: number
    offset?: number
  } = {}
): Promise<{ scenarios: Scenario[]; total: number }> {
  const conditions = [
    eq(scenario.locale, locale as any),
    eq(scenario.isPublic, true),
  ]

  // Filter by predefined status
  if (filters.isPredefined !== undefined) {
    conditions.push(eq(scenario.isPredefined, filters.isPredefined))
  }

  // Search in name and description
  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`
    conditions.push(
      sql`(LOWER(${scenario.name}) LIKE ${searchTerm} OR LOWER(${scenario.description}) LIKE ${searchTerm})`
    )
  }

  // Filter by category tags
  if (filters.category && filters.category.length > 0) {
    conditions.push(sql`${scenario.tags} && ${filters.category}`)
  }

  // Filter by initial amount range
  if (filters.minAmount !== undefined) {
    conditions.push(sql`${scenario.initialAmount} >= ${filters.minAmount}`)
  }
  if (filters.maxAmount !== undefined) {
    conditions.push(sql`${scenario.initialAmount} <= ${filters.maxAmount}`)
  }

  // Filter by time horizon range
  if (filters.minTimeHorizon !== undefined) {
    conditions.push(sql`${scenario.timeHorizon} >= ${filters.minTimeHorizon}`)
  }
  if (filters.maxTimeHorizon !== undefined) {
    conditions.push(sql`${scenario.timeHorizon} <= ${filters.maxTimeHorizon}`)
  }

  // Filter by return rate range
  if (filters.minReturn !== undefined) {
    conditions.push(sql`${scenario.annualReturn} >= ${filters.minReturn}`)
  }
  if (filters.maxReturn !== undefined) {
    conditions.push(sql`${scenario.annualReturn} <= ${filters.maxReturn}`)
  }

  const whereClause = and(...conditions)

  // Determine sort order
  let orderBy
  switch (filters.sortBy) {
    case 'popular':
      orderBy = desc(scenario.viewCount)
      break
    case 'return':
      orderBy = desc(scenario.annualReturn)
      break
    case 'amount':
      orderBy = desc(scenario.initialAmount)
      break
    case 'newest':
    default:
      orderBy = desc(scenario.createdAt)
      break
  }

  // Build the scenarios query with all options at once
  const scenariosQueryBuilder = db
    .select(scenarioSelection)
    .from(scenario)
    .where(whereClause)
    .orderBy(orderBy)

  // Apply pagination if provided
  const paginationOptions: any[] = []
  if (filters.offset) paginationOptions.push(filters.offset)
  if (filters.limit) paginationOptions.push(filters.limit)

  const scenariosQuery =
    paginationOptions.length === 2
      ? scenariosQueryBuilder
          .offset(paginationOptions[0])
          .limit(paginationOptions[1])
      : paginationOptions.length === 1 && filters.limit
        ? scenariosQueryBuilder.limit(paginationOptions[0])
        : scenariosQueryBuilder

  const countQuery = db
    .select({ count: sql`count(*)`.as('count') })
    .from(scenario)
    .where(whereClause)

  const [scenarios, totalCount] = await Promise.all([
    scenariosQuery,
    countQuery,
  ])

  return {
    scenarios,
    total: Number(totalCount[0]?.count || 0),
  }
}

// Get trending scenarios (most viewed recently)
export async function getTrendingScenarios(
  locale: string,
  limit: number = 6
): Promise<Scenario[]> {
  return await db
    .select(scenarioSelection)
    .from(scenario)
    .where(
      and(
        eq(scenario.locale, locale as any),
        eq(scenario.isPublic, true),
        sql`${scenario.updatedAt} > NOW() - INTERVAL '7 days'`
      )
    )
    .orderBy(desc(scenario.viewCount))
    .limit(limit)
}

// Get scenario categories/tags statistics
export async function getScenarioCategories(
  locale: string
): Promise<Array<{ category: string; count: number }>> {
  const result = await db
    .select({
      category: sql`unnest(${scenario.tags})`.as('category'),
      count: sql`count(*)`.as('count'),
    })
    .from(scenario)
    .where(and(eq(scenario.locale, locale as any), eq(scenario.isPublic, true)))
    .groupBy(sql`unnest(${scenario.tags})`)
    .orderBy(sql`count(*) DESC`)

  return result.map((row) => ({
    category: row.category as string,
    count: Number(row.count),
  }))
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
