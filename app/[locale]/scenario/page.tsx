import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios'
import Link from 'next/link'

interface Props {
  params: {
    locale: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations('scenarios')

  return {
    title: t('title'),
    description: t('description'),
    keywords:
      'investment scenarios, financial planning, retirement planning, wealth building, investment calculator',
  }
}

export default async function ScenariosPage({ params }: Props) {
  const t = await getTranslations('scenarios')

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-100 to-cyan-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-medium mb-6">
              <span>🎯</span>
              <span>Investment Scenario Explorer</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold font-playfair bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              {t('title')}
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
        </div>
      </section>

      {/* Predefined Scenarios Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Expert-Curated Investment Scenarios
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PREDEFINED_SCENARIOS.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/${params.locale}/scenario/${scenario.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 transition-colors">
                        {scenario.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {scenario.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">
                          ${scenario.params.initialAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">Initial</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">
                          $
                          {scenario.params.monthlyContribution.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">Monthly</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {(scenario.params.annualReturn * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-slate-500">Return</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-cyan-600">
                          {scenario.params.timeHorizon}y
                        </div>
                        <div className="text-xs text-slate-500">Years</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-2xl p-4 text-center">
                      <div className="text-lg font-bold">
                        View Detailed Analysis
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Create Your Own Scenario?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Use our free investment calculator to model your financial future
              and share your strategy with others.
            </p>
            <Link
              href={`/${params.locale}`}
              className="inline-flex items-center space-x-2 bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-lg"
            >
              <span>Start Calculating</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
