import { getHomeContent } from '@/lib/db/queries'

interface SEOContentSectionProps {
  locale: string
}

export async function SEOContentSection({ locale }: SEOContentSectionProps) {
  // Single database query for all SEO content
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}

  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  return (
    <div className="space-y-0">
      {/* Benefits Section */}
      {content.benefits_title && (
        <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
                {content.benefits_title}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Benefit 1 */}
              {content.benefits_benefit_1_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.benefits_benefit_1_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.benefits_benefit_1_description}
                  </p>
                </div>
              )}

              {/* Benefit 2 */}
              {content.benefits_benefit_2_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.benefits_benefit_2_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.benefits_benefit_2_description}
                  </p>
                </div>
              )}

              {/* Benefit 3 */}
              {content.benefits_benefit_3_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.benefits_benefit_3_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.benefits_benefit_3_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {content.how_it_works_title && (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 border-t border-slate-200/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50 mb-6 shadow-soft">
                <span>📋</span>
                <span>Simple Process</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
                {content.how_it_works_title}
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {content.how_it_works_subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Step 1 */}
              {content.how_it_works_step_1_title && (
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.how_it_works_step_1_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.how_it_works_step_1_description}
                  </p>
                </div>
              )}

              {/* Step 2 */}
              {content.how_it_works_step_2_title && (
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.how_it_works_step_2_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.how_it_works_step_2_description}
                  </p>
                </div>
              )}

              {/* Step 3 */}
              {content.how_it_works_step_3_title && (
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.how_it_works_step_3_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {content.how_it_works_step_3_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Investment Strategies Section */}
      {content.strategies_title && (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50/30 via-white to-green-50/20 border-t border-slate-200/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-emerald-50/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 mb-6 shadow-soft">
                <span>💡</span>
                <span>Expert Guidance</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
                {content.strategies_title}
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {content.strategies_subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Strategy 1 */}
              {content.strategies_strategy_1_title && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.strategies_strategy_1_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {content.strategies_strategy_1_description}
                  </p>
                  <div className="text-sm text-blue-700 font-medium">
                    Best for: {content.strategies_strategy_1_best_for}
                  </div>
                </div>
              )}

              {/* Strategy 2 */}
              {content.strategies_strategy_2_title && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-8 border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.strategies_strategy_2_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {content.strategies_strategy_2_description}
                  </p>
                  <div className="text-sm text-emerald-700 font-medium">
                    Best for: {content.strategies_strategy_2_best_for}
                  </div>
                </div>
              )}

              {/* Strategy 3 */}
              {content.strategies_strategy_3_title && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-8 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    {content.strategies_strategy_3_title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {content.strategies_strategy_3_description}
                  </p>
                  <div className="text-sm text-purple-700 font-medium">
                    Best for: {content.strategies_strategy_3_best_for}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Advanced Features Section */}
      {content.features_title && (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/20 border-t border-slate-200/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-indigo-50/80 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium border border-indigo-200/50 mb-6 shadow-soft">
                <span>⚡</span>
                <span>Powerful Features</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
                {content.features_title}
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {content.features_subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {/* Feature 1 */}
              {content.features_feature_1_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    {content.features_feature_1_title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {content.features_feature_1_description}
                  </p>
                </div>
              )}

              {/* Feature 2 */}
              {content.features_feature_2_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    {content.features_feature_2_title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {content.features_feature_2_description}
                  </p>
                </div>
              )}

              {/* Feature 3 */}
              {content.features_feature_3_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">📤</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    {content.features_feature_3_title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {content.features_feature_3_description}
                  </p>
                </div>
              )}

              {/* Feature 4 */}
              {content.features_feature_4_title && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-amber-200 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-3">
                    {content.features_feature_4_title}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {content.features_feature_4_description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {content.faq_title && (
        <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50/30 via-white to-gray-50/20 border-t border-slate-200/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-slate-50/80 text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200/50 mb-6 shadow-soft">
                <span>❓</span>
                <span>Help Center</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
                {content.faq_title}
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {content.faq_subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* FAQ 1 */}
              {content.faq_q1_question && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">
                    {content.faq_q1_question}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {content.faq_q1_answer}
                  </p>
                </div>
              )}

              {/* FAQ 2 */}
              {content.faq_q2_question && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">
                    {content.faq_q2_question}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {content.faq_q2_answer}
                  </p>
                </div>
              )}

              {/* FAQ 3 */}
              {content.faq_q3_question && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">
                    {content.faq_q3_question}
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    {content.faq_q3_answer}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Investment Education Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 border-t border-slate-200/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 mb-6 shadow-soft">
              <span>🎓</span>
              <span>Investment Education</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
              Understanding Investment Growth
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Learn how compound interest and smart investing can transform your
              financial future
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Content */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  The Power of Compound Interest: Your Money&apos;s Best Friend
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Compound interest is often called the &ldquo;eighth wonder of
                  the world&rdquo; for good reason. Unlike simple interest,
                  which only calculates returns on your initial investment,
                  compound interest calculates returns on both your principal
                  AND the interest you&apos;ve already earned.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  This creates a snowball effect where your money grows
                  exponentially over time. The earlier you start investing and
                  the longer you stay invested, the more dramatic this effect
                  becomes. Even small, consistent contributions can grow into
                  substantial wealth over decades.
                </p>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">
                    Key Formula: A = P(1 + r/n)^(nt)
                  </h4>
                  <ul className="space-y-2 text-blue-800">
                    <li>
                      <strong>A</strong> = Final amount
                    </li>
                    <li>
                      <strong>P</strong> = Principal (initial investment)
                    </li>
                    <li>
                      <strong>r</strong> = Annual interest rate
                    </li>
                    <li>
                      <strong>n</strong> = Number of times interest compounds
                      per year
                    </li>
                    <li>
                      <strong>t</strong> = Time in years
                    </li>
                  </ul>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl">
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-slate-900 mb-6">
                    Real Example: $50K Starting Investment
                  </h4>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-600 mb-2">
                        $50,000
                      </div>
                      <div className="text-sm text-slate-500">
                        Initial Investment
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-2">
                        $2,000
                      </div>
                      <div className="text-sm text-slate-500">
                        Monthly Addition
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        7%
                      </div>
                      <div className="text-sm text-slate-500">
                        Annual Return
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        25
                      </div>
                      <div className="text-sm text-slate-500">Time Horizon</div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      $2,127,000
                    </div>
                    <div className="text-sm text-slate-500">Final Value</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  Start Early
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Time is your greatest asset in investing. Starting even a few
                  years earlier can mean hundreds of thousands more in your
                  final portfolio due to compound growth.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  Be Consistent
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Regular monthly contributions, even small ones, can lead to
                  significant wealth accumulation. Consistency beats trying to
                  time the market.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  Think Long-Term
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The magic of compound interest truly shines over long periods.
                  Stay invested through market ups and downs for maximum growth
                  potential.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Calculate Your Investment Growth?
              </h3>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                Use our advanced investment calculator to see how compound
                interest can work for your specific financial situation. Input
                your numbers and watch your wealth grow over time.
              </p>
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 bg-white text-indigo-600 font-semibold px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <span>Start Calculating Now</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Comparison Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-slate-50/30 via-white to-blue-50/20 border-t border-slate-200/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200/50 mb-6 shadow-soft">
              <span>⚖️</span>
              <span>Smart Comparisons</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
              Investment Strategy Comparison
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              See how different investment approaches can dramatically impact
              your long-term wealth
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Comparison Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Conservative Approach */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-4">
                    Conservative
                  </h4>
                  <div className="space-y-3 text-slate-600">
                    <div>
                      <span className="font-medium">Return:</span> 4-5% annually
                    </div>
                    <div>
                      <span className="font-medium">Risk:</span> Low
                    </div>
                    <div>
                      <span className="font-medium">$100K in 25 years:</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      $266K
                    </div>
                  </div>
                </div>

                {/* Balanced Approach */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-4">
                    Balanced
                  </h4>
                  <div className="space-y-3 text-slate-600">
                    <div>
                      <span className="font-medium">Return:</span> 6-7% annually
                    </div>
                    <div>
                      <span className="font-medium">Risk:</span> Moderate
                    </div>
                    <div>
                      <span className="font-medium">$100K in 25 years:</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      $429K
                    </div>
                  </div>
                </div>

                {/* Aggressive Approach */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-4">
                    Aggressive
                  </h4>
                  <div className="space-y-3 text-slate-600">
                    <div>
                      <span className="font-medium">Return:</span> 8-10%
                      annually
                    </div>
                    <div>
                      <span className="font-medium">Risk:</span> High
                    </div>
                    <div>
                      <span className="font-medium">$100K in 25 years:</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      $685K
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  📊 Risk vs. Reward
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Higher potential returns come with increased volatility. Your
                  risk tolerance should match your investment timeline and
                  financial goals.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  ⏰ Time Horizon Matters
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Longer investment periods allow for more aggressive
                  strategies, as you have time to recover from market downturns.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                  🎯 Diversification Benefits
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  A balanced portfolio can help optimize the risk-return ratio,
                  potentially offering better risk-adjusted returns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
