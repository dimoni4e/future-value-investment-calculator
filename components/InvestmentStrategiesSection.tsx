import { getHomeContent } from '@/lib/db/queries'

interface InvestmentStrategiesSectionProps {
  locale: string
}

export async function InvestmentStrategiesSection({
  locale,
}: InvestmentStrategiesSectionProps) {
  const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
  const content: { [key: string]: string } = {}
  homeContentData.forEach((item) => {
    const key = `${item.section}_${item.key}`
    content[key] = item.value
  })

  if (!content.strategies_title) {
    return null
  }

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-50/30 via-white to-purple-50/30 border-t border-slate-200/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-50/80 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200/50 mb-6 shadow-soft">
            <span>📈</span>
            <span>Investment Strategies</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold font-playfair text-slate-900 mb-6">
            {content.strategies_title}
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            {content.strategies_subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Strategy 1 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
              {content.strategies_strategy_1_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.strategies_strategy_1_description}
            </p>
          </div>

          {/* Strategy 2 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
              {content.strategies_strategy_2_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.strategies_strategy_2_description}
            </p>
          </div>

          {/* Strategy 3 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-4 group-hover:text-purple-600 transition-colors">
              {content.strategies_strategy_3_title}
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {content.strategies_strategy_3_description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
