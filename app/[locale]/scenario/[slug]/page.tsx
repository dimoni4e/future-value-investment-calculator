import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PREDEFINED_SCENARIOS, getScenarioById } from '@/lib/scenarios'
import { locales } from '@/i18n/request'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import type { Metadata } from 'next'

// This will also handle user-generated scenarios
async function getUserScenario(slug: string) {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scenarios?slug=${slug}`,
      {
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    )

    if (response.ok) {
      const data = await response.json()
      return data.scenario
    }
  } catch (error) {
    console.error('Error fetching user scenario:', error)
  }

  return null
}

interface Props {
  params: {
    locale: string
    slug: string
  }
}

// Generate static paths for all scenarios
export async function generateStaticParams() {
  const paths: Array<{ locale: string; slug: string }> = []

  locales.forEach((locale) => {
    PREDEFINED_SCENARIOS.forEach((scenario) => {
      paths.push({
        locale,
        slug: scenario.id,
      })
    })
  })

  return paths
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const scenario = getScenarioById(params.slug)

  if (!scenario) {
    return {
      title: 'Scenario Not Found',
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
    title: `${scenario.name} - Financial Growth Calculator`,
    description: `${scenario.description}. Starting with $${calcParams.initialAmount.toLocaleString()}, contributing $${calcParams.monthlyContribution.toLocaleString()}/month at ${calcParams.annualReturn}% return over ${calcParams.timeHorizon} years. Final value: $${result.futureValue.toLocaleString()}`,
    keywords: [
      'financial planning',
      'investment calculator',
      scenario.name.toLowerCase(),
      ...scenario.tags,
      `${calcParams.annualReturn}% return`,
      `${calcParams.timeHorizon} year investment`,
    ].join(', '),
    openGraph: {
      title: `${scenario.name} Investment Scenario`,
      description: scenario.description,
      type: 'website',
    },
  }
}

export default async function ScenarioPage({ params }: Props) {
  // Try to get predefined scenario first
  let scenario = getScenarioById(params.slug)
  let isUserGenerated = false

  // If not found in predefined, try user-generated scenarios
  if (!scenario) {
    const userScenario = await getUserScenario(params.slug)
    if (userScenario) {
      scenario = {
        id: userScenario.id,
        name: userScenario.name,
        description: userScenario.description || '',
        params: {
          initialAmount: userScenario.params.initialAmount,
          monthlyContribution: userScenario.params.monthlyContribution,
          annualReturn: userScenario.params.annualReturnRate,
          timeHorizon: userScenario.params.timeHorizonYears,
        },
        tags: userScenario.tags,
      }
      isUserGenerated = true
    }
  }

  if (!scenario) {
    notFound()
  }

  const t = await getTranslations('scenarios')
  const tCommon = await getTranslations('common')

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
              <span>Predefined Scenario</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {scenario.name}
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              {scenario.description}
            </p>

            {/* Scenario Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-indigo-600">
                  ${scenario.params.initialAmount.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">Initial Investment</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-emerald-600">
                  ${scenario.params.monthlyContribution.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  Monthly Contribution
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-purple-600">
                  {scenario.params.annualReturn}%
                </div>
                <div className="text-sm text-slate-600">Annual Return</div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50">
                <div className="text-2xl font-bold text-cyan-600">
                  {scenario.params.timeHorizon} years
                </div>
                <div className="text-sm text-slate-600">Time Horizon</div>
              </div>
            </div>

            {/* Result Preview */}
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-3xl p-8 mb-12">
              <h2 className="text-2xl font-bold mb-4">Projected Result</h2>
              <div className="text-5xl font-bold mb-2">
                ${result.futureValue.toLocaleString()}
              </div>
              <div className="text-emerald-100">
                Total Growth: ${result.totalGrowth.toLocaleString()} (
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
