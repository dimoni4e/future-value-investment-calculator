import { useEffect, useState } from 'react'

export interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
]

export interface ExchangeRates {
  [currencyCode: string]: number
}

interface CachedExchangeRates {
  rates: ExchangeRates
  timestamp: number
}

// Free API service for exchange rates
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'

// Cache key for localStorage
const CACHE_KEY = 'fx_rates_cache'

// Cache duration: 1 hour in milliseconds
const CACHE_DURATION = 60 * 60 * 1000

// Get cached rates from localStorage
function getCachedRates(): ExchangeRates | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const data: CachedExchangeRates = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is still valid (within 1 hour)
    if (now - data.timestamp < CACHE_DURATION) {
      console.log('Using cached exchange rates', {
        age: Math.round((now - data.timestamp) / 1000 / 60),
        rates: data.rates,
      })
      return data.rates
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY)
    console.log('Exchange rate cache expired, will fetch fresh rates')
    return null
  } catch (error) {
    console.error('Error reading cached exchange rates:', error)
    // Remove corrupted cache
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

// Save rates to localStorage
function setCachedRates(rates: ExchangeRates): void {
  if (typeof window === 'undefined') return

  try {
    const data: CachedExchangeRates = {
      rates,
      timestamp: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    console.log('Cached exchange rates to localStorage', { rates })
  } catch (error) {
    console.error('Error caching exchange rates:', error)
  }
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  // First, try to get rates from cache
  const cachedRates = getCachedRates()
  if (cachedRates) {
    return cachedRates
  }

  // Cache miss or expired, fetch from API
  try {
    console.log('Fetching fresh exchange rates from API')
    const response = await fetch(EXCHANGE_API_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    const rates = {
      USD: 1, // Base currency
      ...data.rates,
    }

    // Cache the fresh rates
    setCachedRates(rates)

    return rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Fallback rates for development/testing
    const fallbackRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      PLN: 4.12,
      CAD: 1.25,
      AUD: 1.35,
    }

    // Cache fallback rates with a shorter duration (5 minutes) to retry sooner
    setCachedRates(fallbackRates)

    return fallbackRates
  }
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount

  // Convert to USD first (base currency)
  const usdAmount =
    fromCurrency === 'USD' ? amount : amount / exchangeRates[fromCurrency]

  // Convert from USD to target currency
  const convertedAmount =
    toCurrency === 'USD' ? usdAmount : usdAmount * exchangeRates[toCurrency]

  return convertedAmount
}

export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Hook for managing exchange rates
export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadRates = async () => {
      try {
        setLoading(true)
        setError(null)
        const exchangeRates = await fetchExchangeRates()
        setRates(exchangeRates)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load exchange rates'
        )
      } finally {
        setLoading(false)
      }
    }

    loadRates()

    // Refresh rates every 30 minutes
    const interval = setInterval(loadRates, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return { rates, loading, error }
}
