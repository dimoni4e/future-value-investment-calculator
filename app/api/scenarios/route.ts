import { NextRequest, NextResponse } from 'next/server'
import {
  createUserScenario,
  type UserGeneratedScenario,
} from '@/lib/user-scenarios'
import {
  generateScenarioSlug,
  parseSlugToScenario,
  CalculatorInputs,
  validateScenarioParams,
} from '@/lib/scenarioUtils'
import { revalidatePath } from 'next/cache'

// In-memory storage for demo (replace with database later)
const userScenarios = new Map<string, UserGeneratedScenario>()

// In-memory cache for auto-generated scenarios (replace with Redis later)
const scenarioCache = new Map<string, any>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

interface CachedScenario {
  data: any
  timestamp: number
  views: number
}

/**
 * Check if a scenario exists by slug
 */
function checkScenarioExists(slug: string): UserGeneratedScenario | null {
  // Check user-generated scenarios first
  const userScenario = userScenarios.get(slug)
  if (userScenario) {
    return userScenario
  }

  // Check if it's a valid auto-generated scenario slug
  const parsedParams = parseSlugToScenario(slug)
  if (parsedParams && validateScenarioParams(parsedParams)) {
    // This is a valid auto-generated scenario
    return null // Indicates it should be auto-generated
  }

  return null
}

/**
 * Auto-generate scenario content based on parameters
 */
function autoGenerateScenario(params: CalculatorInputs): any {
  const slug = generateScenarioSlug(params)

  // Check cache first
  const cached = scenarioCache.get(slug)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    cached.views += 1
    return cached.data
  }

  // Generate new scenario content
  const scenario = {
    slug,
    params,
    content: {
      title: `Investment Plan: $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month`,
      description: `Calculate investing $${params.initialAmount.toLocaleString()} initially with $${params.monthlyContribution} monthly contributions at ${params.annualReturn}% annual return over ${params.timeHorizon} years.`,
      projections: {
        futureValue: calculateFutureValue(params),
        totalContributions:
          params.initialAmount +
          params.monthlyContribution * 12 * params.timeHorizon,
        totalGains: 0, // Calculated below
      },
    },
    metadata: {
      generated: true,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    },
  }

  // Calculate total gains
  scenario.content.projections.totalGains =
    scenario.content.projections.futureValue -
    scenario.content.projections.totalContributions

  // Cache the scenario
  scenarioCache.set(slug, {
    data: scenario,
    timestamp: Date.now(),
    views: 1,
  })

  return scenario
}

/**
 * Simple future value calculation
 */
function calculateFutureValue(params: CalculatorInputs): number {
  const { initialAmount, monthlyContribution, annualReturn, timeHorizon } =
    params
  const monthlyRate = annualReturn / 100 / 12
  const months = timeHorizon * 12

  // Future value of initial amount
  const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months)

  // Future value of monthly contributions (annuity)
  const fvMonthly =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  return Math.round(fvInitial + fvMonthly)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { name, description, params } = body

    if (!name || !params) {
      return NextResponse.json(
        { error: 'Name and parameters are required' },
        { status: 400 }
      )
    }

    // Validate parameters
    if (
      typeof params.initialAmount !== 'number' ||
      typeof params.monthlyContribution !== 'number' ||
      typeof params.annualReturn !== 'number' ||
      typeof params.timeHorizon !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid parameter types' },
        { status: 400 }
      )
    }

    // Create new scenario
    const scenario = createUserScenario({
      name,
      description,
      params,
    })

    // Store scenario (in production, this would be in a database)
    userScenarios.set(scenario.slug, scenario)

    // Trigger revalidation of the new page (Next.js ISR)
    await revalidatePath(`/[locale]/scenario/${scenario.slug}`)

    return NextResponse.json(
      {
        success: true,
        scenario: {
          id: scenario.id,
          slug: scenario.slug,
          name: scenario.name,
          url: `/scenario/${scenario.slug}`,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store', // creation endpoint shouldn't be cached
        },
      }
    )
  } catch (error) {
    console.error('Error creating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const action = searchParams.get('action') // 'check' or 'generate'

    if (slug !== null) {
      // Check if scenario exists (for scenario existence check)
      if (action === 'check') {
        // Handle empty slug
        if (!slug || slug.trim() === '') {
          return NextResponse.json(
            {
              exists: false,
              canGenerate: false,
              error: 'Empty scenario slug',
            },
            { status: 400 }
          )
        }

        const existingScenario = checkScenarioExists(slug)

        if (existingScenario) {
          // User-generated scenario exists
          return NextResponse.json({
            exists: true,
            type: 'user-generated',
            scenario: existingScenario,
          })
        }

        // Check if it's a valid auto-generated scenario
        const parsedParams = parseSlugToScenario(slug)
        if (parsedParams && validateScenarioParams(parsedParams)) {
          return NextResponse.json({
            exists: false,
            type: 'auto-generated',
            canGenerate: true,
            params: parsedParams,
          })
        }

        return NextResponse.json(
          {
            exists: false,
            canGenerate: false,
            error: 'Invalid scenario slug',
          },
          { status: 400 }
        )
      }

      // Generate or get scenario
      // Handle empty slug
      if (!slug || slug.trim() === '') {
        return NextResponse.json(
          { error: 'Empty scenario slug' },
          { status: 400 }
        )
      }

      const existingScenario = userScenarios.get(slug)
      if (existingScenario) {
        // User-generated scenario
        existingScenario.views += 1
        return NextResponse.json(
          { scenario: existingScenario },
          { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } }
        )
      }

      // Try to auto-generate scenario
      const parsedParams = parseSlugToScenario(slug)
      if (parsedParams && validateScenarioParams(parsedParams)) {
        const autoGeneratedScenario = autoGenerateScenario(parsedParams)
        return NextResponse.json(
          { scenario: autoGeneratedScenario },
          { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=120' } }
        )
      }

      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    // Get all user-generated scenarios
    const scenarios = Array.from(userScenarios.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20) // Limit to 20 most recent

    return NextResponse.json(
      { scenarios },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } }
    )
  } catch (error) {
    console.error('Error in GET /api/scenarios:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
