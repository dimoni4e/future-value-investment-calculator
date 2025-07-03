/**
 * Unit tests for Content Generator
 * Tests content generation with various parameter combinations
 */

import {
  generatePersonalizedContent,
  populateTemplate,
  generateMarketContext,
  type CalculatorInputs,
  type ContentSections,
} from '../lib/contentGenerator'

describe('Content Generator', () => {
  const defaultParams: CalculatorInputs = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    timeHorizon: 20,
    goal: 'retirement',
  }

  const testParams: CalculatorInputs[] = [
    defaultParams,
    {
      initialAmount: 5000,
      monthlyContribution: 250,
      annualReturn: 6,
      timeHorizon: 15,
      goal: 'house',
    },
    {
      initialAmount: 50000,
      monthlyContribution: 1000,
      annualReturn: 8,
      timeHorizon: 30,
      goal: 'education',
    },
    {
      initialAmount: 1000,
      monthlyContribution: 100,
      annualReturn: 5,
      timeHorizon: 10,
      goal: 'emergency',
    },
  ]

  describe('generatePersonalizedContent', () => {
    test('should generate all required content sections for English', () => {
      const content = generatePersonalizedContent(defaultParams, 'en')

      expect(content).toHaveProperty('investment_overview')
      expect(content).toHaveProperty('growth_projection')
      expect(content).toHaveProperty('investment_insights')
      expect(content).toHaveProperty('strategy_analysis')
      expect(content).toHaveProperty('comparative_scenarios')
      expect(content).toHaveProperty('community_insights')
      expect(content).toHaveProperty('optimization_tips')
      expect(content).toHaveProperty('market_context')

      // Check that each section has content
      Object.values(content).forEach((section) => {
        expect(typeof section).toBe('string')
        expect(section.length).toBeGreaterThan(0)
      })
    })

    test('should generate content for all supported languages', () => {
      const languages = ['en', 'es', 'pl']

      languages.forEach((locale) => {
        const content = generatePersonalizedContent(defaultParams, locale)

        expect(Object.keys(content)).toHaveLength(8)
        Object.values(content).forEach((section) => {
          expect(typeof section).toBe('string')
          expect(section.length).toBeGreaterThan(100) // Should have substantial content
        })
      })
    })

    test('should handle different parameter combinations', () => {
      testParams.forEach((params) => {
        const content = generatePersonalizedContent(params, 'en')

        // Should generate content for all sections
        expect(Object.keys(content)).toHaveLength(8)

        // Content should be personalized (contain parameter values)
        const allContent = Object.values(content).join(' ')

        // Check for formatted values instead of raw numbers
        if (params.initialAmount >= 1000) {
          const formattedInitial =
            params.initialAmount >= 1000000
              ? `$${(params.initialAmount / 1000000).toFixed(1)}M`
              : `$${(params.initialAmount / 1000).toFixed(0)}K`
          expect(allContent).toContain(formattedInitial)
        } else {
          expect(allContent).toContain(`$${params.initialAmount}`)
        }

        if (params.monthlyContribution >= 1000) {
          const formattedMonthly = `$${(
            params.monthlyContribution / 1000
          ).toFixed(0)}K`
          expect(allContent).toContain(formattedMonthly)
        } else {
          expect(allContent).toContain(`$${params.monthlyContribution}`)
        }

        expect(allContent).toContain(`${params.annualReturn}%`)
        expect(allContent).toContain(params.timeHorizon.toString())
      })
    })

    test('should generate different content for different parameters', () => {
      const content1 = generatePersonalizedContent(testParams[0], 'en')
      const content2 = generatePersonalizedContent(testParams[1], 'en')

      // Content should be different for different parameters
      expect(content1.investment_overview).not.toBe(
        content2.investment_overview
      )
      expect(content1.growth_projection).not.toBe(content2.growth_projection)
    })

    test('should fallback to English for unsupported locales', () => {
      const englishContent = generatePersonalizedContent(defaultParams, 'en')
      const fallbackContent = generatePersonalizedContent(defaultParams, 'fr')

      // Should get English content for unsupported locale
      expect(fallbackContent).toEqual(englishContent)
    })
  })

  describe('populateTemplate', () => {
    test('should replace placeholders with parameter values', () => {
      const template =
        'Invest {{ initialAmount }} with {{ monthlyContribution }} monthly for {{ timeHorizon }} years at {{ annualReturn }}%'
      const result = populateTemplate(template, defaultParams)

      expect(result).toContain('$10K') // Formatted initial amount
      expect(result).toContain('$500') // Monthly contribution
      expect(result).toContain('20 years') // Time horizon
      expect(result).toContain('7%') // Annual return
    })

    test('should handle currency formatting', () => {
      const template = 'Future value: {{ futureValue }}'
      const result = populateTemplate(template, defaultParams)

      // Should format large amounts with K/M suffix
      expect(result).toMatch(/Future value: \$\d+[KM]?/)
    })

    test('should handle percentage formatting', () => {
      const template =
        'Return: {{ annualReturn }}, Real return: {{ realReturn }}'
      const result = populateTemplate(template, defaultParams)

      expect(result).toContain('7%')
      expect(result).toMatch(/Real return: \d+\.?\d*%/)
    })

    test('should handle calculated values', () => {
      const template =
        'Total contributions: {{ totalContributions }}, Future value: {{ futureValue }}'
      const result = populateTemplate(template, defaultParams)

      expect(result).toContain('Total contributions: $')
      expect(result).toContain('Future value: $')
    })

    test('should handle edge case values', () => {
      const edgeParams: CalculatorInputs = {
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 12,
        timeHorizon: 5,
        goal: 'test',
      }

      const template =
        'Amount: {{ initialAmount }}, Monthly: {{ monthlyContribution }}'
      const result = populateTemplate(template, edgeParams)

      expect(result).toContain('$1.0M') // Should format millions
      expect(result).toContain('$10K') // Should format thousands
    })

    test('should not break with missing placeholders', () => {
      const template = 'Simple text without placeholders'
      const result = populateTemplate(template, defaultParams)

      expect(result).toBe(template)
    })

    test('should handle multiple instances of same placeholder', () => {
      const template =
        'Start with {{ initialAmount }} and add {{ monthlyContribution }}. Your {{ initialAmount }} will grow.'
      const result = populateTemplate(template, defaultParams)

      // Should replace all instances
      const initialCount = (result.match(/\$10K/g) || []).length
      expect(initialCount).toBe(2)
    })
  })

  describe('generateMarketContext', () => {
    test('should generate market context for English', () => {
      const context = generateMarketContext(defaultParams, 'en')

      expect(typeof context).toBe('string')
      expect(context.length).toBeGreaterThan(50)
      expect(context).toContain('economic environment')
      expect(context).toContain('inflation')
      expect(context).toContain('interest rates')
    })

    test('should generate market context for Spanish', () => {
      const context = generateMarketContext(defaultParams, 'es')

      expect(typeof context).toBe('string')
      expect(context.length).toBeGreaterThan(50)
      expect(context).toContain('entorno económico')
      expect(context).toContain('inflación')
    })

    test('should generate market context for Polish', () => {
      const context = generateMarketContext(defaultParams, 'pl')

      expect(typeof context).toBe('string')
      expect(context.length).toBeGreaterThan(50)
      expect(context).toContain('środowisku ekonomicznym')
      expect(context).toContain('inflacją')
    })

    test('should adapt context based on return expectations', () => {
      const conservativeParams = { ...defaultParams, annualReturn: 4 }
      const aggressiveParams = { ...defaultParams, annualReturn: 12 }

      const conservativeContext = generateMarketContext(
        conservativeParams,
        'en'
      )
      const aggressiveContext = generateMarketContext(aggressiveParams, 'en')

      expect(conservativeContext).toContain('balanced approach')
      expect(aggressiveContext).toContain('aggressive growth strategy')
    })

    test('should adapt context based on time horizon', () => {
      const shortTermParams = { ...defaultParams, timeHorizon: 5 }
      const longTermParams = { ...defaultParams, timeHorizon: 30 }

      const shortTermContext = generateMarketContext(shortTermParams, 'en')
      const longTermContext = generateMarketContext(longTermParams, 'en')

      expect(shortTermContext).toContain('sufficient time')
      expect(longTermContext).toContain('fully capitalize')
    })

    test('should include current economic indicators', () => {
      const context = generateMarketContext(defaultParams, 'en')

      // Should include realistic current economic data
      expect(context).toMatch(/\d+\.?\d*% inflation/)
      expect(context).toMatch(/\d+\.?\d*% interest rates/)
    })

    test('should fallback to English for unsupported locales', () => {
      const englishContext = generateMarketContext(defaultParams, 'en')
      const fallbackContext = generateMarketContext(defaultParams, 'fr')

      expect(fallbackContext).toBe(englishContext)
    })
  })

  describe('Output Format and Structure Consistency', () => {
    test('should maintain consistent structure across different parameters', () => {
      testParams.forEach((params) => {
        const content = generatePersonalizedContent(params, 'en')

        // All sections should be present
        expect(Object.keys(content)).toEqual([
          'investment_overview',
          'growth_projection',
          'investment_insights',
          'strategy_analysis',
          'comparative_scenarios',
          'community_insights',
          'optimization_tips',
          'market_context',
        ])

        // All sections should have substantial content
        Object.values(content).forEach((section) => {
          expect(section.length).toBeGreaterThan(200)
        })
      })
    })

    test('should maintain HTML structure in generated content', () => {
      const content = generatePersonalizedContent(defaultParams, 'en')

      Object.values(content).forEach((section) => {
        // Should contain HTML elements
        expect(section).toMatch(/<h2>.*<\/h2>/)
        expect(section).toMatch(/<p>.*<\/p>/)
      })
    })

    test('should have no leftover placeholders', () => {
      const content = generatePersonalizedContent(defaultParams, 'en')

      Object.values(content).forEach((section) => {
        // Should not contain unreplaced placeholders
        expect(section).not.toMatch(/\{\{[^}]*\}\}/)
      })
    })

    test('should generate appropriate word count per section', () => {
      const content = generatePersonalizedContent(defaultParams, 'en')

      Object.values(content).forEach((section) => {
        const wordCount = section
          .replace(/<[^>]*>/g, ' ')
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length

        // Each section should have substantial content
        expect(wordCount).toBeGreaterThan(50)
        expect(wordCount).toBeLessThan(1000)
      })
    })
  })

  describe('Mathematical Accuracy', () => {
    test('should calculate future value correctly', () => {
      const content = generatePersonalizedContent(defaultParams, 'en')
      const allContent = Object.values(content).join(' ')

      // Extract calculated future value from content
      const futureValueMatch = allContent.match(/\$(\d+[KM]?)/)
      expect(futureValueMatch).toBeTruthy()

      // Should be a reasonable future value for the parameters
      // $10K initial + $500/month * 240 months = $130K contributions
      // At 7% for 20 years should be significantly higher
      expect(allContent).toMatch(/\$[23]\d{2}K|\$[1-9]\.\d{1}M/)
    })

    test('should handle zero initial amount', () => {
      const zeroInitialParams = { ...defaultParams, initialAmount: 0 }
      const content = generatePersonalizedContent(zeroInitialParams, 'en')

      // Should not break with zero initial amount
      expect(Object.keys(content)).toHaveLength(8)
      Object.values(content).forEach((section) => {
        expect(section.length).toBeGreaterThan(0)
      })
    })

    test('should handle edge case parameters', () => {
      const edgeCases: CalculatorInputs[] = [
        {
          initialAmount: 1,
          monthlyContribution: 1,
          annualReturn: 1,
          timeHorizon: 1,
          goal: 'test',
        },
        {
          initialAmount: 1000000,
          monthlyContribution: 10000,
          annualReturn: 15,
          timeHorizon: 50,
          goal: 'retirement',
        },
      ]

      edgeCases.forEach((params) => {
        expect(() => {
          const content = generatePersonalizedContent(params, 'en')
          expect(Object.keys(content)).toHaveLength(8)
        }).not.toThrow()
      })
    })
  })

  describe('Localization Integration', () => {
    test('should work with different number formats by locale', () => {
      const content = generatePersonalizedContent(defaultParams, 'en')
      const spanishContent = generatePersonalizedContent(defaultParams, 'es')
      const polishContent = generatePersonalizedContent(defaultParams, 'pl')

      // All should generate valid content
      expect(Object.keys(content)).toHaveLength(8)
      expect(Object.keys(spanishContent)).toHaveLength(8)
      expect(Object.keys(polishContent)).toHaveLength(8)

      // Content should be different between languages
      expect(content.investment_overview).not.toBe(
        spanishContent.investment_overview
      )
      expect(content.investment_overview).not.toBe(
        polishContent.investment_overview
      )
    })

    test('should maintain parameter accuracy across languages', () => {
      const languages = ['en', 'es', 'pl']

      languages.forEach((locale) => {
        const content = generatePersonalizedContent(defaultParams, locale)
        const allContent = Object.values(content).join(' ')

        // Should contain the same numeric values regardless of language
        expect(allContent).toContain('10') // Initial amount in thousands
        expect(allContent).toContain('500') // Monthly contribution
        expect(allContent).toContain('7') // Annual return
        expect(allContent).toContain('20') // Time horizon
      })
    })
  })
})
