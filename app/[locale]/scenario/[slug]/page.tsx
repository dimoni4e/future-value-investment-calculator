import { notFound } from 'next/navigation'
import { getTranslations, getMessages } from 'next-intl/server'
import { locales } from '@/i18n/request'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import type { Metadata } from 'next'
import { getScenarioBySlug, getPredefinedScenarios } from '@/lib/db/queries'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'
import type { Scenario as DBScenario } from '@/lib/db/schema'

// Force dynamic rendering to test if SSG is causing translation issues
export const dynamic = 'force-dynamic'

// Get scenario data from database (primary) with fallback to predefined scenarios
async function getScenarioData(slug: string, locale: string) {
  try {
    // Primary: Get from database
    const dbScenario = await getScenarioBySlug(slug, locale)
    if (dbScenario) {
      return {
        scenario: {
          id: dbScenario.slug,
          name: dbScenario.name,
          description: dbScenario.description || '',
          params: {
            initialAmount: Number(dbScenario.initialAmount),
            monthlyContribution: Number(dbScenario.monthlyContribution),
            annualReturn: Number(dbScenario.annualReturn),
            timeHorizon: dbScenario.timeHorizon,
          },
          tags: dbScenario.tags || [],
        },
        source: 'database',
        isUserGenerated: !dbScenario.isPredefined,
      }
    }
  } catch (error) {
    console.error('Error fetching scenario from database:', error)
  }

  // Fallback: Check predefined scenarios
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

  // Fallback: Try legacy API for user-generated scenarios (if any exist)
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
              annualReturn: data.scenario.params.annualReturnRate,
              timeHorizon: data.scenario.params.timeHorizonYears,
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

  // Get all scenarios from database for each locale (if available)
  for (const locale of locales) {
    try {
      const scenarios = await getPredefinedScenarios(locale)
      scenarios.forEach((scenario) => {
        paths.push({
          locale,
          slug: scenario.slug,
        })
      })
    } catch (error) {
      console.error(
        `Error generating static params for locale ${locale}:`,
        error
      )

      // Fallback: Use predefined scenarios
      PREDEFINED_SCENARIOS.forEach((scenario) => {
        paths.push({
          locale,
          slug: scenario.id,
        })
      })
    }
  }

  return paths
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Get scenario from database, static data, or API
  const scenarioData = await getScenarioData(params.slug, params.locale)

  if (!scenarioData) {
    return {
      title: 'Scenario Not Found',
    }
  }

  const { scenario, isUserGenerated } = scenarioData

  // Get translations for metadata
  const metadataMessages = await getMessages({ locale: params.locale })
  const metadataPredefinedScenarios =
    (metadataMessages?.scenarios as any)?.predefinedScenarios || {}

  // Use translated content for predefined scenarios
  let scenarioName = scenario.name
  let scenarioDescription = scenario.description

  if (!isUserGenerated) {
    try {
      const translatedName = metadataPredefinedScenarios?.[scenario.id]?.name
      const translatedDescription =
        metadataPredefinedScenarios?.[scenario.id]?.description

      if (translatedName) scenarioName = translatedName
      if (translatedDescription) scenarioDescription = translatedDescription
    } catch (error) {
      // Use original if translation fails
    }
  }

  const { params: calcParams } = scenario
  const investmentParams: InvestmentParameters = {
    initialAmount: calcParams.initialAmount,
    monthlyContribution: calcParams.monthlyContribution,
    annualReturnRate: calcParams.annualReturn,
    timeHorizonYears: calcParams.timeHorizon,
  }
  const result = calculateFutureValue(investmentParams)

  return {
    title: `${scenarioName} - Financial Growth Calculator`,
    description: `${scenarioDescription}. Starting with $${calcParams.initialAmount.toLocaleString()}, contributing $${calcParams.monthlyContribution.toLocaleString()}/month at ${calcParams.annualReturn}% return over ${calcParams.timeHorizon} years. Final value: $${result.futureValue.toLocaleString()}`,
    keywords: [
      'financial planning',
      'investment calculator',
      scenarioName.toLowerCase(),
      ...scenario.tags,
      `${calcParams.annualReturn}% return`,
      `${calcParams.timeHorizon} year investment`,
    ].join(', '),
    openGraph: {
      title: `${scenarioName} Investment Scenario`,
      description: scenarioDescription,
      type: 'website',
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
                  {scenario.params.annualReturn}%
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
                href={`/${params.locale}?initial=${scenario.params.initialAmount}&monthly=${scenario.params.monthlyContribution}&return=${scenario.params.annualReturn}&years=${scenario.params.timeHorizon}`}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Open Interactive Calculator</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
