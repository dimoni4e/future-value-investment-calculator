'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { InvestmentParameters } from '@/lib/finance'
import { PREDEFINED_SCENARIOS, ScenarioConfig } from '@/lib/scenarios'
import {
  generateScenarioSlug,
  detectInvestmentGoal,
  generateScenarioHeadline,
} from '@/lib/scenarioUtils'
import { useTranslations } from 'next-intl'
import { formatPercent, formatCurrencyUSD } from '@/lib/format'

interface RelatedScenario {
  id: string
  name: string
  description: string
  params: InvestmentParameters
  slug: string
  similarity: number
  reason: string
}

interface RelatedScenariosProps {
  currentScenario: {
    id: string
    name: string
    params: InvestmentParameters
  }
  locale: string
  maxResults?: number
}

/**
 * Calculates similarity score between two investment scenarios
 * Uses weighted factors: amount (30%), monthly (25%), timeframe (25%), return (20%)
 */
function calculateSimilarity(
  current: InvestmentParameters,
  candidate: InvestmentParameters
): number {
  // Normalize differences to 0-1 scale
  const amountDiff =
    Math.abs(current.initialAmount - candidate.initialAmount) /
    Math.max(current.initialAmount, candidate.initialAmount, 1000)

  const monthlyDiff =
    Math.abs(current.monthlyContribution - candidate.monthlyContribution) /
    Math.max(current.monthlyContribution, candidate.monthlyContribution, 100)

  const timeDiff =
    Math.abs(current.timeHorizonYears - candidate.timeHorizonYears) /
    Math.max(current.timeHorizonYears, candidate.timeHorizonYears, 1)

  const returnDiff =
    Math.abs(current.annualReturnRate - candidate.annualReturnRate) /
    Math.max(current.annualReturnRate, candidate.annualReturnRate, 1)

  // Weighted similarity score (higher is more similar)
  const similarity =
    1 -
    (amountDiff * 0.3 + monthlyDiff * 0.25 + timeDiff * 0.25 + returnDiff * 0.2)

  return Math.max(0, Math.min(1, similarity))
}

/**
 * Generates related scenarios based on different variation strategies
 */
function generateRelatedScenarios(
  currentParams: InvestmentParameters,
  currentId: string,
  locale: string
): RelatedScenario[] {
  const related: RelatedScenario[] = []
  const currentGoal = detectInvestmentGoal({
    initialAmount: currentParams.initialAmount,
    monthlyContribution: currentParams.monthlyContribution,
    annualReturn: currentParams.annualReturnRate,
    timeHorizon: currentParams.timeHorizonYears,
  })

  // Strategy 1: Similar amount ranges (±25% initial amount)
  const amountVariations = [0.75, 1.25, 1.5].map((factor) => ({
    ...currentParams,
    initialAmount: Math.round(currentParams.initialAmount * factor),
  }))

  // Strategy 2: Different monthly contributions (±50%)
  const monthlyVariations = [0.5, 1.5, 2].map((factor) => ({
    ...currentParams,
    monthlyContribution: Math.round(currentParams.monthlyContribution * factor),
  }))

  // Strategy 3: Different timeframes (±5 years)
  const timeVariations = [-5, 5, 10].map((adjustment) => ({
    ...currentParams,
    timeHorizonYears: Math.max(1, currentParams.timeHorizonYears + adjustment),
  }))

  // Strategy 4: Different return rates (±2%)
  const returnVariations = [-2, 2, 3].map((adjustment) => ({
    ...currentParams,
    annualReturnRate: Math.max(1, currentParams.annualReturnRate + adjustment),
  }))

  // Combine all variations
  const allVariations = [
    ...amountVariations,
    ...monthlyVariations,
    ...timeVariations,
    ...returnVariations,
  ]

  // Add predefined scenarios with same goal
  const sameGoalScenarios = PREDEFINED_SCENARIOS.filter((scenario) => {
    const scenarioGoal = detectInvestmentGoal({
      initialAmount: scenario.params.initialAmount,
      monthlyContribution: scenario.params.monthlyContribution,
      annualReturn: scenario.params.annualReturn,
      timeHorizon: scenario.params.timeHorizon,
    })
    return scenarioGoal === currentGoal && scenario.id !== currentId
  })

  // Convert predefined scenarios to variations
  const predefinedVariations = sameGoalScenarios.map((scenario) => ({
    initialAmount: scenario.params.initialAmount,
    monthlyContribution: scenario.params.monthlyContribution,
    annualReturnRate: scenario.params.annualReturn,
    timeHorizonYears: scenario.params.timeHorizon,
  }))

  // Process all variations
  const allCombinedVariations = [...allVariations, ...predefinedVariations]
  allCombinedVariations.forEach((variation, index) => {
    // Skip if identical to current
    if (
      variation.initialAmount === currentParams.initialAmount &&
      variation.monthlyContribution === currentParams.monthlyContribution &&
      variation.annualReturnRate === currentParams.annualReturnRate &&
      variation.timeHorizonYears === currentParams.timeHorizonYears
    ) {
      return
    }

    const similarity = calculateSimilarity(currentParams, variation)

    // Only include scenarios with reasonable similarity (20-80%)
    if (similarity < 0.2 || similarity > 0.8) {
      return
    }

    const slug = generateScenarioSlug({
      initialAmount: variation.initialAmount,
      monthlyContribution: variation.monthlyContribution,
      annualReturn: variation.annualReturnRate,
      timeHorizon: variation.timeHorizonYears,
    })

    // Find matching predefined scenario or create synthetic one
    const matchingPredefined = sameGoalScenarios.find(
      (s) =>
        s.params.initialAmount === variation.initialAmount &&
        s.params.monthlyContribution === variation.monthlyContribution &&
        s.params.annualReturn === variation.annualReturnRate &&
        s.params.timeHorizon === variation.timeHorizonYears
    )

    let reason = ''
    if (index < 3) reason = 'Similar initial amount'
    else if (index < 6) reason = 'Different monthly contribution'
    else if (index < 9) reason = 'Different time horizon'
    else if (index < 12) reason = 'Different return rate'
    else reason = 'Same goal category'

    const name =
      matchingPredefined?.name ||
      `Invest $${variation.initialAmount.toLocaleString()} + $${variation.monthlyContribution}/month`

    const description =
      matchingPredefined?.description ||
      `${variation.timeHorizonYears}-year plan with ${variation.annualReturnRate}% annual return`

    related.push({
      id: matchingPredefined?.id || slug,
      name,
      description,
      params: variation,
      slug,
      similarity,
      reason,
    })
  })

  // Sort by similarity (descending) and remove duplicates
  const uniqueRelated = related
    .filter(
      (scenario, index, arr) =>
        arr.findIndex((s) => s.slug === scenario.slug) === index
    )
    .sort((a, b) => b.similarity - a.similarity)

  return uniqueRelated
}

export default function RelatedScenarios({
  currentScenario,
  locale,
  maxResults = 6,
}: RelatedScenariosProps) {
  const t = useTranslations('scenarios.related')
  const [relatedScenarios, setRelatedScenarios] = useState<RelatedScenario[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const related = generateRelatedScenarios(
        currentScenario.params,
        currentScenario.id,
        locale
      ).slice(0, maxResults)

      setRelatedScenarios(related)
    } catch (error) {
      console.error('Error generating related scenarios:', error)
      setRelatedScenarios([])
    } finally {
      setIsLoading(false)
    }
  }, [currentScenario, locale, maxResults])

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded-lg max-w-md mx-auto animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (relatedScenarios.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold font-playfair bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              {t('title')}
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Related Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedScenarios.map((scenario, index) => {
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
                  key={scenario.slug}
                  href={`/${locale}/scenario/${scenario.slug}`}
                  className="block group"
                >
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/50 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group-hover:scale-105">
                    {/* Scenario Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                          {(
                            {
                              'Similar initial amount': t(
                                'reasons.similarInitial'
                              ),
                              'Different monthly contribution': t(
                                'reasons.differentMonthly'
                              ),
                              'Different time horizon': t(
                                'reasons.differentTime'
                              ),
                              'Different return rate': t(
                                'reasons.differentReturn'
                              ),
                              'Same goal category': t('reasons.sameGoal'),
                            } as Record<string, string>
                          )[scenario.reason] || scenario.reason}
                        </span>
                        <span className="text-xs text-slate-500">
                          {Math.round(scenario.similarity * 100)}%{' '}
                          {t('similar')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {headline}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        {scenario.description}
                      </p>
                    </div>

                    {/* Scenario Parameters */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {t('labels.initial')}:
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatCurrencyUSD(scenario.params.initialAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {t('labels.monthly')}:
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatCurrencyUSD(
                            scenario.params.monthlyContribution
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {t('labels.return')}:
                        </span>
                        <span className="font-medium text-slate-900">
                          {formatPercent(scenario.params.annualReturnRate, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {t('labels.timeline')}:
                        </span>
                        <span className="font-medium text-slate-900">
                          {scenario.params.timeHorizonYears} {t('labels.years')}
                        </span>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-indigo-600 group-hover:text-indigo-700 transition-colors">
                        {t('viewScenario')} →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* View More Link */}
          <div className="text-center mt-12">
            <Link
              href={locale === 'en' ? '/' : `/${locale}`}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white px-8 py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-700 transition-all duration-300"
            >
              <span>🧮</span>
              {t('createYourOwn')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
