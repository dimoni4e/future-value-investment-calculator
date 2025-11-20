import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import {
  generateScenarioSlug,
  generateLocalizedScenarioName,
  generateLocalizedScenarioDescription,
  CalculatorInputs,
} from '../lib/scenarioUtils'

// Helper to generate random number within range
const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min

// Helper to round to nearest step
const roundToStep = (value: number, step: number) =>
  Math.round(value / step) * step

async function generateDailyScenario() {
  // Dynamically import DB queries to ensure env vars are loaded first
  const { createScenario } = await import('../lib/db/queries')

  console.log('Starting daily scenario generation...')

  // 1. Generate unique random parameters
  // Initial Amount: 1,000 to 100,000, rounded to nearest 100
  const initialAmount = roundToStep(randomInRange(1000, 100000), 100)

  // Monthly Contribution: 50 to 5,000, rounded to nearest 50
  const monthlyContribution = roundToStep(randomInRange(50, 5000), 50)

  // Annual Return: 3% to 12%, rounded to 1 decimal place
  const annualReturn = Math.round(randomInRange(3, 12) * 10) / 10

  // Time Horizon: 5 to 40 years
  const timeHorizon = Math.round(randomInRange(5, 40))

  const params: CalculatorInputs = {
    initialAmount,
    monthlyContribution,
    annualReturn,
    timeHorizon,
  }

  console.log('Generated parameters:', params)

  // 2. Generate slug (shared across locales for consistency if desired, or unique per locale)
  // The current app structure uses the same slug format for all locales but stores them as separate rows.
  // generateScenarioSlug uses English keywords (invest-X-monthly-Y...) which is fine as the canonical slug.
  const slug = generateScenarioSlug(params)
  console.log('Generated slug:', slug)

  const locales = ['en', 'es', 'pl'] as const

  // 3. Create scenario for each locale
  for (const locale of locales) {
    try {
      const name = generateLocalizedScenarioName(locale, params)
      const description = generateLocalizedScenarioDescription(locale, params)

      console.log(`Creating scenario for ${locale}: "${name}"`)

      await createScenario({
        slug,
        locale,
        name,
        description,
        initialAmount: params.initialAmount,
        monthlyContribution: params.monthlyContribution,
        annualReturn: params.annualReturn,
        timeHorizon: params.timeHorizon,
        tags: ['daily-generated', 'auto-generated'], // Add tags to identify these
        isPredefined: false, // User-generated style
        isPublic: true, // Public so it shows up in sitemap
        createdBy: 'system-cron',
      })

      console.log(`✅ Successfully created scenario for ${locale}`)
    } catch (error) {
      console.error(`❌ Error creating scenario for ${locale}:`, error)
    }
  }

  console.log('Daily scenario generation complete.')
  process.exit(0)
}

generateDailyScenario().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
