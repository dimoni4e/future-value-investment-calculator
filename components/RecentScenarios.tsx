'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bookmark, TrendingUp, Eye, Calendar } from 'lucide-react'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'
import { getHomeContent } from '@/lib/db/queries'
import { formatCurrencyUSD } from '@/lib/format'
import { generateScenarioHeadline } from '@/lib/scenarioUtils'

interface UserScenario {
  id: string
  slug: string
  name: string
  description?: string
  params: {
    initialAmount: number
    monthlyContribution: number
    annualReturnRate: number
    timeHorizonYears: number
  }
  createdAt: string
  views: number
}

interface RecentScenariosProps {
  locale: string
  limit?: number
}

export function RecentScenarios({ locale, limit = 3 }: RecentScenariosProps) {
  const [scenarios, setScenarios] = useState<UserScenario[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<{ [key: string]: string }>({})

  // Fetch content from database
  const fetchContent = useCallback(async () => {
    try {
      const homeContentData = await getHomeContent(locale as 'en' | 'pl' | 'es')
      const contentMap: { [key: string]: string } = {}
      homeContentData.forEach((item) => {
        const key = `${item.section}_${item.key}`
        contentMap[key] = item.value
      })
      setContent(contentMap)
    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }, [locale])

  const fetchRecentScenarios = useCallback(async () => {
    try {
      const response = await fetch('/api/scenarios')
      if (response.ok) {
        const data = await response.json()
        setScenarios(data.scenarios.slice(0, limit))
      }
    } catch (error) {
      console.error('Error fetching scenarios:', error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchContent()
    fetchRecentScenarios()
  }, [limit, fetchRecentScenarios, fetchContent])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-24 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-8">
        <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">
          {content.scenarios_no_scenarios || 'No user scenarios yet'}
        </p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {content.scenarios_create_first || 'Create the first scenario'}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {content.scenarios_popular_title || 'Popular Investment Scenarios'}
        </h3>
        <Link
          href={locale === 'en' ? '/scenario' : `/${locale}/scenario`}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          {content.scenarios_explore_all || 'Explore all scenarios →'}
        </Link>
      </div>

      {scenarios.map((scenario) => {
        const investmentParams: InvestmentParameters = {
          initialAmount: scenario.params.initialAmount,
          monthlyContribution: scenario.params.monthlyContribution,
          annualReturnRate: scenario.params.annualReturnRate,
          timeHorizonYears: scenario.params.timeHorizonYears,
        }

        const result = calculateFutureValue(investmentParams)
        const headline = generateScenarioHeadline(
          locale as 'en' | 'pl' | 'es',
          {
            initialAmount: scenario.params.initialAmount,
            monthlyContribution: scenario.params.monthlyContribution,
            annualReturn: scenario.params.annualReturnRate,
            timeHorizon: scenario.params.timeHorizonYears,
          }
        )

        return (
          <Link
            key={scenario.id}
            href={
              locale === 'en'
                ? `/scenario/${scenario.slug}`
                : `/${locale}/scenario/${scenario.slug}`
            }
            className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {content.scenarios_user_created || 'User Created'}
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-3 h-3 mr-1" />
                    {scenario.views} {content.scenarios_views || 'views'}
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">{headline}</h4>

                {scenario.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {scenario.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    {formatCurrencyUSD(scenario.params.initialAmount)}{' '}
                    {content.scenarios_initial || 'initial'}
                  </span>
                  <span>
                    {formatCurrencyUSD(scenario.params.monthlyContribution)}/
                    {content.scenarios_monthly || 'month'}
                  </span>
                  <span>
                    {scenario.params.annualReturnRate}%{' '}
                    {content.scenarios_return || 'return'}
                  </span>
                  <span>
                    {scenario.params.timeHorizonYears}{' '}
                    {content.scenarios_timeline || 'years'}
                  </span>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-lg font-bold text-emerald-600">
                  {formatCurrencyUSD(result.futureValue)}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(scenario.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
