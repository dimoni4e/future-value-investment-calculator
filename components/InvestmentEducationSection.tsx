import { getHomeContent } from '@/lib/db/queries'

interface InvestmentEducationSectionProps {
  locale: string
}

export async function InvestmentEducationSection({
  locale,
}: InvestmentEducationSectionProps) {
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-emerald-50/30 via-white to-teal-50/20 border-t border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50/80 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 mb-6 shadow-soft">
            <span>📚</span>
            <span>Investment Education</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            Master the Art of Compound Interest & Investment Growth
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Understanding compound interest is the foundation of successful
            investing. Learn key concepts to maximize your wealth building
            potential.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Content */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900">
                The Power of Compound Interest: Your Money's Best Friend
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Compound interest is often called the "eighth wonder of the
                world" for good reason. Unlike simple interest, which only
                calculates returns on your initial investment, compound interest
                calculates returns on both your principal AND the interest
                you've already earned.
              </p>
              <p className="text-slate-600 leading-relaxed">
                This creates a snowball effect where your money grows
                exponentially over time. The earlier you start investing and the
                longer you stay invested, the more dramatic this effect becomes.
                Even small, consistent contributions can grow into substantial
                wealth over decades.
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
                    <strong>n</strong> = Number of times interest compounds per
                    year
                  </li>
                  <li>
                    <strong>t</strong> = Time in years
                  </li>
                </ul>
              </div>
            </div>

            {/* Visual Element */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-slate-900 mb-6">
                  Investment Growth Example
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      $10,000
                    </div>
                    <div className="text-sm text-slate-500">
                      Initial Investment
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                      $500
                    </div>
                    <div className="text-sm text-slate-500">
                      Monthly Addition
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      7%
                    </div>
                    <div className="text-sm text-slate-500">Annual Return</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      20 years
                    </div>
                    <div className="text-sm text-slate-500">Time Horizon</div>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    $534,279
                  </div>
                  <div className="text-sm text-slate-500">Final Value</div>
                </div>
              </div>
            </div>
          </div>

          {/* Investment Tips Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">
                Start Early
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Time is your greatest asset in investing. Starting early, even
                with small amounts, can significantly outperform larger
                investments made later in life due to compound growth.
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-3">
                Stay Consistent
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Regular, consistent investments through dollar-cost averaging
                help smooth out market volatility and build disciplined
                investing habits that lead to long-term success.
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
                Compound interest works best over longer time periods. Resist
                the urge to make short-term moves based on market fluctuations
                and focus on your long-term financial goals.
              </p>
            </div>
          </div>

          {/* Call to Action */}
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
      </div>
    </section>
  )
}
