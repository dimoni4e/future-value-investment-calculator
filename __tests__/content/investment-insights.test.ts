/**
 * Task 7.1.3: Investment Insights Template Tests
 * Test risk assessment accuracy
 * Test historical data integration
 * Test educational value and content comprehensiveness
 */

import {
  generatePersonalizedContent,
  type CalculatorInputs,
} from '../../lib/contentGenerator'

describe('Task 7.1.3: Investment Insights Template', () => {
  const testParams: CalculatorInputs = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    timeHorizon: 20,
    goal: 'retirement',
  }

  const supportedLanguages = ['en', 'es', 'pl']

  describe('Risk Assessment Accuracy', () => {
    test('should categorize risk level appropriately for 7% returns', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should contain risk category and level
      expect(insightsContent).toMatch(/moderate.*category/i)
      expect(insightsContent).toMatch(/balances.*growth.*risk/i)

      // Should not contain placeholder values
      expect(insightsContent).not.toContain('{{ riskCategory }}')
      expect(insightsContent).not.toContain('{{ riskLevel }}')
    })

    test('should show volatility expectations for 7% return profile', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should contain volatility range around 4-12%
      expect(insightsContent).toMatch(/4%-12%|4-12%/)
      expect(insightsContent).not.toContain('{{ volatilityRange }}')
    })

    test('should handle conservative risk profile (5% returns)', () => {
      const conservativeParams = { ...testParams, annualReturn: 5 }
      const content = generatePersonalizedContent(conservativeParams, 'en')
      const insightsContent = content.investment_insights

      expect(insightsContent).toMatch(/conservative|low.*risk/i)
      expect(insightsContent).toMatch(/2%-10%|2-10%/)
    })

    test('should handle aggressive risk profile (10% returns)', () => {
      const aggressiveParams = { ...testParams, annualReturn: 10 }
      const content = generatePersonalizedContent(aggressiveParams, 'en')
      const insightsContent = content.investment_insights

      expect(insightsContent).toMatch(/aggressive|high.*risk/i)
      expect(insightsContent).toMatch(/7%-15%|7-15%/)
    })
  })

  describe('Historical Data Integration', () => {
    test('should include historical context with positive years percentage', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should contain historical performance data
      expect(insightsContent).toMatch(/positive.*(?:results|returns).*\d+%/i)
      expect(insightsContent).toMatch(/30 years/i)
      expect(insightsContent).not.toContain('{{ positiveYears }}')
    })

    test('should show market downturn and bull market averages', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should contain downturn information
      expect(insightsContent).toMatch(/(?:decline|downturn).*15-20%/i)

      // Should contain bull market information
      expect(insightsContent).toMatch(/bull.*market.*18-25%/i)

      expect(insightsContent).not.toContain('{{ averageDownturn }}')
      expect(insightsContent).not.toContain('{{ averageBullReturn }}')
    })

    test('should provide time horizon success rate', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should mention rolling periods and success rate
      expect(insightsContent).toMatch(/rolling.*period/i)
      expect(insightsContent).toMatch(/positive.*\d+%.*time/i)
      expect(insightsContent).not.toContain('{{ successRate }}')
    })
  })

  describe('Educational Value and Content Quality', () => {
    test('should explain dollar-cost averaging benefits', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should explain DCA concept
      expect(insightsContent).toMatch(/dollar.*cost.*averag/i)
      expect(insightsContent).toMatch(/timing.*risk/i)
      expect(insightsContent).toMatch(/average.*cost.*basis/i)
    })

    test('should provide actionable investment discipline advice', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should mention discipline and long-term focus
      expect(insightsContent).toMatch(/disciplin/i)
      expect(insightsContent).toMatch(/volatility/i)
      expect(insightsContent).toMatch(/long.?term/i)
    })

    test('should be comprehensive and detailed (minimum content length)', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should be substantial content (at least 500 characters)
      expect(insightsContent.length).toBeGreaterThan(500)

      // Should contain multiple sections
      expect(insightsContent).toMatch(/Risk Assessment.*:/)
      expect(insightsContent).toMatch(/Historical Context.*:/)
      expect(insightsContent).toMatch(/Volatility Expectations.*:/)
      expect(insightsContent).toMatch(/Dollar.*Cost.*Averaging.*:/)
    })

    test('should contain proper HTML structure', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should have proper HTML tags
      expect(insightsContent).toMatch(/<h2>.*<\/h2>/)
      expect(insightsContent).toMatch(/<p>.*<\/p>/)
      expect(insightsContent).toMatch(/<strong>.*<\/strong>/)
    })
  })

  describe('Multi-language Support', () => {
    test.each(supportedLanguages)(
      'should generate insights content in %s',
      (locale) => {
        const content = generatePersonalizedContent(testParams, locale)
        const insightsContent = content.investment_insights

        expect(insightsContent).toBeDefined()
        expect(insightsContent.length).toBeGreaterThan(200)

        // Should not contain any placeholder values
        expect(insightsContent).not.toMatch(/\{\{.*\}\}/)
        expect(insightsContent).not.toMatch(/\{[a-zA-Z_]+\}/)
      }
    )

    test('should maintain consistent structure across languages', () => {
      const results = supportedLanguages.map((locale) => {
        const content = generatePersonalizedContent(testParams, locale)
        return {
          locale,
          length: content.investment_insights.length,
          hasRiskSection:
            content.investment_insights.includes('Risk Assessment') ||
            content.investment_insights.includes('Evaluación de Riesgo') ||
            content.investment_insights.includes('Ocena Ryzyka'),
          hasHistoricalSection:
            content.investment_insights.includes('Historical Context') ||
            content.investment_insights.includes('Contexto Histórico') ||
            content.investment_insights.includes('Kontekst Historyczny'),
        }
      })

      // All should have substantial content
      results.forEach((result) => {
        expect(result.length).toBeGreaterThan(300)
        expect(result.hasRiskSection).toBe(true)
        expect(result.hasHistoricalSection).toBe(true)
      })
    })
  })

  describe('Parameter Integration', () => {
    test('should integrate all required financial parameters', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const insightsContent = content.investment_insights

      // Should contain key financial values
      expect(insightsContent).toContain('7%') // annual return
      expect(insightsContent).toContain('20') // time horizon
      expect(insightsContent).toContain('$500') // monthly contribution

      // Should not contain any unresolved placeholders
      expect(insightsContent).not.toMatch(/\{\{?\s*\w+\s*\}?\}/g)
    })

    test('should handle edge cases gracefully', () => {
      const edgeCaseParams = {
        ...testParams,
        annualReturn: 12, // high return
        timeHorizon: 5, // short timeline
        monthlyContribution: 100, // small contribution
      }

      const content = generatePersonalizedContent(edgeCaseParams, 'en')
      const insightsContent = content.investment_insights

      expect(insightsContent).toBeDefined()
      expect(insightsContent.length).toBeGreaterThan(300)
      expect(insightsContent).toContain('12%')
      expect(insightsContent).toContain('5')
    })
  })

  describe('Content Accuracy and Consistency', () => {
    test('should maintain consistency with risk categorization logic', () => {
      const lowRiskParams = { ...testParams, annualReturn: 4 }
      const highRiskParams = { ...testParams, annualReturn: 12 }

      const lowRiskContent = generatePersonalizedContent(lowRiskParams, 'en')
      const highRiskContent = generatePersonalizedContent(highRiskParams, 'en')

      // Low risk should mention conservative approach
      expect(lowRiskContent.investment_insights).toMatch(
        /conservative|low.*risk/i
      )

      // High risk should mention aggressive approach
      expect(highRiskContent.investment_insights).toMatch(
        /aggressive|high.*risk/i
      )
    })

    test('should provide contextually appropriate advice based on time horizon', () => {
      const shortTermParams = { ...testParams, timeHorizon: 5 }
      const longTermParams = { ...testParams, timeHorizon: 30 }

      const shortTermContent = generatePersonalizedContent(
        shortTermParams,
        'en'
      )
      const longTermContent = generatePersonalizedContent(longTermParams, 'en')

      // Both should contain time horizon references
      expect(shortTermContent.investment_insights).toContain('5')
      expect(longTermContent.investment_insights).toContain('30')

      // Content should be contextually different
      expect(shortTermContent.investment_insights).not.toBe(
        longTermContent.investment_insights
      )
    })
  })
})
