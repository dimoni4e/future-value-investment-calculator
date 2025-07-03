import { jest } from '@jest/globals'
import { generateMetadata } from '@/app/[locale]/scenario/[slug]/page'
import { parseSlugToScenario, detectInvestmentGoal } from '@/lib/scenarioUtils'
import type { Metadata } from 'next'

// Mock the scenario utilities
jest.mock('@/lib/scenarioUtils', () => ({
  parseSlugToScenario: jest.fn(),
  detectInvestmentGoal: jest.fn(),
}))

// Mock Next.js functions
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}))

const mockParseSlugToScenario = parseSlugToScenario as jest.MockedFunction<
  typeof parseSlugToScenario
>
const mockDetectInvestmentGoal = detectInvestmentGoal as jest.MockedFunction<
  typeof detectInvestmentGoal
>

describe('SEO Meta Tags - Task 5.1', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Title Generation', () => {
    it('should generate SEO-optimized title for retirement scenario', async () => {
      const slug = 'invest-50000-monthly-2000-8percent-25years-retirement'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturn: 0.08,
        timeHorizon: 25,
        goal: 'retirement',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('retirement')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.title).toContain('$50,000')
      expect(metadata.title).toContain('$2,000/month')
      expect(metadata.title).toContain('8%')
      expect(metadata.title).toContain('25 Year')
      expect(metadata.title).toContain('retirement')
    })

    it('should generate SEO-optimized title for house down payment scenario', async () => {
      const slug = 'invest-25000-monthly-1000-7percent-15years-house'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 0.07,
        timeHorizon: 15,
        goal: 'house',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('house')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.title).toContain('$25,000')
      expect(metadata.title).toContain('$1,000/month')
      expect(metadata.title).toContain('7%')
      expect(metadata.title).toContain('15 Year')
      expect(metadata.title).toContain('house')
    })

    it('should generate SEO-optimized title for education scenario', async () => {
      const slug = 'invest-10000-monthly-500-6percent-10years-education'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 0.06,
        timeHorizon: 10,
        goal: 'education',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('education')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.title).toContain('$10,000')
      expect(metadata.title).toContain('$500/month')
      expect(metadata.title).toContain('6%')
      expect(metadata.title).toContain('10 Year')
      expect(metadata.title).toContain('education')
    })
  })

  describe('Title Length Compliance', () => {
    it('should truncate long titles to 60 characters or less', async () => {
      const slug = 'invest-100000-monthly-5000-12percent-30years-wealth'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 100000,
        monthlyContribution: 5000,
        annualReturn: 0.12,
        timeHorizon: 30,
        goal: 'wealth',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('wealth')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      const title = String(metadata.title)
      expect(title.length).toBeLessThanOrEqual(60)
      if (title.length >= 57) {
        expect(title).toMatch(/\.\.\.$/)
      }
    })

    it('should not truncate short titles', async () => {
      const slug = 'invest-1000-monthly-100-4percent-5years-starter'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturn: 0.04,
        timeHorizon: 5,
        goal: 'starter',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('starter')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      const title = String(metadata.title)
      expect(title.length).toBeLessThan(60)
      expect(title).not.toMatch(/\.\.\.$/)
    })
  })

  describe('Description Generation and Length Compliance', () => {
    it('should truncate long descriptions to 160 characters or less', async () => {
      const slug = 'invest-75000-monthly-3000-9percent-20years-wealth'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 75000,
        monthlyContribution: 3000,
        annualReturn: 0.09,
        timeHorizon: 20,
        goal: 'wealth',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('wealth')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.description!.length).toBeLessThanOrEqual(160)
      if (metadata.description!.length >= 157) {
        expect(metadata.description).toMatch(/\.\.\.$/)
      }
    })

    it('should not truncate short descriptions', async () => {
      const slug = 'invest-5000-monthly-250-5percent-8years-vacation'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 5000,
        monthlyContribution: 250,
        annualReturn: 0.05,
        timeHorizon: 8,
        goal: 'vacation',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('vacation')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.description!.length).toBeLessThanOrEqual(160)
      expect(metadata.description).not.toMatch(/\.\.\.$/)
    })
  })

  describe('Keywords Generation and Density', () => {
    it('should include relevant financial keywords', async () => {
      const slug = 'invest-30000-monthly-1500-7point5percent-18years-emergency'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 30000,
        monthlyContribution: 1500,
        annualReturn: 0.075,
        timeHorizon: 18,
        goal: 'emergency',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('emergency')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      const keywords = String(metadata.keywords).toLowerCase()
      expect(keywords).toContain('invest')
      expect(keywords).toContain('30000')
      expect(keywords).toContain('monthly')
      expect(keywords).toContain('1500')
      expect(keywords).toContain('return')
      expect(keywords).toContain('18 year')
      expect(keywords).toContain('emergency')
      expect(keywords).toContain('investment calculator')
    })

    it('should maintain appropriate keyword density', async () => {
      const slug = 'invest-40000-monthly-2500-8point5percent-22years-wealth'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 40000,
        monthlyContribution: 2500,
        annualReturn: 0.085,
        timeHorizon: 22,
        goal: 'wealth',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('wealth')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      const keywordList = String(metadata.keywords)
        .split(',')
        .map((k) => k.trim())
      expect(keywordList.length).toBeGreaterThan(5)
      expect(keywordList.length).toBeLessThan(15)
    })
  })

  describe('Fallback Behavior', () => {
    it('should provide generic fallback when slug is invalid', async () => {
      mockParseSlugToScenario.mockReturnValue(null)

      const metadata = await generateMetadata({
        params: { locale: 'en', slug: 'invalid-slug-format' },
      })

      expect(metadata.title).toBe(
        'Investment Scenario Calculator - Future Value Analysis'
      )
      expect(metadata.description).toContain('investment scenario')
      expect(metadata.keywords).toContain('investment calculator')
    })

    it('should handle different locales appropriately', async () => {
      const slug = 'invest-15000-monthly-750-6point5percent-12years-vacation'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 15000,
        monthlyContribution: 750,
        annualReturn: 0.065,
        timeHorizon: 12,
        goal: 'vacation',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('vacation')

      const metadata = await generateMetadata({
        params: { locale: 'es', slug },
      })

      expect(metadata.openGraph?.locale).toBe('es')
      expect(metadata.title).toBeDefined()
      expect(metadata.description).toBeDefined()
    })
  })

  describe('OpenGraph and Twitter Metadata', () => {
    it('should include proper OpenGraph and Twitter metadata', async () => {
      const slug = 'invest-0-monthly-500-7percent-15years-starter'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 0,
        monthlyContribution: 500,
        annualReturn: 0.07,
        timeHorizon: 15,
        goal: 'starter',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('starter')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph?.title).toBeDefined()
      expect(metadata.openGraph?.description).toBeDefined()
      expect(metadata.openGraph?.locale).toBe('en')

      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter?.title).toBeDefined()
      expect(metadata.twitter?.description).toBeDefined()
    })
  })

  describe('Edge Cases', () => {
    it('should handle high return rates properly', async () => {
      const slug = 'invest-20000-monthly-1000-15percent-10years-wealth'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 20000,
        monthlyContribution: 1000,
        annualReturn: 0.15,
        timeHorizon: 10,
        goal: 'wealth',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('wealth')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.title).toContain('15%')
      expect(metadata.description).toContain('15%')
    })

    it('should handle long time horizons properly', async () => {
      const slug = 'invest-10000-monthly-800-6percent-40years-retirement'

      mockParseSlugToScenario.mockReturnValue({
        initialAmount: 10000,
        monthlyContribution: 800,
        annualReturn: 0.06,
        timeHorizon: 40,
        goal: 'retirement',
        slug,
      })
      mockDetectInvestmentGoal.mockReturnValue('retirement')

      const metadata = await generateMetadata({
        params: { locale: 'en', slug },
      })

      expect(metadata.title).toContain('40 Year')
      expect(metadata.description).toContain('40 years')
    })
  })
})
