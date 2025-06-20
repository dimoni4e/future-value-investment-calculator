/**
 * Dynamic scenario creation and storage system
 * Allows users to create scenarios that become permanent SEO-friendly pages
 */

import { InvestmentParameters } from '@/lib/finance'

export interface UserGeneratedScenario {
  id: string
  slug: string
  name: string
  description?: string
  params: InvestmentParameters
  createdAt: Date
  createdBy?: string // user ID or session ID
  isPublic: boolean
  views: number
  likes?: number
  tags: string[]
  seoMetadata: {
    title: string
    description: string
    keywords: string[]
  }
}

/**
 * Generate scenario from user input
 */
export function createUserScenario(
  userInput: {
    name: string
    description?: string
    params: {
      initialAmount: number
      monthlyContribution: number
      annualReturn: number
      timeHorizon: number
    }
  },
  userId?: string
): UserGeneratedScenario {
  const slug = generateScenarioSlug(userInput.name, userInput.params)
  const id = generateScenarioId()

  return {
    id,
    slug,
    name: userInput.name,
    description: userInput.description,
    params: {
      initialAmount: userInput.params.initialAmount,
      monthlyContribution: userInput.params.monthlyContribution,
      annualReturnRate: userInput.params.annualReturn,
      timeHorizonYears: userInput.params.timeHorizon,
    },
    createdAt: new Date(),
    createdBy: userId,
    isPublic: true,
    views: 0,
    tags: generateTags(userInput.params),
    seoMetadata: generateSEOMetadata(userInput.name, userInput.params),
  }
}

/**
 * Generate SEO-friendly slug from scenario name and params
 */
function generateScenarioSlug(name: string, params: any): string {
  const nameSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const paramSlug = `${params.initialAmount}-${params.monthlyContribution}-${params.annualReturn}-${params.timeHorizon}`

  return `${nameSlug}-${paramSlug}`
}

/**
 * Generate unique scenario ID
 */
function generateScenarioId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Auto-generate tags based on scenario parameters
 */
function generateTags(params: any): string[] {
  const tags: string[] = ['user-generated']

  // Risk level tags
  if (params.annualReturn <= 4) tags.push('conservative', 'low-risk')
  else if (params.annualReturn <= 8) tags.push('moderate', 'balanced')
  else tags.push('aggressive', 'high-risk', 'growth')

  // Time horizon tags
  if (params.timeHorizon <= 5) tags.push('short-term')
  else if (params.timeHorizon <= 15) tags.push('medium-term')
  else tags.push('long-term', 'retirement')

  // Amount tags
  if (params.initialAmount >= 100000) tags.push('high-value', 'wealth')
  else if (params.initialAmount >= 25000) tags.push('substantial')
  else tags.push('starter', 'beginner')

  return tags
}

/**
 * Generate SEO metadata
 */
function generateSEOMetadata(name: string, params: any) {
  const finalValue = calculateEstimatedValue(params)

  return {
    title: `${name} - Investment Calculator Scenario`,
    description: `Custom investment scenario: ${name}. Starting with $${params.initialAmount.toLocaleString()}, contributing $${params.monthlyContribution.toLocaleString()}/month at ${params.annualReturn}% return over ${params.timeHorizon} years. Estimated result: $${finalValue.toLocaleString()}`,
    keywords: [
      name.toLowerCase(),
      'investment calculator',
      'financial planning',
      `${params.annualReturn}% return`,
      `${params.timeHorizon} year investment`,
      'compound interest',
      'wealth building',
    ],
  }
}

/**
 * Quick estimation for SEO metadata (simplified calculation)
 */
function calculateEstimatedValue(params: any): number {
  const monthlyRate = params.annualReturn / 100 / 12
  const months = params.timeHorizon * 12

  // Simplified compound interest calculation
  const futureValueInitial =
    params.initialAmount * Math.pow(1 + monthlyRate, months)
  const futureValueContributions =
    params.monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)

  return Math.round(futureValueInitial + futureValueContributions)
}
