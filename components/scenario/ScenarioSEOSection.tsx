import { generatePersonalizedContent } from '@/lib/contentGenerator'
import { detectInvestmentGoal } from '@/lib/scenarioUtils'
import {
  InvestmentParameters,
  InvestmentResult,
  calculateFutureValue,
} from '@/lib/finance'
import LazyContentSection from '@/components/scenario/LazyContentSection'
import OptimizedGrowthChart from '@/components/OptimizedGrowthChart'
import { TrendingUp, Activity, Percent } from 'lucide-react'

interface ScenarioSEOSectionProps {
  params: InvestmentParameters
  result?: InvestmentResult
  locale: string
  goalHint?: string | null
  headings?: {
    overview?: string
    projection?: string
    strategy?: string
    insights?: string
    market?: string
  }
}

// Server component: renders localized, template-based SEO content
export default async function ScenarioSEOSection({
  params,
  result,
  locale,
  goalHint,
  headings,
}: ScenarioSEOSectionProps) {
  // params.annualReturnRate is already a PERCENT (e.g., 7 for 7%).
  // Round to one decimal to avoid long floats like 7.000000000000001%.
  const annualPct = Math.round(params.annualReturnRate * 10) / 10

  const goal =
    goalHint ||
    detectInvestmentGoal({
      initialAmount: params.initialAmount,
      monthlyContribution: params.monthlyContribution,
      annualReturn: Number(annualPct.toFixed(1)),
      timeHorizon: params.timeHorizonYears,
    })

  const sections = generatePersonalizedContent(
    {
      initialAmount: params.initialAmount,
      monthlyContribution: params.monthlyContribution,
      annualReturn: Number(annualPct.toFixed(1)),
      timeHorizon: params.timeHorizonYears,
      goal: String(goal),
      futureValue: result?.futureValue,
      totalContributions: result?.totalContributions,
      totalGains: result?.totalGrowth,
    },
    locale
  )

  // Build chart data from annual breakdown (compute if not provided)
  const breakdown =
    result &&
    Array.isArray(result.annualBreakdown) &&
    result.annualBreakdown.length > 0
      ? result.annualBreakdown
      : calculateFutureValue({
          ...params,
          // calculateFutureValue expects percentage and params is already percentage
          annualReturnRate: params.annualReturnRate,
        }).annualBreakdown

  const chartData = breakdown.map((b) => ({
    year: b.year,
    totalValue: b.totalValue,
    contributions: b.contributions,
    growth: b.growth,
  }))

  return (
    <section
      id="seo-content"
      className="py-16 lg:py-24 bg-gradient-to-br from-slate-50/40 via-white to-blue-50/20 border-t border-slate-200/50"
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-slate prose-invert:prose-slate prose-h2:font-semibold prose-h3:font-semibold prose-h2:tracking-tight prose-h3:tracking-tight prose-h2:text-slate-900 prose-h3:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1">
          {/* Overview */}
          {sections.investment_overview && (
            <div className="animate-fade-in">
              {headings?.overview && (
                <h3 className="mt-0 mb-3 text-xl text-slate-900">
                  {headings.overview}
                </h3>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: sections.investment_overview,
                }}
              />
              <hr className="my-10 border-slate-200/60" />
            </div>
          )}

          {/* Growth projection */}
          {sections.growth_projection && (
            <div className="mt-10 animate-fade-in">
              {headings?.projection && (
                <h3 className="mt-0 mb-3 text-xl text-slate-900">
                  {headings.projection}
                </h3>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: sections.growth_projection,
                }}
              />

              {/* Growth chart (lazy-loaded for performance) */}
              <div className="mt-6 not-prose">
                <LazyContentSection
                  // Use chart's own skeleton via a minimal placeholder box
                  fallback={
                    <div className="w-full h-80 bg-slate-100 rounded-xl animate-pulse" />
                  }
                  rootMargin="200px"
                >
                  <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm w-full">
                    <OptimizedGrowthChart
                      data={chartData}
                      height={320}
                      enableAnimations
                    />
                  </div>
                </LazyContentSection>
              </div>
              <hr className="my-10 border-slate-200/60" />
            </div>
          )}

          {/* Strategy analysis */}
          {sections.strategy_analysis && (
            <div className="mt-10 animate-fade-in">
              {headings?.strategy && (
                <h3 className="mt-0 mb-3 text-xl text-slate-900">
                  {headings.strategy}
                </h3>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: sections.strategy_analysis,
                }}
              />
              <hr className="my-10 border-slate-200/60" />
            </div>
          )}

          {/* Investment insights */}
          {sections.investment_insights && (
            <div className="mt-10 animate-fade-in">
              {headings?.insights && (
                <h3 className="mt-0 mb-3 text-xl text-slate-900">
                  {headings.insights}
                </h3>
              )}
              <div
                dangerouslySetInnerHTML={{
                  __html: sections.investment_insights,
                }}
              />
              <hr className="my-10 border-slate-200/60" />
            </div>
          )}

          {/* Market context */}
          {sections.market_context && (
            <div className="mt-12 animate-fade-in bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 m-0">
                  {headings?.market || 'Market Context & Analysis'}
                </h3>
              </div>

              {sections.market_data && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 not-prose">
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Percent className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Inflation Rate
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {sections.market_data.inflation}%
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Interest Rates
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {sections.market_data.interestRate}%
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Market Volatility
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 capitalize">
                      {sections.market_data.volatility}
                    </div>
                  </div>
                </div>
              )}

              <div
                dangerouslySetInnerHTML={{
                  __html: sections.market_context,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
