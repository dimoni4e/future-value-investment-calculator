import { NextRequest, NextResponse } from 'next/server'
import {
  generatePersonalizedContent,
  type CalculatorInputs,
} from '@/lib/contentGenerator'
import {
  generateScenarioSlug,
  parseSlugToScenario,
  validateScenarioParams,
  detectInvestmentGoal,
  type ScenarioParams,
} from '@/lib/scenarioUtils'
import {
  createScenario,
  getScenarioBySlug,
  updateScenarioViews,
} from '@/lib/db/queries'
import { createUserScenario } from '@/lib/user-scenarios'
import { revalidatePath } from 'next/cache'

// Extended interface for calculated parameters
interface ExtendedCalculatorInputs extends CalculatorInputs {
  goal: string
  futureValue?: number
  totalContributions?: number
  totalGains?: number
}

// In-memory storage for demo (replace with database later)
const generatedScenarios = new Map<string, any>()

// In-memory cache for popular scenarios (replace with Redis later)
const scenarioCache = new Map<string, any>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

interface GeneratedScenarioData {
  slug: string
  params: ExtendedCalculatorInputs
  content: any
  metadata: {
    generated: boolean
    createdAt: string
    lastAccessed: string
    views: number
    locale: string
  }
}

/**
 * Generate comprehensive scenario content using templates
 */
async function generateScenarioContent(
  params: ExtendedCalculatorInputs,
  locale: string = 'en'
): Promise<GeneratedScenarioData> {
  const slug = generateScenarioSlug(params)

  // Check if scenario already exists in database
  try {
    const existingScenario = await getScenarioBySlug(slug, locale)
    if (existingScenario) {
      // Update view count
      await updateScenarioViews(slug, locale)

      // Generate content using templates
      const contentSections = generatePersonalizedContent(params, locale)

      // Return existing scenario data with fresh content
      return {
        slug,
        params,
        content: {
          // Basic information
          title: `Investment Plan: $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month`,
          description: `Calculate investing $${params.initialAmount.toLocaleString()} initially with $${params.monthlyContribution} monthly contributions at ${params.annualReturn}% annual return over ${params.timeHorizon} years.`,

          // Financial projections
          projections: {
            futureValue: params.futureValue || 0,
            totalContributions: params.totalContributions || 0,
            totalGains: params.totalGains || 0,
          },

          // Generated content sections
          sections: contentSections,

          // SEO metadata
          seo: {
            title: `Invest $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month at ${params.annualReturn}% - ${params.timeHorizon} Year ${params.goal} Plan`,
            description: `Calculate investing $${params.initialAmount.toLocaleString()} initially with $${params.monthlyContribution} monthly contributions at ${params.annualReturn}% annual return over ${params.timeHorizon} years. See detailed projections and investment insights.`,
            keywords: `invest ${params.initialAmount}, monthly ${params.monthlyContribution}, ${params.annualReturn} percent return, ${params.timeHorizon} year investment, ${params.goal}`,
          },
        },
        metadata: {
          generated: false,
          createdAt: existingScenario.createdAt.toISOString(),
          lastAccessed: new Date().toISOString(),
          views: existingScenario.viewCount + 1,
          locale,
        },
      }
    }
  } catch (error) {
    console.warn('Database check failed, proceeding with generation:', error)
  }

  // Check cache second
  const cacheKey = `${slug}-${locale}`
  const cached = scenarioCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    cached.views += 1
    return cached.data
  }

  // Generate personalized content using templates
  const contentSections = generatePersonalizedContent(params, locale)

  // Create comprehensive scenario data
  const scenarioData: GeneratedScenarioData = {
    slug,
    params,
    content: {
      // Basic information
      title: `Investment Plan: $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month`,
      description: `Calculate investing $${params.initialAmount.toLocaleString()} initially with $${params.monthlyContribution} monthly contributions at ${params.annualReturn}% annual return over ${params.timeHorizon} years.`,

      // Financial projections
      projections: {
        futureValue: params.futureValue || 0,
        totalContributions: params.totalContributions || 0,
        totalGains: params.totalGains || 0,
      },

      // Generated content sections
      sections: contentSections,

      // SEO metadata
      seo: {
        title: `Invest $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month at ${params.annualReturn}% - ${params.timeHorizon} Year ${params.goal} Plan`,
        description: `Calculate investing $${params.initialAmount.toLocaleString()} initially with $${params.monthlyContribution} monthly contributions at ${params.annualReturn}% annual return over ${params.timeHorizon} years. See detailed projections and investment insights.`,
        keywords: `invest ${params.initialAmount}, monthly ${params.monthlyContribution}, ${params.annualReturn} percent return, ${params.timeHorizon} year investment, ${params.goal}`,
      },
    },
    metadata: {
      generated: true,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      views: 1,
      locale,
    },
  }

  // Save to database (with error handling)
  try {
    await createScenario({
      slug,
      locale,
      name: `Investment Plan: $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month`,
      description: `Calculate investing $${params.initialAmount.toLocaleString()} initially with $${params.monthlyContribution} monthly contributions at ${params.annualReturn}% annual return over ${params.timeHorizon} years.`,
      initialAmount: params.initialAmount,
      monthlyContribution: params.monthlyContribution,
      annualReturn: params.annualReturn,
      timeHorizon: params.timeHorizon,
      tags: [params.goal],
      isPredefined: false,
      isPublic: true,
      createdBy: 'system',
    })
    console.log(`✅ Saved scenario to database: ${slug}`)
  } catch (error) {
    console.warn('❌ Failed to save scenario to database:', error)
    // Continue with in-memory storage as fallback
  }

  // Save to storage (fallback for when database is unavailable)
  generatedScenarios.set(slug, scenarioData)

  // Cache the scenario
  scenarioCache.set(cacheKey, {
    data: scenarioData,
    timestamp: Date.now(),
    views: 1,
  })

  return scenarioData
}

/**
 * POST - Generate new scenario content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { params, locale = 'en' } = body

    // Validate input
    if (!params) {
      return NextResponse.json(
        { error: 'Parameters are required' },
        { status: 400 }
      )
    }

    // Validate parameters
    if (!validateScenarioParams(params)) {
      return NextResponse.json(
        { error: 'Invalid parameter values' },
        { status: 400 }
      )
    }

    // Detect investment goal if not provided
    if (!params.goal) {
      params.goal = detectInvestmentGoal(params)
    }

    // Calculate financial projections if not provided
    if (!params.futureValue) {
      const { initialAmount, monthlyContribution, annualReturn, timeHorizon } =
        params
      const monthlyRate = annualReturn / 100 / 12
      const months = timeHorizon * 12

      // Future value calculation
      const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months)
      const fvMonthly =
        monthlyContribution *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

      params.futureValue = Math.round(fvInitial + fvMonthly)
      params.totalContributions =
        initialAmount + monthlyContribution * 12 * timeHorizon
      params.totalGains = params.futureValue - params.totalContributions
    }

    // Generate comprehensive scenario content
    const scenarioData = await generateScenarioContent(params, locale)

    // Trigger revalidation of the new page (Next.js ISR)
    await revalidatePath(`/[locale]/scenario/${scenarioData.slug}`)

    return NextResponse.json({
      success: true,
      scenario: {
        slug: scenarioData.slug,
        url: `/scenario/${scenarioData.slug}`,
        content: scenarioData.content,
        metadata: scenarioData.metadata,
      },
    })
  } catch (error) {
    console.error('Error generating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to generate scenario content' },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve generated scenario or check if it exists
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const locale = searchParams.get('locale') || 'en'

    if (!slug) {
      return NextResponse.json(
        { error: 'Scenario slug is required' },
        { status: 400 }
      )
    }

    // Check if scenario already exists in storage
    const existingScenario = generatedScenarios.get(slug)
    if (existingScenario) {
      // Update access time and views
      existingScenario.metadata.lastAccessed = new Date().toISOString()
      existingScenario.metadata.views += 1

      return NextResponse.json({
        exists: true,
        scenario: existingScenario,
      })
    }

    // Try to parse slug and generate if valid
    const parsedParams = parseSlugToScenario(slug)
    if (parsedParams && validateScenarioParams(parsedParams)) {
      // Create extended params with calculated values
      const extendedParams: ExtendedCalculatorInputs = {
        ...parsedParams,
        goal: parsedParams.goal || detectInvestmentGoal(parsedParams),
      }

      // Calculate financial projections
      const { initialAmount, monthlyContribution, annualReturn, timeHorizon } =
        extendedParams
      const monthlyRate = annualReturn / 100 / 12
      const months = timeHorizon * 12

      const fvInitial = initialAmount * Math.pow(1 + monthlyRate, months)
      const fvMonthly =
        monthlyContribution *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

      extendedParams.futureValue = Math.round(fvInitial + fvMonthly)
      extendedParams.totalContributions =
        initialAmount + monthlyContribution * 12 * timeHorizon
      extendedParams.totalGains =
        extendedParams.futureValue - extendedParams.totalContributions

      // Generate scenario content
      const scenarioData = await generateScenarioContent(extendedParams, locale)

      return NextResponse.json({
        exists: false,
        generated: true,
        scenario: scenarioData,
      })
    }

    return NextResponse.json(
      { error: 'Invalid scenario slug' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error retrieving scenario:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve scenario' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update scenario view count and last accessed time
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug } = body

    if (!slug) {
      return NextResponse.json(
        { error: 'Scenario slug is required' },
        { status: 400 }
      )
    }

    const scenario = generatedScenarios.get(slug)
    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 })
    }

    // Update metadata
    scenario.metadata.lastAccessed = new Date().toISOString()
    scenario.metadata.views += 1

    // Update cache if it exists
    const cacheKey = `${slug}-${scenario.metadata.locale}`
    const cached = scenarioCache.get(cacheKey)
    if (cached) {
      cached.data.metadata.lastAccessed = scenario.metadata.lastAccessed
      cached.data.metadata.views = scenario.metadata.views
    }

    return NextResponse.json({
      success: true,
      views: scenario.metadata.views,
    })
  } catch (error) {
    console.error('Error updating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to update scenario' },
      { status: 500 }
    )
  }
}
