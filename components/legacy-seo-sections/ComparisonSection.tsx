import { getHomeContent } from '@/lib/db/queries'

interface ComparisonSectionProps {
  locale: string
}

export async function ComparisonSection({ locale }: ComparisonSectionProps) {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-50/30 via-white to-blue-50/20 border-t border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50/80 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200/50 mb-6 shadow-soft">
            <span>⚖️</span>
            <span>Investment Comparison</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            See the Dramatic Difference Compound Interest Makes
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Compare how different investment approaches affect your long-term
            wealth building. Small changes in strategy can lead to massive
            differences in final results.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Comparison Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Conservative Approach */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                  <span className="text-2xl">🐌</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Conservative Approach
                </h3>
                <div className="space-y-3 text-sm text-slate-600 mb-6">
                  <div>Initial: $10,000</div>
                  <div>Monthly: $200</div>
                  <div>Return: 4% annually</div>
                  <div>Time: 20 years</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200/50">
                  <div className="text-3xl font-bold text-amber-600 mb-2">
                    $123,219
                  </div>
                  <div className="text-xs text-amber-700">Final Value</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Interest Earned: $65,219
                  </div>
                </div>
              </div>

              {/* Moderate Approach */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                  <span className="text-2xl">🚶</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Moderate Approach
                </h3>
                <div className="space-y-3 text-sm text-slate-600 mb-6">
                  <div>Initial: $10,000</div>
                  <div>Monthly: $500</div>
                  <div>Return: 7% annually</div>
                  <div>Time: 20 years</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    $534,279
                  </div>
                  <div className="text-xs text-indigo-700">Final Value</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Interest Earned: $404,279
                  </div>
                </div>
              </div>

              {/* Aggressive Approach */}
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  Aggressive Approach
                </h3>
                <div className="space-y-3 text-sm text-slate-600 mb-6">
                  <div>Initial: $10,000</div>
                  <div>Monthly: $1,000</div>
                  <div>Return: 10% annually</div>
                  <div>Time: 20 years</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/50">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    $1,316,816
                  </div>
                  <div className="text-xs text-emerald-700">Final Value</div>
                  <div className="text-xs text-slate-500 mt-2">
                    Interest Earned: $1,066,816
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="mt-12 pt-8 border-t border-slate-200/50">
              <h4 className="text-xl font-semibold text-slate-900 mb-6 text-center">
                Key Investment Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 text-sm">💡</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 mb-2">
                      Higher Returns = Exponential Growth
                    </h5>
                    <p className="text-slate-600 text-sm">
                      The difference between 4% and 10% returns isn&apos;t just
                      6% - it&apos;s the difference between $123K and $1.3M over
                      20 years.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 text-sm">📈</span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 mb-2">
                      Monthly Contributions Matter
                    </h5>
                    <p className="text-slate-600 text-sm">
                      Consistent monthly investing is often more impactful than
                      your initial investment amount due to compound interest
                      over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
