import { NextRequest, NextResponse } from 'next/server'
import {
  parseSlugToScenario,
  validateScenarioParams,
  generateScenarioSlug,
} from '@/lib/scenarioUtils'

// In-memory storage (will be replaced with database later)
const generatedScenarios = new Map<string, any>()
const userScenarios = new Map<string, any>()

// In-memory cache with TTL (will be replaced with Redis later)
const scenarioCache = new Map<string, any>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

interface CacheEntry {
  data: any
  timestamp: number
  views: number
  ttl: number
}

interface ScenarioCheckResponse {
  exists: boolean
  cached: boolean
  type?: 'user-generated' | 'auto-generated'
  scenario?: any
  canGenerate?: boolean
  params?: any
  cacheHit?: boolean
  error?: string
}

/**
 * Check if scenario exists with cache-first strategy
 */
function checkScenarioExistsWithCache(slug: string): ScenarioCheckResponse {
  // Cache-first strategy: Check cache before database/storage
  const cacheKey = `scenario:${slug}`
  const cachedEntry = scenarioCache.get(cacheKey)

  if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
    // Cache hit - increment views and return cached data
    cachedEntry.views += 1
    cachedEntry.timestamp = Date.now() // Update access time

    return {
      exists: true,
      cached: true,
      cacheHit: true,
      type: cachedEntry.data.type || 'auto-generated',
      scenario: cachedEntry.data,
    }
  }

  // Cache miss - check storage
  // First check user-generated scenarios
  const userScenario = userScenarios.get(slug)
  if (userScenario) {
    // Cache the user scenario for future requests
    scenarioCache.set(cacheKey, {
      data: { ...userScenario, type: 'user-generated' },
      timestamp: Date.now(),
      views: 1,
      ttl: CACHE_TTL,
    })

    return {
      exists: true,
      cached: false,
      cacheHit: false,
      type: 'user-generated',
      scenario: userScenario,
    }
  }

  // Check generated scenarios storage
  const generatedScenario = generatedScenarios.get(slug)
  if (generatedScenario) {
    // Cache the generated scenario
    scenarioCache.set(cacheKey, {
      data: { ...generatedScenario, type: 'auto-generated' },
      timestamp: Date.now(),
      views: 1,
      ttl: CACHE_TTL,
    })

    return {
      exists: true,
      cached: false,
      cacheHit: false,
      type: 'auto-generated',
      scenario: generatedScenario,
    }
  }

  // Scenario doesn't exist - check if it can be auto-generated
  const parsedParams = parseSlugToScenario(slug)
  if (parsedParams && validateScenarioParams(parsedParams)) {
    return {
      exists: false,
      cached: false,
      cacheHit: false,
      canGenerate: true,
      params: parsedParams,
    }
  }

  return {
    exists: false,
    cached: false,
    cacheHit: false,
    canGenerate: false,
    error: 'Invalid scenario slug format',
  }
}

/**
 * Get cache statistics for monitoring
 */
function getCacheStats() {
  const now = Date.now()
  let validEntries = 0
  let expiredEntries = 0
  let totalViews = 0

  for (const [key, entry] of Array.from(scenarioCache.entries())) {
    if (now - entry.timestamp < entry.ttl) {
      validEntries++
      totalViews += entry.views
    } else {
      expiredEntries++
    }
  }

  return {
    totalEntries: scenarioCache.size,
    validEntries,
    expiredEntries,
    totalViews,
    hitRate:
      totalViews > 0 ? validEntries / (validEntries + expiredEntries) : 0,
  }
}

/**
 * Clean expired cache entries
 */
function cleanExpiredCache() {
  const now = Date.now()
  const keysToDelete: string[] = []

  for (const [key, entry] of Array.from(scenarioCache.entries())) {
    if (now - entry.timestamp >= entry.ttl) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach((key) => scenarioCache.delete(key))
  return keysToDelete.length
}

/**
 * GET /api/scenarios/check
 * Check if a scenario exists by slug with cache-first strategy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const includeStats = searchParams.get('stats') === 'true'
    const cleanup = searchParams.get('cleanup') === 'true'

    // Handle cache cleanup request
    if (cleanup) {
      const cleanedCount = cleanExpiredCache()
      return NextResponse.json({
        success: true,
        message: `Cleaned ${cleanedCount} expired cache entries`,
        stats: getCacheStats(),
      })
    }

    // Handle stats request
    if (includeStats && !slug) {
      return NextResponse.json({
        success: true,
        stats: getCacheStats(),
      })
    }

    // Validate slug parameter
    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug parameter is required',
          exists: false,
          cached: false,
          canGenerate: false,
        },
        { status: 400 }
      )
    }

    // Handle empty or invalid slug
    if (slug.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Empty scenario slug',
          exists: false,
          cached: false,
          canGenerate: false,
        },
        { status: 400 }
      )
    }

    // Check scenario existence with cache-first strategy
    const result = checkScenarioExistsWithCache(slug)

    // Add stats if requested
    const response: any = {
      success: true,
      slug,
      ...result,
    }

    if (includeStats) {
      response.stats = getCacheStats()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in scenario existence check:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        exists: false,
        cached: false,
        canGenerate: false,
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/scenarios/check
 * Batch check multiple scenarios at once
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slugs, includeStats } = body

    if (!Array.isArray(slugs)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slugs must be an array',
        },
        { status: 400 }
      )
    }

    if (slugs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one slug is required',
        },
        { status: 400 }
      )
    }

    if (slugs.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 100 slugs allowed per batch',
        },
        { status: 400 }
      )
    }

    // Check each scenario
    const results = slugs.map((slug: string) => {
      if (typeof slug !== 'string' || slug.trim() === '') {
        return {
          slug,
          success: false,
          error: 'Invalid slug',
          exists: false,
          cached: false,
          canGenerate: false,
        }
      }

      try {
        const result = checkScenarioExistsWithCache(slug.trim())
        return {
          slug: slug.trim(),
          success: true,
          ...result,
        }
      } catch (error) {
        return {
          slug,
          success: false,
          error: 'Failed to check scenario',
          exists: false,
          cached: false,
          canGenerate: false,
        }
      }
    })

    const response: any = {
      success: true,
      totalChecked: slugs.length,
      results,
    }

    if (includeStats) {
      response.stats = getCacheStats()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in batch scenario check:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/scenarios/check
 * Clear cache or remove specific entries
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const clearAll = searchParams.get('all') === 'true'

    if (clearAll) {
      const originalSize = scenarioCache.size
      scenarioCache.clear()
      return NextResponse.json({
        success: true,
        message: `Cleared all ${originalSize} cache entries`,
        stats: getCacheStats(),
      })
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slug parameter is required (or use ?all=true to clear all)',
        },
        { status: 400 }
      )
    }

    const cacheKey = `scenario:${slug}`
    const existed = scenarioCache.has(cacheKey)
    scenarioCache.delete(cacheKey)

    return NextResponse.json({
      success: true,
      slug,
      removed: existed,
      message: existed
        ? `Removed cache entry for ${slug}`
        : `Cache entry for ${slug} did not exist`,
      stats: getCacheStats(),
    })
  } catch (error) {
    console.error('Error in cache deletion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
