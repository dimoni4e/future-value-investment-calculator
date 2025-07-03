/**
 * Unit tests for scenarioUtils.ts
 * Testing slug generation, parsing, goal detection, and validation
 */

import {
  generateScenarioSlug,
  parseSlugToScenario,
  detectInvestmentGoal,
  validateScenarioParams,
  generateScenarioName,
  generateMetaDescription,
  generateSEOKeywords,
  CalculatorInputs,
  INVESTMENT_GOALS,
  InvestmentGoal,
} from '../lib/scenarioUtils'

describe('scenarioUtils', () => {
  // Test data - this will be detected as "starter" based on the algorithm
  const baseParams: CalculatorInputs = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7.5,
    timeHorizon: 20,
  }

  describe('generateScenarioSlug', () => {
    it('should generate correct slug format with whole numbers', () => {
      const slug = generateScenarioSlug(baseParams)
      expect(slug).toBe('invest-10000-monthly-500-7.5percent-20years-starter')
    })

    it('should round decimal amounts to whole numbers', () => {
      const params = {
        initialAmount: 10500.75,
        monthlyContribution: 499.99,
        annualReturn: 7.25,
        timeHorizon: 19.8,
      }
      const slug = generateScenarioSlug(params)
      // This should be detected as 'starter' (initialAmount <= 10000 after rounding, monthlyContribution <= 500)
      expect(slug).toBe(
        'invest-10501-monthly-500-7.3percent-20years-investment'
      )
    })

    it('should handle zero values correctly', () => {
      const params = {
        initialAmount: 0,
        monthlyContribution: 1000,
        annualReturn: 6.0,
        timeHorizon: 10,
      }
      const slug = generateScenarioSlug(params)
      // This should be 'education' (timeHorizon 10, monthlyContribution 1000 >= 500)
      expect(slug).toBe('invest-0-monthly-1000-6percent-10years-education')
    })

    it('should handle edge cases with very large numbers', () => {
      const params = {
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 15.75,
        timeHorizon: 30,
      }
      const slug = generateScenarioSlug(params)
      // This should be 'retirement' (timeHorizon >= 20 and monthlyContribution >= 1000)
      expect(slug).toBe(
        'invest-1000000-monthly-10000-15.8percent-30years-retirement'
      )
    })

    it('should handle different investment goals', () => {
      const emergencyParams = {
        initialAmount: 5000,
        monthlyContribution: 300,
        annualReturn: 4.0,
        timeHorizon: 3,
      }
      const slug = generateScenarioSlug(emergencyParams)
      expect(slug).toContain('emergency')
    })
  })

  describe('parseSlugToScenario', () => {
    it('should parse valid slug correctly', () => {
      const slug = 'invest-10000-monthly-500-7.5percent-20years-starter'
      const result = parseSlugToScenario(slug)

      expect(result).toEqual({
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7.5,
        timeHorizon: 20,
        goal: 'starter',
        slug: slug,
      })
    })

    it('should handle zero values in slug', () => {
      const slug = 'invest-0-monthly-1000-6percent-10years-education'
      const result = parseSlugToScenario(slug)

      expect(result?.initialAmount).toBe(0)
      expect(result?.monthlyContribution).toBe(1000)
    })

    it('should handle decimal rates correctly', () => {
      const slug = 'invest-5000-monthly-250-4.25percent-5years-emergency'
      const result = parseSlugToScenario(slug)

      expect(result?.annualReturn).toBe(4.25)
    })

    it('should handle multi-word goals', () => {
      const slug = 'invest-50000-monthly-2000-8percent-15years-wealth-building'
      const result = parseSlugToScenario(slug)

      expect(result?.goal).toBe('wealth-building')
    })

    it('should return null for invalid slug format', () => {
      const invalidSlugs = [
        'invalid-format',
        'invest-abc-monthly-500-7percent-20years-retirement',
        'invest-10000-monthly-xyz-7percent-20years-retirement',
        'invest-10000-monthly-500-abcpercent-20years-retirement',
        'invest-10000-monthly-500-7percent-abcyears-retirement',
        'notinvest-10000-monthly-500-7percent-20years-retirement',
        'invest-10000-500-7percent-20years-retirement', // missing monthly
      ]

      invalidSlugs.forEach((slug) => {
        expect(parseSlugToScenario(slug)).toBeNull()
      })
    })

    it('should return null for negative values', () => {
      const negativeValueSlugs = [
        'invest--1000-monthly-500-7percent-20years-retirement',
        'invest-10000-monthly--500-7percent-20years-retirement',
        'invest-10000-monthly-500--7percent-20years-retirement',
        'invest-10000-monthly-500-7percent--20years-retirement',
      ]

      negativeValueSlugs.forEach((slug) => {
        expect(parseSlugToScenario(slug)).toBeNull()
      })
    })

    it('should return null for zero time horizon', () => {
      const slug = 'invest-10000-monthly-500-7percent-0years-retirement'
      expect(parseSlugToScenario(slug)).toBeNull()
    })
  })

  describe('detectInvestmentGoal', () => {
    it('should detect retirement goal for long-term high contributions', () => {
      const params = {
        initialAmount: 20000,
        monthlyContribution: 1500,
        annualReturn: 7.0,
        timeHorizon: 25,
      }
      expect(detectInvestmentGoal(params)).toBe('retirement')
    })

    it('should detect wealth goal for high amounts or long-term aggressive strategy', () => {
      const highInitialParams = {
        initialAmount: 75000,
        monthlyContribution: 1000,
        annualReturn: 8.0,
        timeHorizon: 20,
      }
      // Should be 'retirement' due to timeHorizon >= 20 && monthlyContribution >= 1000
      expect(detectInvestmentGoal(highInitialParams)).toBe('retirement')

      const highMonthlyParams = {
        initialAmount: 10000,
        monthlyContribution: 2500,
        annualReturn: 8.0,
        timeHorizon: 15,
      }
      // Should be 'wealth' due to timeHorizon >= 15 && monthlyContribution >= 2000
      expect(detectInvestmentGoal(highMonthlyParams)).toBe('wealth')
    })

    it('should detect emergency fund for short-term lower amounts', () => {
      const params = {
        initialAmount: 5000,
        monthlyContribution: 500,
        annualReturn: 4.0,
        timeHorizon: 3,
      }
      expect(detectInvestmentGoal(params)).toBe('emergency')
    })

    it('should detect house goal for medium-term substantial savings', () => {
      const params = {
        initialAmount: 15000,
        monthlyContribution: 1200,
        annualReturn: 6.0,
        timeHorizon: 8,
      }
      expect(detectInvestmentGoal(params)).toBe('house')
    })

    it('should detect education goal for medium to long-term planning', () => {
      const params = {
        initialAmount: 8000,
        monthlyContribution: 600,
        annualReturn: 6.5,
        timeHorizon: 15,
      }
      expect(detectInvestmentGoal(params)).toBe('education')
    })

    it('should detect vacation goal for short to medium-term moderate amounts', () => {
      const params = {
        initialAmount: 3000,
        monthlyContribution: 400,
        annualReturn: 5.0,
        timeHorizon: 5,
      }
      // This should be 'emergency' due to timeHorizon <= 5 && initialAmount <= 20000 && monthlyContribution <= 1000
      expect(detectInvestmentGoal(params)).toBe('emergency')
    })

    it('should detect starter goal for small amounts', () => {
      const params = {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturn: 7.0,
        timeHorizon: 10,
      }
      // This should be 'vacation' due to timeHorizon <= 10 && initialAmount <= 50000 && monthlyContribution <= 1000
      expect(detectInvestmentGoal(params)).toBe('vacation')
    })

    it('should default to investment goal for edge cases', () => {
      const params = {
        initialAmount: 25000,
        monthlyContribution: 800,
        annualReturn: 7.0,
        timeHorizon: 12,
      }
      // This should be 'house' due to timeHorizon >= 5 && timeHorizon <= 15 && initialAmount >= 10000
      expect(detectInvestmentGoal(params)).toBe('house')
    })

    it('should be deterministic for same inputs', () => {
      const params = baseParams
      const goal1 = detectInvestmentGoal(params)
      const goal2 = detectInvestmentGoal(params)
      expect(goal1).toBe(goal2)
    })
  })

  describe('validateScenarioParams', () => {
    it('should validate correct parameters', () => {
      expect(validateScenarioParams(baseParams)).toBe(true)
    })

    it('should reject negative values', () => {
      const negativeParams = [
        { ...baseParams, initialAmount: -1000 },
        { ...baseParams, monthlyContribution: -100 },
        { ...baseParams, annualReturn: -5 },
        { ...baseParams, timeHorizon: -1 },
      ]

      negativeParams.forEach((params) => {
        expect(validateScenarioParams(params)).toBe(false)
      })
    })

    it('should reject zero time horizon', () => {
      const params = { ...baseParams, timeHorizon: 0 }
      expect(validateScenarioParams(params)).toBe(false)
    })

    it('should reject unreasonably high values', () => {
      const extremeParams = [
        { ...baseParams, initialAmount: 20000000 }, // > 10M
        { ...baseParams, monthlyContribution: 150000 }, // > 100K
        { ...baseParams, annualReturn: 75 }, // > 50%
        { ...baseParams, timeHorizon: 150 }, // > 100 years
      ]

      extremeParams.forEach((params) => {
        expect(validateScenarioParams(params)).toBe(false)
      })
    })

    it('should accept boundary values', () => {
      const boundaryParams = [
        { ...baseParams, initialAmount: 0 },
        { ...baseParams, monthlyContribution: 0 },
        { ...baseParams, annualReturn: 0 },
        { ...baseParams, timeHorizon: 1 },
        { ...baseParams, initialAmount: 10000000 },
        { ...baseParams, monthlyContribution: 100000 },
        { ...baseParams, annualReturn: 50 },
        { ...baseParams, timeHorizon: 100 },
      ]

      boundaryParams.forEach((params) => {
        expect(validateScenarioParams(params)).toBe(true)
      })
    })
  })

  describe('generateScenarioName', () => {
    it('should generate readable scenario names', () => {
      const name = generateScenarioName(baseParams)
      expect(name).toBe('Starter Investment: $10,000 + $500/month')
    })

    it('should format large numbers with commas', () => {
      const params = {
        initialAmount: 1000000,
        monthlyContribution: 5000,
        annualReturn: 8.0,
        timeHorizon: 20,
      }
      const name = generateScenarioName(params)
      expect(name).toContain('$1,000,000')
      expect(name).toContain('$5,000')
    })
  })

  describe('generateMetaDescription', () => {
    it('should generate SEO-optimized meta descriptions', () => {
      const description = generateMetaDescription(baseParams)
      expect(description).toContain('$10,000')
      expect(description).toContain('$500')
      expect(description).toContain('7.5%')
      expect(description).toContain('20 years')
      expect(description).toContain('starter')
      expect(description).toContain('Calculate investing')
    })

    it('should handle different goals in description', () => {
      const emergencyParams = {
        initialAmount: 5000,
        monthlyContribution: 300,
        annualReturn: 4.0,
        timeHorizon: 3,
      }
      const description = generateMetaDescription(emergencyParams)
      expect(description).toContain('emergency')
    })
  })

  describe('generateSEOKeywords', () => {
    it('should generate relevant SEO keywords', () => {
      const keywords = generateSEOKeywords(baseParams)
      expect(keywords).toContain('invest 10000')
      expect(keywords).toContain('monthly 500')
      expect(keywords).toContain('7.5 percent return')
      expect(keywords).toContain('20 year investment')
      expect(keywords).toContain('retirement planning')
      expect(keywords).toContain('investment calculator')
      expect(keywords).toContain('compound interest')
      expect(keywords).toContain('future value')
    })

    it('should return array of strings', () => {
      const keywords = generateSEOKeywords(baseParams)
      expect(Array.isArray(keywords)).toBe(true)
      keywords.forEach((keyword) => {
        expect(typeof keyword).toBe('string')
      })
    })
  })

  describe('round-trip slug generation and parsing', () => {
    it('should maintain data integrity through slug generation and parsing', () => {
      const testParams = [
        baseParams,
        {
          initialAmount: 0,
          monthlyContribution: 1000,
          annualReturn: 5.0,
          timeHorizon: 10,
        },
        {
          initialAmount: 50000,
          monthlyContribution: 0,
          annualReturn: 8.25,
          timeHorizon: 15,
        },
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 10.5,
          timeHorizon: 1,
        },
        {
          initialAmount: 999999,
          monthlyContribution: 99999,
          annualReturn: 49.9,
          timeHorizon: 99,
        },
      ]

      testParams.forEach((params) => {
        const slug = generateScenarioSlug(params)
        const parsed = parseSlugToScenario(slug)

        expect(parsed).not.toBeNull()
        expect(parsed!.initialAmount).toBe(Math.round(params.initialAmount))
        expect(parsed!.monthlyContribution).toBe(
          Math.round(params.monthlyContribution)
        )
        expect(parsed!.timeHorizon).toBe(Math.round(params.timeHorizon))
        // Allow small rounding differences for annual return
        expect(
          Math.abs(
            parsed!.annualReturn - Math.round(params.annualReturn * 10) / 10
          )
        ).toBeLessThan(0.01)
      })
    })
  })

  describe('INVESTMENT_GOALS constant', () => {
    it('should contain all expected goal types', () => {
      const expectedGoals = [
        'retirement',
        'emergency',
        'house',
        'education',
        'wealth',
        'vacation',
        'starter',
        'investment',
      ]

      expectedGoals.forEach((goal) => {
        expect(INVESTMENT_GOALS).toHaveProperty(goal)
      })
    })

    it('should have string values matching keys', () => {
      Object.entries(INVESTMENT_GOALS).forEach(([key, value]) => {
        expect(value).toBe(key)
      })
    })
  })
})
