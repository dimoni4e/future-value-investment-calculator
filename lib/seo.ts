/**
 * SEO utilities for dynamic meta data generation
 */

import { type CalculatorParams } from './urlState'

// Simple currency interface for SEO
interface SimpleCurrency {
  code: string
  name: string
  symbol: string
}

// Default currency for SEO (USD)
const DEFAULT_CURRENCY: SimpleCurrency = {
  code: 'USD',
  name: 'US Dollar',
  symbol: '$',
}

// Simple currency formatter for SEO
function formatCurrency(
  amount: number,
  currency: SimpleCurrency = DEFAULT_CURRENCY
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  openGraph: {
    title: string
    description: string
    url?: string
  }
  twitter: {
    title: string
    description: string
  }
}

/**
 * Generate SEO data based on calculator inputs
 */
export function generateSEO(
  params: CalculatorParams,
  currency: SimpleCurrency = DEFAULT_CURRENCY,
  futureValue?: number,
  locale: string = 'en'
): SEOData {
  const { initialAmount, monthlyContribution, annualReturn, timeHorizon } =
    params

  // Format monetary values
  const formattedInitial = formatCurrency(initialAmount, currency)
  const formattedMonthly = formatCurrency(monthlyContribution, currency)
  const formattedFuture = futureValue
    ? formatCurrency(futureValue, currency)
    : null

  // Generate dynamic title
  const baseTitle = 'Future Value Calculator'
  const dynamicTitle = futureValue
    ? `${formattedInitial} → ${formattedFuture} in ${timeHorizon} Years | ${baseTitle}`
    : `${formattedInitial} Investment Calculator | ${baseTitle}`

  // Generate dynamic description
  const dynamicDescription = futureValue
    ? `Calculate how ${formattedInitial} initial investment with ${formattedMonthly} monthly contributions at ${annualReturn}% annual return grows to ${formattedFuture} over ${timeHorizon} years. Free financial planning tool with interactive charts.`
    : `Investment calculator: See how ${formattedInitial} grows with ${formattedMonthly} monthly contributions at ${annualReturn}% return over ${timeHorizon} years. Plan your financial future with compound interest projections.`

  // Generate keywords based on inputs
  const dynamicKeywords = [
    'future value calculator',
    'investment calculator',
    'compound interest',
    'financial planning',
    `${currency.code} investment`,
    `${timeHorizon} year plan`,
    `${annualReturn}% return`,
    'retirement planning',
    'wealth building',
    'financial growth',
    'investment projections',
    'money planning',
  ]

  // Shorter titles for social media
  const shortTitle = futureValue
    ? `${formattedInitial} → ${formattedFuture} in ${timeHorizon}Y`
    : `${formattedInitial} Investment Plan`

  const shortDescription = futureValue
    ? `See how ${formattedInitial} grows to ${formattedFuture} over ${timeHorizon} years with ${annualReturn}% returns.`
    : `Calculate investment growth: ${formattedInitial} + ${formattedMonthly}/month at ${annualReturn}% for ${timeHorizon} years.`

  return {
    title: dynamicTitle,
    description: dynamicDescription,
    keywords: dynamicKeywords,
    openGraph: {
      title: shortTitle,
      description: shortDescription,
    },
    twitter: {
      title: shortTitle,
      description: shortDescription,
    },
  }
}

/**
 * Generate structured data for search engines
 */
export function generateStructuredData(
  params: CalculatorParams,
  currency: SimpleCurrency = DEFAULT_CURRENCY,
  futureValue?: number,
  url?: string
) {
  const seoData = generateSEO(params, currency, futureValue)

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Future Value Investment Calculator',
    description: seoData.description,
    url: url || 'https://future-value-calculator.com',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Compound interest calculations',
      'Interactive investment charts',
      'Multiple currency support',
      'Scenario planning',
      'Share investment plans',
    ],
    provider: {
      '@type': 'Organization',
      name: 'Future Value Calculator',
    },
    potentialAction: {
      '@type': 'UseAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url
          ? `${url}?initial={initial}&monthly={monthly}&return={return}&years={years}`
          : undefined,
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
    },
  }
}

/**
 * Get default SEO data for the application
 */
export function getDefaultSEO(locale: string = 'en'): SEOData {
  return {
    title: 'Financial Growth Planner - Plan Your Financial Future',
    description:
      'Advanced financial growth planning platform with compound interest projections, scenario analysis, and interactive charts. Transform your investment strategy with data-driven insights.',
    keywords: [
      'financial growth planner',
      'investment projections',
      'compound interest',
      'financial planning',
      'future value',
      'investment returns',
      'retirement planning',
      'wealth building',
    ],
    openGraph: {
      title: 'Financial Growth Planner',
      description:
        'Plan your financial future with advanced compound interest calculations and interactive charts.',
    },
    twitter: {
      title: 'Financial Growth Planner',
      description:
        'Plan your financial future with compound interest projections.',
    },
  }
}
