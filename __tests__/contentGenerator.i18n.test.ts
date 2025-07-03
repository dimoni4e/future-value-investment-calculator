/**
 * Integration tests for content generator with i18n template keys
 * Tests that content generator works properly with the new translation keys
 */

import {
  generatePersonalizedContent,
  generateMarketContext,
} from '../lib/contentGenerator'

describe('Content Generator I18n Integration', () => {
  const mockParams = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    timeHorizon: 10,
    futureValue: 100000,
    totalContributions: 70000,
    totalGains: 30000,
    goal: 'retirement planning',
  }

  describe('Multi-language Content Generation', () => {
    test.each(['en', 'es', 'pl'])(
      'should generate complete content for %s locale',
      (locale) => {
        const content = generatePersonalizedContent(mockParams, locale)

        expect(content).toBeDefined()
        expect(typeof content).toBe('object')

        // Check all 8 content sections are generated
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

        expectedSections.forEach((section) => {
          expect(content[section]).toBeDefined()
          expect(typeof content[section]).toBe('string')
          expect(content[section].trim()).not.toBe('')
          expect(content[section].length).toBeGreaterThan(50)
        })
      }
    )

    test.each(['en', 'es', 'pl'])(
      'should populate parameters correctly in %s content',
      (locale) => {
        const content = generatePersonalizedContent(mockParams, locale)

        // Check that parameters are properly populated (no remaining placeholders)
        Object.values(content).forEach((section: string) => {
          expect(section).not.toMatch(/\{\w+\}/)
        })

        // Check that actual values are present
        expect(content.investment_overview).toContain('10,000')
        expect(content.investment_overview).toContain('500')
        expect(content.investment_overview).toContain('100,000')
      }
    )

    test('should generate different content for different locales', () => {
      const contentEn = generatePersonalizedContent(mockParams, 'en')
      const contentEs = generatePersonalizedContent(mockParams, 'es')
      const contentPl = generatePersonalizedContent(mockParams, 'pl')

      // Content should be different between languages
      expect(contentEn.investment_overview).not.toBe(
        contentEs.investment_overview
      )
      expect(contentEn.investment_overview).not.toBe(
        contentPl.investment_overview
      )
      expect(contentEs.investment_overview).not.toBe(
        contentPl.investment_overview
      )

      // But parameter values should be consistent
      const amount = '10,000'
      expect(contentEn.investment_overview).toContain(amount)
      expect(contentEs.investment_overview).toContain(amount)
      expect(contentPl.investment_overview).toContain(amount)
    })
  })

  describe('Market Context Generation', () => {
    test.each(['en', 'es', 'pl'])(
      'should generate market context for %s locale',
      (locale) => {
        const marketContext = generateMarketContext(mockParams, locale)

        expect(marketContext).toBeDefined()
        expect(typeof marketContext).toBe('string')
        expect(marketContext.trim()).not.toBe('')
        expect(marketContext.length).toBeGreaterThan(100)

        // Should not contain unfilled placeholders
        expect(marketContext).not.toMatch(/\{\w+\}/)

        // Should contain parameter values
        expect(marketContext).toContain('10')
        expect(marketContext).toContain('7')
      }
    )

    test('should generate locale-appropriate market context', () => {
      const contextEn = generateMarketContext(mockParams, 'en')
      const contextEs = generateMarketContext(mockParams, 'es')
      const contextPl = generateMarketContext(mockParams, 'pl')

      // Should be different content
      expect(contextEn).not.toBe(contextEs)
      expect(contextEn).not.toBe(contextPl)
      expect(contextEs).not.toBe(contextPl)

      // Should contain expected language-specific phrases
      expect(contextEn).toMatch(/market|investment|return/i)
      expect(contextEs).toMatch(/mercado|inversión|rendimiento/i)
      expect(contextPl).toMatch(/rynek|inwestycja|zwrot/i)
    })
  })

  describe('Goal Category Integration', () => {
    const goalVariations = [
      { goal: 'retirement', locale: 'en', expected: 'retirement planning' },
      {
        goal: 'retirement',
        locale: 'es',
        expected: 'planificación de jubilación',
      },
      { goal: 'retirement', locale: 'pl', expected: 'planowanie emerytury' },
      { goal: 'house', locale: 'en', expected: 'home purchase' },
      { goal: 'house', locale: 'es', expected: 'compra de vivienda' },
      { goal: 'house', locale: 'pl', expected: 'zakup domu' },
    ]

    test.each(goalVariations)(
      'should handle $goal goal in $locale correctly',
      ({ goal, locale, expected }) => {
        const paramsWithGoal = { ...mockParams, goal }
        const content = generatePersonalizedContent(paramsWithGoal, locale)

        expect(content.investment_overview).toContain(expected)
        expect(content.strategy_analysis).toContain(expected)
      }
    )
  })

  describe('Parameter Edge Cases', () => {
    test('should handle large numbers correctly', () => {
      const largeParams = {
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 12,
        timeHorizon: 30,
        futureValue: 50000000,
        totalContributions: 3600000,
        totalGains: 46400000,
        goal: 'wealth building',
      }

      const content = generatePersonalizedContent(largeParams, 'en')
      expect(content.investment_overview).toContain('1,000,000')
      expect(content.investment_overview).toContain('10,000')
      expect(content.investment_overview).toContain('50,000,000')
    })

    test('should handle small numbers correctly', () => {
      const smallParams = {
        initialAmount: 100,
        monthlyContribution: 25,
        annualReturn: 3,
        timeHorizon: 5,
        futureValue: 2000,
        totalContributions: 1600,
        totalGains: 400,
        goal: 'emergency fund',
      }

      const content = generatePersonalizedContent(smallParams, 'en')
      expect(content.investment_overview).toContain('100')
      expect(content.investment_overview).toContain('25')
      expect(content.investment_overview).toContain('2,000')
    })

    test('should handle decimal return rates', () => {
      const decimalParams = {
        ...mockParams,
        annualReturn: 7.5,
      }

      const content = generatePersonalizedContent(decimalParams, 'en')
      expect(content.investment_insights).toContain('7.5')
    })
  })

  describe('Content Quality Validation', () => {
    test.each(['en', 'es', 'pl'])(
      'should generate coherent content structure for %s',
      (locale) => {
        const content = generatePersonalizedContent(mockParams, locale)

        // Each section should have reasonable length
        Object.entries(content).forEach(([section, text]: [string, string]) => {
          expect(text.length).toBeGreaterThan(100)
          expect(text.length).toBeLessThan(5000)

          // Should not have excessive repetition
          const words = text.split(/\s+/)
          const uniqueWords = new Set(words.map((w) => w.toLowerCase()))
          const repetitionRatio = uniqueWords.size / words.length
          expect(repetitionRatio).toBeGreaterThan(0.3) // At least 30% unique words
        })
      }
    )

    test('should maintain consistency across sections', () => {
      const content = generatePersonalizedContent(mockParams, 'en')

      // All sections should reference the same goal
      Object.values(content).forEach((section: string) => {
        if (section.includes('goal')) {
          expect(section).toContain('retirement planning')
        }
      })

      // All sections should use consistent number formatting
      Object.values(content).forEach((section: string) => {
        if (section.includes('10000')) {
          expect(section).toContain('10,000')
        }
      })
    })
  })

  describe('Error Handling', () => {
    test('should handle missing parameters gracefully', () => {
      const incompleteParams = {
        initialAmount: 10000,
        monthlyContribution: 500,
        // Missing other required params
      }

      // Should not throw error, should use defaults or fallbacks
      expect(() => {
        generatePersonalizedContent(incompleteParams as any, 'en')
      }).not.toThrow()
    })

    test('should handle unsupported locale gracefully', () => {
      // Should fall back to English for unsupported locale
      const content = generatePersonalizedContent(mockParams, 'fr')
      expect(content).toBeDefined()
      expect(typeof content).toBe('object')

      // Should contain English text patterns
      expect(content.investment_overview).toMatch(/investment|growth|future/i)
    })

    test('should handle zero values appropriately', () => {
      const zeroParams = {
        initialAmount: 0,
        monthlyContribution: 500,
        annualReturn: 7,
        timeHorizon: 10,
        futureValue: 50000,
        totalContributions: 50000,
        totalGains: 0,
        goal: 'general investment',
      }

      const content = generatePersonalizedContent(zeroParams, 'en')
      expect(content.investment_overview).toContain('0')
      expect(content.investment_overview).toContain('500')
    })
  })

  describe('Performance Validation', () => {
    test('should generate content efficiently', () => {
      const startTime = Date.now()

      // Generate content for all languages
      ;['en', 'es', 'pl'].forEach((locale) => {
        generatePersonalizedContent(mockParams, locale)
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete within reasonable time (500ms for all languages)
      expect(duration).toBeLessThan(500)
    })

    test('should handle batch generation', () => {
      const scenarios = [
        { ...mockParams, goal: 'retirement' },
        { ...mockParams, goal: 'house', initialAmount: 5000 },
        { ...mockParams, goal: 'education', timeHorizon: 15 },
        { ...mockParams, goal: 'emergency', monthlyContribution: 200 },
      ]

      const startTime = Date.now()

      scenarios.forEach((scenario) => {
        ;['en', 'es', 'pl'].forEach((locale) => {
          const content = generatePersonalizedContent(scenario, locale)
          expect(content).toBeDefined()
        })
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should handle 12 content generations efficiently
      expect(duration).toBeLessThan(1000)
    })
  })
})
