import { type InvestmentParameters, calculateFutureValue } from '@/lib/finance'
import { TrendingUp, Users, BarChart3, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ComparativeAnalysisProps {
  params: InvestmentParameters
  result: {
    futureValue: number
    totalContributions: number
    totalGrowth: number
  }
  locale: string
  translations: any
}

export default function ComparativeAnalysis({
  params,
  result,
  locale,
  translations,
}: ComparativeAnalysisProps) {
  // Generate comparative scenarios
  const scenarios = [
    {
      title: translations?.higherContribution || 'Higher Monthly Contribution',
      description:
        translations?.higherContributionDesc ||
        'Increase monthly contribution by 50%',
      params: {
        ...params,
        monthlyContribution: Math.round(params.monthlyContribution * 1.5),
      },
      color: 'blue',
    },
    {
      title: translations?.longerTimeframe || 'Extended Time Horizon',
      description:
        translations?.longerTimeframeDesc || 'Add 5 more years to investment',
      params: {
        ...params,
        timeHorizonYears: params.timeHorizonYears + 5,
      },
      color: 'green',
    },
    {
      title: translations?.higherReturn || 'Higher Expected Return',
      description:
        translations?.higherReturnDesc || 'Increase expected return by 2%',
      params: {
        ...params,
        annualReturnRate: params.annualReturnRate + 2,
      },
      color: 'purple',
    },
    {
      title: translations?.doubleInitial || 'Double Initial Investment',
      description:
        translations?.doubleInitialDesc ||
        'Start with twice the initial amount',
      params: {
        ...params,
        initialAmount: params.initialAmount * 2,
      },
      color: 'orange',
    },
  ]

  const calculateScenario = (scenarioParams: InvestmentParameters) => {
    return calculateFutureValue(scenarioParams)
  }

  return (
    <section className="py-16 bg-white/70 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full text-purple-700 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              <span>
                {translations?.comparativeAnalysis || 'Comparative Analysis'}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-4">
              {translations?.compareTitle ||
                'How Different Choices Impact Your Results'}
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {translations?.compareDescription ||
                'Explore how modifying key parameters could dramatically change your investment outcomes.'}
            </p>
          </div>

          {/* Current Scenario Baseline */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 mb-12 border border-indigo-200/50">
            <div className="text-center">
              <h4 className="text-xl font-semibold mb-4 text-indigo-900">
                {translations?.currentScenario || 'Your Current Scenario'}
              </h4>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    ${params.initialAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.initial || 'Initial'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    ${params.monthlyContribution.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.monthly || 'Monthly'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {params.annualReturnRate}%
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.return || 'Return'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {params.timeHorizonYears} {translations?.years || 'years'}
                  </div>
                  <div className="text-sm text-slate-600">
                    {translations?.timeframe || 'Timeframe'}
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-indigo-200">
                <div className="text-3xl font-bold text-indigo-800">
                  ${result.futureValue.toLocaleString()}
                </div>
                <div className="text-sm text-indigo-600">
                  {translations?.projectedValue || 'Projected Final Value'}
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Scenarios */}
          <div className="grid md:grid-cols-2 gap-8">
            {scenarios.map((scenario, index) => {
              const scenarioResult = calculateScenario(scenario.params)
              const improvement =
                ((scenarioResult.futureValue - result.futureValue) /
                  result.futureValue) *
                100

              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 bg-${scenario.color}-100 rounded-lg`}>
                      <TrendingUp
                        className={`w-5 h-5 text-${scenario.color}-600`}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        {scenario.title}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-600">
                          {translations?.newValue || 'New Value'}
                        </div>
                        <div className="font-semibold">
                          ${scenarioResult.futureValue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-600">
                          {translations?.improvement || 'Improvement'}
                        </div>
                        <div
                          className={`font-semibold ${
                            improvement > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {improvement > 0 ? '+' : ''}
                          {improvement.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-center p-4 bg-${scenario.color}-50 rounded-2xl`}
                  >
                    <div
                      className={`text-2xl font-bold text-${scenario.color}-600 mb-1`}
                    >
                      +$
                      {(
                        scenarioResult.futureValue - result.futureValue
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">
                      {translations?.additionalGrowth || 'Additional Growth'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Similar Scenarios from Community */}
          <div className="mt-16 bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-emerald-100 px-4 py-2 rounded-full text-emerald-700 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                <span>
                  {translations?.communityScenarios || 'Community Scenarios'}
                </span>
              </div>
              <h4 className="text-2xl font-bold mb-4">
                {translations?.similarInvestors || 'Similar Investors Choose'}
              </h4>
              <p className="text-slate-600 max-w-2xl mx-auto">
                {translations?.similarDescription ||
                  'See how other investors with similar profiles have structured their investment strategies.'}
              </p>
            </div>

            <div className="flex justify-center">
              <Link
                href={`/${locale}#calculator`}
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>
                  {translations?.exploreMore || 'Explore More Scenarios'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
