/**
 * Scenario URL utilities for programmatic SEO
 * Handles slug generation, parsing, and goal detection
 */

export interface CalculatorInputs {
  initialAmount: number
  monthlyContribution: number
  annualReturn: number
  timeHorizon: number
}

export interface ScenarioParams extends CalculatorInputs {
  goal: string
  slug: string
}

/**
 * Investment goal categories for programmatic SEO
 */
export const INVESTMENT_GOALS = {
  retirement: 'retirement',
  emergency: 'emergency',
  house: 'house',
  education: 'education',
  wealth: 'wealth',
  vacation: 'vacation',
  starter: 'starter',
  investment: 'investment', // default fallback
} as const

export type InvestmentGoal = keyof typeof INVESTMENT_GOALS

/**
 * Detects the most appropriate investment goal based on parameters
 */
export function detectInvestmentGoal(params: CalculatorInputs): InvestmentGoal {
  const { initialAmount, monthlyContribution, timeHorizon } = params

  // Retirement planning: Long-term with substantial monthly contributions
  if (timeHorizon >= 20 && monthlyContribution >= 1000) {
    return 'retirement'
  }

  // Wealth building: High initial amount or long-term aggressive strategy
  if (
    timeHorizon >= 15 &&
    (initialAmount >= 50000 || monthlyContribution >= 2000)
  ) {
    return 'wealth'
  }

  // Emergency fund: Short-term with lower amounts
  if (
    timeHorizon <= 5 &&
    initialAmount <= 20000 &&
    monthlyContribution <= 1000
  ) {
    return 'emergency'
  }

  // House down payment: Medium-term substantial savings
  if (
    timeHorizon >= 5 &&
    timeHorizon <= 15 &&
    (initialAmount >= 10000 || monthlyContribution >= 1500)
  ) {
    return 'house'
  }

  // Education fund: Medium to long-term planning
  if (timeHorizon >= 10 && timeHorizon <= 18 && monthlyContribution >= 500) {
    return 'education'
  }

  // Vacation fund: Short to medium-term with moderate amounts
  if (
    timeHorizon <= 10 &&
    initialAmount <= 50000 &&
    monthlyContribution <= 1000
  ) {
    return 'vacation'
  }

  // Starter investment: Small amounts, learning phase
  if (initialAmount <= 10000 && monthlyContribution <= 500) {
    return 'starter'
  }

  // Default fallback
  return 'investment'
}

/**
 * Generates SEO-optimized scenario slug from calculator parameters
 */
export function generateScenarioSlug(params: CalculatorInputs): string {
  const goal = detectInvestmentGoal(params)

  // Format numbers for URL (remove decimals, use whole numbers)
  const initial = Math.round(params.initialAmount)
  const monthly = Math.round(params.monthlyContribution)
  const rate = Math.round(params.annualReturn * 10) / 10 // Keep one decimal
  const years = Math.round(params.timeHorizon)

  // Create SEO-friendly slug with long-tail keywords
  return `invest-${initial}-monthly-${monthly}-${rate}percent-${years}years-${goal}`
}

/**
 * Parses scenario slug back to calculator parameters
 */
export function parseSlugToScenario(slug: string): ScenarioParams | null {
  try {
    // Expected format: invest-{initial}-monthly-{monthly}-{rate}percent-{years}years-{goal}
    const parts = slug.split('-')

    if (parts.length < 7 || parts[0] !== 'invest') {
      return null
    }

    const initial = parseInt(parts[1])
    const monthly = parseInt(parts[3])
    const rateStr = parts[4].replace('percent', '').replace('point', '.')
    const rate = parseFloat(rateStr)
    const yearsStr = parts[5].replace('years', '')
    const years = parseInt(yearsStr)
    const goal = parts.slice(6).join('-')

    // Validate parsed values
    if (isNaN(initial) || isNaN(monthly) || isNaN(rate) || isNaN(years)) {
      return null
    }

    if (initial < 0 || monthly < 0 || rate < 0 || years < 1) {
      return null
    }

    return {
      initialAmount: initial,
      monthlyContribution: monthly,
      annualReturn: rate, // Keep as percentage for consistency with API
      timeHorizon: years,
      goal,
      slug,
    }
  } catch (error) {
    console.error('Error parsing scenario slug:', error)
    return null
  }
}

/**
 * Validates scenario parameters are within reasonable bounds
 */
export function validateScenarioParams(params: CalculatorInputs): boolean {
  const { initialAmount, monthlyContribution, annualReturn, timeHorizon } =
    params

  // Basic validation
  if (
    initialAmount < 0 ||
    monthlyContribution < 0 ||
    annualReturn < 0 ||
    timeHorizon < 1
  ) {
    return false
  }

  // Reasonable upper bounds
  if (
    initialAmount > 10000000 ||
    monthlyContribution > 100000 ||
    annualReturn > 50 ||
    timeHorizon > 100
  ) {
    return false
  }

  return true
}

/**
 * Generates a user-friendly scenario name from parameters
 */
export function generateScenarioName(params: CalculatorInputs): string {
  const goal = detectInvestmentGoal(params)
  const goalNames = {
    retirement: 'Retirement Planning',
    emergency: 'Emergency Fund',
    house: 'House Down Payment',
    education: 'Education Fund',
    wealth: 'Wealth Building',
    vacation: 'Vacation Fund',
    starter: 'Starter Investment',
    investment: 'Investment Plan',
  }

  const initial = params.initialAmount.toLocaleString()
  const monthly = params.monthlyContribution.toLocaleString()

  return `${goalNames[goal]}: $${initial} + $${monthly}/month`
}

/**
 * Generates SEO meta description from parameters
 */
export function generateMetaDescription(params: CalculatorInputs): string {
  const goal = detectInvestmentGoal(params)
  const initial = params.initialAmount.toLocaleString()
  const monthly = params.monthlyContribution.toLocaleString()
  const rate = params.annualReturn
  const years = params.timeHorizon

  return `Calculate investing $${initial} initially with $${monthly} monthly contributions at ${rate}% annual return over ${years} years for ${goal}. See projected growth, risk analysis, and optimization tips.`
}

/**
 * Generates SEO keywords from parameters
 */
export function generateSEOKeywords(params: CalculatorInputs): string[] {
  const goal = detectInvestmentGoal(params)
  const initial = params.initialAmount
  const monthly = params.monthlyContribution
  const rate = params.annualReturn
  const years = params.timeHorizon

  return [
    `invest ${initial}`,
    `monthly ${monthly}`,
    `${rate} percent return`,
    `${years} year investment`,
    `${goal} planning`,
    `investment calculator`,
    `compound interest`,
    `future value`,
    `retirement planning`,
    `investment strategy`,
  ]
}
