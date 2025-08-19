/**
 * Predefined calculation scenarios for static generation
 * These represent common financial planning scenarios that will be pre-generated as static pages
 */

export interface ScenarioConfig {
  id: string
  name: string
  description: string
  params: {
    initialAmount: number
    monthlyContribution: number
    annualReturn: number
    timeHorizon: number
  }
  tags: string[]
}

export const PREDEFINED_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'starter-10k-500-7-10',
    name: 'Beginner Investor',
    description: 'Conservative start with moderate monthly contributions',
    params: {
      initialAmount: 10000,
      monthlyContribution: 500,
      annualReturn: 7,
      timeHorizon: 10,
    },
    tags: ['beginner', 'conservative', 'starter'],
  },
  {
    id: 'retirement-50k-2k-6-30',
    name: 'Retirement Planning',
    description: 'Long-term retirement strategy with steady contributions',
    params: {
      initialAmount: 50000,
      monthlyContribution: 2000,
      annualReturn: 6,
      timeHorizon: 30,
    },
    tags: ['retirement', 'long-term', 'conservative'],
  },
  {
    id: 'aggressive-25k-1k-12-20',
    name: 'Growth Investor',
    description: 'Higher risk, higher reward investment strategy',
    params: {
      initialAmount: 25000,
      monthlyContribution: 1000,
      annualReturn: 12,
      timeHorizon: 20,
    },
    tags: ['aggressive', 'growth', 'high-risk'],
  },
  {
    id: 'young-5k-300-8-15',
    name: 'Young Professional',
    description: 'Starting early with modest contributions',
    params: {
      initialAmount: 5000,
      monthlyContribution: 300,
      annualReturn: 8,
      timeHorizon: 15,
    },
    tags: ['young', 'early-start', 'moderate'],
  },
  {
    id: 'wealth-100k-5k-10-25',
    name: 'Wealth Building',
    description: 'High-value investments for serious wealth accumulation',
    params: {
      initialAmount: 100000,
      monthlyContribution: 5000,
      annualReturn: 10,
      timeHorizon: 25,
    },
    tags: ['wealth', 'high-value', 'aggressive'],
  },
  {
    id: 'emergency-1k-200-4-5',
    name: 'Emergency Fund',
    description: 'Building a safety net with conservative returns',
    params: {
      initialAmount: 1000,
      monthlyContribution: 200,
      annualReturn: 4,
      timeHorizon: 5,
    },
    tags: ['emergency', 'safety', 'conservative'],
  },
]

// Map for O(1) lookup (used in static generation + runtime short-circuit)
export const PREDEFINED_SCENARIOS_MAP: Record<string, ScenarioConfig> =
  Object.fromEntries(PREDEFINED_SCENARIOS.map((s) => [s.id, s]))

/**
 * Generate all possible locale-scenario combinations for static generation
 */
export function generateScenarioPaths() {
  const locales = ['en', 'es', 'pl']
  const paths: Array<{ params: { locale: string; scenario: string } }> = []

  locales.forEach((locale) => {
    PREDEFINED_SCENARIOS.forEach((scenario) => {
      paths.push({
        params: {
          locale,
          scenario: scenario.id,
        },
      })
    })
  })

  return paths
}

/**
 * Find scenario by ID
 */
export function getScenarioById(id: string): ScenarioConfig | undefined {
  return PREDEFINED_SCENARIOS.find((scenario) => scenario.id === id)
}

/**
 * Generate SEO-friendly URL slug from scenario
 */
export function generateScenarioSlug(scenario: ScenarioConfig): string {
  return scenario.id
}

/**
 * Parse scenario slug back to scenario ID
 */
export function parseScenarioSlug(slug: string): string {
  return slug
}
