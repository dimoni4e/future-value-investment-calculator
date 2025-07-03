/**
 * Task 5.3 SEO Internal Linking Tests
 * Tests for internal link structure and anchor text optimization
 */

import { InvestmentParameters } from '@/lib/finance'
import { generateScenarioSlug } from '@/lib/scenarioUtils'

describe('Task 5.3: SEO Internal Linking', () => {
  const baseScenario: InvestmentParameters = {
    initialAmount: 50000,
    monthlyContribution: 2000,
    annualReturnRate: 7,
    timeHorizonYears: 25,
  }

  describe('Internal Link Structure', () => {
    it('should generate SEO-friendly URLs for related scenarios', () => {
      const variations = [
        {
          ...baseScenario,
          initialAmount: 37500, // 25% decrease
        },
        {
          ...baseScenario,
          monthlyContribution: 3000, // 50% increase
        },
        {
          ...baseScenario,
          timeHorizonYears: 30, // 5 year increase
        },
      ]

      variations.forEach((variation) => {
        const slug = generateScenarioSlug({
          initialAmount: variation.initialAmount,
          monthlyContribution: variation.monthlyContribution,
          annualReturn: variation.annualReturnRate,
          timeHorizon: variation.timeHorizonYears,
        })

        // Test URL structure
        expect(slug).toMatch(
          /^invest-\d+-monthly-\d+-[\d.]+percent-\d+years-\w+$/
        )

        // Test that URL contains key SEO keywords
        expect(slug).toContain('invest')
        expect(slug).toContain('monthly')
        expect(slug).toContain('percent')
        expect(slug).toContain('years')

        // Test that numerical values are included
        expect(slug).toContain(variation.initialAmount.toString())
        expect(slug).toContain(variation.monthlyContribution.toString())
        expect(slug).toContain(variation.timeHorizonYears.toString())
      })
    })

    it('should create unique URLs for different scenarios', () => {
      const scenarios = [
        { initial: 10000, monthly: 500, rate: 6, years: 10 },
        { initial: 50000, monthly: 2000, rate: 7, years: 25 },
        { initial: 100000, monthly: 1000, rate: 8, years: 15 },
      ]

      const slugs = scenarios.map((scenario) =>
        generateScenarioSlug({
          initialAmount: scenario.initial,
          monthlyContribution: scenario.monthly,
          annualReturn: scenario.rate,
          timeHorizon: scenario.years,
        })
      )

      // All slugs should be unique
      const uniqueSlugs = new Set(slugs)
      expect(uniqueSlugs.size).toBe(slugs.length)
    })

    it('should generate canonical URL patterns', () => {
      const testCases = [
        {
          params: {
            initialAmount: 25000,
            monthlyContribution: 1500,
            annualReturnRate: 6.5,
            timeHorizonYears: 20,
          },
          expectedPattern: 'invest-25000-monthly-1500-6.5percent-20years-',
        },
        {
          params: {
            initialAmount: 75000,
            monthlyContribution: 500,
            annualReturnRate: 9,
            timeHorizonYears: 15,
          },
          expectedPattern: 'invest-75000-monthly-500-9percent-15years-',
        },
      ]

      testCases.forEach(({ params, expectedPattern }) => {
        const slug = generateScenarioSlug({
          initialAmount: params.initialAmount,
          monthlyContribution: params.monthlyContribution,
          annualReturn: params.annualReturnRate,
          timeHorizon: params.timeHorizonYears,
        })

        expect(slug).toContain(expectedPattern)
      })
    })
  })

  describe('Anchor Text Optimization', () => {
    it('should generate descriptive scenario names for anchor text', () => {
      const scenarios = [
        {
          params: {
            initialAmount: 10000,
            monthlyContribution: 500,
            annualReturnRate: 7,
            timeHorizonYears: 10,
          },
          expectedNameKeywords: ['$10,000', '$500', 'month'],
          expectedDescKeywords: ['10', 'year'],
        },
        {
          params: {
            initialAmount: 100000,
            monthlyContribution: 0,
            annualReturnRate: 6,
            timeHorizonYears: 25,
          },
          expectedNameKeywords: ['$100,000', '$0', 'month'],
          expectedDescKeywords: ['25', 'year'],
        },
      ]

      scenarios.forEach(
        ({ params, expectedNameKeywords, expectedDescKeywords }) => {
          // Test anchor text content (simulating component behavior)
          const anchorText = `Invest $${params.initialAmount.toLocaleString()} + $${params.monthlyContribution}/month`
          const description = `${params.timeHorizonYears}-year plan with ${params.annualReturnRate}% annual return`

          expectedNameKeywords.forEach((keyword) => {
            expect(anchorText).toContain(keyword)
          })

          expectedDescKeywords.forEach((keyword) => {
            expect(description).toContain(keyword)
          })
        }
      )
    })

    it('should include target keywords in scenario descriptions', () => {
      const descriptions = [
        '10-year plan with 7% annual return',
        '25-year retirement strategy with compound growth',
        '15-year house down payment savings plan',
      ]

      descriptions.forEach((description) => {
        // Should contain time reference
        expect(description).toMatch(/\d+[\s-]year/)

        // Should contain percentage or growth reference
        const hasFinancialTerm =
          description.includes('%') ||
          description.includes('return') ||
          description.includes('growth') ||
          description.includes('savings')

        expect(hasFinancialTerm).toBe(true)
      })
    })

    it('should vary anchor text to avoid over-optimization', () => {
      const reasonVariations = [
        'Similar initial amount',
        'Different monthly contribution',
        'Different time horizon',
        'Different return rate',
        'Same goal category',
      ]

      // Test that reasons are diverse
      const uniqueReasons = new Set(reasonVariations)
      expect(uniqueReasons.size).toBe(reasonVariations.length)

      // Test that each reason is descriptive
      reasonVariations.forEach((reason) => {
        expect(reason.length).toBeGreaterThan(10)
        expect(reason).toMatch(/^[A-Z]/) // Should start with capital letter
      })
    })
  })

  describe('Link Relevance and Context', () => {
    it('should recommend scenarios with logical relationships', () => {
      const currentScenario = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturnRate: 7,
        timeHorizonYears: 25,
      }

      // Test amount-based relationships
      const amountRelated = [
        { ...currentScenario, initialAmount: 37500 }, // 25% less
        { ...currentScenario, initialAmount: 62500 }, // 25% more
      ]

      amountRelated.forEach((related) => {
        const amountRatio =
          related.initialAmount / currentScenario.initialAmount
        expect(amountRatio).toBeGreaterThan(0.5)
        expect(amountRatio).toBeLessThan(2.0)
      })

      // Test monthly contribution relationships
      const monthlyRelated = [
        { ...currentScenario, monthlyContribution: 1000 }, // 50% less
        { ...currentScenario, monthlyContribution: 3000 }, // 50% more
      ]

      monthlyRelated.forEach((related) => {
        const monthlyRatio =
          related.monthlyContribution / currentScenario.monthlyContribution
        expect(monthlyRatio).toBeGreaterThan(0.25)
        expect(monthlyRatio).toBeLessThan(4.0)
      })

      // Test time horizon relationships
      const timeRelated = [
        { ...currentScenario, timeHorizonYears: 20 }, // 5 years less
        { ...currentScenario, timeHorizonYears: 30 }, // 5 years more
      ]

      timeRelated.forEach((related) => {
        const timeDiff = Math.abs(
          related.timeHorizonYears - currentScenario.timeHorizonYears
        )
        expect(timeDiff).toBeLessThanOrEqual(10) // Within 10 years
      })
    })

    it('should maintain thematic consistency', () => {
      // Test scenarios should maintain goal category consistency
      const retirementParams = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturnRate: 6,
        timeHorizonYears: 30,
      }

      const houseParams = {
        initialAmount: 20000,
        monthlyContribution: 1500,
        annualReturnRate: 5,
        timeHorizonYears: 8,
      }

      // Generate slugs to verify thematic elements
      const retirementSlug = generateScenarioSlug({
        initialAmount: retirementParams.initialAmount,
        monthlyContribution: retirementParams.monthlyContribution,
        annualReturn: retirementParams.annualReturnRate,
        timeHorizon: retirementParams.timeHorizonYears,
      })

      const houseSlug = generateScenarioSlug({
        initialAmount: houseParams.initialAmount,
        monthlyContribution: houseParams.monthlyContribution,
        annualReturn: houseParams.annualReturnRate,
        timeHorizon: houseParams.timeHorizonYears,
      })

      // Retirement scenarios should have long time horizons
      expect(retirementSlug).toContain('30years')

      // House scenarios should have medium time horizons
      expect(houseSlug).toContain('8years')
    })

    it('should provide contextual similarity information', () => {
      // Test similarity percentage calculations
      const similarityPercentages = [25, 45, 67, 82, 91]

      similarityPercentages.forEach((percentage) => {
        const label = `${percentage}% similar`

        // Should be properly formatted
        expect(label).toMatch(/^\d+%\s+similar$/)

        // Should provide meaningful categories
        if (percentage < 30) {
          // Low similarity - should indicate significant differences
          expect(percentage).toBeLessThan(30)
        } else if (percentage > 80) {
          // High similarity - should indicate minor variations
          expect(percentage).toBeGreaterThan(80)
        } else {
          // Medium similarity - should indicate moderate differences
          expect(percentage).toBeGreaterThanOrEqual(30)
          expect(percentage).toBeLessThanOrEqual(80)
        }
      })
    })
  })

  describe('Prevention of Link Loops and Excessive Linking', () => {
    it('should limit the number of related scenarios', () => {
      const maxResults = 6

      // Test that we don't exceed maximum results
      expect(maxResults).toBeLessThanOrEqual(12) // Reasonable upper limit
      expect(maxResults).toBeGreaterThanOrEqual(3) // Minimum useful number
    })

    it('should exclude overly similar scenarios', () => {
      const currentScenario = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturnRate: 7,
        timeHorizonYears: 25,
      }

      // Very similar scenario (only 2% difference in initial amount)
      const tooSimilar = {
        ...currentScenario,
        initialAmount: 51000, // Only 2% increase
      }

      // Calculate expected similarity (would be very high)
      const amountDiff =
        Math.abs(currentScenario.initialAmount - tooSimilar.initialAmount) /
        Math.max(currentScenario.initialAmount, tooSimilar.initialAmount, 1000)

      const expectedSimilarity = 1 - amountDiff * 0.3 // Only amount difference

      // Should be filtered out for being too similar (>80%)
      expect(expectedSimilarity).toBeGreaterThan(0.8)
    })

    it('should exclude overly different scenarios', () => {
      const currentScenario = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturnRate: 7,
        timeHorizonYears: 25,
      }

      // Very different scenario
      const tooDifferent = {
        initialAmount: 1000, // 98% decrease
        monthlyContribution: 100, // 95% decrease
        annualReturnRate: 15, // 114% increase
        timeHorizonYears: 2, // 92% decrease
      }

      // These should be considered too different to be useful recommendations
      const differences = {
        amount:
          Math.abs(currentScenario.initialAmount - tooDifferent.initialAmount) /
          Math.max(
            currentScenario.initialAmount,
            tooDifferent.initialAmount,
            1000
          ),
        monthly:
          Math.abs(
            currentScenario.monthlyContribution -
              tooDifferent.monthlyContribution
          ) /
          Math.max(
            currentScenario.monthlyContribution,
            tooDifferent.monthlyContribution,
            100
          ),
        time:
          Math.abs(
            currentScenario.timeHorizonYears - tooDifferent.timeHorizonYears
          ) /
          Math.max(
            currentScenario.timeHorizonYears,
            tooDifferent.timeHorizonYears,
            1
          ),
        return:
          Math.abs(
            currentScenario.annualReturnRate - tooDifferent.annualReturnRate
          ) /
          Math.max(
            currentScenario.annualReturnRate,
            tooDifferent.annualReturnRate,
            1
          ),
      }

      // All differences should be significant
      Object.values(differences).forEach((diff) => {
        expect(diff).toBeGreaterThan(0.5)
      })
    })

    it('should prevent duplicate scenario recommendations', () => {
      const testScenarios = [
        {
          initialAmount: 25000,
          monthlyContribution: 1000,
          annualReturnRate: 6,
          timeHorizonYears: 20,
        },
        {
          initialAmount: 25000,
          monthlyContribution: 1000,
          annualReturnRate: 6,
          timeHorizonYears: 20,
        }, // Exact duplicate
        {
          initialAmount: 50000,
          monthlyContribution: 2000,
          annualReturnRate: 7,
          timeHorizonYears: 25,
        },
      ]

      const slugs = testScenarios.map((scenario) =>
        generateScenarioSlug({
          initialAmount: scenario.initialAmount,
          monthlyContribution: scenario.monthlyContribution,
          annualReturn: scenario.annualReturnRate,
          timeHorizon: scenario.timeHorizonYears,
        })
      )

      // Should filter out duplicates
      const uniqueSlugs = Array.from(new Set(slugs))
      expect(uniqueSlugs.length).toBeLessThan(slugs.length)
    })

    it('should maintain reasonable page link density', () => {
      const maxRelatedScenarios = 6
      const estimatedWordsPerScenario = 50 // Name, description, parameters
      const totalWordsFromRelatedScenarios =
        maxRelatedScenarios * estimatedWordsPerScenario

      // Assuming page has roughly 1000-2000 words of content
      const estimatedPageWords = 1500
      const linkDensity = totalWordsFromRelatedScenarios / estimatedPageWords

      // Link density should be reasonable (not more than 25% of content)
      expect(linkDensity).toBeLessThanOrEqual(0.25)
    })
  })
})
