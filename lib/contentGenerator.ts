/**
 * Content Generator for Parameter-Based Content Generation
 * Generates personalized investment content based on calculator parameters
 * Uses i18n translation keys for multi-language support
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { calculateFutureValue as calculateFinanceValue } from './finance'

export interface CalculatorInputs {
  initialAmount: number
  monthlyContribution: number
  annualReturn: number
  timeHorizon: number
  goal: string
  futureValue?: number
  totalContributions?: number
  totalGains?: number
}

export interface ContentSections {
  investment_overview: string
  growth_projection: string
  investment_insights: string
  strategy_analysis: string
  comparative_scenarios: string
  community_insights: string
  optimization_tips: string
  market_context: string
  market_data?: {
    inflation: number
    interestRate: number
    volatility: string
  }
}

/**
 * Load i18n messages for a specific locale
 */
function loadI18nMessages(locale: string): any {
  try {
    const filePath = join(process.cwd(), 'i18n', 'messages', `${locale}.json`)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (error) {
    // Fallback to English if locale not found
    if (locale !== 'en') {
      return loadI18nMessages('en')
    }
    throw error
  }
}

/**
 * Get goal translation for a specific locale
 */
function getGoalTranslation(goal: string, locale: string): string {
  // Handle undefined or null goal
  if (!goal) {
    goal = 'general'
  }

  const messages = loadI18nMessages(locale)
  const goals = messages?.content?.goals

  // Map common goal keys to translation keys
  const goalMappings: Record<string, string> = {
    'retirement planning': 'retirement',
    retirement: 'retirement',
    house: 'house',
    'home purchase': 'house',
    education: 'education',
    'emergency fund': 'emergency',
    emergency: 'emergency',
    'wealth building': 'wealth',
    wealth: 'wealth',
    'general investment': 'general',
    general: 'general',
    vacation: 'vacation',
    car: 'car',
    business: 'business',
    debt: 'debt',
  }

  const goalKey = goalMappings[goal.toLowerCase()] || 'general'
  return goals?.[goalKey] || goal
}

/**
 * Generate additional parameters for template population
 */
function generateAdditionalParameters(
  params: CalculatorInputs,
  locale: string
): any {
  const messages = loadI18nMessages(locale)

  // Determine risk category based on annual return
  let riskCategory = 'moderate'
  if (params.annualReturn >= 10) {
    riskCategory = 'aggressive'
  } else if (params.annualReturn <= 5) {
    riskCategory = 'conservative'
  }

  // Determine risk level
  let riskLevel = 'moderate'
  if (params.annualReturn >= 12) {
    riskLevel = 'very_high'
  } else if (params.annualReturn >= 8) {
    riskLevel = 'high'
  } else if (params.annualReturn <= 4) {
    riskLevel = 'low'
  }

  // Generate volatility range
  const volatilityRange = `${Math.max(2, params.annualReturn - 3)}%-${params.annualReturn + 5}%`

  // Calculate milestone values for Growth Projection template
  const fiveYearValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyContribution,
    params.annualReturn,
    5
  )
  const tenYearValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyContribution,
    params.annualReturn,
    10
  )
  const monthlyTotal = params.monthlyContribution * params.timeHorizon * 12

  // Generate scenario values using proper financial calculations
  const higherContribution = Math.max(params.monthlyContribution * 1.5, 1001)
  const higherContributionValue = calculateFutureValue(
    params.initialAmount,
    higherContribution,
    params.annualReturn,
    params.timeHorizon
  )
  const currentFutureValue =
    params.futureValue ||
    calculateFutureValue(
      params.initialAmount,
      params.monthlyContribution,
      params.annualReturn,
      params.timeHorizon
    )
  const higherContributionGain = higherContributionValue - currentFutureValue

  const lowerContribution = Math.max(params.monthlyContribution * 0.75, 1001)
  const lowerContributionValue = calculateFutureValue(
    params.initialAmount,
    lowerContribution,
    params.annualReturn,
    params.timeHorizon
  )
  const lowerContributionLoss = currentFutureValue - lowerContributionValue

  const extendedTimeline = params.timeHorizon + 5
  const extendedValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyContribution,
    params.annualReturn,
    extendedTimeline
  )

  const shorterTimeline = Math.max(params.timeHorizon - 5, 5)
  const shorterValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyContribution,
    params.annualReturn,
    shorterTimeline
  )

  // Different return scenarios
  const conservativeReturn = Math.max(2, params.annualReturn - 2)
  const aggressiveReturn = params.annualReturn + 2
  const conservativeValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyContribution,
    conservativeReturn,
    params.timeHorizon
  )
  const aggressiveValue = calculateFutureValue(
    params.initialAmount,
    params.monthlyContribution,
    aggressiveReturn,
    params.timeHorizon
  )

  // Calculate lump sum scenario
  const totalContributions =
    params.initialAmount + params.monthlyContribution * params.timeHorizon * 12
  const lumpSumValue =
    totalContributions *
    Math.pow(1 + params.annualReturn / 100, params.timeHorizon)
  const delayedStartLoss = currentFutureValue * 0.08

  // Percentage changes for template
  const contributionIncreasePercent = 50
  const contributionDecreasePercent = 25

  // Generate success metrics
  const successRate = Math.min(
    95,
    Math.max(60, 85 - (params.annualReturn - 6) * 2)
  )
  const escalationPercent = 3
  const escalatedValue = Math.round((params.futureValue || 0) * 1.2)
  const escalationBenefit = escalatedValue - (params.futureValue || 0)

  // Historical market data
  const positiveYears = Math.min(70 + params.annualReturn * 2, 85)
  const averageDownturn = '15-20%'
  const averageBullReturn = '18-25%'

  // Community insights
  const averageIncrease = 15
  const marketDownturnPercent = 42
  const timingPercent = 68
  const firstMilestone = Math.round(params.initialAmount * 2 + 10000)
  const milestoneTimeframe = Math.max(3, Math.round(params.timeHorizon / 3))
  const adaptationPercent = 35
  const increasePercent = 72
  const satisfactionRate = 94

  // Optimization tips
  const timingBenefit =
    calculateFutureValue(
      0,
      params.monthlyContribution,
      params.annualReturn,
      params.timeHorizon
    ) * 0.005 // Approx 0.5% benefit
  const taxSavings = 25
  const feeReduction = 0.5
  const feeSavings =
    calculateFutureValue(
      params.initialAmount,
      params.monthlyContribution,
      params.annualReturn,
      params.timeHorizon
    ) -
    calculateFutureValue(
      params.initialAmount,
      params.monthlyContribution,
      params.annualReturn - 0.5,
      params.timeHorizon
    )
  const rebalancingBonus = 0.8
  const windfallAmount = 2000
  const windfallValue =
    calculateFutureValue(
      params.initialAmount,
      params.monthlyContribution,
      params.annualReturn,
      params.timeHorizon
    ) +
    calculateFutureValue(
      0,
      windfallAmount / 12,
      params.annualReturn,
      params.timeHorizon
    )

  // Get translations for categories
  const riskCategories = messages?.content?.riskCategories || {}
  const riskLevels = messages?.content?.riskLevels || {}

  // Asset allocation recommendations
  let stockAllocation = Math.min(100 - params.timeHorizon, 90)
  let bondAllocation = Math.min(params.timeHorizon, 40)
  let alternativeAllocation = Math.max(
    100 - stockAllocation - bondAllocation,
    0
  )

  // Ensure allocations sum to 100%
  const totalAllocation =
    stockAllocation + bondAllocation + alternativeAllocation
  if (totalAllocation !== 100) {
    // Adjust the largest allocation to make the total 100%
    const maxAllocation = Math.max(
      stockAllocation,
      bondAllocation,
      alternativeAllocation
    )
    const adjustment = 100 - totalAllocation

    if (maxAllocation === stockAllocation) {
      stockAllocation += adjustment
    } else if (maxAllocation === bondAllocation) {
      bondAllocation += adjustment
    } else {
      alternativeAllocation += adjustment
    }
  }

  // Calculate contribution percentage
  const futureValue =
    params.futureValue ||
    calculateFutureValue(
      params.initialAmount,
      params.monthlyContribution,
      params.annualReturn,
      params.timeHorizon
    )
  const contributionPercentage =
    futureValue > 0
      ? Math.round((monthlyTotal / futureValue) * 100 * 10) / 10
      : 0

  // Market context parameters
  const currentInflation = 3.2
  const realReturn = Math.max(0, params.annualReturn - currentInflation)
  const expectedCycles = Math.max(1, Math.round(params.timeHorizon / 7))
  const domesticAllocation = Math.round(stockAllocation * 0.6)
  const internationalAllocation = Math.round(stockAllocation * 0.4)

  return {
    riskCategory: riskCategories[riskCategory] || riskCategory,
    riskLevel: riskLevels[riskLevel] || riskLevel,
    volatilityRange,
    stockAllocation,
    bondAllocation,
    alternativeAllocation,
    domesticAllocation,
    internationalAllocation,
    contributionPercentage,
    fiveYearValue: Math.round(fiveYearValue),
    tenYearValue: Math.round(tenYearValue),
    monthlyTotal: Math.round(monthlyTotal),
    higherContribution: Math.round(higherContribution),
    higherContributionValue: Math.round(higherContributionValue),
    higherContributionGain: Math.round(higherContributionGain),
    lowerContribution: Math.round(lowerContribution),
    lowerContributionValue: Math.round(lowerContributionValue),
    lowerContributionLoss: Math.round(lowerContributionLoss),
    contributionIncreasePercent,
    contributionDecreasePercent,
    extendedTimeline,
    extendedValue: Math.round(extendedValue),
    shorterTimeline,
    shorterValue: Math.round(shorterValue),
    conservativeReturn,
    aggressiveReturn,
    conservativeValue: Math.round(conservativeValue),
    aggressiveValue: Math.round(aggressiveValue),
    totalContributions: Math.round(totalContributions),
    lumpSumValue: Math.round(lumpSumValue),
    delayedStartLoss: Math.round(delayedStartLoss),
    successRate,
    escalationPercent,
    escalatedValue,
    escalationBenefit,
    positiveYears,
    averageDownturn,
    averageBullReturn,
    averageIncrease,
    marketDownturnPercent,
    timingPercent,
    firstMilestone: Math.round(firstMilestone),
    milestoneTimeframe,
    adaptationPercent,
    increasePercent,
    satisfactionRate,
    timingBenefit: Math.round(timingBenefit),
    taxSavings,
    feeReduction,
    feeSavings: Math.round(feeSavings),
    rebalancingBonus,
    windfallAmount: Math.round(windfallAmount),
    windfallValue: Math.round(windfallValue),
    currentInflation,
    realReturn,
    expectedCycles,
    currentInterestRates: 5.25,
    marketVolatility: 'moderate',
  }
}

/**
 * Generate personalized content for a given set of calculator inputs
 */
export function generatePersonalizedContent(
  params: CalculatorInputs,
  locale: string = 'en'
): ContentSections {
  const messages = loadI18nMessages(locale)
  const templates = messages?.content?.templates

  if (!templates) {
    throw new Error(`No content templates found for locale: ${locale}`)
  }

  // Calculate derived values if not provided
  const futureValue =
    params.futureValue ||
    calculateFinanceValue({
      initialAmount: params.initialAmount,
      monthlyContribution: params.monthlyContribution,
      annualReturnRate: params.annualReturn,
      timeHorizonYears: params.timeHorizon,
    }).futureValue

  const totalContributions =
    params.totalContributions ||
    params.initialAmount + params.monthlyContribution * params.timeHorizon * 12

  const totalGains =
    params.totalGains || futureValue - params.initialAmount - totalContributions

  // Get goal translation
  const goalTranslation = getGoalTranslation(params.goal, locale)

  // Generate additional parameters for templates
  const additionalParams = generateAdditionalParameters(params, locale)

  // Prepare parameters for template population
  const templateParams = {
    ...params,
    futureValue,
    totalContributions,
    totalGains,
    goal: goalTranslation,
    ...additionalParams,
  }

  const sections: ContentSections = {
    investment_overview: populateTemplate(
      templates.investment_overview,
      templateParams
    ),
    growth_projection: populateTemplate(
      templates.growth_projection,
      templateParams
    ),
    investment_insights: populateTemplate(
      templates.investment_insights,
      templateParams
    ),
    strategy_analysis: populateTemplate(
      templates.strategy_analysis,
      templateParams
    ),
    comparative_scenarios: populateTemplate(
      templates.comparative_scenarios,
      templateParams
    ),
    community_insights: populateTemplate(
      templates.community_insights,
      templateParams
    ),
    optimization_tips: populateTemplate(
      templates.optimization_tips,
      templateParams
    ),
    market_context: populateTemplate(templates.market_context, templateParams),
    market_data: {
      inflation: additionalParams.currentInflation,
      interestRate: additionalParams.currentInterestRates,
      volatility: additionalParams.marketVolatility,
    },
  }

  return sections
}

/**
 * Populate template with actual parameter values
 * Works with both single {parameter} and double {{parameter}} curly braces
 */
export function populateTemplate(template: string, params: any): string {
  let populatedTemplate = template

  // Replace all placeholders with actual values
  Object.entries(params).forEach(([key, value]) => {
    // Handle both single and double curly braces
    const singleBracePattern = new RegExp(`\\{\\s*${key}\\s*\\}`, 'g')
    const doubleBracePattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')

    const formattedValue = formatValue(key, value)

    populatedTemplate = populatedTemplate.replace(
      doubleBracePattern,
      formattedValue
    )
    populatedTemplate = populatedTemplate.replace(
      singleBracePattern,
      formattedValue
    )
  })

  return populatedTemplate
}

/**
 * Calculate future value for given parameters
 */
function calculateFutureValue(
  initial: number,
  monthly: number,
  rate: number,
  years: number
): number {
  const monthlyRate = rate / 100 / 12
  const totalMonths = years * 12

  const futureValueInitial = initial * Math.pow(1 + rate / 100, years)
  const futureValueMonthly =
    monthly * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)

  return futureValueInitial + futureValueMonthly
}

/**
 * Format values for display in templates
 */
function formatValue(key: string, value: any): string {
  // Currency formatting for amount fields
  if (
    key.includes('Amount') ||
    key.includes('Value') ||
    key.includes('Contribution') ||
    key.includes('Gain') ||
    key.includes('Loss') ||
    key.includes('Total') ||
    key.includes('Benefit') ||
    key.includes('Savings') ||
    key === 'futureValue' ||
    key === 'fiveYearValue' ||
    key === 'tenYearValue' ||
    key === 'monthlyTotal' ||
    key === 'windfallAmount' ||
    key === 'windfallValue' ||
    key === 'lumpSumValue' ||
    key === 'delayedStartLoss' ||
    key === 'firstMilestone'
  ) {
    return formatCurrency(value)
  }

  // Percentage formatting
  if (
    key.includes('Return') ||
    key.includes('Percent') ||
    key.includes('Rate') ||
    key.includes('Allocation') ||
    key.includes('Inflation') ||
    key.includes('Interest') ||
    key === 'escalationPercent' ||
    key === 'taxSavings' ||
    key === 'feeReduction' ||
    key === 'rebalancingBonus' ||
    key === 'realReturn' ||
    key === 'contributionPercentage'
  ) {
    const num =
      typeof value === 'number'
        ? Math.round((value as number) * 10) / 10
        : value
    return `${num}%`
  }

  // Year formatting - but not for timeHorizon which is used in contexts like "{timeHorizon}-year"
  if (
    key.includes('Timeline') ||
    key === 'extendedTimeline' ||
    key === 'historicalPeriod' ||
    key === 'milestoneTimeframe'
  ) {
    return `${value} years`
  }

  return String(value)
}

/**
 * Format currency values with K/M suffixes for large amounts
 */
function formatCurrency(amount: number): string {
  const rounded = Math.round(amount)

  if (rounded >= 1000000) {
    return `$${(rounded / 1000000).toFixed(1)}M`
  } else if (rounded >= 1000) {
    return `$${(rounded / 1000).toFixed(0)}K`
  } else {
    return `$${rounded.toLocaleString()}`
  }
}

/**
 * Assess risk level based on annual return
 */
function assessRiskLevel(annualReturn: number): string {
  if (annualReturn <= 4) return 'conservative'
  if (annualReturn <= 7) return 'moderate'
  if (annualReturn <= 10) return 'moderately aggressive'
  return 'aggressive'
}

/**
 * Get risk category description
 */
function getRiskCategory(annualReturn: number): string {
  if (annualReturn <= 4) return 'Conservative Growth'
  if (annualReturn <= 7) return 'Balanced Growth'
  if (annualReturn <= 10) return 'Growth-Oriented'
  return 'Aggressive Growth'
}

/**
 * Get volatility range description
 */
function getVolatilityRange(annualReturn: number): string {
  if (annualReturn <= 4) return '5-10%'
  if (annualReturn <= 7) return '10-15%'
  if (annualReturn <= 10) return '15-20%'
  return '20-25%'
}

/**
 * Get market volatility description
 */
function getMarketVolatilityDescription(annualReturn: number): string {
  if (annualReturn <= 4) return 'low'
  if (annualReturn <= 7) return 'moderate'
  if (annualReturn <= 10) return 'elevated'
  return 'high'
}

/**
 * Generate market context based on parameters and current economic environment
 */
export function generateMarketContext(
  params: CalculatorInputs,
  locale: string = 'en'
): string {
  const messages = loadI18nMessages(locale)
  const template = messages?.content?.templates?.market_context

  if (!template) {
    return `Market context not available for locale: ${locale}`
  }

  // Get current market indicators (in a real app, these would come from APIs)
  const marketData = {
    currentInflation: 3.2,
    currentInterestRates: 5.25,
    marketVolatility: 'moderate',
  }

  // Generate additional parameters to get derived values like realReturn, expectedCycles, etc.
  const additionalParams = generateAdditionalParameters(params, locale)

  // Prepare parameters for template population
  const templateParams = {
    ...params,
    ...marketData,
    ...additionalParams,
    goal: getGoalTranslation(params.goal, locale),
  }

  return populateTemplate(template, templateParams)
}
