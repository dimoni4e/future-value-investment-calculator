import { getTranslations } from 'next-intl/server'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import Link from 'next/link'
import { TrendingUp, Users, Clock, Target } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: {
    locale: string
  }
}

// Generate metadata for the scenarios discovery page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Investment Scenarios Library - Financial Planning Examples',
    description:
      'Explore hundreds of real investment scenarios and strategies. From conservative retirement plans to aggressive growth strategies. Find inspiration for your financial goals.',
    keywords: [
      'investment scenarios',
      'financial planning examples',
      'retirement strategies',
      'investment calculator',
      'wealth building plans',
      'financial goals',
      'compound interest examples',
    ].join(', '),
    openGraph: {
      title: 'Investment Scenarios Library',
      description:
        'Discover proven investment strategies and calculate your own financial future',
      type: 'website',
    },
  }
}

// Fetch user-generated scenarios
async function getUserScenarios() {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/scenarios`,
      {
        next: { revalidate: 1800 }, // Revalidate every 30 minutes
      }
    )

    if (response.ok) {
      const data = await response.json()
      return data.scenarios || []
    }
  } catch (error) {
    console.error('Error fetching scenarios:', error)
  }

  return []
}

export default async function ScenariosPage({ params }: Props) {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'scenarios',
  })
  const userScenarios = await getUserScenarios()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              <span>{t('title')}</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {t('subtitle')}
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {PREDEFINED_SCENARIOS.length}
              </div>
              <div className="text-sm text-slate-600">
                {t('statistics.expertScenarios')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {userScenarios.length}
              </div>
              <div className="text-sm text-slate-600">
                {t('statistics.userCreated')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {PREDEFINED_SCENARIOS.length + userScenarios.length}
              </div>
              <div className="text-sm text-slate-600">
                {t('statistics.totalScenarios')}
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600 mb-2">3</div>
              <div className="text-sm text-slate-600">
                {t('statistics.languages')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('browseByCategory')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Risk-based categories */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {t('categories.conservative.title')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('categories.conservative.description')}
              </p>
              <Link
                href={`/${params.locale}/scenarios/conservative`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {t('categories.conservative.link')} →
              </Link>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {t('categories.moderate.title')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('categories.moderate.description')}
              </p>
              <Link
                href={`/${params.locale}/scenarios/moderate`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {t('categories.moderate.link')} →
              </Link>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {t('categories.aggressive.title')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('categories.aggressive.description')}
              </p>
              <Link
                href={`/${params.locale}/scenarios/aggressive`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {t('categories.aggressive.link')} →
              </Link>
            </div>

            {/* Timeline-based categories */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {t('categories.shortTerm.title')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('categories.shortTerm.description')}
              </p>
              <Link
                href={`/${params.locale}/scenarios/short-term`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {t('categories.shortTerm.link')} →
              </Link>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {t('categories.retirement.title')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('categories.retirement.description')}
              </p>
              <Link
                href={`/${params.locale}/scenarios/retirement`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {t('categories.retirement.link')} →
              </Link>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                {t('categories.all.title')}
              </h3>
              <p className="text-slate-600 mb-6">
                {t('categories.all.description')}
              </p>
              <Link
                href={`/${params.locale}/scenarios/all`}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                {t('categories.all.link')} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Predefined Scenarios */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('expertCurated')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PREDEFINED_SCENARIOS.slice(0, 6).map((scenario) => {
              const investmentParams: InvestmentParameters = {
                initialAmount: scenario.params.initialAmount,
                monthlyContribution: scenario.params.monthlyContribution,
                annualReturnRate: scenario.params.annualReturn,
                timeHorizonYears: scenario.params.timeHorizon,
              }

              const result = calculateFutureValue(investmentParams)

              return (
                <Link
                  key={scenario.id}
                  href={`/${params.locale}/scenario/${scenario.id}`}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    {scenario.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                    {scenario.name}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4">
                    {scenario.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.initial')}
                      </div>
                      <div className="font-semibold">
                        ${scenario.params.initialAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.monthly')}
                      </div>
                      <div className="font-semibold">
                        ${scenario.params.monthlyContribution.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.return')}
                      </div>
                      <div className="font-semibold">
                        {scenario.params.annualReturn}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.years')}
                      </div>
                      <div className="font-semibold">
                        {scenario.params.timeHorizon}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="text-2xl font-bold text-emerald-600">
                      ${result.futureValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t('scenarioCard.projectedResult')}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Link
            href={`/${params.locale}`}
            className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-lg"
          >
            <span>{t('cta.button')}</span>
            <TrendingUp className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
