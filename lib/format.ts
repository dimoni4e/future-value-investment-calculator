// Lightweight formatting utilities that are safe for both server and client usage.

/**
 * Formats a percentage value with fixed decimals, avoiding FP artifacts
 * like 7.000000000000001. Input is expected as a percent (e.g., 7 for 7%).
 */
export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '—%'
  const rounded = Number(value.toFixed(decimals))
  const formatted = rounded.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${formatted}%`
}

/**
 * Formats a currency value in USD with configurable decimals.
 * Defaults to whole-dollar display to keep UI clean and consistent.
 */
export function formatCurrencyUSD(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return '$—'
  const rounded = Number(value.toFixed(decimals))
  return rounded.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
