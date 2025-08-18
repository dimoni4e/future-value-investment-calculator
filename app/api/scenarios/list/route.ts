import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { scenario } from '@/lib/db/schema'

export async function GET() {
  try {
    const scenarios = await db.select().from(scenario).limit(50)

    return NextResponse.json(
      {
        success: true,
        count: scenarios.length,
        scenarios: scenarios.map((s) => ({
          slug: s.slug,
          name: s.name,
          locale: s.locale,
          initialAmount: s.initialAmount,
          monthlyContribution: s.monthlyContribution,
          annualReturn: s.annualReturn,
          timeHorizon: s.timeHorizon,
          viewCount: s.viewCount,
          createdAt: s.createdAt,
          isPublic: s.isPublic,
          isPredefined: s.isPredefined,
        })),
      },
      {
        headers: {
          'Cache-Control':
            'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('Error querying database:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to query database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
