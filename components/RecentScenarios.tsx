'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bookmark, TrendingUp, Eye, Calendar } from 'lucide-react'
import { calculateFutureValue, type InvestmentParameters } from '@/lib/finance'

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
    fetchRecentScenarios()
  }, [limit, fetchRecentScenarios])

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
        <p className="text-gray-600 mb-4">No user scenarios yet</p>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Create the first scenario
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Recent User Scenarios
        </h3>
        <Link
          href={locale === 'en' ? '/my-scenarios' : `/${locale}/my-scenarios`}
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          View all →
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
                    User Created
                  </span>
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="w-3 h-3 mr-1" />
                    {scenario.views} views
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-1">
                  {scenario.name}
                </h4>

                {scenario.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {scenario.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>
                    ${scenario.params.initialAmount.toLocaleString()} initial
                  </span>
                  <span>
                    ${scenario.params.monthlyContribution.toLocaleString()}
                    /month
                  </span>
                  <span>{scenario.params.annualReturnRate}% return</span>
                  <span>{scenario.params.timeHorizonYears} years</span>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="text-lg font-bold text-emerald-600">
                  ${result.futureValue.toLocaleString()}
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
