/**
 * Programmatic SEO Strategy for Investment Calculator
 *
 * This system generates thousands of SEO-optimized pages automatically
 * from user-generated scenarios, maximizing search engine visibility.
 */

// SEO URL Patterns
export const SEO_URL_PATTERNS = {
  // Predefined scenarios (static generation)
  PREDEFINED: '/[locale]/scenario/[predefined-slug]/',

  // User-generated scenarios (dynamic generation)
  USER_GENERATED: '/[locale]/scenario/[user-slug]/',

  // Category pages (programmatic landing pages)
  CATEGORIES: {
    BY_RISK: '/[locale]/scenario/[risk-level]/', // conservative, moderate, aggressive
    BY_TIMELINE: '/[locale]/scenario/[timeline]/', // short-term, medium-term, long-term
    BY_AMOUNT: '/[locale]/scenario/[amount-range]/', // starter, substantial, high-value
    BY_PURPOSE: '/[locale]/scenario/[purpose]/', // retirement, college, emergency
  },

  // Discovery pages
  DISCOVERY: '/[locale]/scenario/',
  TRENDING: '/[locale]/scenario/trending/',
  RECENT: '/[locale]/scenario/recent/',
} as const

// SEO Metadata Templates
export const SEO_TEMPLATES = {
  SCENARIO_TITLE: (name: string) => `${name} - Investment Calculator Scenario`,

  SCENARIO_DESCRIPTION: (params: {
    name: string
    initialAmount: number
    monthlyContribution: number
    annualReturn: number
    timeHorizon: number
    finalValue: number
  }) =>
    `${params.name}: Start with $${params.initialAmount.toLocaleString()}, add $${params.monthlyContribution.toLocaleString()}/month at ${params.annualReturn}% return over ${params.timeHorizon} years. Projected result: $${params.finalValue.toLocaleString()}. Free investment calculator with detailed projections.`,

  CATEGORY_TITLE: (category: string, locale: string) => {
    const titles = {
      en: {
        conservative: 'Conservative Investment Scenarios - Low Risk Strategies',
        moderate: 'Moderate Investment Scenarios - Balanced Growth Plans',
        aggressive: 'Aggressive Investment Scenarios - High Growth Potential',
        'short-term': 'Short-term Investment Plans - 1-5 Year Strategies',
        'medium-term': 'Medium-term Investment Goals - 5-15 Year Plans',
        'long-term': 'Long-term Wealth Building - 15+ Year Strategies',
        retirement: 'Retirement Planning Scenarios - Build Your Future',
        college: 'College Fund Investment Plans - Education Savings',
        emergency: 'Emergency Fund Scenarios - Financial Security',
      },
      es: {
        conservative:
          'Escenarios de Inversión Conservadores - Estrategias de Bajo Riesgo',
        // ... add Spanish translations
      },
      pl: {
        conservative:
          'Scenariusze Konserwatywnych Inwestycji - Strategie Niskiego Ryzyka',
        // ... add Polish translations
      },
    }

    return (
      titles[locale as keyof typeof titles]?.[
        category as keyof typeof titles.en
      ] || category
    )
  },

  KEYWORDS: {
    CORE: [
      'investment calculator',
      'financial planning',
      'compound interest',
      'future value',
      'wealth building',
      'retirement planning',
    ],
    BY_RISK: {
      conservative: [
        'low risk',
        'safe investment',
        'capital preservation',
        'stable returns',
      ],
      moderate: [
        'balanced portfolio',
        'moderate risk',
        'diversified investment',
      ],
      aggressive: [
        'high growth',
        'aggressive investment',
        'maximum returns',
        'growth stocks',
      ],
    },
    BY_TIMELINE: {
      'short-term': ['short term investment', '1 year', '5 year plan'],
      'medium-term': [
        'medium term goals',
        '10 year plan',
        '15 year investment',
      ],
      'long-term': [
        'long term wealth',
        '20 year plan',
        '30 year investment',
        'retirement',
      ],
    },
  },
} as const

// Structured Data for Rich Snippets
export const generateStructuredData = (scenario: any) => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: scenario.name,
  description: scenario.description,
  provider: {
    '@type': 'Organization',
    name: 'Nature2Pixel Financial Tools',
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free investment calculator',
  },
  additionalProperty: [
    {
      '@type': 'PropertyValue',
      name: 'Initial Amount',
      value: scenario.params.initialAmount,
    },
    {
      '@type': 'PropertyValue',
      name: 'Monthly Contribution',
      value: scenario.params.monthlyContribution,
    },
    {
      '@type': 'PropertyValue',
      name: 'Annual Return',
      value: `${scenario.params.annualReturn}%`,
    },
    {
      '@type': 'PropertyValue',
      name: 'Time Horizon',
      value: `${scenario.params.timeHorizon} years`,
    },
  ],
})

// Sitemap Priority Rules
export const SITEMAP_PRIORITIES = {
  HOMEPAGE: 1.0,
  PREDEFINED_SCENARIOS: 0.9,
  USER_SCENARIOS_TRENDING: 0.8,
  CATEGORY_PAGES: 0.8,
  USER_SCENARIOS_RECENT: 0.7,
  USER_SCENARIOS_GENERAL: 0.6,
  STATIC_PAGES: 0.5,
} as const

// Change Frequency for Different Content Types
export const CHANGE_FREQUENCIES = {
  HOMEPAGE: 'daily',
  TRENDING_SCENARIOS: 'daily',
  CATEGORY_PAGES: 'weekly',
  PREDEFINED_SCENARIOS: 'monthly',
  USER_SCENARIOS: 'monthly',
  STATIC_PAGES: 'yearly',
} as const
