/**
 * Strategy Analysis Template Tests
 */

import { generatePersonalizedContent } from '@/lib/contentGenerator'

const mockCalculatorInputs = {
  initialAmount: 10000,
  monthlyContribution: 500,
  timeHorizon: 20,
  annualReturn: 8,
  inflationRate: 3,
  goal: 'retirement',
}

const mockLocales = ['en', 'es', 'pl']

describe('Strategy Analysis Template', () => {
  describe('Template Content Generation', () => {
    test('should generate strategy analysis content for each locale', async () => {
      for (const locale of mockLocales) {
        const content = generatePersonalizedContent(
          mockCalculatorInputs,
          locale
        )

        expect(content.strategy_analysis).toBeDefined()
        expect(content.strategy_analysis.length).toBeGreaterThan(500)
        expect(content.strategy_analysis).toContain('<h2>')
        expect(content.strategy_analysis).toContain('</h2>')
      }
    })

    test('should include goal-specific strategy information', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should mention the specific goal
      expect(content.strategy_analysis).toContain('retirement')
      expect(content.strategy_analysis).toContain('Strategic Analysis for Your')
      expect(content.strategy_analysis).toContain('20 years')
    })

    test('should include asset allocation recommendations', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should contain asset allocation information
      expect(content.strategy_analysis).toContain(
        'Asset Allocation Recommendations'
      )
      expect(content.strategy_analysis).toContain('% stocks')
      expect(content.strategy_analysis).toContain('% bonds')
      expect(content.strategy_analysis).toContain('% alternative')
    })

    test('should include time-based strategy adjustments', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should discuss time-based approach
      expect(content.strategy_analysis).toContain(
        'Time-Based Strategy Adjustments'
      )
      expect(content.strategy_analysis).toContain('glide path')
      expect(content.strategy_analysis).toContain('conservative')
    })

    test('should include contribution strategy analysis', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should analyze contribution strategy
      expect(content.strategy_analysis).toContain('Contribution Strategy')
      expect(content.strategy_analysis).toContain('$500')
      expect(content.strategy_analysis).toContain('monthly contributions')
    })

    test('should include rebalancing considerations', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should discuss rebalancing
      expect(content.strategy_analysis).toContain('Rebalancing Considerations')
      expect(content.strategy_analysis).toContain('annually')
      expect(content.strategy_analysis).toContain('5%')
    })

    test('should include tax optimization advice', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should mention tax strategies
      expect(content.strategy_analysis).toContain('Tax Optimization')
      expect(content.strategy_analysis).toContain('tax-advantaged')
      expect(content.strategy_analysis).toContain('tax-efficient')
    })
  })

  describe('Parameter Integration', () => {
    test('should properly integrate asset allocation percentages', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Check that allocation percentages add up to 100%
      const stockMatch = content.strategy_analysis.match(/(\d+)%% stocks/)
      const bondMatch = content.strategy_analysis.match(/(\d+)%% bonds/)
      const altMatch = content.strategy_analysis.match(/(\d+)%% alternative/)

      expect(stockMatch).toBeTruthy()
      expect(bondMatch).toBeTruthy()
      expect(altMatch).toBeTruthy()

      if (stockMatch && bondMatch && altMatch) {
        const stockPct = parseInt(stockMatch[1])
        const bondPct = parseInt(bondMatch[1])
        const altPct = parseInt(altMatch[1])

        expect(stockPct + bondPct + altPct).toBe(100)

        // Check reasonable allocation ranges
        expect(stockPct).toBeGreaterThanOrEqual(40)
        expect(stockPct).toBeLessThanOrEqual(90)
        expect(bondPct).toBeGreaterThanOrEqual(5)
        expect(bondPct).toBeLessThanOrEqual(50)
        expect(altPct).toBeGreaterThanOrEqual(0)
        expect(altPct).toBeLessThanOrEqual(20)
      }
    })

    test('should include contribution percentage analysis', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should mention contribution percentage - check if the placeholder was replaced
      expect(content.strategy_analysis).not.toContain(
        '{contributionPercentage}'
      )

      // Should contain the percentage analysis text
      expect(content.strategy_analysis).toContain('% of your total projected')
    })

    test('should adjust asset allocation based on time horizon', async () => {
      // Test longer time horizon (should have more aggressive allocation)
      const longTermInputs = { ...mockCalculatorInputs, timeHorizon: 30 }
      const longTermContent = generatePersonalizedContent(longTermInputs, 'en')

      // Test shorter time horizon (should have more conservative allocation)
      const shortTermInputs = { ...mockCalculatorInputs, timeHorizon: 5 }
      const shortTermContent = generatePersonalizedContent(
        shortTermInputs,
        'en'
      )

      const longStockMatch =
        longTermContent.strategy_analysis.match(/(\d+)% stocks/)
      const shortStockMatch =
        shortTermContent.strategy_analysis.match(/(\d+)% stocks/)

      if (longStockMatch && shortStockMatch) {
        const longStockPct = parseInt(longStockMatch[1])
        const shortStockPct = parseInt(shortStockMatch[1])

        // Longer time horizon should generally have higher stock allocation
        expect(longStockPct).toBeGreaterThanOrEqual(shortStockPct)
      }
    })
  })

  describe('Multi-language Support', () => {
    test('should generate appropriate content for Spanish locale', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'es')

      expect(content.strategy_analysis).toBeDefined()
      expect(content.strategy_analysis.length).toBeGreaterThan(500)

      // Should contain Spanish content markers
      expect(content.strategy_analysis).toContain('<h2>')
      expect(content.strategy_analysis).toContain('jubilación')
    })

    test('should generate appropriate content for Polish locale', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'pl')

      expect(content.strategy_analysis).toBeDefined()
      expect(content.strategy_analysis.length).toBeGreaterThan(500)

      // Should contain Polish content markers
      expect(content.strategy_analysis).toContain('<h2>')
      expect(content.strategy_analysis).toContain('planowanie emerytury')
    })

    test('should maintain consistent structure across languages', async () => {
      const enContent = generatePersonalizedContent(mockCalculatorInputs, 'en')
      const esContent = generatePersonalizedContent(mockCalculatorInputs, 'es')
      const plContent = generatePersonalizedContent(mockCalculatorInputs, 'pl')

      // All should have similar length ranges (allowing for language differences)
      const lengths = [
        enContent.strategy_analysis.length,
        esContent.strategy_analysis.length,
        plContent.strategy_analysis.length,
      ]
      const maxLength = Math.max(...lengths)
      const minLength = Math.min(...lengths)

      // Languages shouldn't vary by more than 50% in content length
      expect(maxLength / minLength).toBeLessThan(1.5)

      // All should contain key structural elements
      for (const content of [enContent, esContent, plContent]) {
        expect(content.strategy_analysis).toContain('<h2>')
        expect(content.strategy_analysis).toContain('<strong>')
        expect(content.strategy_analysis).toContain('<p>')
      }
    })
  })

  describe('Strategy Relevance', () => {
    test('should provide actionable asset allocation advice', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should provide specific, actionable advice
      expect(content.strategy_analysis).toContain(
        'consider an asset allocation'
      )
      expect(content.strategy_analysis).toContain(
        'balances growth potential with stability'
      )
    })

    test('should include relevant rebalancing frequency guidance', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should provide specific rebalancing guidance
      expect(content.strategy_analysis).toContain(
        'rebalancing your portfolio annually'
      )
      expect(content.strategy_analysis).toContain(
        'when allocations drift more than 5%'
      )
    })

    test('should adapt strategy recommendations to goal type', async () => {
      // Test different goal types
      const retirementContent = generatePersonalizedContent(
        { ...mockCalculatorInputs, goal: 'retirement' },
        'en'
      )
      const emergencyContent = generatePersonalizedContent(
        { ...mockCalculatorInputs, goal: 'emergency' },
        'en'
      )

      expect(retirementContent.strategy_analysis).toContain('retirement')
      expect(emergencyContent.strategy_analysis).toContain('emergency')
    })
  })

  describe('Financial Logic Validation', () => {
    test('should include reasonable contribution percentage calculations', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Extract contribution percentage
      const contribMatch = content.strategy_analysis.match(
        /(\d+(?:\.\d+)?)% of your total projected/
      )

      if (contribMatch) {
        const contribPct = parseFloat(contribMatch[1])

        // Should be a reasonable percentage (contributions shouldn't be more than 100% of final value)
        expect(contribPct).toBeGreaterThan(0)
        expect(contribPct).toBeLessThan(100)
      }
    })

    test('should provide logical time-based strategy progression', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should discuss evolution over time
      expect(content.strategy_analysis).toContain('Early years')
      expect(content.strategy_analysis).toContain('gradually shifting')
      expect(content.strategy_analysis).toContain('approach your')
    })
  })
})
