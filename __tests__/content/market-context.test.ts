/**
 * @fileoverview Tests for Market Context Template (Task 7.1.8)
 *
 * Tests the market context content generation including:
 * - Current economic environment integration
 * - Historical market performance for timeframe
 * - Inflation impact considerations
 * - Market volatility expectations
 * - Economic data accuracy and timeliness
 * - Historical context relevance
 * - Inflation calculation accuracy
 */

import {
  generatePersonalizedContent,
  generateMarketContext,
  CalculatorInputs,
} from '../../lib/contentGenerator'

const mockInputs: CalculatorInputs = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 8,
  timeHorizon: 20,
  goal: 'retirement planning',
}

describe('Market Context Template', () => {
  describe('Template Content Generation', () => {
    test('should generate market context content for each locale', async () => {
      const locales = ['en', 'es', 'pl']

      for (const locale of locales) {
        const content = await generatePersonalizedContent(mockInputs, locale)

        expect(content.market_context).toBeDefined()
        expect(content.market_context.length).toBeGreaterThan(150)

        // Check for locale-appropriate market terminology
        if (locale === 'es') {
          expect(content.market_context).toMatch(/mercado|inversión|entorno/)
        } else if (locale === 'pl') {
          expect(content.market_context).toMatch(/rynkow|inwestycyjn|środowisk/)
        } else {
          expect(content.market_context).toMatch(
            /market|investment|environment/
          )
        }
      }
    })

    test('should include current economic environment indicators', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss current economic conditions
      const marketContext = content.market_context.toLowerCase()
      expect(marketContext).toMatch(/inflation|interest.*rate|volatility/)
      expect(marketContext).toMatch(/current|today|environment/)
    })

    test('should include inflation impact considerations', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should mention inflation and its impact
      expect(content.market_context).toMatch(/inflation/)
      expect(content.market_context).toMatch(/\d+\.?\d*%.*inflation/)
    })

    test('should include market volatility expectations', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss market volatility
      expect(content.market_context).toMatch(/volatility|volatile/)
      expect(content.market_context).toMatch(/moderate|high|low|elevated/)
    })
  })

  describe('Economic Data Integration', () => {
    test('should include realistic current inflation rates', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Extract inflation rate from content
      const inflationMatch = content.market_context.match(
        /(\d+\.?\d*)%.*inflation/
      )
      if (inflationMatch) {
        const inflationRate = parseFloat(inflationMatch[1])
        expect(inflationRate).toBeGreaterThan(0)
        expect(inflationRate).toBeLessThan(20) // Realistic inflation range
      }
    })

    test('should include realistic interest rates', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should contain interest rate information
      expect(content.market_context).toMatch(/interest.*rate/)

      // Extract interest rate if mentioned
      const rateMatch = content.market_context.match(
        /(\d+\.?\d*)%.*interest.*rate/
      )
      if (rateMatch) {
        const interestRate = parseFloat(rateMatch[1])
        expect(interestRate).toBeGreaterThan(0)
        expect(interestRate).toBeLessThan(25) // Realistic interest rate range
      }
    })

    test('should provide accurate market volatility assessment', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should contain volatility assessment
      const volatilityTerms = ['low', 'moderate', 'elevated', 'high']
      const hasVolatilityAssessment = volatilityTerms.some((term) =>
        content.market_context.toLowerCase().includes(term)
      )
      expect(hasVolatilityAssessment).toBe(true)
    })
  })

  describe('Historical Context Integration', () => {
    test('should provide historical market performance context', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should reference historical context
      expect(content.market_context).toMatch(
        /historical|history|past|long.*term/
      )
    })

    test('should relate timeframe to historical patterns', async () => {
      const longTermInputs = { ...mockInputs, timeHorizon: 30 }
      const shortTermInputs = { ...mockInputs, timeHorizon: 5 }

      const longTermContent = await generatePersonalizedContent(
        longTermInputs,
        'en'
      )
      const shortTermContent = await generatePersonalizedContent(
        shortTermInputs,
        'en'
      )

      // Both should reference the specific timeframe
      expect(longTermContent.market_context).toContain('30')
      expect(shortTermContent.market_context).toContain('5')
    })

    test('should maintain historical perspective across different return expectations', async () => {
      const conservativeInputs = { ...mockInputs, annualReturn: 5 }
      const aggressiveInputs = { ...mockInputs, annualReturn: 12 }

      const conservativeContent = await generatePersonalizedContent(
        conservativeInputs,
        'en'
      )
      const aggressiveContent = await generatePersonalizedContent(
        aggressiveInputs,
        'en'
      )

      // Both should reference historical context
      expect(conservativeContent.market_context).toMatch(
        /historical|perspective/
      )
      expect(aggressiveContent.market_context).toMatch(/historical|perspective/)

      // Should mention the specific return rates
      expect(conservativeContent.market_context).toContain('5%')
      expect(aggressiveContent.market_context).toContain('12%')
    })
  })

  describe('Parameter-Based Personalization', () => {
    test('should adapt context based on investment timeline', async () => {
      const shortTerm = { ...mockInputs, timeHorizon: 5 }
      const longTerm = { ...mockInputs, timeHorizon: 30 }

      const shortTermContent = await generatePersonalizedContent(
        shortTerm,
        'en'
      )
      const longTermContent = await generatePersonalizedContent(longTerm, 'en')

      expect(shortTermContent.market_context).toBeDefined()
      expect(longTermContent.market_context).toBeDefined()

      // Should reference specific timeframes
      expect(shortTermContent.market_context).toContain('5')
      expect(longTermContent.market_context).toContain('30')
    })

    test('should reference investment goal in market context', async () => {
      const goalsAndTranslations = [
        { goal: 'retirement planning', expected: 'retirement planning' },
        { goal: 'house', expected: 'home purchase' },
        { goal: 'education', expected: 'education' },
        { goal: 'emergency', expected: 'emergency' },
        { goal: 'wealth', expected: 'wealth building' },
      ]

      for (const { goal, expected } of goalsAndTranslations) {
        const content = await generatePersonalizedContent(
          { ...mockInputs, goal },
          'en'
        )

        expect(content.market_context).toBeDefined()
        // Should contain goal-specific context (may be translated)
        expect(content.market_context).toContain(expected)
      }
    })

    test('should relate expected returns to current market conditions', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should reference the expected return rate
      expect(content.market_context).toContain('8%')
      expect(content.market_context).toMatch(
        /expected.*return|return.*expected/
      )
    })
  })

  describe('Multi-language Support', () => {
    test('should generate appropriate content for Spanish locale', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'es')

      expect(content.market_context).toBeDefined()
      expect(content.market_context).toContain('mercado')
      expect(content.market_context).toContain('inversión')
      expect(content.market_context).toMatch(/inflación|volatilidad/)
    })

    test('should generate appropriate content for Polish locale', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'pl')

      expect(content.market_context).toBeDefined()
      expect(content.market_context).toMatch(/rynkow|inwestycyjn/)
      expect(content.market_context).toMatch(/inflacj|zmiennoś/)
    })

    test('should maintain consistent economic data across languages', async () => {
      const enContent = await generatePersonalizedContent(mockInputs, 'en')
      const esContent = await generatePersonalizedContent(mockInputs, 'es')
      const plContent = await generatePersonalizedContent(mockInputs, 'pl')

      // All should contain similar economic indicators
      expect(enContent.market_context.length).toBeGreaterThan(150)
      expect(esContent.market_context.length).toBeGreaterThan(150)
      expect(plContent.market_context.length).toBeGreaterThan(150)

      // Should all reference inflation and volatility concepts
      expect(enContent.market_context).toMatch(/inflation|volatility/)
      expect(esContent.market_context).toMatch(/inflación|volatilidad/)
      expect(plContent.market_context).toMatch(/inflacj|zmiennoś/)
    })
  })

  describe('Professional and Educational Tone', () => {
    test('should maintain educational tone about market conditions', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should provide educational context
      expect(content.market_context).toMatch(
        /understanding|context|perspective/
      )
      expect(content.market_context).toMatch(/provides|valuable|important/)
    })

    test('should avoid market timing or prediction language', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should not make market predictions
      const predictionWords = [
        'will definitely',
        'guaranteed to',
        'certainly will',
        'predict',
        'forecast exactly',
      ]
      const hasPredictions = predictionWords.some((word) =>
        content.market_context.toLowerCase().includes(word)
      )
      expect(hasPredictions).toBe(false)
    })

    test('should use appropriate conditional language', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should use measured, educational language
      const conditionalWords = [
        'provides',
        'features',
        'accounts for',
        'perspective',
        'context',
      ]
      const hasConditionalLanguage = conditionalWords.some((word) =>
        content.market_context.toLowerCase().includes(word)
      )
      expect(hasConditionalLanguage).toBe(true)
    })
  })

  describe('Content Quality and Accuracy', () => {
    test('should maintain appropriate content length', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      const wordCount = content.market_context.split(/\s+/).length
      expect(wordCount).toBeGreaterThanOrEqual(30) // Substantial content
      expect(wordCount).toBeLessThanOrEqual(200) // Not too verbose
    })

    test('should provide actionable market insights', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should connect market conditions to investment strategy
      expect(content.market_context).toMatch(
        /accounts.*for|considers|perspective/
      )
      expect(content.market_context).toMatch(/conditions|environment|landscape/)
    })

    test('should handle edge case parameters gracefully', async () => {
      const edgeCases = [
        { ...mockInputs, annualReturn: 1 }, // Very low return
        { ...mockInputs, annualReturn: 15 }, // Very high return
        { ...mockInputs, timeHorizon: 1 }, // Very short term
        { ...mockInputs, timeHorizon: 50 }, // Very long term
      ]

      for (const edgeCase of edgeCases) {
        const content = await generatePersonalizedContent(edgeCase, 'en')
        expect(content.market_context).toBeDefined()
        expect(content.market_context.length).toBeGreaterThan(100)
      }
    })
  })

  describe('Direct Market Context Generation', () => {
    test('should generate market context directly via generateMarketContext function', () => {
      const marketContext = generateMarketContext(mockInputs, 'en')

      expect(marketContext).toBeDefined()
      expect(marketContext.length).toBeGreaterThan(150)
      expect(marketContext).toMatch(/market|inflation|volatility/)
    })

    test('should handle missing locale gracefully', () => {
      const marketContext = generateMarketContext(mockInputs, 'invalid')

      expect(marketContext).toBeDefined()
      // Should fallback to English or provide error message
      expect(marketContext.length).toBeGreaterThan(50)
    })

    test('should maintain consistency between direct call and full content generation', async () => {
      const directContext = generateMarketContext(mockInputs, 'en')
      const fullContent = await generatePersonalizedContent(mockInputs, 'en')

      // Both should provide market context
      expect(directContext).toBeDefined()
      expect(fullContent.market_context).toBeDefined()
      expect(directContext.length).toBeGreaterThan(100)
      expect(fullContent.market_context.length).toBeGreaterThan(100)
    })
  })

  describe('Integration with Investment Parameters', () => {
    test('should reference all key investment parameters', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should reference key parameters
      expect(content.market_context).toContain('20') // timeHorizon
      expect(content.market_context).toContain('8%') // annualReturn
      expect(content.market_context).toContain('retirement planning') // goal
    })

    test('should provide contextually relevant information for different goals', async () => {
      const emergencyInputs = { ...mockInputs, goal: 'emergency' }
      const retirementInputs = { ...mockInputs, goal: 'retirement planning' }

      const emergencyContent = await generatePersonalizedContent(
        emergencyInputs,
        'en'
      )
      const retirementContent = await generatePersonalizedContent(
        retirementInputs,
        'en'
      )

      expect(emergencyContent.market_context).toContain('emergency')
      expect(retirementContent.market_context).toContain('retirement planning')
    })
  })
})
