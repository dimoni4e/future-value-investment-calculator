import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { db } from '@/lib/db'
import { scenario } from '@/lib/db/schema'

export async function GET(request: NextRequest) {
  try {
    const scenarios = await db.select().from(scenario).limit(50)
    const payload = {
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
        'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
      ETag: etag,
    }
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers })
    }
    return new NextResponse(jsonString, {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
    })
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
