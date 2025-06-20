import { NextRequest, NextResponse } from 'next/server'
import {
  createUserScenario,
  type UserGeneratedScenario,
} from '@/lib/user-scenarios'
import { revalidatePath } from 'next/cache'

// In-memory storage for demo (replace with database later)
const userScenarios = new Map<string, UserGeneratedScenario>()

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

    return NextResponse.json({
      success: true,
      scenario: {
        id: scenario.id,
        slug: scenario.slug,
        name: scenario.name,
        url: `/scenario/${scenario.slug}`,
      },
    })
  } catch (error) {
    console.error('Error creating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to create scenario' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    // Get specific scenario
    const scenario = userScenarios.get(slug)
    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    // Increment view count
    scenario.views += 1

    return NextResponse.json({ scenario })
  }

  // Get all scenarios
  const scenarios = Array.from(userScenarios.values())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 20) // Limit to 20 most recent

  return NextResponse.json({ scenarios })
}
