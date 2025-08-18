import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
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

    const res = NextResponse.json(
      {
        scenarios: result.scenarios,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit),
      },
      {
        headers: {
          // Short edge cache; SWR allows serving slightly stale while revalidating.
          'Cache-Control':
            'public, max-age=30, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
    return res
  } catch (error) {
    console.error('Scenario search error:', error)
    return NextResponse.json(
      { error: 'Failed to search scenarios' },
      { status: 500 }
    )
  }
}
