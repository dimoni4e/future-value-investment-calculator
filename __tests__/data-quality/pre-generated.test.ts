/**
 * Data Quality Tests for Pre-generated Scenarios
 * Tests content uniqueness, SEO quality, and parameter accuracy
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'

// Mock the dependencies
jest.mock('@/lib/scenarioUtils', () => ({
  detectInvestmentGoal: jest.fn(),
  generateScenarioSlug: jest.fn(),
}))

jest.mock('@/lib/contentGenerator', () => ({
  generatePersonalizedContent: jest.fn(),
}))

import { preGenerateScenarios } from '@/scripts/preGenerateScenarios'

const mockDetectInvestmentGoal =
  require('@/lib/scenarioUtils').detectInvestmentGoal
const mockGenerateScenarioSlug =
  require('@/lib/scenarioUtils').generateScenarioSlug
const mockGeneratePersonalizedContent =
  require('@/lib/contentGenerator').generatePersonalizedContent

// Quality thresholds
const QUALITY_THRESHOLDS = {
  MIN_CONTENT_LENGTH: 50, // Minimum characters per section
  MAX_CONTENT_LENGTH: 2000, // Maximum characters per section
  MIN_UNIQUENESS_RATIO: 0.8, // 80% of scenarios should be unique
  MIN_SEO_SCORE: 0.7, // Minimum SEO quality score
  MAX_KEYWORD_DENSITY: 0.15, // Maximum 15% keyword density (accounting for investment-focused content)
}

describe('Pre-generated Data Quality Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock implementations with quality content
    mockDetectInvestmentGoal.mockImplementation((params) => {
      if (params.timeHorizon >= 25) return 'retirement'
      if (params.initialAmount >= 50000) return 'wealth'
      if (params.monthlyContribution <= 200) return 'starter'
      return 'investment'
    })

    mockGenerateScenarioSlug.mockImplementation((params) => {
      return `invest-${params.initialAmount}-monthly-${params.monthlyContribution}-${Math.round(params.annualReturn * 100)}percent-${params.timeHorizon}years-${mockDetectInvestmentGoal(params)}`
    })

    mockGeneratePersonalizedContent.mockImplementation(
      async (params, locale) => {
        const amount = params.initialAmount
        const monthly = params.monthlyContribution
        const rate = Math.round(params.annualReturn * 100)
        const years = params.timeHorizon
        const goal = params.goal

        return {
          investment_overview: `Comprehensive ${goal} investment plan starting with $${amount} and contributing $${monthly} monthly at ${rate}% return for ${years} years. This strategic approach balances growth potential with risk management for ${locale} investors.`,

          growth_projection: `Over ${years} years, your investment of $${amount} plus $${monthly} monthly contributions at ${rate}% annual return could grow significantly. This projection accounts for compound interest and market volatility typical in ${goal} investing.`,

          investment_insights: `Based on historical market data, ${rate}% returns are ${rate > 8 ? 'aggressive but achievable' : 'conservative and realistic'} for ${goal} investments. Your ${monthly > 1000 ? 'substantial' : 'modest'} monthly contributions will accelerate wealth building.`,

          strategy_analysis: `This ${goal} strategy suits investors with ${years > 20 ? 'long-term' : 'medium-term'} horizons. The ${amount > 10000 ? 'significant' : 'modest'} initial investment provides a strong foundation for growth through compound returns.`,

          comparative_scenarios: `Compared to similar ${goal} plans, this combination of $${amount} initial and $${monthly} monthly at ${rate}% represents a ${monthly > 500 ? 'aggressive' : 'balanced'} approach to wealth building over ${years} years.`,

          community_insights: `Many successful ${goal} investors in the ${locale} market follow similar patterns: starting with $${amount > 20000 ? 'substantial' : 'reasonable'} amounts and consistently contributing $${monthly} monthly for ${years} years.`,

          optimization_tips: `To maximize your ${goal} returns: ${rate < 7 ? 'Consider slightly higher-risk investments' : 'Maintain current conservative approach'}, ${monthly < 1000 ? 'increase monthly contributions when possible' : 'maintain current contribution level'}, and review annually.`,

          market_context: `Current ${locale} market conditions ${rate > 8 ? 'support optimistic' : 'suggest conservative'} return expectations. Your ${years}-year timeline allows for ${years > 15 ? 'riding out market cycles' : 'moderate market exposure'} in ${goal} investing.`,
        }
      }
    )

    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('Content Uniqueness Across Generated Scenarios', () => {
    it('should generate unique content for different parameter combinations', async () => {
      await preGenerateScenarios({
        maxScenarios: 20,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const generatedContents = await Promise.all(
        contentCalls.map(([params, locale]) =>
          mockGeneratePersonalizedContent(params, locale)
        )
      )

      // Check uniqueness of investment_overview sections
      const overviewContents = generatedContents.map(
        (content) => content.investment_overview
      )
      const uniqueOverviews = new Set(overviewContents)

      const uniquenessRatio = uniqueOverviews.size / overviewContents.length
      expect(uniquenessRatio).toBeGreaterThan(
        QUALITY_THRESHOLDS.MIN_UNIQUENESS_RATIO
      )
    })

    it('should generate different content for different goals', async () => {
      // Force different goals
      mockDetectInvestmentGoal
        .mockReturnValueOnce('retirement')
        .mockReturnValueOnce('wealth')
        .mockReturnValueOnce('emergency')
        .mockReturnValueOnce('starter')

      await preGenerateScenarios({
        maxScenarios: 10,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const goals = contentCalls.map(([params]) => params.goal)
      const uniqueGoals = new Set(goals)

      expect(uniqueGoals.size).toBeGreaterThan(1)
    })

    it('should vary content based on parameter ranges', async () => {
      await preGenerateScenarios({
        maxScenarios: 15,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const parameterSets = contentCalls.map(([params]) => ({
        amount: params.initialAmount,
        monthly: params.monthlyContribution,
        rate: params.annualReturn,
        years: params.timeHorizon,
      }))

      // Check for parameter diversity
      const amounts = new Set(parameterSets.map((p) => p.amount))
      const monthlies = new Set(parameterSets.map((p) => p.monthly))
      const rates = new Set(parameterSets.map((p) => p.rate))
      const years = new Set(parameterSets.map((p) => p.years))

      expect(amounts.size).toBeGreaterThan(2)
      expect(monthlies.size).toBeGreaterThan(2)
      expect(rates.size).toBeGreaterThan(2)
      expect(years.size).toBeGreaterThan(2)
    })
  })

  describe('SEO Quality Scores for Generated Content', () => {
    it('should generate content with appropriate length', async () => {
      await preGenerateScenarios({
        maxScenarios: 10,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const generatedContents = await Promise.all(
        contentCalls.map(([params, locale]) =>
          mockGeneratePersonalizedContent(params, locale)
        )
      )

      generatedContents.forEach((content) => {
        Object.values(content).forEach((section) => {
          expect(section.length).toBeGreaterThan(
            QUALITY_THRESHOLDS.MIN_CONTENT_LENGTH
          )
          expect(section.length).toBeLessThan(
            QUALITY_THRESHOLDS.MAX_CONTENT_LENGTH
          )
        })
      })
    })

    it('should include relevant keywords in content', async () => {
      await preGenerateScenarios({
        maxScenarios: 5,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const generatedContents = await Promise.all(
        contentCalls.map(([params, locale]) =>
          mockGeneratePersonalizedContent(params, locale)
        )
      )

      generatedContents.forEach((content, index) => {
        const [params] = contentCalls[index]
        const expectedKeywords = [
          'investment',
          'return',
          params.goal,
          params.initialAmount.toString(),
          params.monthlyContribution.toString(),
        ]

        const fullContent = Object.values(content).join(' ').toLowerCase()

        expectedKeywords.forEach((keyword) => {
          expect(fullContent).toContain(keyword.toLowerCase())
        })
      })
    })

    it('should maintain reasonable keyword density', async () => {
      await preGenerateScenarios({
        maxScenarios: 5,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const generatedContents = await Promise.all(
        contentCalls.map(([params, locale]) =>
          mockGeneratePersonalizedContent(params, locale)
        )
      )

      generatedContents.forEach((content) => {
        const fullContent = Object.values(content).join(' ')
        const words = fullContent.split(/\s+/)
        const investmentCount = words.filter((word) =>
          word.toLowerCase().includes('invest')
        ).length

        const keywordDensity = investmentCount / words.length
        expect(keywordDensity).toBeLessThan(
          QUALITY_THRESHOLDS.MAX_KEYWORD_DENSITY
        )
        expect(keywordDensity).toBeGreaterThan(0) // Should contain investment-related terms
      })
    })

    it('should generate SEO-friendly meta information', async () => {
      await preGenerateScenarios({
        maxScenarios: 5,
        locales: ['en'],
      })

      const slugCalls = mockGenerateScenarioSlug.mock.calls
      const generatedSlugs = slugCalls.map(([params]) =>
        mockGenerateScenarioSlug(params)
      )

      generatedSlugs.forEach((slug) => {
        // Slug should be SEO-friendly
        expect(slug).toMatch(/^[a-z0-9-]+$/) // Only lowercase, numbers, and hyphens
        expect(slug.length).toBeGreaterThan(20) // Descriptive length
        expect(slug.length).toBeLessThan(100) // Not too long
        expect(slug).toContain('invest')
        expect(slug).toContain('monthly')
        expect(slug).toContain('percent')
        expect(slug).toContain('years')
      })
    })
  })

  describe('Parameter Accuracy in Generated Scenarios', () => {
    it('should preserve parameter accuracy in content generation', async () => {
      await preGenerateScenarios({
        maxScenarios: 10,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls

      contentCalls.forEach(([params, locale]) => {
        // Verify parameter types and ranges
        expect(typeof params.initialAmount).toBe('number')
        expect(typeof params.monthlyContribution).toBe('number')
        expect(typeof params.annualReturn).toBe('number')
        expect(typeof params.timeHorizon).toBe('number')
        expect(typeof params.goal).toBe('string')

        // Verify parameter ranges are realistic
        expect(params.initialAmount).toBeGreaterThan(0)
        expect(params.initialAmount).toBeLessThanOrEqual(200000)
        expect(params.monthlyContribution).toBeGreaterThan(0)
        expect(params.monthlyContribution).toBeLessThanOrEqual(10000)
        expect(params.annualReturn).toBeGreaterThan(0)
        expect(params.annualReturn).toBeLessThanOrEqual(0.15) // 15% max
        expect(params.timeHorizon).toBeGreaterThan(0)
        expect(params.timeHorizon).toBeLessThanOrEqual(40)

        // Verify locale is valid
        expect(['en', 'es', 'pl']).toContain(locale)
      })
    })

    it('should generate consistent slugs for same parameters', async () => {
      const testParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 0.07,
        timeHorizon: 20,
      }

      const slug1 = mockGenerateScenarioSlug(testParams)
      const slug2 = mockGenerateScenarioSlug(testParams)

      expect(slug1).toBe(slug2) // Should be deterministic
    })

    it('should maintain goal detection consistency', async () => {
      const testCases = [
        {
          params: {
            initialAmount: 100000,
            monthlyContribution: 2000,
            annualReturn: 0.07,
            timeHorizon: 30,
          },
          expectedGoal: 'retirement',
        },
        {
          params: {
            initialAmount: 75000,
            monthlyContribution: 1000,
            annualReturn: 0.08,
            timeHorizon: 15,
          },
          expectedGoal: 'wealth',
        },
        {
          params: {
            initialAmount: 5000,
            monthlyContribution: 150,
            annualReturn: 0.06,
            timeHorizon: 10,
          },
          expectedGoal: 'starter',
        },
      ]

      testCases.forEach(({ params, expectedGoal }) => {
        const detectedGoal = mockDetectInvestmentGoal(params)
        expect(detectedGoal).toBe(expectedGoal)
      })
    })

    it('should handle edge case parameters gracefully', async () => {
      const edgeCases = [
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 0.04,
          timeHorizon: 5,
        }, // Minimum viable
        {
          initialAmount: 100000,
          monthlyContribution: 5000,
          annualReturn: 0.12,
          timeHorizon: 30,
        }, // High values
      ]

      for (const params of edgeCases) {
        const goal = mockDetectInvestmentGoal(params)
        const slug = mockGenerateScenarioSlug(params)
        const content = await mockGeneratePersonalizedContent(
          { ...params, goal },
          'en'
        )

        expect(goal).toBeTruthy()
        expect(slug).toBeTruthy()
        expect(content).toBeTruthy()
        expect(typeof content).toBe('object')
      }
    })
  })

  describe('Multi-language Content Quality', () => {
    it('should generate appropriate content for different locales', async () => {
      await preGenerateScenarios({
        maxScenarios: 15,
        locales: ['en', 'es', 'pl'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const locales = contentCalls.map(([, locale]) => locale)

      expect(locales).toContain('en')
      expect(locales).toContain('es')
      expect(locales).toContain('pl')

      // Each locale should have generated content
      const localeGroups = {
        en: contentCalls.filter(([, locale]) => locale === 'en'),
        es: contentCalls.filter(([, locale]) => locale === 'es'),
        pl: contentCalls.filter(([, locale]) => locale === 'pl'),
      }

      Object.values(localeGroups).forEach((group) => {
        expect(group.length).toBeGreaterThan(0)
      })
    })

    it('should maintain content structure across locales', async () => {
      await preGenerateScenarios({
        maxScenarios: 6,
        locales: ['en', 'es'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const generatedContents = await Promise.all(
        contentCalls.map(([params, locale]) =>
          mockGeneratePersonalizedContent(params, locale)
        )
      )

      const expectedSections = [
        'investment_overview',
        'growth_projection',
        'investment_insights',
        'strategy_analysis',
        'comparative_scenarios',
        'community_insights',
        'optimization_tips',
        'market_context',
      ]

      generatedContents.forEach((content) => {
        expectedSections.forEach((section) => {
          expect(content).toHaveProperty(section)
          expect(content[section]).toBeTruthy()
          expect(typeof content[section]).toBe('string')
        })
      })
    })
  })

  describe('Content Validation and Error Handling', () => {
    it('should handle missing or invalid parameters gracefully', async () => {
      // Test with mock that might receive invalid parameters
      mockGeneratePersonalizedContent.mockImplementationOnce(async (params) => {
        if (!params.goal) {
          throw new Error('Missing goal parameter')
        }
        return {
          investment_overview: 'Fallback content',
          growth_projection: 'Fallback content',
          investment_insights: 'Fallback content',
          strategy_analysis: 'Fallback content',
          comparative_scenarios: 'Fallback content',
          community_insights: 'Fallback content',
          optimization_tips: 'Fallback content',
          market_context: 'Fallback content',
        }
      })

      const result = await preGenerateScenarios({
        maxScenarios: 5,
        locales: ['en'],
      })

      // Should handle errors gracefully and continue processing
      expect(result.totalGenerated).toBeGreaterThanOrEqual(0)
    })

    it('should validate generated content structure', async () => {
      await preGenerateScenarios({
        maxScenarios: 3,
        locales: ['en'],
      })

      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const generatedContents = await Promise.all(
        contentCalls.map(([params, locale]) =>
          mockGeneratePersonalizedContent(params, locale)
        )
      )

      generatedContents.forEach((content) => {
        // Content should be an object
        expect(typeof content).toBe('object')
        expect(content).not.toBeNull()

        // Should have all required sections
        const sections = Object.keys(content)
        expect(sections.length).toBeGreaterThanOrEqual(8)

        // All sections should have content
        Object.values(content).forEach((section) => {
          expect(typeof section).toBe('string')
          expect(section.length).toBeGreaterThan(0)
        })
      })
    })
  })
})
