import { type InvestmentParameters } from '@/lib/finance'
import { generateMarketContext } from '@/lib/contentGenerator'
import { TrendingUp, AlertTriangle, Info, Globe } from 'lucide-react'

interface MarketContextProps {
  params: InvestmentParameters
  locale: string
  translations: any
}

export default async function MarketContext({
  params,
  locale,
  translations,
}: MarketContextProps) {
  // Generate market context using our content generator
  const marketContext = generateMarketContext(
    {
      initialAmount: params.initialAmount,
      monthlyContribution: params.monthlyContribution,
      annualReturn: params.annualReturnRate,
      timeHorizon: params.timeHorizonYears,
      goal: 'general',
    },
    locale
  )

  // Determine risk level based on annual return
  const getRiskLevel = (returnRate: number) => {
    if (returnRate <= 4) return { level: 'Conservative', color: 'green' }
    if (returnRate <= 7) return { level: 'Moderate', color: 'blue' }
    if (returnRate <= 10) return { level: 'Aggressive', color: 'yellow' }
    return { level: 'Very Aggressive', color: 'red' }
  }

  const riskInfo = getRiskLevel(params.annualReturnRate)

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-slate-100 to-blue-100 px-4 py-2 rounded-full text-slate-700 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              <span>
                {translations?.marketContext || 'Market Context & Analysis'}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-4">
              {translations?.marketTitle ||
                'Market Environment for Your Investment'}
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {translations?.marketDescription ||
                'Understanding current market conditions and how they impact your investment strategy.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Market Context Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg">
                <h4 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span>
                    {translations?.currentMarket || 'Current Market Analysis'}
                  </span>
                </h4>
                <div className="prose prose-slate max-w-none">
                  <div
                    className="text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: marketContext.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Risk Assessment Sidebar */}
            <div className="space-y-6">
              {/* Risk Level Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <AlertTriangle
                    className={`w-5 h-5 text-${riskInfo.color}-600`}
                  />
                  <span>{translations?.riskLevel || 'Risk Assessment'}</span>
                </h4>
                <div className="space-y-4">
                  <div>
                    <div
                      className={`text-2xl font-bold text-${riskInfo.color}-600 mb-2`}
                    >
                      {riskInfo.level}
                    </div>
                    <div className="text-sm text-slate-600">
                      {translations?.expectedReturn || 'Expected Return'}:{' '}
                      {params.annualReturnRate}%
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">
                      {translations?.riskFactors || 'Key Risk Factors'}
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li>
                        •{' '}
                        {translations?.marketVolatility || 'Market volatility'}
                      </li>
                      <li>
                        • {translations?.inflationRisk || 'Inflation impact'}
                      </li>
                      <li>
                        •{' '}
                        {translations?.timeHorizonRisk ||
                          'Time horizon considerations'}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Economic Indicators */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-lg">
                <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>
                    {translations?.economicIndicators || 'Economic Indicators'}
                  </span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {translations?.currentInflation || 'Current Inflation'}
                    </span>
                    <span className="font-semibold text-slate-800">3.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {translations?.interestRates || 'Interest Rates'}
                    </span>
                    <span className="font-semibold text-slate-800">5.25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      {translations?.marketVolatility || 'Market Volatility'}
                    </span>
                    <span className="font-semibold text-blue-600">
                      {translations?.moderate || 'Moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Horizon Insight */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-6">
                <h4 className="text-lg font-semibold mb-3">
                  {translations?.timeHorizonInsight || 'Time Horizon Advantage'}
                </h4>
                <p className="text-sm text-indigo-100">
                  {translations?.timeHorizonText ||
                    `With ${params.timeHorizonYears} years to invest, you have time to weather market fluctuations and benefit from compound growth.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
