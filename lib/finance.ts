/**
 * Financial calculation utilities for investment analysis
 */

export interface InvestmentParameters {
  initialAmount: number
  monthlyContribution: number
  annualReturnRate: number
  timeHorizonYears: number
}

export interface InvestmentResult {
  futureValue: number
  totalContributions: number
  totalGrowth: number
  annualBreakdown: Array<{
    year: number
    totalValue: number
    contributions: number
    growth: number
    yearlyGrowth: number
  }>
}

/**
 * Calculate the future value of an investment with compound interest
 * @param params Investment parameters
 * @returns Detailed investment results
 */
export function calculateFutureValue(
  params: InvestmentParameters
): InvestmentResult {
  const {
    initialAmount,
    monthlyContribution,
    annualReturnRate,
    timeHorizonYears,
  } = params

  // Convert annual rate to monthly rate
  const monthlyRate = annualReturnRate / 100 / 12
  const totalMonths = timeHorizonYears * 12

  let futureValue: number

  if (monthlyRate === 0) {
    // Special case: no interest, just add contributions
    futureValue = initialAmount + monthlyContribution * totalMonths
  } else {
    // Future value of initial amount (compound interest)
    const futureValueInitial =
      initialAmount * Math.pow(1 + monthlyRate, totalMonths)

    // Future value of monthly contributions (annuity formula)
    const futureValueAnnuity =
      monthlyContribution === 0
        ? 0
        : monthlyContribution *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)

    futureValue = futureValueInitial + futureValueAnnuity
  }
  const totalContributions = initialAmount + monthlyContribution * totalMonths
  const totalGrowth = futureValue - totalContributions

  // Generate year-by-year breakdown
  const annualBreakdown = []
  let previousYearValue = initialAmount

  for (let year = 0; year <= timeHorizonYears; year++) {
    const monthsElapsed = year * 12
    const contributionsToDate =
      initialAmount + monthlyContribution * monthsElapsed

    // Calculate future value at this point in time
    let futureValueAtYear: number
    if (monthsElapsed === 0) {
      futureValueAtYear = initialAmount
    } else if (monthlyRate === 0) {
      // No interest case
      futureValueAtYear = contributionsToDate
    } else {
      const fvInitial = initialAmount * Math.pow(1 + monthlyRate, monthsElapsed)
      const fvAnnuity =
        monthlyContribution === 0
          ? 0
          : monthlyContribution *
            ((Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate)
      futureValueAtYear = fvInitial + fvAnnuity
    }

    const growthAtYear = futureValueAtYear - contributionsToDate
    const yearlyGrowth = year === 0 ? 0 : futureValueAtYear - previousYearValue

    annualBreakdown.push({
      year,
      totalValue: futureValueAtYear,
      contributions: contributionsToDate,
      growth: growthAtYear,
      yearlyGrowth,
    })

    previousYearValue = futureValueAtYear
  }

  return {
    futureValue,
    totalContributions,
    totalGrowth,
    annualBreakdown,
  }
}

/**
 * Calculate the monthly contribution needed to reach a target amount
 * @param targetAmount The desired future value
 * @param initialAmount Initial investment
 * @param annualReturnRate Annual return rate as percentage
 * @param timeHorizonYears Investment period in years
 * @returns Required monthly contribution
 */
export function calculateRequiredContribution(
  targetAmount: number,
  initialAmount: number,
  annualReturnRate: number,
  timeHorizonYears: number
): number {
  const monthlyRate = annualReturnRate / 100 / 12
  const totalMonths = timeHorizonYears * 12

  if (monthlyRate === 0) {
    // No interest case: simple division
    const remainingAmount = targetAmount - initialAmount
    return remainingAmount <= 0 ? 0 : remainingAmount / totalMonths
  }

  // Future value of initial amount
  const futureValueInitial =
    initialAmount * Math.pow(1 + monthlyRate, totalMonths)

  // Remaining amount needed from contributions
  const remainingAmount = targetAmount - futureValueInitial

  if (remainingAmount <= 0) {
    return 0
  }

  // Calculate required monthly contribution using annuity formula
  const requiredContribution =
    (remainingAmount * monthlyRate) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)

  return Math.max(0, requiredContribution)
}

/**
 * Calculate the time needed to reach a target amount
 * @param targetAmount The desired future value
 * @param initialAmount Initial investment
 * @param monthlyContribution Monthly contribution amount
 * @param annualReturnRate Annual return rate as percentage
 * @returns Time in years to reach target
 */
export function calculateTimeToTarget(
  targetAmount: number,
  initialAmount: number,
  monthlyContribution: number,
  annualReturnRate: number
): number {
  if (targetAmount <= initialAmount) {
    return 0
  }

  const monthlyRate = annualReturnRate / 100 / 12

  if (monthlyRate === 0) {
    // Simple case: no growth, just contributions
    return (targetAmount - initialAmount) / monthlyContribution / 12
  }

  // Use logarithmic formula to solve for time
  if (monthlyContribution === 0) {
    // Only initial amount grows
    return (
      Math.log(targetAmount / initialAmount) / Math.log(1 + monthlyRate) / 12
    )
  }

  // Both initial amount and contributions grow
  const A = targetAmount
  const P = initialAmount
  const PMT = monthlyContribution
  const r = monthlyRate

  // Solve: A = P(1+r)^n + PMT * ((1+r)^n - 1) / r
  // This is a transcendental equation, solved iteratively
  let months = 1
  let futureValue = 0

  while (futureValue < targetAmount && months <= 600) {
    // Max 50 years
    futureValue =
      P * Math.pow(1 + r, months) + PMT * ((Math.pow(1 + r, months) - 1) / r)
    months++
  }

  return months / 12
}

/**
 * Format currency with locale support
 * @param amount Amount to format
 * @param currency Currency code (default: USD)
 * @param locale Locale string (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate effective annual rate from compound frequency
 * @param nominalRate Nominal annual rate as percentage
 * @param compoundingFrequency Number of compounding periods per year
 * @returns Effective annual rate as percentage
 */
export function calculateEffectiveRate(
  nominalRate: number,
  compoundingFrequency: number
): number {
  const r = nominalRate / 100
  const n = compoundingFrequency

  return (Math.pow(1 + r / n, n) - 1) * 100
}
