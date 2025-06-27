import { getTranslations } from 'next-intl/server'
import { getPredefinedScenarios } from '@/lib/db/queries'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import Link from 'next/link'
import { TrendingUp, Users, Clock, Target } from 'lucide-react'
import { RecentScenarios } from '@/components/RecentScenarios'

interface ComprehensiveScenariosProps {
  locale: string
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

export default async function ComprehensiveScenarios({
  locale,
}: ComprehensiveScenariosProps) {
  const t = await getTranslations({
    locale: locale,
    namespace: 'scenarios',
  })

  // Get scenarios from database
  const predefinedScenarios = await getPredefinedScenarios(locale)
  const userScenarios = await getUserScenarios()

  return (
    <div className="bg-gradient-to-br from-indigo-50/50 via-white to-cyan-50/50">
      {/* Section Header */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              <span>{t('title')}</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {t('subtitle')}
            </h2>

            <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
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
                {predefinedScenarios.length}
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
                {predefinedScenarios.length + userScenarios.length}
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

      {/* Community Scenarios Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full text-green-700 text-sm font-medium mb-6">
                <Users className="w-4 h-4" />
                <span>Community Created</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                User-Created Scenarios
              </h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Discover investment scenarios created by our community members.
                Get inspired by real-world planning strategies.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentScenarios locale={locale} limit={6} />
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg h-fit">
                <h4 className="text-xl font-semibold mb-4">
                  Create Your Own Scenario
                </h4>
                <p className="text-gray-600 mb-6">
                  Use our calculator to create custom investment scenarios.
                </p>
                <a
                  href="#calculator"
                  className="inline-flex items-center w-full justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Start Calculating
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Predefined Scenarios */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">
            {t('expertCurated')}
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {predefinedScenarios.map((scenario) => {
              const investmentParams: InvestmentParameters = {
                initialAmount: Number(scenario.initialAmount),
                monthlyContribution: Number(scenario.monthlyContribution),
                annualReturnRate: Number(scenario.annualReturn),
                timeHorizonYears: scenario.timeHorizon,
              }

              const result = calculateFutureValue(investmentParams)

              return (
                <Link
                  key={scenario.slug}
                  href={`/${locale}/scenario/${scenario.slug}`}
                  className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-2 mb-4">
                    {scenario.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h4 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                    {scenario.name}
                  </h4>

                  <p className="text-slate-600 text-sm mb-4">
                    {scenario.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.initial')}
                      </div>
                      <div className="font-semibold">
                        ${Number(scenario.initialAmount).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.monthly')}
                      </div>
                      <div className="font-semibold">
                        ${Number(scenario.monthlyContribution).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.return')}
                      </div>
                      <div className="font-semibold">
                        {Number(scenario.annualReturn)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">
                        {t('scenarioCard.years')}
                      </div>
                      <div className="font-semibold">
                        {scenario.timeHorizon}
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
          <h3 className="text-3xl font-bold text-white mb-6">
            {t('cta.title')}
          </h3>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <a
            href="#calculator"
            className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-lg"
          >
            <span>{t('cta.button')}</span>
            <TrendingUp className="w-5 h-5" />
          </a>
        </div>
      </section>
    </div>
  )
}
