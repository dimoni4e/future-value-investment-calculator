import { type InvestmentParameters } from '@/lib/finance'
import ScenarioSEOSection from '@/components/scenario/ScenarioSEOSection'
import { TrendingUp, Target, Clock, BarChart3 } from 'lucide-react'

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
            <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {growthRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.totalGrowthRate || 'Total Growth Rate'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${monthlyGrowth.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.avgMonthlyGrowth || 'Avg Monthly Growth'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {compoundEffect.toFixed(1)}x
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.compoundMultiplier || 'Compound Multiplier'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    $
                    {(
                      result.futureValue /
                      (params.timeHorizonYears * 12)
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.avgMonthlyValue || 'Avg Monthly Value'}
                  </div>
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
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8">
            <h4 className="text-2xl font-bold mb-6 text-center">
              {translations?.milestones || 'Investment Milestones'}
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {Math.round(params.timeHorizonYears / 3)}{' '}
                  {translations?.years || 'years'}
                </div>
                <div className="text-lg font-semibold mb-2">
                  ${Math.round(result.futureValue * 0.25).toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {translations?.firstMilestone || 'First Quarter Milestone'}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {Math.round(params.timeHorizonYears / 2)}{' '}
                  {translations?.years || 'years'}
                </div>
                <div className="text-lg font-semibold mb-2">
                  ${Math.round(result.futureValue * 0.5).toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {translations?.midpointMilestone || 'Halfway Milestone'}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {params.timeHorizonYears} {translations?.years || 'years'}
                </div>
                <div className="text-lg font-semibold mb-2">
                  ${result.futureValue.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600">
                  {translations?.finalGoal || 'Final Goal'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
