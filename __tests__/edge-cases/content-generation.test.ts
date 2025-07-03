/**
 * @fileoverview Edge Case Tests for Content Generation (Task 8.1)
 *
 * Tests content generation with edge cases including:
 * - Minimum and maximum parameter values
 * - Unusual parameter combinations
 * - Error handling for invalid inputs
 * - Boundary value testing
 * - Performance with extreme values
 */

import {
  generatePersonalizedContent,
  CalculatorInputs,
} from '../../lib/contentGenerator'

describe('Content Generation Edge Cases', () => {
  describe('Minimum Parameter Values', () => {
    test('should handle zero initial amount', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 0,
        monthlyContribution: 100,
        annualReturn: 5,
        timeHorizon: 5,
        goal: 'emergency',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      // Should generate valid content even with zero initial amount
      expect(content.investment_overview).toBeDefined()
      expect(content.investment_overview.length).toBeGreaterThan(100)
      expect(content.growth_projection).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()
      expect(content.optimization_tips).toBeDefined()
      expect(content.market_context).toBeDefined()

      // Should handle zero initial amount gracefully
      expect(content.investment_overview).toContain('$0')
      expect(content.investment_overview).toContain('$100')
    })

    test('should handle minimum monthly contribution', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 1000,
        monthlyContribution: 1,
        annualReturn: 1,
        timeHorizon: 1,
        goal: 'emergency',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.growth_projection).toBeDefined()
      expect(content.investment_insights).toBeDefined()

      // Should handle small amounts appropriately
      expect(content.investment_overview).toContain('$1,000')
      expect(content.investment_overview).toContain('$1')
    })

    test('should handle minimum return rate', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 5000,
        monthlyContribution: 200,
        annualReturn: 0.1,
        timeHorizon: 10,
        goal: 'wealth',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()

      // Should handle very low return rates
      expect(content.investment_overview).toContain('0.1%')
    })

    test('should handle minimum time horizon', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 1,
        goal: 'emergency',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.growth_projection).toBeDefined()

      // Should handle short timeframes appropriately
      expect(content.investment_overview).toContain('1')
    })
  })

  describe('Maximum Parameter Values', () => {
    test('should handle very large initial amounts', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 10000000, // $10M
        monthlyContribution: 50000, // $50K/month
        annualReturn: 15,
        timeHorizon: 50,
        goal: 'wealth',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.growth_projection).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()

      // Should handle large amounts with proper formatting
      expect(content.investment_overview).toMatch(/\$10\.0?M|\$10,000,000/)
      expect(content.investment_overview).toMatch(/\$50\.0?K|\$50,000/)
    })

    test('should handle high return rates', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 20,
        timeHorizon: 30,
        goal: 'wealth',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.investment_insights).toBeDefined()

      // Should handle high return rates
      expect(content.investment_overview).toContain('20%')
    })

    test('should handle very long time horizons', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 15000,
        monthlyContribution: 750,
        annualReturn: 8,
        timeHorizon: 50,
        goal: 'retirement planning',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.growth_projection).toBeDefined()

      // Should handle long timeframes appropriately
      expect(content.investment_overview).toContain('50')
    })
  })

  describe('Unusual Parameter Combinations', () => {
    test('should handle high monthly vs low initial', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 100,
        monthlyContribution: 5000,
        annualReturn: 7,
        timeHorizon: 20,
        goal: 'wealth',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()

      // Should handle this unusual but valid combination
      expect(content.investment_overview).toContain('$100')
      expect(content.investment_overview).toContain('$5,000')
    })

    test('should handle high initial vs zero monthly', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 100000,
        monthlyContribution: 0,
        annualReturn: 6,
        timeHorizon: 15,
        goal: 'wealth',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.optimization_tips).toBeDefined()

      // Should handle lump sum only scenario
      expect(content.investment_overview).toContain('$100,000')
      expect(content.investment_overview).toContain('$0')
    })

    test('should handle conservative goal with aggressive parameters', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 50000,
        monthlyContribution: 3000,
        annualReturn: 15,
        timeHorizon: 5,
        goal: 'emergency',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()

      // Should handle mismatched goal and parameters
      expect(content.investment_overview).toContain('emergency')
      expect(content.investment_overview).toContain('15%')
    })

    test('should handle aggressive goal with conservative parameters', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 1000,
        monthlyContribution: 50,
        annualReturn: 2,
        timeHorizon: 40,
        goal: 'wealth',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.optimization_tips).toBeDefined()

      // Should handle conservative approach to wealth building
      expect(content.investment_overview).toContain('wealth building')
      expect(content.investment_overview).toContain('2%')
    })
  })

  describe('Invalid Input Handling', () => {
    test('should handle negative values gracefully', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: -1000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 20,
        goal: 'retirement planning',
      }

      // Should either handle gracefully or provide meaningful fallback
      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.investment_overview.length).toBeGreaterThan(50)
    })

    test('should handle very large decimal values', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 10000.9999,
        monthlyContribution: 500.5555,
        annualReturn: 7.123456,
        timeHorizon: 20,
        goal: 'retirement planning',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.growth_projection).toBeDefined()

      // Should handle decimal precision appropriately
      expect(content.investment_overview).toMatch(/\$10,000|\$10\.0K/)
      expect(content.investment_overview).toMatch(/\$500|\$501/)
    })

    test('should handle unknown goal types', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 10000,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 20,
        goal: 'unknown_goal_type',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      expect(content.investment_overview).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()

      // Should handle unknown goals with fallback
      expect(content.investment_overview.length).toBeGreaterThan(100)
    })
  })

  describe('Performance with Extreme Values', () => {
    test('should generate content efficiently with complex calculations', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 9999999,
        monthlyContribution: 99999,
        annualReturn: 19.99,
        timeHorizon: 49,
        goal: 'wealth',
      }

      const startTime = Date.now()
      const content = await generatePersonalizedContent(edgeCase, 'en')
      const endTime = Date.now()

      // Should complete within reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000)

      expect(content.investment_overview).toBeDefined()
      expect(content.growth_projection).toBeDefined()
      expect(content.investment_insights).toBeDefined()
      expect(content.strategy_analysis).toBeDefined()
      expect(content.optimization_tips).toBeDefined()
      expect(content.market_context).toBeDefined()
    })

    test('should handle multiple rapid generation calls', async () => {
      const edgeCases = [
        {
          initialAmount: 0,
          monthlyContribution: 1,
          annualReturn: 0.1,
          timeHorizon: 1,
          goal: 'emergency',
        },
        {
          initialAmount: 1000000,
          monthlyContribution: 10000,
          annualReturn: 20,
          timeHorizon: 50,
          goal: 'wealth',
        },
        {
          initialAmount: 5000,
          monthlyContribution: 0,
          annualReturn: 15,
          timeHorizon: 10,
          goal: 'house',
        },
      ]

      const startTime = Date.now()
      const promises = edgeCases.map((params) =>
        generatePersonalizedContent(params, 'en')
      )

      const results = await Promise.all(promises)
      const endTime = Date.now()

      // Should handle multiple calls efficiently
      expect(endTime - startTime).toBeLessThan(10000)

      results.forEach((content) => {
        expect(content.investment_overview).toBeDefined()
        expect(content.growth_projection).toBeDefined()
        expect(content.strategy_analysis).toBeDefined()
      })
    })
  })

  describe('Content Quality with Edge Cases', () => {
    test('should maintain quality standards with extreme parameters', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 999999,
        monthlyContribution: 99999,
        annualReturn: 0.5,
        timeHorizon: 1,
        goal: 'emergency',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      // Should maintain minimum content quality
      Object.values(content).forEach((section) => {
        expect(section).toBeDefined()
        expect(typeof section).toBe('string')
        expect(section.length).toBeGreaterThan(50)

        // Should not contain obvious errors or placeholders
        expect(section).not.toContain('undefined')
        expect(section).not.toContain('NaN')
        expect(section).not.toContain('{{')
        expect(section).not.toContain('}}')
      })
    })

    test('should provide coherent narrative with unusual combinations', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 1,
        monthlyContribution: 10000,
        annualReturn: 25,
        timeHorizon: 2,
        goal: 'retirement planning',
      }

      const content = await generatePersonalizedContent(edgeCase, 'en')

      // Content should be coherent despite unusual parameters
      expect(content.investment_overview).toMatch(
        /investment|dollar|contribution/
      )
      expect(content.strategy_analysis).toMatch(/strategy|approach|plan/)
      expect(content.optimization_tips).toMatch(/optimization|tip|improve/)

      // Should reference the actual parameters
      expect(content.investment_overview).toContain('$1')
      expect(content.investment_overview).toContain('$10,000')
      expect(content.investment_overview).toContain('25%')
      expect(content.investment_overview).toContain('2')
    })
  })

  describe('Cross-Language Edge Case Consistency', () => {
    test('should handle edge cases consistently across languages', async () => {
      const edgeCase: CalculatorInputs = {
        initialAmount: 0,
        monthlyContribution: 99999,
        annualReturn: 0.1,
        timeHorizon: 50,
        goal: 'wealth',
      }

      const locales = ['en', 'es', 'pl']
      const results = await Promise.all(
        locales.map((locale) => generatePersonalizedContent(edgeCase, locale))
      )

      results.forEach((content, index) => {
        const locale = locales[index]

        // Should generate valid content for all languages
        expect(content.investment_overview).toBeDefined()
        expect(content.investment_overview.length).toBeGreaterThan(100)

        // Should contain the same numerical values
        expect(content.investment_overview).toContain('$0')
        expect(content.investment_overview).toContain('$99,999')
        expect(content.investment_overview).toContain('0.1%')
        expect(content.investment_overview).toContain('50')

        // Language-specific content should be present
        if (locale === 'es') {
          expect(content.investment_overview).toMatch(/inversión|contribución/)
        } else if (locale === 'pl') {
          expect(content.investment_overview).toMatch(/inwestycj|składk/)
        } else {
          expect(content.investment_overview).toMatch(/investment|contribution/)
        }
      })
    })
  })
})
