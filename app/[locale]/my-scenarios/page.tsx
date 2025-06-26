import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { TrendingUp, Clock, Target, Eye, Bookmark } from 'lucide-react'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import type { Metadata } from 'next'

interface Props {
  params: {
    locale: string
  }
}

// Generate metadata for the user scenarios page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'My Saved Scenarios - Investment Calculator',
    description:
      'View and manage your saved investment scenarios. Compare different investment strategies and track your financial planning progress.',
    keywords: [
      'saved scenarios',
      'investment planning',
      'financial calculator',
      'my scenarios',
    ],
  }
}

// Fetch user scenarios from API
async function getUserScenarios() {
  try {
    // In a real implementation, this would fetch from your database
    // For now, return empty array since scenarios are stored in memory
    return []
  } catch (error) {
    console.error('Error fetching user scenarios:', error)
    return []
  }
}

export default async function MyScenariosPage({ params }: Props) {
  const t = await getTranslations('scenarios')
  const tCommon = await getTranslations('common')

  const userScenarios = await getUserScenarios()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <Bookmark className="w-4 h-4" />
              <span>My Investment Scenarios</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 font-playfair">
              Your Saved Scenarios
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Manage and compare your saved investment scenarios. Track
              different strategies and see how they evolve over time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${params.locale}`}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Create New Scenario
              </Link>

              <Link
                href={`/${params.locale}/scenario`}
                className="inline-flex items-center px-6 py-3 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-all duration-300"
              >
                Browse Expert Scenarios
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* User Scenarios */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {userScenarios.length > 0 ? (
            <>
              <h2 className="text-3xl font-bold text-center mb-12">
                Your Saved Scenarios ({userScenarios.length})
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {userScenarios.map((scenario: any) => {
                  const investmentParams: InvestmentParameters = {
                    initialAmount: scenario.params.initialAmount,
                    monthlyContribution: scenario.params.monthlyContribution,
                    annualReturnRate: scenario.params.annualReturnRate,
                    timeHorizonYears: scenario.params.timeHorizonYears,
                  }

                  const result = calculateFutureValue(investmentParams)

                  return (
                    <Link
                      key={scenario.id}
                      href={`/${params.locale}/scenario/${scenario.slug}`}
                      className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Your Scenario
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <Eye className="w-3 h-3 mr-1" />
                          {scenario.views || 0} views
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
                        {scenario.name}
                      </h3>

                      {scenario.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {scenario.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="text-center">
                          <p className="text-xs text-slate-600 mb-1">
                            Future Value
                          </p>
                          <p className="text-2xl font-bold text-emerald-600">
                            ${result.futureValue.toLocaleString()}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <p className="text-xs text-slate-600">Initial</p>
                            <p className="font-semibold">
                              ${scenario.params.initialAmount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Monthly</p>
                            <p className="font-semibold">
                              $
                              {scenario.params.monthlyContribution.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <p className="text-xs text-slate-600">Return</p>
                            <p className="font-semibold">
                              {scenario.params.annualReturnRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600">Years</p>
                            <p className="font-semibold">
                              {scenario.params.timeHorizonYears}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Created:{' '}
                          {new Date(scenario.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {scenario.params.timeHorizonYears} years
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          ) : (
            // Empty state
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-12 h-12 text-indigo-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                No Saved Scenarios Yet
              </h2>

              <p className="text-gray-600 mb-8">
                Start creating investment scenarios to save and compare
                different strategies. Your saved scenarios will appear here for
                easy access and comparison.
              </p>

              <div className="space-y-4">
                <Link
                  href={`/${params.locale}`}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Create Your First Scenario
                </Link>

                <div className="text-center">
                  <Link
                    href={`/${params.locale}/scenario`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Or explore expert-curated scenarios →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              Tips for Managing Your Scenarios
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Set Clear Goals</h3>
                <p className="text-sm text-gray-600">
                  Name your scenarios descriptively (e.g., &ldquo;Retirement at{' '}
                  65&rdquo;, &ldquo;House Down Payment&rdquo;)
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Compare Strategies</h3>
                <p className="text-sm text-gray-600">
                  Create multiple scenarios with different parameters to find
                  the best approach
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Regular Reviews</h3>
                <p className="text-sm text-gray-600">
                  Revisit your scenarios periodically to adjust for life changes
                  and market conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
