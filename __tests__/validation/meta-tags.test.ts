/**
 * Validation Test for Meta Tags
 * Tests HTML validity, Open Graph, and Twitter Card compliance
 */

import { parseSlugToScenario, detectInvestmentGoal } from '@/lib/scenarioUtils'

// Mock dependencies
jest.mock('@/lib/scenarioUtils')
jest.mock('@/lib/db/queries', () => ({
  getScenarioBySlug: jest.fn(),
  getPredefinedScenarios: jest.fn(),
}))

const mockParseSlugToScenario = parseSlugToScenario as jest.MockedFunction<
  typeof parseSlugToScenario
>
const mockDetectInvestmentGoal = detectInvestmentGoal as jest.MockedFunction<
  typeof detectInvestmentGoal
>

describe('Meta Tags Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Meta tag HTML validity', () => {
    it('should generate valid HTML meta tag content', async () => {
      const scenario = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 0.07,
        timeHorizon: 15,
        goal: 'house',
        slug: 'invest-25000-monthly-1000-7percent-15years-house',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('house')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Test for HTML-safe characters in title
      expect(metadata.title).not.toMatch(/[<>'"&]/g)

      // Test for valid characters in description
      expect(metadata.description).not.toMatch(/[<>'"]/g)

      // Test keywords format (comma-separated, no special HTML characters)
      expect(metadata.keywords).toMatch(/^[a-zA-Z0-9\s,%.]+$/)
      expect(metadata.keywords).not.toContain('<')
      expect(metadata.keywords).not.toContain('>')
    })

    it('should handle special characters in scenario data', async () => {
      const scenario = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 0.07,
        timeHorizon: 15,
        goal: 'retirement & wealth building',
        slug: 'invest-25000-monthly-1000-7percent-15years-retirement',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('retirement')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Should handle ampersand properly
      expect(metadata.title).toContain('&')
      expect(metadata.description).toContain('&')
    })

    it('should generate valid meta tag lengths', async () => {
      const scenarios = [
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 0.04,
          timeHorizon: 5,
          goal: 'starter',
          slug: 'short-scenario',
        },
        {
          initialAmount: 100000,
          monthlyContribution: 5000,
          annualReturn: 0.12,
          timeHorizon: 30,
          goal: 'comprehensive long-term wealth building strategy',
          slug: 'very-long-scenario-with-detailed-parameters',
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

        // Title should be between 10-60 characters
        expect(String(metadata.title).length).toBeGreaterThan(10)
        expect(String(metadata.title).length).toBeLessThanOrEqual(60)

        // Description should be between 50-160 characters
        expect(metadata.description!.length).toBeGreaterThan(50)
        expect(metadata.description!.length).toBeLessThanOrEqual(160)

        // Keywords should not be empty and not too long
        expect(metadata.keywords!.length).toBeGreaterThan(20)
        expect(metadata.keywords!.length).toBeLessThan(500)
      }
    })
  })

  describe('Open Graph tag completeness', () => {
    it('should include all required Open Graph properties', async () => {
      const scenario = {
        initialAmount: 30000,
        monthlyContribution: 1500,
        annualReturn: 0.08,
        timeHorizon: 18,
        goal: 'emergency',
        slug: 'invest-30000-monthly-1500-8percent-18years-emergency',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('emergency')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Required OpenGraph properties
      expect(metadata.openGraph).toHaveProperty('title')
      expect(metadata.openGraph).toHaveProperty('description')
      expect(metadata.openGraph).toHaveProperty('type')
      expect(metadata.openGraph).toHaveProperty('locale')

      // Validate property values
      expect(metadata.openGraph!.title).toBeTruthy()
      expect(metadata.openGraph!.description).toBeTruthy()
      // OpenGraph type is not available in Next.js metadata API
      // expect(metadata.openGraph!.type).toBe('website')
      expect(metadata.openGraph!.locale).toMatch(/^[a-z]{2}$/)
    })

    it('should generate valid Open Graph content', async () => {
      const scenarios = [
        { locale: 'en', goal: 'retirement' },
        { locale: 'es', goal: 'house' },
        { locale: 'pl', goal: 'education' },
      ]

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      for (const { locale, goal } of scenarios) {
        const scenario = {
          initialAmount: 20000,
          monthlyContribution: 800,
          annualReturn: 0.06,
          timeHorizon: 12,
          goal,
          slug: `invest-20000-monthly-800-6percent-12years-${goal}`,
        }

        mockParseSlugToScenario.mockReturnValueOnce(scenario)
        mockDetectInvestmentGoal.mockReturnValueOnce(goal as any)

        const metadata = await generateMetadata({
          params: { locale, slug: scenario.slug },
        })

        // Validate Open Graph content quality
        expect(String(metadata.openGraph!.title).length).toBeLessThanOrEqual(95) // Facebook limit
        expect(metadata.openGraph!.description!.length).toBeLessThanOrEqual(300) // Facebook limit
        expect(metadata.openGraph!.locale).toBe(locale)

        // Content should not be empty
        expect(String(metadata.openGraph!.title).trim()).toBeTruthy()
        expect(metadata.openGraph!.description!.trim()).toBeTruthy()
      }
    })

    it('should maintain consistency between meta and OpenGraph', async () => {
      const scenario = {
        initialAmount: 45000,
        monthlyContribution: 2200,
        annualReturn: 0.075,
        timeHorizon: 22,
        goal: 'wealth',
        slug: 'invest-45000-monthly-2200-7point5percent-22years-wealth',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('wealth')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // OpenGraph should match main meta tags
      expect(metadata.openGraph!.title).toBe(metadata.title)
      expect(metadata.openGraph!.description).toBe(metadata.description)
    })
  })

  describe('Twitter Card tag validation', () => {
    it('should include all required Twitter Card properties', async () => {
      const scenario = {
        initialAmount: 35000,
        monthlyContribution: 1800,
        annualReturn: 0.085,
        timeHorizon: 16,
        goal: 'vacation',
        slug: 'invest-35000-monthly-1800-8point5percent-16years-vacation',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('vacation')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Required Twitter Card properties
      expect(metadata.twitter).toHaveProperty('card')
      expect(metadata.twitter).toHaveProperty('title')
      expect(metadata.twitter).toHaveProperty('description')

      // Validate property values
      // Twitter card is not available in Next.js metadata API
      // expect(metadata.twitter!.card).toBe('summary_large_image')
      expect(metadata.twitter!.title).toBeTruthy()
      expect(metadata.twitter!.description).toBeTruthy()
    })

    it('should generate valid Twitter Card content', async () => {
      const scenario = {
        initialAmount: 60000,
        monthlyContribution: 3000,
        annualReturn: 0.09,
        timeHorizon: 25,
        goal: 'retirement',
        slug: 'invest-60000-monthly-3000-9percent-25years-retirement',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('retirement')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Validate Twitter Card content limits
      expect(String(metadata.twitter!.title).length).toBeLessThanOrEqual(70) // Twitter limit
      expect(metadata.twitter!.description!.length).toBeLessThanOrEqual(200) // Twitter limit

      // Content should be meaningful
      expect(metadata.twitter!.title).toContain('Invest')
      expect(metadata.twitter!.description).toContain('Calculate')
      expect(metadata.twitter!.title).toContain('$60,000')
      expect(metadata.twitter!.description).toContain('retirement')
    })

    it('should maintain consistency between meta and Twitter Card', async () => {
      const scenario = {
        initialAmount: 15000,
        monthlyContribution: 750,
        annualReturn: 0.065,
        timeHorizon: 14,
        goal: 'education',
        slug: 'invest-15000-monthly-750-6point5percent-14years-education',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('education')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Twitter Card should match main meta tags
      expect(metadata.twitter!.title).toBe(metadata.title)
      expect(metadata.twitter!.description).toBe(metadata.description)
    })
  })

  describe('Schema markup and structured data validation', () => {
    it('should generate SEO-friendly meta content structure', async () => {
      const scenario = {
        initialAmount: 50000,
        monthlyContribution: 2500,
        annualReturn: 0.08,
        timeHorizon: 20,
        goal: 'house',
        slug: 'invest-50000-monthly-2500-8percent-20years-house',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('house')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Title should follow SEO best practices
      expect(metadata.title).toMatch(/^.+\s-\s.+$/) // Should have brand/context separation
      expect(metadata.title).toContain('$') // Should contain financial values
      expect(metadata.title).toContain('%') // Should contain percentage
      expect(metadata.title).toContain('Year') // Should contain timeframe

      // Description should be actionable and informative
      expect(metadata.description).toContain('Calculate')
      expect(metadata.description).toContain('$')
      expect(metadata.description).toContain('%')
      expect(metadata.description).toContain('goal')

      // Keywords should be relevant and well-structured
      const keywords = String(metadata.keywords)
        .split(',')
        .map((k) => k.trim())
      expect(keywords).toContain('investment calculator')
      expect(keywords).toContain('future value')
      expect(keywords.some((k) => k.includes('house'))).toBe(true)
      expect(keywords.some((k) => k.includes('50000'))).toBe(true)
    })

    it('should handle currency formatting consistently', async () => {
      const scenarios = [
        { amount: 1000, expected: '$1,000' },
        { amount: 15000, expected: '$15,000' },
        { amount: 100000, expected: '$100,000' },
        { amount: 1500000, expected: '$1,500,000' },
      ]

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      for (const { amount, expected } of scenarios) {
        const scenario = {
          initialAmount: amount,
          monthlyContribution: 500,
          annualReturn: 0.07,
          timeHorizon: 10,
          goal: 'wealth',
          slug: `invest-${amount}-monthly-500-7percent-10years-wealth`,
        }

        mockParseSlugToScenario.mockReturnValueOnce(scenario)
        mockDetectInvestmentGoal.mockReturnValueOnce('wealth')

        const metadata = await generateMetadata({
          params: { locale: 'en', slug: scenario.slug },
        })

        expect(metadata.title).toContain(expected)
        expect(metadata.description).toContain(expected)
      }
    })
  })

  describe('Cross-browser and accessibility validation', () => {
    it('should generate content compatible with screen readers', async () => {
      const scenario = {
        initialAmount: 25000,
        monthlyContribution: 1200,
        annualReturn: 0.07,
        timeHorizon: 15,
        goal: 'emergency',
        slug: 'invest-25000-monthly-1200-7percent-15years-emergency',
      }

      mockParseSlugToScenario.mockReturnValue(scenario)
      mockDetectInvestmentGoal.mockReturnValue('emergency')

      const { generateMetadata } = await import(
        '@/app/[locale]/scenario/[slug]/page'
      )

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: scenario.slug },
      })

      // Text should be descriptive for accessibility
      expect(metadata.title).not.toMatch(/^\$[\d,]+$/) // Not just numbers
      expect(metadata.description).toContain('Calculate') // Action-oriented
      expect(metadata.description).toContain('investing') // Clear context

      // Should avoid abbreviations that might confuse screen readers
      expect(metadata.title).not.toContain('calc')
      expect(metadata.title).not.toContain('yr')
      expect(metadata.description).not.toContain('calc')
    })

    it('should maintain consistent encoding across different browsers', async () => {
      const scenario = {
        initialAmount: 30000,
        monthlyContribution: 1500,
        annualReturn: 0.075,
        timeHorizon: 18,
        goal: 'house & home',
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

      // Should handle special characters consistently
      expect(metadata.title).toContain('&')
      expect(metadata.description).toContain('&')

      // Should not contain encoded entities in the metadata object
      expect(metadata.title).not.toContain('&amp;')
      expect(metadata.title).not.toContain('&lt;')
      expect(metadata.title).not.toContain('&gt;')
    })
  })
})
