import { type InvestmentParameters } from '@/lib/finance'
import { Lightbulb, TrendingUp, Shield, Clock, DollarSign } from 'lucide-react'

interface OptimizationTipsProps {
  params: InvestmentParameters
  result: {
    futureValue: number
    totalContributions: number
    totalGrowth: number
  }
  locale: string
  translations: any
}

export default function OptimizationTips({
  params,
  result,
  locale,
  translations,
}: OptimizationTipsProps) {
  // Generate personalized optimization tips based on parameters
  const generateTips = () => {
    const tips = []

    // Monthly contribution tips
    if (params.monthlyContribution < 500) {
      tips.push({
        icon: TrendingUp,
        title:
          translations?.increaseContributions ||
          'Increase Monthly Contributions',
        description:
          translations?.increaseContributionsDesc ||
          'Consider increasing your monthly contributions by $100-200 to significantly boost your final result.',
        impact: `+$${((params.monthlyContribution * 1.5 - params.monthlyContribution) * params.timeHorizonYears * 12 * 1.5).toLocaleString()}`,
        color: 'blue',
      })
    }

    // Time horizon tips
    if (params.timeHorizonYears < 20) {
      tips.push({
        icon: Clock,
        title: translations?.extendTimeframe || 'Extend Investment Timeframe',
        description:
          translations?.extendTimeframeDesc ||
          'Adding even 5 more years can dramatically increase your returns due to compound interest.',
        impact: `+$${(result.futureValue * 0.4).toLocaleString()}`,
        color: 'green',
      })
    }

    // Tax optimization
    tips.push({
      icon: Shield,
      title: translations?.taxOptimization || 'Tax-Advantaged Accounts',
      description:
        translations?.taxOptimizationDesc ||
        'Consider using 401(k), IRA, or other tax-advantaged accounts to maximize your after-tax returns.',
      impact: translations?.taxSavings || 'Up to 30% more after-tax returns',
      color: 'purple',
    })

    // Automation tip
    tips.push({
      icon: DollarSign,
      title: translations?.automate || 'Automate Your Investments',
      description:
        translations?.automateDesc ||
        'Set up automatic transfers to ensure consistent investing and take advantage of dollar-cost averaging.',
      impact: translations?.consistentGrowth || 'More consistent growth',
      color: 'emerald',
    })

    // High return optimization
    if (params.annualReturnRate < 8) {
      tips.push({
        icon: TrendingUp,
        title: translations?.diversify || 'Diversify for Higher Returns',
        description:
          translations?.diversifyDesc ||
          'Consider a mix of stocks, bonds, and other assets to potentially achieve higher returns.',
        impact: `+$${(result.futureValue * 0.3).toLocaleString()}`,
        color: 'orange',
      })
    }

    return tips.slice(0, 4) // Return top 4 most relevant tips
  }

  const tips = generateTips()

  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4" />
              <span>
                {translations?.optimizationTips || 'Optimization Tips'}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-4">
              {translations?.optimizeTitle ||
                'Maximize Your Investment Potential'}
            </h3>
            <p className="text-lg text-indigo-100 max-w-2xl mx-auto">
              {translations?.optimizeDescription ||
                'Personalized strategies to help you achieve even better results with your investment plan.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <tip.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-3">{tip.title}</h4>
                    <p className="text-indigo-100 mb-4 leading-relaxed">
                      {tip.description}
                    </p>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <div className="text-sm text-indigo-200 mb-1">
                        {translations?.potentialImpact || 'Potential Impact'}
                      </div>
                      <div className="text-lg font-bold text-white">
                        {tip.impact}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="mt-16 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h4 className="text-2xl font-bold mb-4">
                {translations?.readyToOptimize || 'Ready to Optimize?'}
              </h4>
              <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
                {translations?.optimizeCta ||
                  'Use our calculator to experiment with these optimizations and see how they could impact your results.'}
              </p>
              <a
                href={`/${locale}?initial=${params.initialAmount}&monthly=${params.monthlyContribution}&return=${params.annualReturnRate}&years=${params.timeHorizonYears}`}
                className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-lg"
              >
                <span>
                  {translations?.tryOptimizations || 'Try These Optimizations'}
                </span>
                <TrendingUp className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
