import {
  getHomeContent,
  getPageBySlug,
  getScenarioBySlug,
  transformHomeContent,
} from '@/lib/db/queries'
import type { Page, Scenario } from '@/lib/db/schema'

/**
 * Unified content provider for all database operations
 * Centralizes error handling and provides consistent API
 */

// Home content operations
export async function getHomeContentData(locale: string) {
  try {
    const rawContent = await getHomeContent(locale)
    if (!rawContent || rawContent.length === 0) {
      return null
    }
    return transformHomeContent(rawContent)
  } catch (error) {
    console.error('Error fetching home content:', error)
    return null
  }
}

// Page content operations
export async function getPageData(
  slug: string,
  locale: string
): Promise<Page | null> {
  try {
    return await getPageBySlug(slug, locale)
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

// Scenario content operations
export async function getScenarioData(
  slug: string,
  locale: string
): Promise<Scenario | null> {
  try {
    return await getScenarioBySlug(slug, locale)
  } catch (error) {
    console.error('Error fetching scenario:', error)
    return null
  }
}

// Helper function to get content value with fallback
export function getContentValue(
  content: Record<string, Record<string, string>>,
  section: string,
  key: string,
  fallback?: string
): string {
  return content[section]?.[key] || fallback || `${section}.${key}`
}

// Helper to safely get content with logging
export function getContentWithFallback(
  dbContent: Record<string, Record<string, string>> | null,
  section: string,
  key: string,
  staticFallback: string,
  locale?: string
): string {
  if (dbContent) {
    const value = getContentValue(dbContent, section, key)
    if (value && value !== `${section}.${key}`) {
      return value
    }
  }

  // Quiet fallback (previously logged for debugging; removed to reduce noise)

  return staticFallback
}
