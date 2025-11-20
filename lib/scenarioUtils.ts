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

const SUPPORTED_LOCALES = ['en', 'pl', 'es'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const GOAL_LABELS: Record<SupportedLocale, Record<InvestmentGoal, string>> = {
  en: {
    retirement: 'Retirement Planning',
    emergency: 'Emergency Fund',
    house: 'House Down Payment',
    education: 'Education Fund',
    wealth: 'Wealth Building',
    vacation: 'Vacation Fund',
    starter: 'Starter Investment',
    investment: 'Investment Plan',
  },
  pl: {
    retirement: 'Planowanie emerytalne',
    emergency: 'Fundusz awaryjny',
    house: 'Wkład własny na dom',
    education: 'Fundusz edukacyjny',
    wealth: 'Budowanie majątku',
    vacation: 'Fundusz wakacyjny',
    starter: 'Inwestycja startowa',
    investment: 'Plan inwestycyjny',
  },
  es: {
    retirement: 'Plan de jubilación',
    emergency: 'Fondo de emergencia',
    house: 'Entrada para vivienda',
    education: 'Fondo educativo',
    wealth: 'Construcción de patrimonio',
    vacation: 'Fondo de vacaciones',
    starter: 'Inversión inicial',
    investment: 'Plan de inversión',
  },
}

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

  const initial = params.initialAmount.toLocaleString()
  const monthly = params.monthlyContribution.toLocaleString()

  return `${GOAL_LABELS.en[goal]}: $${initial} + $${monthly}/month`
}

/**
 * Generates a locale-aware scenario name from parameters
 * Example (en): Retirement Planning: $10,000 + $500/month
 * Example (pl): Planowanie emerytalne: 10 000 $ + 500 $/mies.
 * Example (es): Plan de jubilación: 10.000 US$ + 500 US$/mes
 */
export function generateLocalizedScenarioName(
  locale: 'en' | 'pl' | 'es',
  params: CalculatorInputs
): string {
  const goal = detectInvestmentGoal(params)

  const nf = new Intl.NumberFormat(
    locale === 'en' ? 'en-US' : locale === 'pl' ? 'pl-PL' : 'es-ES',
    { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
  )

  const perMonth: Record<'en' | 'pl' | 'es', string> = {
    en: 'month',
    pl: 'mies.',
    es: 'mes',
  }

  return `${GOAL_LABELS[locale][goal]}: ${nf.format(params.initialAmount)} + ${nf.format(params.monthlyContribution)}/${perMonth[locale]}`
}

const numberFormatLocale = {
  en: 'en-US',
  pl: 'pl-PL',
  es: 'es-ES',
} as const

const perMonthLabel: Record<SupportedLocale, string> = {
  en: 'month',
  pl: 'mies.',
  es: 'mes',
}

function normalizeAnnualReturn(value: number): number {
  if (Number.isNaN(value)) return 0
  return value <= 1 ? value * 100 : value
}

function formatPercentDisplay(value: number): string {
  const normalized = normalizeAnnualReturn(value)
  return Number.isInteger(normalized)
    ? normalized.toFixed(0)
    : normalized.toFixed(1).replace(/\.0$/, '')
}

function coerceLocale(locale: string): SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : 'en'
}

export function generateScenarioHeadline(
  locale: 'en' | 'pl' | 'es',
  params: CalculatorInputs
): string {
  const safeLocale = coerceLocale(locale)
  const goal = detectInvestmentGoal(params)
  const nf = new Intl.NumberFormat(numberFormatLocale[safeLocale], {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
  const initial = nf.format(params.initialAmount)
  const monthly = nf.format(params.monthlyContribution)
  const years = params.timeHorizon
  const rate = formatPercentDisplay(params.annualReturn)

  if (safeLocale === 'pl') {
    return `${GOAL_LABELS.pl[goal]} | Zainwestuj ${initial} na start + ${monthly}/${perMonthLabel.pl} przez ${years} lat przy ${rate}% rocznego zwrotu`
  }

  if (safeLocale === 'es') {
    return `${GOAL_LABELS.es[goal]} | Invierte ${initial} inicial + ${monthly}/${perMonthLabel.es} durante ${years} años con ${rate}% de rendimiento anual`
  }

  const yearLabel = years === 1 ? '1-year' : `${years}-year`
  return `${GOAL_LABELS.en[goal]} | Invest ${initial} upfront + ${monthly}/${perMonthLabel.en} for a ${yearLabel} horizon at ${rate}% annual return`
}

/**
 * Generates the specific page title format requested:
 * "Future Value of $10,000 in 10 Years at 7% Monthly $200 Contributions"
 */
export function generateScenarioPageTitle(
  locale: 'en' | 'pl' | 'es',
  params: CalculatorInputs
): string {
  const safeLocale = coerceLocale(locale)
  const nf = new Intl.NumberFormat(numberFormatLocale[safeLocale], {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })
  const initial = nf.format(params.initialAmount)
  const monthly = nf.format(params.monthlyContribution)
  const years = params.timeHorizon
  const rate = formatPercentDisplay(params.annualReturn)

  if (safeLocale === 'pl') {
    return `Przyszła wartość ${initial} po ${years} latach przy ${rate}% i składkach miesięcznych ${monthly}`
  }

  if (safeLocale === 'es') {
    return `Valor Futuro de ${initial} en ${years} Años al ${rate}% con Contribuciones Mensuales de ${monthly}`
  }

  return `Future Value of ${initial} in ${years} Years at ${rate}% Monthly ${monthly} Contributions`
}

/**
 * Generates a localized short description suitable for DB and previews
 */
export function generateLocalizedScenarioDescription(
  locale: 'en' | 'pl' | 'es',
  params: CalculatorInputs
): string {
  const nf0 = new Intl.NumberFormat(
    locale === 'en' ? 'en-US' : locale === 'pl' ? 'pl-PL' : 'es-ES',
    { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
  )

  const t = (key: string) => {
    const dict: Record<'en' | 'pl' | 'es', Record<string, string>> = {
      en: {
        intro: 'Explore the investment strategy',
        initial: 'initial investment',
        monthly: 'monthly contributions',
        over: 'over',
        years: 'years',
        targeting: 'targeting',
        annual: 'annual return',
      },
      pl: {
        intro: 'Poznaj strategię inwestycyjną',
        initial: 'inwestycja początkowa',
        monthly: 'miesięczne składki',
        over: 'przez',
        years: 'lat',
        targeting: 'z celem',
        annual: 'rocznego zwrotu',
      },
      es: {
        intro: 'Explora la estrategia de inversión',
        initial: 'inversión inicial',
        monthly: 'contribuciones mensuales',
        over: 'durante',
        years: 'años',
        targeting: 'con objetivo de',
        annual: 'de rendimiento anual',
      },
    }
    return dict[locale][key]
  }

  const initial = nf0.format(params.initialAmount)
  const monthly = nf0.format(params.monthlyContribution)
  const rate = params.annualReturn.toFixed(0)
  const years = params.timeHorizon

  if (locale === 'pl') {
    return `${t('intro')}: ${t('initial')} ${initial}, ${t('monthly')} ${monthly} ${t('over')} ${years} ${t('years')} ${t('targeting')} ${rate}% ${t('annual')}.`
  }
  if (locale === 'es') {
    return `${t('intro')}: ${t('initial')} de ${initial}, ${t('monthly')} de ${monthly} ${t('over')} ${years} ${t('years')} ${t('targeting')} ${rate}% ${t('annual')}.`
  }
  // en default
  return `${t('intro')}: ${initial} ${t('initial')}, ${monthly} ${t('monthly')} ${t('over')} ${years} ${t('years')} ${t('targeting')} ${rate}% ${t('annual')}.`
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
