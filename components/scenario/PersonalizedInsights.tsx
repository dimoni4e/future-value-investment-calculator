import { type InvestmentParameters } from '@/lib/finance'
import ScenarioSEOSection from '@/components/scenario/ScenarioSEOSection'
import { TrendingUp, Target, Clock, BarChart3 } from 'lucide-react'
import { formatCurrencyUSD } from '@/lib/format'

interface PersonalizedInsightsProps {
  params: InvestmentParameters
  result: {
    futureValue: number
    totalContributions: number
    totalGrowth: number
  }
  locale: string
  translations: any
}

export default function PersonalizedInsights({
  params,
  result,
  locale,
  translations,
}: PersonalizedInsightsProps) {
  // Calculate additional metrics
  const totalInvested =
    params.initialAmount +
    params.monthlyContribution * params.timeHorizonYears * 12
  const growthRate =
    ((result.futureValue - totalInvested) / totalInvested) * 100
  const monthlyGrowth = result.totalGrowth / (params.timeHorizonYears * 12)
  const compoundEffect = result.futureValue / totalInvested

  const headingMap: Record<
    string,
    {
      overview: string
      projection: string
      strategy: string
      insights: string
      market: string
    }
  > = {
    en: {
      overview: 'Overview',
      projection: 'Growth Projection',
      strategy: 'Strategy Analysis',
      insights: 'Investment Insights',
      market: 'Market Context',
    },
    pl: {
      overview: 'Przegląd',
      projection: 'Prognoza wzrostu',
      strategy: 'Analiza strategii',
      insights: 'Wnioski inwestycyjne',
      market: 'Kontekst rynkowy',
    },
    es: {
      overview: 'Resumen',
      projection: 'Proyección de crecimiento',
      strategy: 'Análisis de estrategia',
      insights: 'Ideas de inversión',
      market: 'Contexto del mercado',
    },
  }
  const headings = headingMap[locale] || headingMap.en

  return (
    <section className="py-16 bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full text-blue-700 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              <span>
                {translations?.personalizedMetrics ||
                  'Personalized Investment Metrics'}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-4">
              {translations?.insightsTitle || 'Your Investment Journey'}
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {translations?.insightsDescription ||
                'Detailed breakdown of your investment performance and key milestones.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                    {growthRate.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {translations?.totalGrowthRate || 'Total Growth Rate'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Return on investment
                </div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {formatCurrencyUSD(monthlyGrowth)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {translations?.avgMonthlyGrowth || 'Avg Monthly Growth'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Average monthly gain
                </div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-100 to-fuchsia-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                    {compoundEffect.toFixed(1)}x
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {translations?.compoundMultiplier || 'Compound Multiplier'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Wealth multiplication factor
                </div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">
                    {formatCurrencyUSD(
                      result.futureValue / (params.timeHorizonYears * 12)
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                  {translations?.avgMonthlyValue || 'Avg Monthly Value'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Future value per month
                </div>
              </div>
            </div>
          </div>

          {/* Deeper analysis (Programmatic SEO content) */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold">
                {translations?.deeperAnalysisTitle || 'Deeper Analysis'}
              </h4>
              <p className="text-slate-600">
                {translations?.deeperAnalysisDescription ||
                  'Personalized insights based on your inputs, including projections and strategy notes.'}
              </p>
            </div>

            <ScenarioSEOSection
              params={params}
              // Round-related adjustments are handled inside ScenarioSEOSection
              result={
                {
                  futureValue: result.futureValue,
                  totalContributions: result.totalContributions,
                  totalGrowth: result.totalGrowth,
                  // Let the section compute a fresh breakdown for the chart if missing
                  // (we don't have it here in this context)
                  annualBreakdown: [],
                } as any
              }
              locale={locale}
              headings={headings}
            />
          </div>

          {/* Investment Milestones */}
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-3xl p-8 border border-indigo-100/50 shadow-lg">
            <h4 className="text-2xl font-bold mb-8 text-center text-slate-900">
              {translations?.milestones || 'Investment Milestones'}
            </h4>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-green-200 -translate-y-8 z-0"></div>

              <div className="relative z-10 text-center group">
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-md border-4 border-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:border-indigo-200">
                  <span className="text-xl font-bold text-indigo-600">1/3</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">
                    {Math.round(params.timeHorizonYears / 3)}{' '}
                    <span className="text-base font-medium text-indigo-400">
                      {translations?.years || 'years'}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-slate-800 mb-1">
                    {formatCurrencyUSD(Math.round(result.futureValue * 0.25))}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {translations?.firstMilestone || 'First Quarter Milestone'}
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center group">
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-md border-4 border-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:border-purple-200">
                  <span className="text-xl font-bold text-purple-600">1/2</span>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round(params.timeHorizonYears / 2)}{' '}
                    <span className="text-base font-medium text-purple-400">
                      {translations?.years || 'years'}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-slate-800 mb-1">
                    {formatCurrencyUSD(Math.round(result.futureValue * 0.5))}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {translations?.midpointMilestone || 'Halfway Milestone'}
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-center group">
                <div className="w-16 h-16 mx-auto bg-white rounded-full shadow-md border-4 border-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:border-green-200">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {params.timeHorizonYears}{' '}
                    <span className="text-base font-medium text-green-400">
                      {translations?.years || 'years'}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-slate-800 mb-1">
                    {formatCurrencyUSD(result.futureValue)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {translations?.finalGoal || 'Final Goal'}
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
