/**
 * Pre-generation Strategy Script
 * Generates scenarios for popular parameter combinations to improve SEO coverage
 * and reduce response times for common investment scenarios
 */

import {
  CalculatorInputs,
  generateScenarioSlug,
  detectInvestmentGoal,
} from '../lib/scenarioUtils'
import { generatePersonalizedContent } from '../lib/contentGenerator'
import { CalculatorInputs as ContentGeneratorInputs } from '../lib/contentGenerator'

// Popular parameter combinations for pre-generation
const POPULAR_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000] // Common initial amounts
const POPULAR_MONTHLY = [100, 250, 500, 1000, 2000, 5000] // Common monthly contributions
const POPULAR_TIMEFRAMES = [5, 10, 15, 20, 25, 30] // Common investment periods (years)
const POPULAR_RATES = [0.04, 0.06, 0.07, 0.08, 0.1, 0.12] // Common return rates (4-12%)

// Currency configurations
const CURRENCY_CONFIGS = [
  { currency: 'USD', locale: 'en' },
  { currency: 'EUR', locale: 'es' },
  { currency: 'PLN', locale: 'pl' },
]

// Inflation rates by currency
const INFLATION_RATES = {
  USD: 0.025, // 2.5%
  EUR: 0.02, // 2.0%
  PLN: 0.035, // 3.5%
}

interface PreGenerationResult {
  slug: string
  params: ContentGeneratorInputs
  content: any
  locale: string
  priority: number
}

interface PreGenerationStats {
  totalGenerated: number
  byGoal: Record<string, number>
  byLocale: Record<string, number>
  processingTime: number
  errors: string[]
}

/**
 * Calculate priority score for parameter combinations
 * Higher score = more likely to be searched by users
 */
function calculatePriority(params: CalculatorInputs): number {
  let score = 0

  // Initial amount scoring (common amounts get higher priority)
  if ([1000, 5000, 10000, 25000, 50000].includes(params.initialAmount)) {
    score += 3
  } else if (params.initialAmount <= 100000) {
    score += 1
  }

  // Monthly contribution scoring
  if ([100, 250, 500, 1000].includes(params.monthlyContribution)) {
    score += 3
  } else if (params.monthlyContribution <= 2000) {
    score += 1
  }

  // Time horizon scoring (common planning periods)
  if ([10, 15, 20, 25, 30].includes(params.timeHorizon)) {
    score += 2
  } else if (params.timeHorizon >= 5) {
    score += 1
  }

  // Return rate scoring (realistic market returns)
  if ([0.06, 0.07, 0.08].includes(params.annualReturn)) {
    score += 2
  } else if (params.annualReturn >= 0.04 && params.annualReturn <= 0.12) {
    score += 1
  }

  return score
}

/**
 * Generate all parameter combinations
 */
function generateParameterCombinations(): CalculatorInputs[] {
  const combinations: CalculatorInputs[] = []

  for (const initial of POPULAR_AMOUNTS) {
    for (const monthly of POPULAR_MONTHLY) {
      for (const years of POPULAR_TIMEFRAMES) {
        for (const rate of POPULAR_RATES) {
          // Skip unrealistic combinations
          if (initial === 100000 && monthly >= 5000) continue // Too high combined
          if (years <= 5 && initial >= 50000) continue // Short-term with high initial
          if (rate >= 0.12 && years >= 25) continue // Unrealistic long-term high returns

          combinations.push({
            initialAmount: initial,
            monthlyContribution: monthly,
            annualReturn: rate,
            timeHorizon: years,
          })
        }
      }
    }
  }

  return combinations
}

/**
 * Generate scenarios for a specific locale and currency
 */
async function generateScenariosForLocale(
  combinations: CalculatorInputs[],
  locale: string,
  currency: string
): Promise<PreGenerationResult[]> {
  const results: PreGenerationResult[] = []
  const inflationRate = INFLATION_RATES[currency] || 0.025

  for (const params of combinations) {
    try {
      // Generate goal first
      const goal = detectInvestmentGoal(params)

      // Create full params for content generation
      const contentParams: ContentGeneratorInputs = {
        ...params,
        goal,
      }

      // Generate slug and content
      const slug = generateScenarioSlug(params)
      const content = await generatePersonalizedContent(contentParams, locale)

      // Calculate priority
      const priority = calculatePriority(params)

      results.push({
        slug,
        params: contentParams,
        content,
        locale,
        priority,
      })
    } catch (error) {
      console.warn(`Failed to generate scenario for ${locale}:`, error.message)
    }
  }

  return results
}

/**
 * Main pre-generation function
 */
export async function preGenerateScenarios(
  options: {
    maxScenarios?: number
    minPriority?: number
    locales?: string[]
  } = {}
): Promise<PreGenerationStats> {
  const startTime = Date.now()
  const stats: PreGenerationStats = {
    totalGenerated: 0,
    byGoal: {},
    byLocale: {},
    processingTime: 0,
    errors: [],
  }

  try {
    console.log('🚀 Starting scenario pre-generation...')

    // Generate base parameter combinations
    const baseCombinations = generateParameterCombinations()
    console.log(
      `📊 Generated ${baseCombinations.length} base parameter combinations`
    )

    const allResults: PreGenerationResult[] = []
    const targetLocales =
      options.locales || CURRENCY_CONFIGS.map((c) => c.locale)

    // Generate for each locale/currency
    for (const { locale, currency } of CURRENCY_CONFIGS) {
      if (!targetLocales.includes(locale)) continue

      console.log(`🌍 Generating scenarios for ${locale} (${currency})...`)

      try {
        const localeResults = await generateScenariosForLocale(
          baseCombinations,
          locale,
          currency
        )

        allResults.push(...localeResults)
        stats.byLocale[locale] = localeResults.length

        console.log(
          `✅ Generated ${localeResults.length} scenarios for ${locale}`
        )
      } catch (error) {
        const errorMsg = `Failed to generate scenarios for ${locale}: ${error.message}`
        console.error(`❌ ${errorMsg}`)
        stats.errors.push(errorMsg)
      }
    }

    // Sort by priority and apply limits
    allResults.sort((a, b) => b.priority - a.priority)

    const minPriority = options.minPriority || 0
    const filteredResults = allResults.filter((r) => r.priority >= minPriority)

    const maxScenarios = options.maxScenarios || filteredResults.length
    const finalResults = filteredResults.slice(0, maxScenarios)

    // Calculate goal statistics
    for (const result of finalResults) {
      const goal = result.params.goal || 'unknown'
      stats.byGoal[goal] = (stats.byGoal[goal] || 0) + 1
    }

    stats.totalGenerated = finalResults.length
    stats.processingTime = Date.now() - startTime

    console.log('\n📈 Pre-generation Summary:')
    console.log(`✅ Total scenarios: ${stats.totalGenerated}`)
    console.log(`⏱️  Processing time: ${stats.processingTime}ms`)
    console.log(`🎯 By goal:`, stats.byGoal)
    console.log(`🌍 By locale:`, stats.byLocale)

    if (stats.errors.length > 0) {
      console.log(`⚠️  Errors: ${stats.errors.length}`)
      stats.errors.forEach((error) => console.log(`   - ${error}`))
    }
    return stats
  } catch (error) {
    stats.errors.push(`Pre-generation failed: ${error.message}`)
    stats.processingTime = Date.now() - startTime
    throw error
  }
}

/**
 * Run pre-generation with specific parameter combinations
 */
export async function preGenerateCustomScenarios(
  customCombinations: CalculatorInputs[],
  locales: string[] = ['en']
): Promise<PreGenerationStats> {
  const startTime = Date.now()
  const stats: PreGenerationStats = {
    totalGenerated: 0,
    byGoal: {},
    byLocale: {},
    processingTime: 0,
    errors: [],
  }

  console.log(`🎯 Generating ${customCombinations.length} custom scenarios...`)

  for (const locale of locales) {
    const currencyConfig = CURRENCY_CONFIGS.find((c) => c.locale === locale)
    const currency = currencyConfig?.currency || 'USD'

    try {
      const results = await generateScenariosForLocale(
        customCombinations,
        locale,
        currency
      )
      stats.byLocale[locale] = results.length

      for (const result of results) {
        const goal = result.params.goal || 'unknown'
        stats.byGoal[goal] = (stats.byGoal[goal] || 0) + 1
      }

      stats.totalGenerated += results.length
    } catch (error) {
      const errorMsg = `Failed custom generation for ${locale}: ${error.message}`
      stats.errors.push(errorMsg)
      console.error(`❌ ${errorMsg}`)
    }
  }

  stats.processingTime = Date.now() - startTime

  console.log(
    `✅ Custom generation complete: ${stats.totalGenerated} scenarios in ${stats.processingTime}ms`
  )

  return stats
}

/**
 * Estimate total scenarios for given parameters
 */
export function estimateScenarioCount(
  amounts = POPULAR_AMOUNTS.length,
  monthly = POPULAR_MONTHLY.length,
  timeframes = POPULAR_TIMEFRAMES.length,
  rates = POPULAR_RATES.length,
  locales = CURRENCY_CONFIGS.length
): number {
  // Apply realistic combination filter (~85% pass the validation)
  const baseCombinations = amounts * monthly * timeframes * rates * 0.85
  return Math.floor(baseCombinations * locales)
}

// CLI execution support
if (require.main === module) {
  const args = process.argv.slice(2)
  const maxScenarios = args.includes('--max')
    ? parseInt(args[args.indexOf('--max') + 1])
    : undefined
  const minPriority = args.includes('--min-priority')
    ? parseInt(args[args.indexOf('--min-priority') + 1])
    : 0
  const locales = args.includes('--locales')
    ? args[args.indexOf('--locales') + 1].split(',')
    : undefined

  preGenerateScenarios({ maxScenarios, minPriority, locales })
    .then((stats) => {
      console.log('\n🎉 Pre-generation completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Pre-generation failed:', error.message)
      process.exit(1)
    })
}
