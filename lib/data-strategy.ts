/**
 * Hybrid data strategy - combining static scenarios with optional database storage
 * This allows for both SEO-friendly static pages and dynamic user features
 */

import { InvestmentParameters, InvestmentResult } from '@/lib/finance'

// Static scenarios (no database needed)
export interface StaticScenario {
  id: string
  name: string
  description: string
  params: InvestmentParameters
  tags: string[]
  seoMetadata: {
    title: string
    description: string
    keywords: string[]
  }
}

// Dynamic user scenarios (database optional)
export interface UserScenario {
  id: string
  userId?: string // Optional - for logged-in users
  sessionId?: string // For anonymous users
  name: string
  description?: string
  params: InvestmentParameters
  createdAt: Date
  isPublic: boolean
  shareableUrl: string
}

// Analytics data (database recommended)
export interface CalculationAnalytics {
  scenarioId?: string
  params: InvestmentParameters
  result: InvestmentResult
  timestamp: Date
  userAgent?: string
  locale: string
  referrer?: string
}

/**
 * Data storage strategy:
 *
 * 1. STATIC (No DB): Predefined scenarios for SEO
 * 2. CLIENT-SIDE: URL params + localStorage for user sessions
 * 3. OPTIONAL DB: User accounts, custom scenarios, analytics
 */
export const DATA_STRATEGY = {
  // Static scenarios - built into the app
  STATIC_SCENARIOS: 'Built-in TypeScript files',

  // User session data - no database needed
  SESSION_DATA: 'URL parameters + localStorage',

  // Optional database features
  OPTIONAL_DB_FEATURES: [
    'User accounts',
    'Saved scenarios',
    'Custom scenario sharing',
    'Usage analytics',
    'A/B testing data',
  ],
} as const
