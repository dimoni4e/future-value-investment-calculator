import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { scenario } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getRecentScenarios } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const checkSlug = url.searchParams.get('slug')

    if (checkSlug) {
      // Check specific scenario
      const scenarios = await db
        .select()
        .from(scenario)
        .where(eq(scenario.slug, checkSlug))

      return NextResponse.json({
        slug: checkSlug,
        found: scenarios.length > 0,
        scenarios: scenarios.map((s) => ({
          id: s.id,
          slug: s.slug,
          locale: s.locale,
          name: s.name,
          isPublic: s.isPublic,
          isPredefined: s.isPredefined,
          createdAt: s.createdAt,
        })),
      })
    }

    // Get recent user scenarios for debugging
    const recentScenarios = await db
      .select({
        id: scenario.id,
        slug: scenario.slug,
        locale: scenario.locale,
        name: scenario.name,
        isPublic: scenario.isPublic,
        isPredefined: scenario.isPredefined,
        createdAt: scenario.createdAt,
      })
      .from(scenario)
      .where(and(eq(scenario.locale, 'en'), eq(scenario.isPredefined, false)))
      .orderBy(desc(scenario.createdAt))
      .limit(10)

    // Get scenarios for homepage
    const homepageScenarios = await db
      .select({
        id: scenario.id,
        slug: scenario.slug,
        locale: scenario.locale,
        name: scenario.name,
        isPublic: scenario.isPublic,
        isPredefined: scenario.isPredefined,
        createdAt: scenario.createdAt,
      })
      .from(scenario)
      .where(
        and(
          eq(scenario.locale, 'en'),
          eq(scenario.isPublic, true),
          eq(scenario.isPredefined, false)
        )
      )
      .orderBy(desc(scenario.createdAt))
      .limit(6)

    // Call the same function used by the homepage
    const functionCallResult = await getRecentScenarios('en', 36)

    return NextResponse.json({
      message: 'Database debug information',
      recentScenarios,
      homepageScenarios,
      functionCallResult,
      targetScenario: 'invest-10000-monthly-900-12percent-20years-investment',
    })
  } catch (error) {
    console.error('Database debug error:', error)
    return NextResponse.json(
      { error: 'Failed to query database', details: String(error) },
      { status: 500 }
    )
  }
}
