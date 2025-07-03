/**
 * Parameterized tests for Content Generator
 * Tests with edge case parameters and different goal categories
 */

import {
  generatePersonalizedContent,
  populateTemplate,
  type CalculatorInputs,
} from '../lib/contentGenerator'

describe('Content Generator - Parameterized Tests', () => {
  describe('Edge Case Parameter Testing', () => {
    const edgeCaseParams: CalculatorInputs[] = [
      // Minimum values
      {
        initialAmount: 0,
        monthlyContribution: 1,
        annualReturn: 1,
        timeHorizon: 1,
        goal: 'emergency',
      },
      // Very low values
      {
        initialAmount: 100,
        monthlyContribution: 25,
        annualReturn: 2,
        timeHorizon: 3,
        goal: 'vacation',
      },
      // High values
      {
        initialAmount: 500000,
        monthlyContribution: 5000,
        annualReturn: 12,
        timeHorizon: 40,
        goal: 'retirement',
      },
      // Maximum realistic values
      {
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 15,
        timeHorizon: 50,
        goal: 'wealth',
      },
      // Unusual combinations
      {
        initialAmount: 0,
        monthlyContribution: 2500,
        annualReturn: 4,
        timeHorizon: 35,
        goal: 'house',
      },
      {
        initialAmount: 75000,
        monthlyContribution: 0,
        annualReturn: 8,
        timeHorizon: 25,
        goal: 'education',
      },
    ]

    test.each(edgeCaseParams)(
      'should handle edge case parameters: initial=$initialAmount, monthly=$monthlyContribution, return=$annualReturn%, horizon=$timeHorizon years',
      (params) => {
        expect(() => {
          const content = generatePersonalizedContent(params, 'en')

          // Should generate all sections
          expect(Object.keys(content)).toHaveLength(8)

          // All sections should have content
          Object.values(content).forEach((section) => {
            expect(section).toBeTruthy()
            expect(section.length).toBeGreaterThan(50)
          })

          // Should not contain unreplaced placeholders
          const allContent = Object.values(content).join(' ')
          expect(allContent).not.toMatch(/\{\{[^}]*\}\}/)

          // Should contain parameter values (formatted appropriately)
          if (params.initialAmount > 0) {
            if (params.initialAmount >= 1000000) {
              const formattedInitial = `$${(
                params.initialAmount / 1000000
              ).toFixed(1)}M`
              expect(allContent).toContain(formattedInitial)
            } else if (params.initialAmount >= 1000) {
              const formattedInitial = `$${(
                params.initialAmount / 1000
              ).toFixed(0)}K`
              expect(allContent).toContain(formattedInitial)
            } else {
              expect(allContent).toContain(`$${params.initialAmount}`)
            }
          }
          if (params.monthlyContribution > 0) {
            if (params.monthlyContribution >= 1000) {
              const formattedMonthly = `$${(
                params.monthlyContribution / 1000
              ).toFixed(0)}K`
              expect(allContent).toContain(formattedMonthly)
            } else {
              expect(allContent).toContain(`$${params.monthlyContribution}`)
            }
          }
          expect(allContent).toContain(`${params.annualReturn}%`)
          expect(allContent).toContain(params.timeHorizon.toString())
        }).not.toThrow()
      }
    )
  })

  describe('Goal Category Testing', () => {
    const goalCategories = [
      'retirement',
      'house',
      'education',
      'emergency',
      'vacation',
      'wealth',
      'car',
      'business',
      'family',
      'investment',
    ]

    const baseParams: CalculatorInputs = {
      initialAmount: 15000,
      monthlyContribution: 750,
      annualReturn: 7,
      timeHorizon: 18,
      goal: 'retirement', // Will be overridden
    }

    test.each(goalCategories)(
      'should generate appropriate content for goal: %s',
      (goal) => {
        const params = { ...baseParams, goal }
        const content = generatePersonalizedContent(params, 'en')

        // Should generate all sections
        expect(Object.keys(content)).toHaveLength(8)

        // Content should reference the goal
        const allContent = Object.values(content).join(' ')
        expect(allContent.toLowerCase()).toContain(goal.toLowerCase())

        // Should have goal-appropriate content
        Object.values(content).forEach((section) => {
          expect(section.length).toBeGreaterThan(100)
          expect(section).not.toMatch(/\{\{[^}]*\}\}/)
        })
      }
    )

    test('should generate different content for different goals', () => {
      const retirementContent = generatePersonalizedContent(
        { ...baseParams, goal: 'retirement' },
        'en'
      )
      const houseContent = generatePersonalizedContent(
        { ...baseParams, goal: 'house' },
        'en'
      )

      // Content should be different for different goals
      expect(retirementContent.strategy_analysis).not.toBe(
        houseContent.strategy_analysis
      )
      expect(retirementContent.investment_overview).not.toBe(
        houseContent.investment_overview
      )
    })
  })

  describe('Time Horizon Variations', () => {
    const timeHorizons = [1, 3, 5, 10, 15, 20, 25, 30, 35, 40, 50]
    const baseParams: CalculatorInputs = {
      initialAmount: 20000,
      monthlyContribution: 800,
      annualReturn: 7,
      timeHorizon: 20, // Will be overridden
      goal: 'retirement',
    }

    test.each(timeHorizons)(
      'should generate appropriate content for timeHorizon: %d years',
      (timeHorizon) => {
        const params = { ...baseParams, timeHorizon }
        const content = generatePersonalizedContent(params, 'en')

        // Should generate all sections
        expect(Object.keys(content)).toHaveLength(8)

        // Content should reference the time horizon
        const allContent = Object.values(content).join(' ')
        expect(allContent).toContain(timeHorizon.toString())

        // Should have time-appropriate strategy
        if (timeHorizon <= 5) {
          expect(allContent.toLowerCase()).toMatch(
            /short.{0,20}term|conservative|stable/
          )
        } else if (timeHorizon >= 25) {
          expect(allContent.toLowerCase()).toMatch(
            /long.{0,20}term|compound|growth/
          )
        }
      }
    )
  })

  describe('Return Rate Variations', () => {
    const returnRates = [2, 4, 5, 6, 7, 8, 9, 10, 12, 15]
    const baseParams: CalculatorInputs = {
      initialAmount: 25000,
      monthlyContribution: 1000,
      annualReturn: 7, // Will be overridden
      timeHorizon: 20,
      goal: 'retirement',
    }

    test.each(returnRates)(
      'should generate appropriate content for annualReturn: %d%%',
      (annualReturn) => {
        const params = { ...baseParams, annualReturn }
        const content = generatePersonalizedContent(params, 'en')

        // Should generate all sections
        expect(Object.keys(content)).toHaveLength(8)

        // Content should reference the return rate
        const allContent = Object.values(content).join(' ')
        expect(allContent).toContain(`${annualReturn}%`)

        // Should have return-appropriate risk assessment
        if (annualReturn <= 4) {
          expect(allContent.toLowerCase()).toMatch(
            /conservative|low.{0,20}risk|stable/
          )
        } else if (annualReturn >= 10) {
          expect(allContent.toLowerCase()).toMatch(
            /aggressive|high.{0,20}risk|growth/
          )
        }
      }
    )
  })

  describe('Amount Range Variations', () => {
    const amountCombinations = [
      { initial: 0, monthly: 100 },
      { initial: 1000, monthly: 50 },
      { initial: 5000, monthly: 250 },
      { initial: 10000, monthly: 500 },
      { initial: 25000, monthly: 1000 },
      { initial: 50000, monthly: 2000 },
      { initial: 100000, monthly: 5000 },
      { initial: 250000, monthly: 0 },
      { initial: 500000, monthly: 10000 },
    ]

    const baseParams: CalculatorInputs = {
      initialAmount: 10000, // Will be overridden
      monthlyContribution: 500, // Will be overridden
      annualReturn: 7,
      timeHorizon: 20,
      goal: 'retirement',
    }

    test.each(amountCombinations)(
      'should handle amount combination: initial=$initial, monthly=$monthly',
      ({ initial, monthly }) => {
        const params = {
          ...baseParams,
          initialAmount: initial,
          monthlyContribution: monthly,
        }
        const content = generatePersonalizedContent(params, 'en')

        // Should generate all sections
        expect(Object.keys(content)).toHaveLength(8)

        // Should not break with any amount combination
        Object.values(content).forEach((section) => {
          expect(section.length).toBeGreaterThan(50)
          expect(section).not.toMatch(/\{\{[^}]*\}\}/)
        })

        // Should handle zero values gracefully
        const allContent = Object.values(content).join(' ')
        if (initial === 0) {
          expect(allContent).toContain('$0')
        }
        if (monthly === 0) {
          expect(allContent).toContain('$0')
        }
      }
    )
  })

  describe('Multi-Language Parameter Consistency', () => {
    const testParams: CalculatorInputs = {
      initialAmount: 15000,
      monthlyContribution: 600,
      annualReturn: 8,
      timeHorizon: 25,
      goal: 'retirement',
    }

    const languages = ['en', 'es', 'pl']

    test.each(languages)(
      'should maintain parameter accuracy in %s locale',
      (locale) => {
        const content = generatePersonalizedContent(testParams, locale)
        const allContent = Object.values(content).join(' ')

        // Should contain the correct parameter values (formatted)
        expect(allContent).toContain('$15K') // Initial amount (15K)
        expect(allContent).toContain('$600') // Monthly contribution
        expect(allContent).toContain('8%') // Annual return
        expect(allContent).toContain('25') // Time horizon

        // Should have appropriate formatting for currency
        expect(allContent).toMatch(/\$15K|\$15,000/)
        expect(allContent).toMatch(/\$600/)

        // Should not have unreplaced placeholders
        expect(allContent).not.toMatch(/\{\{[^}]*\}\}/)
      }
    )

    test('should generate consistent calculations across languages', () => {
      const enContent = generatePersonalizedContent(testParams, 'en')
      const esContent = generatePersonalizedContent(testParams, 'es')
      const plContent = generatePersonalizedContent(testParams, 'pl')

      // Extract future values from each language (they should be the same)
      const extractNumbers = (text: string) => {
        const matches = text.match(/\$(\d+(?:,\d{3})*(?:\.\d+)?[KM]?)/g)
        return matches || []
      }

      const enNumbers = extractNumbers(Object.values(enContent).join(' '))
      const esNumbers = extractNumbers(Object.values(esContent).join(' '))
      const plNumbers = extractNumbers(Object.values(plContent).join(' '))

      // Should have similar numerical content across languages
      expect(enNumbers.length).toBeGreaterThan(0)
      expect(esNumbers.length).toBeGreaterThan(0)
      expect(plNumbers.length).toBeGreaterThan(0)

      // Key amounts should appear in all versions
      const keyAmounts = ['$15K', '$600']
      keyAmounts.forEach((amount) => {
        expect(enNumbers.some((num) => num.includes(amount))).toBe(true)
        expect(esNumbers.some((num) => num.includes(amount))).toBe(true)
        expect(plNumbers.some((num) => num.includes(amount))).toBe(true)
      })
    })
  })

  describe('Template Population Edge Cases', () => {
    test('should handle templates with no placeholders', () => {
      const template = 'This is a simple template with no dynamic content.'
      const result = populateTemplate(template, {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturn: 5,
        timeHorizon: 10,
        goal: 'test',
      })

      expect(result).toBe(template)
    })

    test('should handle templates with many placeholders', () => {
      const template = `
        Initial: {{ initialAmount }}, Monthly: {{ monthlyContribution }},
        Return: {{ annualReturn }}, Years: {{ timeHorizon }},
        Future: {{ futureValue }}, Total: {{ totalContributions }},
        Goal: {{ goal }}, Risk: {{ riskLevel }}
      `
      const result = populateTemplate(template, {
        initialAmount: 5000,
        monthlyContribution: 200,
        annualReturn: 6,
        timeHorizon: 15,
        goal: 'house',
      })

      // Should replace all placeholders
      expect(result).not.toMatch(/\{\{[^}]*\}\}/)
      expect(result).toContain('$5K')
      expect(result).toContain('$200')
      expect(result).toContain('6%')
      expect(result).toContain('15 years')
      expect(result).toContain('house')
    })

    test('should handle malformed placeholders gracefully', () => {
      const template =
        'Good: {{ initialAmount }} Bad: {{incomplete Missing: { singleBrace }'
      const result = populateTemplate(template, {
        initialAmount: 1000,
        monthlyContribution: 100,
        annualReturn: 5,
        timeHorizon: 10,
        goal: 'test',
      })

      // Should replace valid placeholders and leave invalid ones
      expect(result).toContain('$1K')
      expect(result).toContain('{{incomplete')
      expect(result).toContain('{ singleBrace }')
    })
  })

  describe('Performance with Large Parameter Sets', () => {
    test('should handle bulk content generation efficiently', () => {
      const paramSets: CalculatorInputs[] = []

      // Generate 100 different parameter combinations
      for (let i = 0; i < 100; i++) {
        paramSets.push({
          initialAmount: Math.floor(Math.random() * 100000) + 1000,
          monthlyContribution: Math.floor(Math.random() * 2000) + 100,
          annualReturn: Math.floor(Math.random() * 10) + 3,
          timeHorizon: Math.floor(Math.random() * 40) + 5,
          goal: ['retirement', 'house', 'education', 'emergency'][
            Math.floor(Math.random() * 4)
          ],
        })
      }

      const startTime = Date.now()

      // Generate content for all parameter sets
      paramSets.forEach((params) => {
        const content = generatePersonalizedContent(params, 'en')
        expect(Object.keys(content)).toHaveLength(8)
      })

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Should complete in reasonable time (less than 5 seconds for 100 generations)
      expect(totalTime).toBeLessThan(5000)

      // Average time per generation should be reasonable
      const avgTime = totalTime / 100
      expect(avgTime).toBeLessThan(50) // Less than 50ms per generation
    })
  })
})
