import { notFound } from 'next/navigation'
import { getTranslations, getMessages } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import type { Metadata } from 'next'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'
import { parseSlugToScenario, detectInvestmentGoal } from '@/lib/scenarioUtils'
import { createScenario, getScenarioBySlug } from '@/lib/db/queries'
import LazyContentSection from '@/components/scenario/LazyContentSection'
import PersonalizedInsights from '@/components/scenario/PersonalizedInsights'
import MarketContext from '@/components/scenario/MarketContext'
import ComparativeAnalysis from '@/components/scenario/ComparativeAnalysis'
import OptimizationTips from '@/components/scenario/OptimizationTips'
import StructuredData from '@/components/scenario/StructuredData'
import RelatedScenarios from '@/components/scenario/RelatedScenarios'

// Force dynamic rendering to test if SSG is causing translation issues
export const dynamic = 'force-dynamic'

// Get scenario data from predefined scenarios with fallback to slug parsing
async function getScenarioData(slug: string, locale: string) {
  // First: Check database for user-generated scenarios
  try {
    const dbScenario = await getScenarioBySlug(slug, locale)
    if (dbScenario) {
      return {
        scenario: {
          id: dbScenario.slug,
          name: dbScenario.name,
          description: dbScenario.description || '',
          params: {
            initialAmount: parseInt(dbScenario.initialAmount),
            monthlyContribution: parseInt(dbScenario.monthlyContribution),
            annualReturn: parseFloat(dbScenario.annualReturn) / 100, // Convert percentage to decimal
            timeHorizon: dbScenario.timeHorizon,
          },
          tags: dbScenario.tags,
        },
        source: 'database',
        isUserGenerated: true,
      }
    }
  } catch (error) {
    console.error('Error checking database for scenario:', error)
  }

  // Second: Check predefined scenarios
  const predefinedScenario = PREDEFINED_SCENARIOS.find((s) => s.id === slug)
  if (predefinedScenario) {
    return {
      scenario: {
        id: predefinedScenario.id,
        name: predefinedScenario.name,
        description: predefinedScenario.description,
        params: predefinedScenario.params,
        tags: predefinedScenario.tags,
      },
      source: 'predefined',
      isUserGenerated: false,
    }
  }

  // Third: Try to parse the slug and save to database
  try {
    const parsedScenario = parseSlugToScenario(slug)
    if (parsedScenario) {
      const scenario = {
        id: slug,
        name: `Investment Plan: $${parsedScenario.initialAmount.toLocaleString()} + $${parsedScenario.monthlyContribution}/month`,
        description: `Calculate investing $${parsedScenario.initialAmount.toLocaleString()} initially with $${parsedScenario.monthlyContribution} monthly contributions at ${parsedScenario.annualReturn}% annual return over ${parsedScenario.timeHorizon} years.`,
        params: {
          initialAmount: parsedScenario.initialAmount,
          monthlyContribution: parsedScenario.monthlyContribution,
          annualReturn: parsedScenario.annualReturn / 100, // Convert percentage to decimal
          timeHorizon: parsedScenario.timeHorizon,
        },
        tags: [parsedScenario.goal],
      }

      // Save the parsed scenario to the database for future use
      try {
        console.log('🔄 Attempting to save scenario to database:', slug)
        console.log('📝 Scenario data:', {
          slug: slug,
          name: scenario.name,
          description: scenario.description,
          initialAmount: scenario.params.initialAmount,
          monthlyContribution: scenario.params.monthlyContribution,
          annualReturn: scenario.params.annualReturn * 100,
          timeHorizon: scenario.params.timeHorizon,
          tags: scenario.tags,
          locale: locale,
        })

        await createScenario({
          slug: slug,
          name: scenario.name,
          description: scenario.description,
          initialAmount: scenario.params.initialAmount,
          monthlyContribution: scenario.params.monthlyContribution,
          annualReturn: scenario.params.annualReturn * 100, // Convert back to percentage for storage
          timeHorizon: scenario.params.timeHorizon,
          tags: scenario.tags,
          locale: locale,
        })
        console.log('✅ Saved parsed scenario to database:', slug)
      } catch (dbError) {
        console.error('❌ Error saving parsed scenario to database:', dbError)
        console.error('❌ Error details:', {
          name: dbError?.name || 'unknown',
          message: dbError?.message || 'no message',
          code: dbError?.code || 'no code',
          detail: dbError?.detail || 'no detail',
          constraint: dbError?.constraint || 'no constraint',
          stack: dbError?.stack || 'no stack',
        })
        // Continue anyway, scenario will still work without being saved
      }

      return {
        scenario,
        source: 'slug',
        isUserGenerated: true,
      }
    }
  } catch (error) {
    console.error('Error parsing scenario from slug:', error)
  }

  // Fourth: Fallback to legacy API for user-generated scenarios (if any exist)
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scenarios?slug=${slug}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.scenario) {
        return {
          scenario: {
            id: data.scenario.id,
            name: data.scenario.name,
            description: data.scenario.description || '',
            params: {
              initialAmount: data.scenario.params.initialAmount,
              monthlyContribution: data.scenario.params.monthlyContribution,
              annualReturn: data.scenario.params.annualReturn / 100, // Convert percentage to decimal
              timeHorizon: data.scenario.params.timeHorizon,
            },
            tags: data.scenario.tags,
          },
          source: 'api',
          isUserGenerated: true,
        }
      }
    }
  } catch (error) {
    console.error('Error fetching scenario from API:', error)
  }

  return null
}

interface Props {
  params: {
    locale: string
    slug: string
  }
}

// Generate static paths for all predefined scenarios
export async function generateStaticParams() {
  const paths: Array<{ locale: string; slug: string }> = []

  // Use predefined scenarios for each locale
  for (const locale of locales) {
    PREDEFINED_SCENARIOS.forEach((scenario) => {
      paths.push({
        locale,
        slug: scenario.id,
      })
    })
  }

  return paths
}

// Generate dynamic metadata for SEO optimization
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = params

  // Try to get scenario data first
  const scenarioData = await getScenarioData(slug, locale)

  let title: string
  let description: string
  let keywords: string

  if (scenarioData?.scenario) {
    // Use scenario data if available
    const { params: scenarioParams } = scenarioData.scenario
    const goal = detectInvestmentGoal(scenarioParams)

    const initial = scenarioParams.initialAmount
    const monthly = scenarioParams.monthlyContribution
    const rate = (scenarioParams.annualReturn * 100).toFixed(0)
    const timeHorizon = scenarioParams.timeHorizon

    title = `Invest $${initial.toLocaleString()} + $${monthly}/month at ${rate}% - ${timeHorizon} Year ${goal} Plan`
    description = `Calculate investing $${initial.toLocaleString()} initially with $${monthly} monthly contributions at ${rate}% annual return over ${timeHorizon} years for your ${goal} goal. See detailed projections and optimization tips.`
    keywords = `invest ${initial}, monthly ${monthly}, ${rate} percent return, ${timeHorizon} year investment, ${goal}, investment calculator, future value`
  } else {
    // Fallback: try parsing slug directly
    const parsedScenario = parseSlugToScenario(slug)

    if (parsedScenario) {
      const {
        initialAmount,
        monthlyContribution,
        annualReturn,
        timeHorizon,
        goal,
      } = parsedScenario
      const rate = (annualReturn * 100).toFixed(0)

      title = `Invest $${initialAmount.toLocaleString()} + $${monthlyContribution}/month at ${rate}% - ${timeHorizon} Year ${goal} Plan`
      description = `Calculate investing $${initialAmount.toLocaleString()} initially with $${monthlyContribution} monthly contributions at ${rate}% annual return over ${timeHorizon} years for your ${goal} goal. See detailed projections and optimization tips.`
      keywords = `invest ${initialAmount}, monthly ${monthlyContribution}, ${rate} percent return, ${timeHorizon} year investment, ${goal}, investment calculator, future value`
    } else {
      // Generic fallback
      title = 'Investment Scenario Calculator - Future Value Analysis'
      description =
        'Analyze your investment scenario with detailed projections, market insights, and optimization recommendations for long-term wealth building.'
      keywords =
        'investment calculator, future value, compound interest, financial planning, wealth building'
    }
  }

  // Ensure title is under 60 characters for SEO
  if (title.length > 60) {
    title = title.substring(0, 57) + '...'
  }

  // Ensure description is under 160 characters for SEO
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function ScenarioPage({ params }: Props) {
  // Get scenario from database, static data, or API
  const scenarioData = await getScenarioData(params.slug, params.locale)

  if (!scenarioData) {
    notFound()
  }

  const { scenario, source, isUserGenerated } = scenarioData

  // Get messages directly instead of using translation hooks
  const messages = await getMessages({ locale: params.locale })
  const scenarios = messages?.scenarios as any
  const scenarioPage = scenarios?.scenarioPage || {}
  const predefinedScenarios = scenarios?.predefinedScenarios || {}

  console.log('Scenario data source:', source, {
    locale: params.locale,
    slug: params.slug,
    scenarioName: scenario.name,
    isUserGenerated,
  })

  // Get translated scenario name and description for predefined scenarios
  const getScenarioTranslation = (scenario: any) => {
    if (isUserGenerated || source === 'database') {
      // For user-generated or database scenarios, use the scenario data directly
      return {
        name: scenario.name,
        description: scenario.description || '',
      }
    }

    // For static predefined scenarios, use direct message access
    try {
      const translatedName = predefinedScenarios?.[scenario.id]?.name
      const translatedDescription =
        predefinedScenarios?.[scenario.id]?.description

      return {
        name: translatedName || scenario.name,
        description: translatedDescription || scenario.description,
      }
    } catch (error) {
      console.log('Translation error:', error)
      // Fallback to original if translation not found
      return {
        name: scenario.name,
        description: scenario.description,
      }
    }
  }

  const translatedScenario = getScenarioTranslation(scenario)

  // Pre-calculate results for static generation
  const investmentParams: InvestmentParameters = {
    initialAmount: scenario.params.initialAmount,
    monthlyContribution: scenario.params.monthlyContribution,
    annualReturnRate: scenario.params.annualReturn,
    timeHorizonYears: scenario.params.timeHorizon,
  }

  const result = calculateFutureValue(investmentParams)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Structured Data for SEO */}
      <StructuredData
        scenario={{
          id: scenario.id,
          name: translatedScenario.name,
          description: translatedScenario.description,
          params: {
            initialAmount: scenario.params.initialAmount,
            monthlyContribution: scenario.params.monthlyContribution,
            annualReturnRate: scenario.params.annualReturn,
            timeHorizonYears: scenario.params.timeHorizon,
          },
          tags: scenario.tags,
        }}
        result={result}
        locale={params.locale}
        source={source}
        isUserGenerated={isUserGenerated}
      />

      {/* Hero Section with Scenario Info */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <span>📊</span>
              <span>
                {source === 'database' && !isUserGenerated
                  ? scenarioPage?.databaseScenario || 'Database Scenario'
                  : isUserGenerated
                    ? scenarioPage?.userScenario || 'User Scenario'
                    : scenarioPage?.predefinedScenario || 'Scenario'}
              </span>
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {source === 'database'
                  ? 'DB'
                  : source === 'api'
                    ? 'API'
                    : 'SYS'}
              </span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {translatedScenario.name}
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              {translatedScenario.description}
            </p>

            {/* Scenario Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-indigo-600">
                  ${scenario.params.initialAmount.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.initialInvestment || 'Initial Investment'}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-emerald-600">
                  ${scenario.params.monthlyContribution.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.monthlyContribution || 'Monthly Contribution'}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-purple-600">
                  {(scenario.params.annualReturn * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.annualReturn || 'Annual Return'}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-cyan-600">
                  {scenario.params.timeHorizon} {scenarioPage?.years || 'years'}
                </div>
                <div className="text-sm text-slate-600">
                  {scenarioPage?.timeHorizon || 'Time Horizon'}
                </div>
              </div>
            </div>

            {/* Result Preview */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-3xl p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">
                {scenarioPage?.projectedResult || 'Projected Result'}
              </h2>
              <div className="text-5xl font-bold mb-2">
                ${result.futureValue.toLocaleString()}
              </div>
              <div className="text-emerald-100">
                {scenarioPage?.totalGrowth || 'Total Growth'}: $
                {result.totalGrowth.toLocaleString()} (
                {(
                  (result.totalGrowth / result.totalContributions) *
                  100
                ).toFixed(1)}
                %)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Customize This Scenario
            </h2>

            <div className="text-center">
              <p className="text-lg text-slate-600 mb-8">
                Visit the main calculator to customize these parameters and
                explore different scenarios.
              </p>
              <a
                href={`/${params.locale}?initial=${scenario.params.initialAmount}&monthly=${scenario.params.monthlyContribution}&return=${(scenario.params.annualReturn * 100).toFixed(1)}&years=${scenario.params.timeHorizon}`}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Open Interactive Calculator</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Investment Metrics (moved from main page statistics) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <PersonalizedInsights
          params={investmentParams}
          result={result}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Market Context & Analysis (moved from main page context) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <MarketContext
          params={investmentParams}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Comparative Analysis (moved from main page expert scenarios) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <ComparativeAnalysis
          params={investmentParams}
          result={result}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Optimization Tips (moved from main page CTA section) */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <OptimizationTips
          params={investmentParams}
          result={result}
          locale={params.locale}
          translations={scenarioPage}
        />
      </LazyContentSection>

      {/* Related Scenarios - Internal Linking Strategy */}
      <LazyContentSection rootMargin="50px" threshold={0.1}>
        <RelatedScenarios
          currentScenario={{
            id: scenario.id,
            name: translatedScenario.name,
            params: {
              initialAmount: scenario.params.initialAmount,
              monthlyContribution: scenario.params.monthlyContribution,
              annualReturnRate: scenario.params.annualReturn,
              timeHorizonYears: scenario.params.timeHorizon,
            },
          }}
          locale={params.locale}
          maxResults={6}
        />
      </LazyContentSection>
    </div>
  )
}
