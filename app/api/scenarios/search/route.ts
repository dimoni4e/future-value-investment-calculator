import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import crypto from 'node:crypto'
import {
  getScenariosWithFilters,
  getTrendingScenarios,
  getScenarioCategories,
} from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Parse filters
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category')?.split(',').filter(Boolean) || [],
      minAmount: searchParams.get('minAmount')
        ? parseFloat(searchParams.get('minAmount')!)
        : undefined,
      maxAmount: searchParams.get('maxAmount')
        ? parseFloat(searchParams.get('maxAmount')!)
        : undefined,
      minTimeHorizon: searchParams.get('minTimeHorizon')
        ? parseInt(searchParams.get('minTimeHorizon')!)
        : undefined,
      maxTimeHorizon: searchParams.get('maxTimeHorizon')
        ? parseInt(searchParams.get('maxTimeHorizon')!)
        : undefined,
      minReturn: searchParams.get('minReturn')
        ? parseFloat(searchParams.get('minReturn')!)
        : undefined,
      maxReturn: searchParams.get('maxReturn')
        ? parseFloat(searchParams.get('maxReturn')!)
        : undefined,
      isPredefined: searchParams.get('isPredefined')
        ? searchParams.get('isPredefined') === 'true'
        : undefined,
      sortBy:
        (searchParams.get('sortBy') as
          | 'newest'
          | 'popular'
          | 'return'
          | 'amount') || 'newest',
      limit,
      offset,
    }

    // Cache search results per (locale + filters) for 10 minutes
    const cacheKey = [
      'scenarios-search',
      locale,
      filters.search || '',
      (filters.category || []).join(','),
      String(filters.minAmount ?? ''),
      String(filters.maxAmount ?? ''),
      String(filters.minTimeHorizon ?? ''),
      String(filters.maxTimeHorizon ?? ''),
      String(filters.minReturn ?? ''),
      String(filters.maxReturn ?? ''),
      String(filters.isPredefined ?? ''),
      String(filters.sortBy ?? ''),
      String(page),
      String(limit),
    ]

    const getCached = unstable_cache(
      async () => getScenariosWithFilters(locale, filters),
      cacheKey,
      { revalidate: 600, tags: [`scenarios:search:${locale}`] }
    )

    const result = await getCached()

    const payload = {
      scenarios: result.scenarios,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    }
    const jsonString = JSON.stringify(payload)
    const etag =
      'W/"' +
      crypto
        .createHash('sha1')
        .update(jsonString)
        .digest('base64')
        .slice(0, 27) +
      '"'

    const ifNoneMatch = request.headers.get('if-none-match')
    const headers: Record<string, string> = {
      'Cache-Control':
        'public, max-age=30, s-maxage=300, stale-while-revalidate=600',
      ETag: etag,
    }
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers })
    }
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    })
  } catch (error) {
    console.error('Scenario search error:', error)
    return NextResponse.json(
      { error: 'Failed to search scenarios' },
      { status: 500 }
    )
  }
}
