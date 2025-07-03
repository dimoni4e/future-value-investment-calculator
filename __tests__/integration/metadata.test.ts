/**
 * Integration Test for Metadata Generation
 * Tests metadata generation in Next.js environment with real scenario data
 */

import { Metadata } from 'next'
import { parseSlugToScenario, detectInvestmentGoal } from '@/lib/scenarioUtils'

// Mock the database and scenario utils
jest.mock('@/lib/db/queries', () => ({
  getScenarioBySlug: jest.fn(),
  getPredefinedScenarios: jest.fn(),
}))

jest.mock('@/lib/scenarioUtils')

const mockParseSlugToScenario = parseSlugToScenario as jest.MockedFunction<
  typeof parseSlugToScenario
>
const mockDetectInvestmentGoal = detectInvestmentGoal as jest.MockedFunction<
  typeof detectInvestmentGoal
>

describe('Metadata Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Metadata generation in Next.js environment', () => {
    it('should generate metadata with valid structure for Next.js', async () => {
      // Mock scenario data
      const mockScenario = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 0.07,
        timeHorizon: 15,
        goal: 'house',
        slug: 'invest-25000-monthly-1000-7percent-15years-house',
      }

      mockParseSlugToScenario.mockReturnValue(mockScenario)
      mockDetectInvestmentGoal.mockReturnValue('house')

      // Import the generateMetadata function
      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: mockScenario.slug },
      })

      // Verify metadata structure matches Next.js Metadata interface
      expect(metadata).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        keywords: expect.any(String),
        openGraph: {
          title: expect.any(String),
          description: expect.any(String),
          type: 'website',
          locale: 'en',
        },
        twitter: {
          card: 'summary_large_image',
          title: expect.any(String),
          description: expect.any(String),
        },
      })
    })

    it('should generate different metadata for different scenarios', async () => {
      const scenario1 = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 0.06,
        timeHorizon: 10,
        goal: 'vacation',
        slug: 'invest-10000-monthly-500-6percent-10years-vacation',
      }

      const scenario2 = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturn: 0.08,
        timeHorizon: 25,
        goal: 'retirement',
        slug: 'invest-50000-monthly-2000-8percent-25years-retirement',
      }

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      // Generate metadata for first scenario
      mockParseSlugToScenario.mockReturnValueOnce(scenario1)
      mockDetectInvestmentGoal.mockReturnValueOnce('vacation')

      const metadata1 = await generateMetadata({
        params: { locale: 'en', slug: scenario1.slug },
      })

      // Generate metadata for second scenario
      mockParseSlugToScenario.mockReturnValueOnce(scenario2)
      mockDetectInvestmentGoal.mockReturnValueOnce('retirement')

      const metadata2 = await generateMetadata({
        params: { locale: 'en', slug: scenario2.slug },
      })

      // Verify different content
      expect(metadata1.title).not.toBe(metadata2.title)
      expect(metadata1.description).not.toBe(metadata2.description)
      expect(metadata1.keywords).not.toBe(metadata2.keywords)

      // Verify scenario-specific content
      expect(metadata1.title).toContain('vacation')
      expect(metadata2.title).toContain('retirement')
      expect(metadata1.title).toContain('$10,000')
      expect(metadata2.title).toContain('$50,000')
    })
  })

  describe('Parameter parsing accuracy in metadata', () => {
    it('should accurately reflect parsed parameters in metadata', async () => {
      const testCases = [
        {
          scenario: {
            initialAmount: 75000,
            monthlyContribution: 3000,
            annualReturn: 0.09,
            timeHorizon: 20,
            goal: 'wealth',
            slug: 'invest-75000-monthly-3000-9percent-20years-wealth',
          },
          expectedInTitle: ['$75,000', '$3,000/month', '9%', '20 Year'],
          expectedInDescription: ['$75,000', '$3,000', '9%', '20 years'],
        },
        {
          scenario: {
            initialAmount: 5000,
            monthlyContribution: 250,
            annualReturn: 0.05,
            timeHorizon: 8,
            goal: 'emergency',
            slug: 'invest-5000-monthly-250-5percent-8years-emergency',
          },
          expectedInTitle: ['$5,000', '$250/month', '5%', '8 Year'],
          expectedInDescription: ['$5,000', '$250', '5%', '8 years'],
        },
      ]

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      for (const testCase of testCases) {
        mockParseSlugToScenario.mockReturnValueOnce(testCase.scenario)
        mockDetectInvestmentGoal.mockReturnValueOnce(
          testCase.scenario.goal as any
        )

        const metadata = await generateMetadata({
          params: { locale: 'en', slug: testCase.scenario.slug },
        })

        // Check title contains expected values
        testCase.expectedInTitle.forEach((expectedValue) => {
          expect(metadata.title).toContain(expectedValue)
        })

        // Check description contains expected values
        testCase.expectedInDescription.forEach((expectedValue) => {
          expect(metadata.description).toContain(expectedValue)
        })
      }
    })

    it('should handle decimal return rates correctly', async () => {
      const scenario = {
        initialAmount: 30000,
        monthlyContribution: 1500,
        annualReturn: 0.075, // 7.5%
        timeHorizon: 18,
        goal: 'house',
        slug: 'invest-30000-monthly-1500-7point5percent-18years-house',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('house')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Should round 7.5% to 8% for display
      expect(metadata.title).toContain('8%')
      expect(metadata.description).toContain('8%')
    })
  })

  describe('Localization of meta tags across languages', () => {
    it('should include correct locale in OpenGraph metadata', async () => {
      const scenario = {
        initialAmount: 20000,
        monthlyContribution: 800,
        annualReturn: 0.06,
        timeHorizon: 12,
        goal: 'education',
        slug: 'invest-20000-monthly-800-6percent-12years-education',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('education')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      // Test different locales
      const locales = ['en', 'es', 'pl']

      for (const locale of locales) {
        const metadata = await generateMetadata({
          params: { locale, slug: scenario.slug },
        })

        expect(metadata.openGraph?.locale).toBe(locale)
      }
    })

    it('should generate consistent metadata structure across locales', async () => {
      const scenario = {
        initialAmount: 15000,
        monthlyContribution: 600,
        annualReturn: 0.065,
        timeHorizon: 14,
        goal: 'vacation',
        slug: 'invest-15000-monthly-600-6point5percent-14years-vacation',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('vacation')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const locales = ['en', 'es', 'pl']
      const metadataResults = []

      for (const locale of locales) {
        const metadata = await generateMetadata({
          params: { locale, slug: scenario.slug },
        })
        metadataResults.push(metadata)
      }

      // All should have the same structure and content (for now, until localization is implemented)
      metadataResults.forEach((metadata) => {
        expect(metadata).toHaveProperty('title')
        expect(metadata).toHaveProperty('description')
        expect(metadata).toHaveProperty('keywords')
        expect(metadata).toHaveProperty('openGraph')
        expect(metadata).toHaveProperty('twitter')
        expect(metadata.title).toContain('$15,000')
        expect(metadata.description).toContain('$600')
      })
    })
  })

  describe('Error handling and fallbacks', () => {
    it('should handle scenario data fetch errors gracefully', async () => {
      // Mock scenario parsing to fail
      mockParseSlugToScenario.mockReturnValue(null)

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: 'invalid-scenario-slug' },
      })

      expect(metadata.title).toBe(
        'Investment Scenario Calculator - Future Value Analysis'
      )
      expect(metadata.description).toContain('detailed projections')
      expect(metadata.keywords).toContain('investment calculator')
    })

    it('should maintain metadata structure even with invalid data', async () => {
      mockParseSlugToScenario.mockImplementation(() => {
        throw new Error('Parsing failed')
      })

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: 'error-prone-slug' },
      })

      // Should still return valid metadata structure
      expect(metadata).toHaveProperty('title')
      expect(metadata).toHaveProperty('description')
      expect(metadata).toHaveProperty('keywords')
      expect(metadata).toHaveProperty('openGraph')
      expect(metadata).toHaveProperty('twitter')

      // Should fall back to generic content
      expect(metadata.title).toContain('Investment Scenario Calculator')
    })
  })

  describe('SEO optimization compliance', () => {
    it('should generate SEO-friendly title lengths', async () => {
      const scenarios = [
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 0.04,
          timeHorizon: 5,
          goal: 'starter',
          slug: 'invest-1000-monthly-100-4percent-5years-starter',
        },
        {
          initialAmount: 100000,
          monthlyContribution: 5000,
          annualReturn: 0.12,
          timeHorizon: 30,
          goal: 'retirement',
          slug: 'invest-100000-monthly-5000-12percent-30years-retirement',
        },
      ]

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      for (const scenario of scenarios) {
        mockParseSlugToScenario.mockReturnValueOnce(scenario)
        mockDetectInvestmentGoal.mockReturnValueOnce(scenario.goal as any)

        const metadata = await generateMetadata({
          params: { locale: 'en', slug: scenario.slug },
        })

        expect(String(metadata.title).length).toBeLessThanOrEqual(60)
        expect(metadata.description!.length).toBeLessThanOrEqual(160)
      }
    })

    it('should include structured social media metadata', async () => {
      const scenario = {
        initialAmount: 40000,
        monthlyContribution: 2000,
        annualReturn: 0.08,
        timeHorizon: 15,
        goal: 'house',
        slug: 'invest-40000-monthly-2000-8percent-15years-house',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('house')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // OpenGraph validation
      expect(metadata.openGraph).toMatchObject({
        title: expect.any(String),
        description: expect.any(String),
        type: 'website',
        locale: 'en',
      })

      // Twitter Card validation
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        title: expect.any(String),
        description: expect.any(String),
      })

      // Consistency between main meta and social meta
      expect(metadata.openGraph!.title).toBe(metadata.title)
      expect(metadata.openGraph!.description).toBe(metadata.description)
      expect(metadata.twitter!.title).toBe(metadata.title)
      expect(metadata.twitter!.description).toBe(metadata.description)
    })
  })
})
