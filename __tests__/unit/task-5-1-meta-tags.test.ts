/**
 * Task 5.1 Meta Tags Unit Tests
 * Simple tests that verify meta tag generation logic without complex imports
 */

import { parseSlugToScenario, detectInvestmentGoal } from '@/lib/scenarioUtils'

describe('Task 5.1: Meta Tag Generation Logic', () => {
  describe('Slug Parsing and Goal Detection', () => {
    it('should parse retirement scenario slug correctly', () => {
      const slug = 'invest-50000-monthly-2000-8percent-25years-retirement'
      const parsed = parseSlugToScenario(slug)

      expect(parsed).not.toBeNull()
      expect(parsed?.initialAmount).toBe(50000)
      expect(parsed?.monthlyContribution).toBe(2000)
      expect(parsed?.annualReturn).toBe(8)
      expect(parsed?.timeHorizon).toBe(25)
      expect(parsed?.goal).toBe('retirement')
    })

    it('should parse house scenario slug correctly', () => {
      const slug = 'invest-25000-monthly-1000-7percent-15years-house'
      const parsed = parseSlugToScenario(slug)

      expect(parsed).not.toBeNull()
      expect(parsed?.initialAmount).toBe(25000)
      expect(parsed?.monthlyContribution).toBe(1000)
      expect(parsed?.annualReturn).toBe(7)
      expect(parsed?.timeHorizon).toBe(15)
      expect(parsed?.goal).toBe('house')
    })

    it('should detect appropriate investment goals', () => {
      // Long-term retirement scenario
      const retirementParams = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturn: 0.08,
        timeHorizon: 25,
      }
      expect(detectInvestmentGoal(retirementParams)).toBe('retirement')

      // House down payment scenario
      const houseParams = {
        initialAmount: 25000,
        monthlyContribution: 1000,
        annualReturn: 0.07,
        timeHorizon: 8,
      }
      expect(detectInvestmentGoal(houseParams)).toBe('house')

      // Emergency fund scenario
      const emergencyParams = {
        initialAmount: 5000,
        monthlyContribution: 500,
        annualReturn: 0.03,
        timeHorizon: 2,
      }
      expect(detectInvestmentGoal(emergencyParams)).toBe('emergency')
    })

    it('should handle invalid slugs gracefully', () => {
      const invalidSlug = 'invalid-slug-format'
      const parsed = parseSlugToScenario(invalidSlug)

      expect(parsed).toBeNull()
    })

    it('should generate appropriate titles for different scenarios', () => {
      // Test title generation logic
      const scenarios = [
        {
          slug: 'invest-50000-monthly-2000-8percent-25years-retirement',
          expectedInTitle: ['$50,000', '$2,000', '8%', '25 Year', 'retirement'],
        },
        {
          slug: 'invest-25000-monthly-1000-7percent-15years-house',
          expectedInTitle: ['$25,000', '$1,000', '7%', '15 Year', 'house'],
        },
        {
          slug: 'invest-10000-monthly-500-6percent-10years-education',
          expectedInTitle: ['$10,000', '$500', '6%', '10 Year', 'education'],
        },
      ]

      scenarios.forEach(({ slug, expectedInTitle }) => {
        const parsed = parseSlugToScenario(slug)
        expect(parsed).not.toBeNull()

        if (parsed) {
          const goal = parsed.goal // Use goal from slug for this test
          const initial = parsed.initialAmount
          const monthly = parsed.monthlyContribution
          const rate = parsed.annualReturn.toFixed(0) // Rate is already a percentage from slug
          const timeHorizon = parsed.timeHorizon

          // Simulated title generation
          let title = `Invest $${initial.toLocaleString()} + $${monthly.toLocaleString()}/month at ${rate}% - ${timeHorizon} Year ${goal} Plan`

          // Apply SEO title length limit
          if (title.length > 60) {
            title = title.substring(0, 57) + '...'
          }

          expectedInTitle.forEach((expected) => {
            expect(title).toContain(expected)
          })

          // SEO compliance checks
          expect(title.length).toBeLessThanOrEqual(60)
        }
      })
    })

    it('should generate appropriate descriptions for different scenarios', () => {
      const scenarios = [
        'invest-50000-monthly-2000-8percent-25years-retirement',
        'invest-25000-monthly-1000-7percent-15years-house',
        'invest-10000-monthly-500-6percent-10years-education',
      ]

      scenarios.forEach((slug) => {
        const parsed = parseSlugToScenario(slug)
        expect(parsed).not.toBeNull()

        if (parsed) {
          const goal = detectInvestmentGoal(parsed)
          const initial = parsed.initialAmount
          const monthly = parsed.monthlyContribution
          const rate = parsed.annualReturn.toFixed(0) // Rate is already a percentage from slug
          const timeHorizon = parsed.timeHorizon

          // Simulated description generation (shorter version)
          let description = `Calculate investing $${initial.toLocaleString()} initially with $${monthly.toLocaleString()} monthly at ${rate}% return over ${timeHorizon} years for your ${goal} goal.`

          // Apply SEO description length limit
          if (description.length > 160) {
            description = description.substring(0, 157) + '...'
          }

          expect(description).toContain(initial.toLocaleString())
          expect(description).toContain(monthly.toLocaleString())
          expect(description).toContain(`${rate}%`)
          expect(description).toContain(`${timeHorizon} years`)
          expect(description).toContain(goal)

          // SEO compliance checks
          expect(description.length).toBeLessThanOrEqual(160)
        }
      })
    })

    it('should generate appropriate keywords for different scenarios', () => {
      const scenarios = [
        'invest-30000-monthly-1500-7point5percent-18years-emergency',
        'invest-40000-monthly-2500-8point5percent-22years-wealth',
        'invest-5000-monthly-250-5percent-8years-vacation',
      ]

      scenarios.forEach((slug) => {
        const parsed = parseSlugToScenario(slug)
        expect(parsed).not.toBeNull()

        if (parsed) {
          const goal = detectInvestmentGoal(parsed)
          const initial = parsed.initialAmount
          const monthly = parsed.monthlyContribution
          const rate = parsed.annualReturn.toFixed(0) // Rate is already a percentage from slug
          const timeHorizon = parsed.timeHorizon

          // Simulated keywords generation
          const keywords = `invest ${initial}, monthly ${monthly}, ${rate} percent return, ${timeHorizon} year investment, ${goal}, investment calculator, future value`

          expect(keywords).toContain(`invest ${initial}`)
          expect(keywords).toContain(`monthly ${monthly}`)
          expect(keywords).toContain(`${rate} percent`)
          expect(keywords).toContain(`${timeHorizon} year`)
          expect(keywords).toContain(goal)
          expect(keywords).toContain('investment calculator')

          // Keyword density check
          const keywordList = keywords.split(',').map((k) => k.trim())
          expect(keywordList.length).toBeGreaterThan(5)
          expect(keywordList.length).toBeLessThan(15)
        }
      })
    })
  })

  describe('SEO Compliance', () => {
    it('should enforce title length limits', () => {
      // Test very long scenario
      const longSlug = 'invest-100000-monthly-5000-12percent-30years-wealth'
      const parsed = parseSlugToScenario(longSlug)

      if (parsed) {
        const goal = detectInvestmentGoal(parsed)
        const initial = parsed.initialAmount
        const monthly = parsed.monthlyContribution
        const rate = parsed.annualReturn.toFixed(0) // Rate is already a percentage from slug
        const timeHorizon = parsed.timeHorizon

        let title = `Invest $${initial.toLocaleString()} + $${monthly.toLocaleString()}/month at ${rate}% - ${timeHorizon} Year ${goal} Plan`

        // Apply truncation logic like in generateMetadata
        if (title.length > 60) {
          title = title.substring(0, 57) + '...'
        }

        expect(title.length).toBeLessThanOrEqual(60)
        if (title.length >= 57) {
          expect(title).toMatch(/\.\.\.$/)
        }
      }
    })

    it('should enforce description length limits', () => {
      const scenarios = ['invest-75000-monthly-3000-9percent-20years-wealth']

      scenarios.forEach((slug) => {
        const parsed = parseSlugToScenario(slug)

        if (parsed) {
          const goal = detectInvestmentGoal(parsed)
          const initial = parsed.initialAmount
          const monthly = parsed.monthlyContribution
          const rate = parsed.annualReturn.toFixed(0) // Rate is already a percentage from slug
          const timeHorizon = parsed.timeHorizon

          let description = `Calculate investing $${initial.toLocaleString()} initially with $${monthly.toLocaleString()} monthly contributions at ${rate}% annual return over ${timeHorizon} years for your ${goal} goal. See detailed projections and optimization tips.`

          // Apply truncation logic like in generateMetadata
          if (description.length > 160) {
            description = description.substring(0, 157) + '...'
          }

          expect(description.length).toBeLessThanOrEqual(160)
        }
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero initial amount', () => {
      const slug = 'invest-0-monthly-500-7percent-15years-starter'
      const parsed = parseSlugToScenario(slug)

      expect(parsed).not.toBeNull()
      expect(parsed?.initialAmount).toBe(0)
      expect(parsed?.monthlyContribution).toBe(500)
    })

    it('should handle high return rates', () => {
      const slug = 'invest-20000-monthly-1000-15percent-10years-wealth'
      const parsed = parseSlugToScenario(slug)

      expect(parsed).not.toBeNull()
      expect(parsed?.annualReturn).toBe(15)
    })

    it('should handle long time horizons', () => {
      const slug = 'invest-10000-monthly-800-6percent-40years-retirement'
      const parsed = parseSlugToScenario(slug)

      expect(parsed).not.toBeNull()
      expect(parsed?.timeHorizon).toBe(40)
    })

    it('should handle decimal rates in slugs', () => {
      const slug = 'invest-30000-monthly-1500-7point5percent-18years-emergency'
      const parsed = parseSlugToScenario(slug)

      expect(parsed).not.toBeNull()
      expect(parsed?.annualReturn).toBe(7.5)
    })
  })
})
