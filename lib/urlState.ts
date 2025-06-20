/**
 * URL state management utilities for encoding/decoding calculator parameters
 */

export interface CalculatorParams {
  initialAmount: number
  monthlyContribution: number
  annualReturn: number
  timeHorizon: number
}

/**
 * Default calculator parameters
 */
export const DEFAULT_PARAMS: CalculatorParams = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 7,
  timeHorizon: 10,
}

/**
 * Encode calculator parameters into URL search string
 * @param params Calculator parameters
 * @returns URL search string (e.g., "?initial=10000&monthly=500&return=7&years=10")
 */
export function encodeParamsToUrl(params: CalculatorParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('initial', params.initialAmount.toString())
  searchParams.set('monthly', params.monthlyContribution.toString())
  searchParams.set('return', params.annualReturn.toString())
  searchParams.set('years', params.timeHorizon.toString())

  return `?${searchParams.toString()}`
}

/**
 * Decode calculator parameters from URL search string
 * @param searchString URL search string (e.g., "?initial=10000&monthly=500&return=7&years=10")
 * @returns Calculator parameters with defaults for missing values
 */
export function decodeParamsFromUrl(searchString: string): CalculatorParams {
  const searchParams = new URLSearchParams(searchString)

  const initial = searchParams.get('initial')
  const monthly = searchParams.get('monthly')
  const returnRate = searchParams.get('return')
  const years = searchParams.get('years')

  return {
    initialAmount: initial
      ? parseFloat(initial) || DEFAULT_PARAMS.initialAmount
      : DEFAULT_PARAMS.initialAmount,
    monthlyContribution: monthly
      ? parseFloat(monthly) || DEFAULT_PARAMS.monthlyContribution
      : DEFAULT_PARAMS.monthlyContribution,
    annualReturn: returnRate
      ? parseFloat(returnRate) || DEFAULT_PARAMS.annualReturn
      : DEFAULT_PARAMS.annualReturn,
    timeHorizon: years
      ? parseFloat(years) || DEFAULT_PARAMS.timeHorizon
      : DEFAULT_PARAMS.timeHorizon,
  }
}

/**
 * Validate calculator parameters to ensure they're within reasonable bounds
 * @param params Calculator parameters to validate
 * @returns Validated parameters with clamped values
 */
export function validateParams(params: CalculatorParams): CalculatorParams {
  return {
    initialAmount: Math.max(0, Math.min(10000000, params.initialAmount)),
    monthlyContribution: Math.max(
      0,
      Math.min(100000, params.monthlyContribution)
    ),
    annualReturn: Math.max(-50, Math.min(50, params.annualReturn)),
    timeHorizon: Math.max(1, Math.min(50, params.timeHorizon)),
  }
}

/**
 * Get current URL without search parameters
 * @returns Base URL without query string
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return `${window.location.origin}${window.location.pathname}`
}

/**
 * Update browser URL with new parameters without triggering navigation
 * @param params Calculator parameters to encode in URL
 */
export function updateUrl(params: CalculatorParams): void {
  if (typeof window === 'undefined') {
    return
  }

  const newUrl = `${getBaseUrl()}${encodeParamsToUrl(params)}`
  window.history.replaceState(null, '', newUrl)
}

/**
 * Generate shareable URL with current parameters
 * @param params Calculator parameters
 * @returns Complete shareable URL
 */
export function generateShareableUrl(params: CalculatorParams): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return `${getBaseUrl()}${encodeParamsToUrl(params)}`
}
