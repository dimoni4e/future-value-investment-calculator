/**
 * Comparative Scenarios Template Tests
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

describe('Comparative Scenarios Template', () => {
  describe('Template Content Generation', () => {
    test('should generate comparative scenarios content for each locale', async () => {
      for (const locale of mockLocales) {
        const content = generatePersonalizedContent(
          mockCalculatorInputs,
          locale
        )

        expect(content.comparative_scenarios).toBeDefined()
        expect(content.comparative_scenarios.length).toBeGreaterThan(800)
        expect(content.comparative_scenarios).toContain('<h2>')
        expect(content.comparative_scenarios).toContain('</h2>')
      }
    })

    test('should include higher contribution comparisons', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should contain higher contribution scenarios
      expect(content.comparative_scenarios).toContain(
        'Higher Monthly Contributions'
      )
      expect(content.comparative_scenarios).toContain('Increasing your monthly')
      expect(content.comparative_scenarios).toMatch(
        /\$\d+.*higher.*contribution/i
      )
    })

    test('should include lower contribution comparisons', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should contain lower contribution scenarios
      expect(content.comparative_scenarios).toContain(
        'Lower Monthly Contributions'
      )
      expect(content.comparative_scenarios).toContain('reducing your monthly')
      expect(content.comparative_scenarios).toMatch(
        /\$\d+.*lower.*contribution/i
      )
    })

    test('should include different timeframe impacts', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should discuss timeframe variations
      expect(content.comparative_scenarios).toContain('Extended Timeline')
      expect(content.comparative_scenarios).toContain('Shorter Timeline')
      expect(content.comparative_scenarios).toContain('additional years')
      expect(content.comparative_scenarios).toContain('fewer years')
    })

    test('should include alternative investment approaches', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should discuss different investment approaches
      expect(content.comparative_scenarios).toContain('Alternative Approaches')
      expect(content.comparative_scenarios).toContain('Conservative Approach')
      expect(content.comparative_scenarios).toContain('Aggressive Approach')
      expect(content.comparative_scenarios).toContain('return scenarios')
    })

    test('should include lump sum vs regular investing comparison', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should compare lump sum vs regular investing
      expect(content.comparative_scenarios).toContain('Lump Sum Investment')
      expect(content.comparative_scenarios).toContain('lump sum today')
      expect(content.comparative_scenarios).toContain('dollar-cost averaging')
    })
  })

  describe('Comparison Accuracy and Fairness', () => {
    test('should provide accurate financial comparisons', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Extract higher contribution values
      const higherContribMatch = content.comparative_scenarios.match(
        /\$([0-9,]+).*higher contribution/i
      )
      const higherValueMatch = content.comparative_scenarios.match(
        /portfolio value of \$([0-9,]+)/i
      )

      if (higherContribMatch && higherValueMatch) {
        const higherContrib = parseInt(higherContribMatch[1].replace(/,/g, ''))
        const higherValue = parseInt(higherValueMatch[1].replace(/,/g, ''))

        // Higher contributions should result in higher values
        expect(higherContrib).toBeGreaterThan(
          mockCalculatorInputs.monthlyContribution
        )
        expect(higherValue).toBeGreaterThan(200000) // Should be substantial
      }
    })

    test('should show proportional impact of contribution changes', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should explain the proportional impact
      expect(content.comparative_scenarios).toMatch(
        /\d+%.*increase.*contribution/i
      )
      expect(content.comparative_scenarios).toMatch(
        /\d+%.*increase.*final.*value/i
      )
    })

    test('should demonstrate time value of money principles', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should explain time value principles
      expect(content.comparative_scenarios).toContain('additional years')
      expect(content.comparative_scenarios).toContain('compound interest')
      expect(content.comparative_scenarios).toContain('time in the market')
    })

    test('should provide realistic scenario variations', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should include realistic percentage variations
      expect(content.comparative_scenarios).toMatch(/[456]%.*conservative/i)
      expect(content.comparative_scenarios).toMatch(/1[012]%.*aggressive/i)
    })
  })

  describe('Scenario Variation Logic', () => {
    test('should adapt scenarios based on current parameters', async () => {
      // Test with high monthly contribution
      const highContribInputs = {
        ...mockCalculatorInputs,
        monthlyContribution: 2000,
      }
      const highContribContent = generatePersonalizedContent(
        highContribInputs,
        'en'
      )

      // Test with low monthly contribution
      const lowContribInputs = {
        ...mockCalculatorInputs,
        monthlyContribution: 100,
      }
      const lowContribContent = generatePersonalizedContent(
        lowContribInputs,
        'en'
      )

      // Scenarios should be different based on starting parameters
      expect(highContribContent.comparative_scenarios).not.toBe(
        lowContribContent.comparative_scenarios
      )
    })

    test('should provide meaningful percentage differences', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should show meaningful differences (not trivial)
      expect(content.comparative_scenarios).toMatch(/[2-9]\d%.*improvement/i)
      expect(content.comparative_scenarios).toMatch(
        /\$\d{1,3},\d{3}.*additional/i
      )
    })

    test('should include both optimistic and conservative scenarios', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should balance optimistic and conservative views
      expect(content.comparative_scenarios).toContain('Conservative')
      expect(content.comparative_scenarios).toContain('Aggressive')
      expect(content.comparative_scenarios).toMatch(/lower.*return/i)
      expect(content.comparative_scenarios).toMatch(/higher.*return/i)
    })
  })

  describe('User Decision-Making Support', () => {
    test('should provide actionable insights for decision making', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should help with decision making
      expect(content.comparative_scenarios).toContain('Consider')
      expect(content.comparative_scenarios).toContain('decision')
      expect(content.comparative_scenarios).toContain('trade-offs')
    })

    test('should explain the impact of each scenario clearly', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should clearly explain impacts
      expect(content.comparative_scenarios).toContain('impact')
      expect(content.comparative_scenarios).toContain('difference')
      expect(content.comparative_scenarios).toContain('demonstrates')
    })

    test('should include practical considerations', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should include practical advice
      expect(content.comparative_scenarios).toContain('practical')
      expect(content.comparative_scenarios).toContain('affordable')
      expect(content.comparative_scenarios).toContain('sustainable')
    })

    test('should help prioritize investment strategies', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should help with strategy prioritization
      expect(content.comparative_scenarios).toContain('prioritize')
      expect(content.comparative_scenarios).toContain('most effective')
      expect(content.comparative_scenarios).toContain('greatest impact')
    })
  })

  describe('Multi-language Support', () => {
    test('should generate appropriate content for Spanish locale', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'es')

      expect(content.comparative_scenarios).toBeDefined()
      expect(content.comparative_scenarios.length).toBeGreaterThan(800)

      // Should contain Spanish content markers
      expect(content.comparative_scenarios).toContain('<h2>')
      expect(content.comparative_scenarios).toMatch(/contribuci[oó]n/i)
      expect(content.comparative_scenarios).toMatch(/escenarios/i)
    })

    test('should generate appropriate content for Polish locale', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'pl')

      expect(content.comparative_scenarios).toBeDefined()
      expect(content.comparative_scenarios.length).toBeGreaterThan(800)

      // Should contain Polish content markers
      expect(content.comparative_scenarios).toContain('<h2>')
      expect(content.comparative_scenarios).toMatch(/składk/i)
      expect(content.comparative_scenarios).toMatch(/scenariusz/i)
    })

    test('should maintain consistent structure across languages', async () => {
      const enContent = generatePersonalizedContent(mockCalculatorInputs, 'en')
      const esContent = generatePersonalizedContent(mockCalculatorInputs, 'es')
      const plContent = generatePersonalizedContent(mockCalculatorInputs, 'pl')

      // All should have similar length ranges (allowing for language differences)
      const lengths = [
        enContent.comparative_scenarios.length,
        esContent.comparative_scenarios.length,
        plContent.comparative_scenarios.length,
      ]
      const maxLength = Math.max(...lengths)
      const minLength = Math.min(...lengths)

      // Languages shouldn't vary by more than 50% in content length
      expect(maxLength / minLength).toBeLessThan(1.5)

      // All should contain key structural elements
      for (const content of [enContent, esContent, plContent]) {
        expect(content.comparative_scenarios).toContain('<h2>')
        expect(content.comparative_scenarios).toContain('<strong>')
        expect(content.comparative_scenarios).toContain('<p>')
      }
    })
  })

  describe('Financial Logic Validation', () => {
    test('should show logical relationship between parameters and outcomes', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should demonstrate logical relationships
      expect(content.comparative_scenarios).toMatch(
        /higher.*contribution.*larger.*portfolio/i
      )
      expect(content.comparative_scenarios).toMatch(
        /longer.*time.*more.*growth/i
      )
      expect(content.comparative_scenarios).toMatch(
        /higher.*return.*greater.*value/i
      )
    })

    test('should include realistic value ranges', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Extract monetary values and ensure they're realistic
      const valueMatches = content.comparative_scenarios.match(/\$[\d,]+/g)
      if (valueMatches) {
        valueMatches.forEach((valueStr) => {
          const value = parseInt(valueStr.replace(/[$,]/g, ''))
          // Values should be reasonable for a 20-year investment
          expect(value).toBeGreaterThan(1000)
          expect(value).toBeLessThan(10000000)
        })
      }
    })

    test('should maintain mathematical consistency', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should not contain contradictory information
      expect(content.comparative_scenarios).not.toMatch(
        /lower.*contribution.*higher.*value/i
      )
      expect(content.comparative_scenarios).not.toMatch(
        /shorter.*time.*more.*compound/i
      )
    })
  })

  describe('Content Structure and Quality', () => {
    test('should have proper HTML structure', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should have proper HTML structure
      expect(content.comparative_scenarios).toMatch(/<h2>.*<\/h2>/)
      expect(content.comparative_scenarios).toMatch(/<p>.*<\/p>/)
      expect(content.comparative_scenarios).toMatch(/<strong>.*<\/strong>/)

      // Should not have unclosed tags
      const openTags = content.comparative_scenarios.match(/<\w+>/g) || []
      const closeTags = content.comparative_scenarios.match(/<\/\w+>/g) || []
      expect(openTags.length).toBeGreaterThanOrEqual(closeTags.length)
    })

    test('should have engaging and educational content', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should be engaging and educational
      expect(content.comparative_scenarios).toContain('understanding')
      expect(content.comparative_scenarios).toContain('demonstrates')
      expect(content.comparative_scenarios).toContain('important')
      expect(content.comparative_scenarios).toMatch(/\?/) // Should ask questions or be engaging
    })

    test('should avoid overwhelming the user with too many scenarios', async () => {
      const content = generatePersonalizedContent(mockCalculatorInputs, 'en')

      // Should have a reasonable number of scenarios (not overwhelming)
      const scenarioSections =
        content.comparative_scenarios.match(/<strong>/g) || []
      expect(scenarioSections.length).toBeGreaterThanOrEqual(4)
      expect(scenarioSections.length).toBeLessThanOrEqual(8)
    })
  })
})
