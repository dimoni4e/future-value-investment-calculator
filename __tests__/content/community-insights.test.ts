/**
 * @fileoverview Tests for Community Insights Template (Task 7.1.6)
 *
 * Tests the community insights content generation including:
 * - Similar investor profiles and success stories
 * - User data anonymization
 * - Content quality and inspirational value
 * - Profile matching accuracy
 * - Multi-language support
 */

import { generatePersonalizedContent } from '../../lib/contentGenerator'
import { CalculatorInputs } from '../../lib/types'

const mockInputs: CalculatorInputs = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 8,
  timeHorizon: 20,
  goal: 'retirement planning',
}

describe('Community Insights Template', () => {
  describe('Template Content Generation', () => {
    test('should generate community insights content for each locale', async () => {
      const locales = ['en', 'es', 'pl']

      for (const locale of locales) {
        const content = await generatePersonalizedContent(mockInputs, locale)

        expect(content.community_insights).toBeDefined()
        expect(content.community_insights.length).toBeGreaterThan(200)
        // Check for locale-appropriate terms for "investors"
        if (locale === 'es') {
          expect(content.community_insights).toContain('inversores')
        } else if (locale === 'pl') {
          expect(content.community_insights).toContain('inwestor')
        } else {
          expect(content.community_insights).toContain('investors')
        }
      }
    })

    test('should include similar investor profiles', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss similar investor profiles
      expect(content.community_insights).toContain('similar')
      expect(content.community_insights).toContain('profiles')
      expect(content.community_insights).toContain('investors')
    })

    test('should include success stories and case studies', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should include success indicators
      expect(content.community_insights).toContain('successful')
      expect(content.community_insights).toContain('achieve')
      expect(content.community_insights).toContain('objectives')
    })

    test('should include common challenges and solutions', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss challenges and solutions
      expect(content.community_insights).toContain('maintain')
      expect(content.community_insights).toContain('consistent')
      expect(content.community_insights).toContain('automate')
    })
  })

  describe('Profile Matching and Personalization', () => {
    test('should adapt insights based on investment parameters', async () => {
      const highAmountInputs = {
        ...mockInputs,
        initialAmount: 50000,
        monthlyContribution: 2000,
      }
      const lowAmountInputs = {
        ...mockInputs,
        initialAmount: 1000,
        monthlyContribution: 100,
      }

      const highAmountContent = await generatePersonalizedContent(
        highAmountInputs,
        'en'
      )
      const lowAmountContent = await generatePersonalizedContent(
        lowAmountInputs,
        'en'
      )

      expect(highAmountContent.community_insights).toBeDefined()
      expect(lowAmountContent.community_insights).toBeDefined()

      // Content should be personalized but maintain consistency
      expect(highAmountContent.community_insights.length).toBeGreaterThan(150)
      expect(lowAmountContent.community_insights.length).toBeGreaterThan(150)
    })

    test('should include goal-specific insights', async () => {
      const retirementInputs = { ...mockInputs, goal: 'retirement planning' }
      const houseInputs = { ...mockInputs, goal: 'house' }

      const retirementContent = await generatePersonalizedContent(
        retirementInputs,
        'en'
      )
      const houseContent = await generatePersonalizedContent(houseInputs, 'en')

      // Should include translated goal references
      expect(retirementContent.community_insights).toContain('retirement')
      expect(houseContent.community_insights).toContain('home purchase')
    })

    test('should provide realistic success rates', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should include percentage-based success metrics
      expect(content.community_insights).toMatch(/\d+%/)

      // Extract success rate to validate it's realistic (40-95%)
      const successRateMatch = content.community_insights.match(/(\d+)%/)
      if (successRateMatch) {
        const successRate = parseInt(successRateMatch[1])
        expect(successRate).toBeGreaterThanOrEqual(40)
        expect(successRate).toBeLessThanOrEqual(95)
      }
    })
  })

  describe('Data Anonymization and Privacy', () => {
    test('should not contain personally identifiable information', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should not contain specific names, addresses, or identifying information
      expect(content.community_insights).not.toMatch(
        /\b[A-Z][a-z]+ [A-Z][a-z]+\b/
      ) // Full names
      expect(content.community_insights).not.toMatch(/\d{3}-\d{2}-\d{4}/) // SSNs
      expect(content.community_insights).not.toMatch(/\d{10,}/) // Phone numbers
      expect(content.community_insights).not.toContain('@') // Email addresses
    })

    test('should use aggregated and anonymized data references', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should reference data in aggregate terms
      expect(content.community_insights).toMatch(
        /thousands|hundreds|many|most|typical/i
      )
      expect(content.community_insights).not.toContain('John')
      expect(content.community_insights).not.toContain('specific')
      expect(content.community_insights).not.toContain('individual')
    })

    test('should maintain professional and ethical tone', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should maintain professional language
      expect(content.community_insights).not.toContain('guarantee')
      expect(content.community_insights).not.toContain('promise')
      expect(content.community_insights).not.toContain('will definitely')

      // Should use appropriate language like "typically", "often", "tend to"
      expect(content.community_insights).toMatch(
        /typically|often|tend to|generally/i
      )
    })
  })

  describe('Inspirational Content Quality', () => {
    test('should provide motivational and encouraging content', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should include encouraging language
      expect(content.community_insights).toMatch(
        /success|achieve|accomplish|reach/i
      )
      expect(content.community_insights).toContain('not alone')

      // Should provide positive reinforcement
      expect(content.community_insights.toLowerCase()).toMatch(
        /journey|path|progress/
      )
    })

    test('should include practical behavioral insights', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should include actionable behavioral insights
      expect(content.community_insights).toContain('automate')
      expect(content.community_insights).toContain('consistent')
      expect(content.community_insights).toMatch(/rarely|seldom|avoid/)
    })

    test('should reference market volatility behavior', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss behavior during market volatility
      expect(content.community_insights).toContain('volatility')
      expect(content.community_insights).toMatch(/market|portfolio/)
      expect(content.community_insights).toMatch(/check|monitor|review/)
    })

    test('should maintain appropriate content length', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should be substantial but not overwhelming
      expect(content.community_insights.length).toBeGreaterThan(200)
      expect(content.community_insights.length).toBeLessThan(800)

      // Should be approximately 2-4 sentences
      const sentences = content.community_insights
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0)
      expect(sentences.length).toBeGreaterThanOrEqual(2)
      expect(sentences.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Multi-language Support', () => {
    test('should generate appropriate content for Spanish locale', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'es')

      expect(content.community_insights).toBeDefined()
      expect(content.community_insights).toContain('inversores')
      expect(content.community_insights).toContain('similares')
      expect(content.community_insights).toMatch(/exitosos|éxito/)
    })

    test('should generate appropriate content for Polish locale', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'pl')

      expect(content.community_insights).toBeDefined()
      expect(content.community_insights).toContain('inwestor')
      expect(content.community_insights).toContain('podobn')
      expect(content.community_insights).toMatch(/skuteczn|sukces/)
    })

    test('should maintain consistent structure across languages', async () => {
      const enContent = await generatePersonalizedContent(mockInputs, 'en')
      const esContent = await generatePersonalizedContent(mockInputs, 'es')
      const plContent = await generatePersonalizedContent(mockInputs, 'pl')

      // All should have substantial content
      for (const content of [enContent, esContent, plContent]) {
        expect(content.community_insights.length).toBeGreaterThan(200)
        expect(content.community_insights).toMatch(/\d+%/) // Should include success rate
      }
    })

    test('should handle cultural adaptation appropriately', async () => {
      const enContent = await generatePersonalizedContent(mockInputs, 'en')
      const esContent = await generatePersonalizedContent(mockInputs, 'es')
      const plContent = await generatePersonalizedContent(mockInputs, 'pl')

      // Should maintain professional tone across all languages
      expect(enContent.community_insights).not.toContain('guarantee')
      expect(esContent.community_insights).not.toContain('garantiza')
      expect(plContent.community_insights).not.toContain('gwarantuje')
    })
  })

  describe('Content Consistency and Reliability', () => {
    test('should generate consistent content for same parameters', async () => {
      const content1 = await generatePersonalizedContent(mockInputs, 'en')
      const content2 = await generatePersonalizedContent(mockInputs, 'en')

      // Core structure should be consistent
      expect(content1.community_insights.length).toEqual(
        content2.community_insights.length
      )
      expect(content1.community_insights).toEqual(content2.community_insights)
    })

    test('should handle edge case parameters gracefully', async () => {
      const edgeCases = [
        { ...mockInputs, initialAmount: 0, monthlyContribution: 25 },
        { ...mockInputs, initialAmount: 1000000, monthlyContribution: 10000 },
        { ...mockInputs, timeHorizon: 5 },
        { ...mockInputs, timeHorizon: 40 },
        { ...mockInputs, annualReturn: 3 },
        { ...mockInputs, annualReturn: 15 },
      ]

      for (const edgeCase of edgeCases) {
        const content = await generatePersonalizedContent(edgeCase, 'en')
        expect(content.community_insights).toBeDefined()
        expect(content.community_insights.length).toBeGreaterThan(100)
      }
    })

    test('should maintain data accuracy in community insights', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Success rates should be realistic and not overstated
      const percentageMatches =
        content.community_insights.match(/(\d+)%/g) || []
      for (const match of percentageMatches) {
        const percentage = parseInt(match.replace('%', ''))
        expect(percentage).toBeGreaterThanOrEqual(0)
        expect(percentage).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('Integration with Goal Types', () => {
    test('should adapt content for different investment goals', async () => {
      const goals = ['retirement', 'house', 'education', 'wealth', 'emergency']

      for (const goal of goals) {
        const content = await generatePersonalizedContent(
          { ...mockInputs, goal },
          'en'
        )

        expect(content.community_insights).toBeDefined()
        expect(content.community_insights.length).toBeGreaterThan(150)

        // Should include goal-relevant language
        if (goal === 'retirement') {
          expect(content.community_insights).toMatch(/retirement|retire/i)
        }
      }
    })

    test('should provide goal-appropriate success metrics', async () => {
      const retirementInputs = { ...mockInputs, goal: 'retirement' }
      const emergencyInputs = { ...mockInputs, goal: 'emergency' }

      const retirementContent = await generatePersonalizedContent(
        retirementInputs,
        'en'
      )
      const emergencyContent = await generatePersonalizedContent(
        emergencyInputs,
        'en'
      )

      // Both should have success metrics but potentially different ranges
      expect(retirementContent.community_insights).toMatch(/\d+%/)
      expect(emergencyContent.community_insights).toMatch(/\d+%/)
    })
  })
})
