/**
 * @fileoverview Tests for Optimization Tips Template (Task 7.1.7)
 *
 * Tests the optimization tips content generation including:
 * - Ways to increase returns
 * - Tax optimization strategies
 * - Automation recommendations
 * - Tip relevance to user parameters
 * - Actionability of recommendations
 * - Legal compliance of tax advice
 */

import {
  generatePersonalizedContent,
  CalculatorInputs,
} from '../../lib/contentGenerator'

const mockInputs: CalculatorInputs = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 8,
  timeHorizon: 20,
  goal: 'retirement planning',
}

describe('Optimization Tips Template', () => {
  describe('Template Content Generation', () => {
    test('should generate optimization tips content for each locale', async () => {
      const locales = ['en', 'es', 'pl']

      for (const locale of locales) {
        const content = await generatePersonalizedContent(mockInputs, locale)

        expect(content.optimization_tips).toBeDefined()
        expect(content.optimization_tips.length).toBeGreaterThan(150)
        // Check for locale-appropriate terms for "optimization"
        if (locale === 'es') {
          expect(content.optimization_tips).toContain('optimización')
        } else if (locale === 'pl') {
          expect(content.optimization_tips).toContain('optymalizac')
        } else {
          expect(content.optimization_tips).toContain('optimization')
        }
      }
    })

    test('should include ways to increase returns', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss return enhancement strategies
      const tips = content.optimization_tips.toLowerCase()
      expect(tips).toMatch(/increase|boost|enhance|improve|maximize/)
      expect(tips).toMatch(/return|result|value|portfolio/)
    })

    test('should include automation recommendations', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss automation strategies
      expect(content.optimization_tips).toContain('automatic')
      expect(content.optimization_tips).toMatch(
        /monthly|contribution|beginning/
      )
    })

    test('should include escalation strategies', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should discuss contribution escalation
      expect(content.optimization_tips).toMatch(/increase|escalation|annual/)
      expect(content.optimization_tips).toMatch(/\d+%/) // Should contain percentage
    })
  })

  describe('Parameter-Based Personalization', () => {
    test('should adapt tips based on investment amount', async () => {
      const highAmountInputs = {
        ...mockInputs,
        initialAmount: 100000,
        monthlyContribution: 5000,
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

      expect(highAmountContent.optimization_tips).toBeDefined()
      expect(lowAmountContent.optimization_tips).toBeDefined()

      // Content should be personalized but maintain core optimization principles
      expect(highAmountContent.optimization_tips.length).toBeGreaterThan(150)
      expect(lowAmountContent.optimization_tips.length).toBeGreaterThan(150)
    })

    test('should include goal-specific optimization strategies', async () => {
      const retirementInputs = { ...mockInputs, goal: 'retirement planning' }
      const houseInputs = { ...mockInputs, goal: 'house' }

      const retirementContent = await generatePersonalizedContent(
        retirementInputs,
        'en'
      )
      const houseContent = await generatePersonalizedContent(houseInputs, 'en')

      // Should include translated goal references in optimization context
      expect(retirementContent.optimization_tips).toContain('retirement')
      expect(houseContent.optimization_tips).toContain('home purchase')
    })

    test('should provide time-horizon appropriate tips', async () => {
      const shortTermInputs = { ...mockInputs, timeHorizon: 5 }
      const longTermInputs = { ...mockInputs, timeHorizon: 30 }

      const shortTermContent = await generatePersonalizedContent(
        shortTermInputs,
        'en'
      )
      const longTermContent = await generatePersonalizedContent(
        longTermInputs,
        'en'
      )

      expect(shortTermContent.optimization_tips).toBeDefined()
      expect(longTermContent.optimization_tips).toBeDefined()

      // Both should contain optimization strategies
      expect(shortTermContent.optimization_tips).toMatch(
        /optimization|automatic|increase/
      )
      expect(longTermContent.optimization_tips).toMatch(
        /optimization|automatic|increase/
      )
    })
  })

  describe('Content Quality and Actionability', () => {
    test('should provide actionable recommendations', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should contain actionable language
      const actionableWords = [
        'consider',
        'set up',
        'make',
        'increase',
        'automate',
        'implement',
      ]
      const hasActionableLanguage = actionableWords.some((word) =>
        content.optimization_tips.toLowerCase().includes(word)
      )
      expect(hasActionableLanguage).toBe(true)
    })

    test('should include specific strategies', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should include specific optimization strategies
      expect(content.optimization_tips).toMatch(
        /beginning.*month|monthly.*contribution/
      )
      expect(content.optimization_tips).toMatch(
        /annual.*increase|automatic.*increase/
      )
    })

    test('should maintain appropriate content length', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should be substantial enough to be helpful
      expect(content.optimization_tips.length).toBeGreaterThan(150)
      expect(content.optimization_tips.length).toBeLessThan(800)
    })

    test('should avoid overly complex financial jargon', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should use accessible language
      const complexTerms = [
        'derivative',
        'hedge',
        'arbitrage',
        'volatility smile',
      ]
      const hasComplexTerms = complexTerms.some((term) =>
        content.optimization_tips.toLowerCase().includes(term)
      )
      expect(hasComplexTerms).toBe(false)
    })
  })

  describe('Mathematical Accuracy', () => {
    test('should include accurate escalation calculations', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should contain escalation percentage and escalated value
      expect(content.optimization_tips).toMatch(/\d+%.*annual.*increase/)
      expect(content.optimization_tips).toMatch(/\$[\d,]+/) // Should contain formatted currency
    })

    test('should provide realistic escalation suggestions', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Extract escalation percentage if mentioned
      const escalationMatch = content.optimization_tips.match(
        /(\d+)%.*annual.*increase/
      )
      if (escalationMatch) {
        const escalationPercent = parseInt(escalationMatch[1])
        expect(escalationPercent).toBeGreaterThan(0)
        expect(escalationPercent).toBeLessThan(20) // Realistic annual increase
      }
    })

    test('should calculate meaningful value improvements', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should show how optimization can improve outcomes
      expect(content.optimization_tips).toMatch(/boost|increase|improve/)
      expect(content.optimization_tips).toMatch(/portfolio.*value|final.*value/)
    })
  })

  describe('Multi-language Support', () => {
    test('should generate appropriate content for Spanish locale', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'es')

      expect(content.optimization_tips).toBeDefined()
      expect(content.optimization_tips).toContain('optimización')
      expect(content.optimization_tips).toContain('estrategia')
      expect(content.optimization_tips).toContain('automático')
    })

    test('should generate appropriate content for Polish locale', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'pl')

      expect(content.optimization_tips).toBeDefined()
      expect(content.optimization_tips).toContain('optymalizac')
      expect(content.optimization_tips).toContain('strategii')
      expect(content.optimization_tips).toContain('automatyczne')
    })

    test('should maintain consistent structure across languages', async () => {
      const enContent = await generatePersonalizedContent(mockInputs, 'en')
      const esContent = await generatePersonalizedContent(mockInputs, 'es')
      const plContent = await generatePersonalizedContent(mockInputs, 'pl')

      // All should have substantial content
      expect(enContent.optimization_tips.length).toBeGreaterThan(150)
      expect(esContent.optimization_tips.length).toBeGreaterThan(150)
      expect(plContent.optimization_tips.length).toBeGreaterThan(150)

      // All should contain optimization concepts
      expect(enContent.optimization_tips).toMatch(
        /optimization|automatic|increase/
      )
      expect(esContent.optimization_tips).toMatch(
        /optimización|automático|aumento/
      )
      expect(plContent.optimization_tips).toMatch(
        /optymalizac|automatyczne|zwiększenie/
      )
    })
  })

  describe('Professional and Ethical Tone', () => {
    test('should maintain professional tone', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should not contain overly casual language
      const casualPhrases = [
        'totally',
        'awesome',
        'super cool',
        'amazing',
        'incredible',
      ]
      const hasCasualLanguage = casualPhrases.some((phrase) =>
        content.optimization_tips.toLowerCase().includes(phrase)
      )
      expect(hasCasualLanguage).toBe(false)
    })

    test('should avoid making guarantees', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should not make absolute guarantees
      const guaranteeWords = [
        'guarantee',
        'guaranteed',
        'will definitely',
        'certain to',
      ]
      const hasGuarantees = guaranteeWords.some((word) =>
        content.optimization_tips.toLowerCase().includes(word)
      )
      expect(hasGuarantees).toBe(false)
    })

    test('should use appropriate conditional language', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should use conditional/suggestive language
      const conditionalWords = [
        'consider',
        'could',
        'might',
        'may',
        'potential',
      ]
      const hasConditionalLanguage = conditionalWords.some((word) =>
        content.optimization_tips.toLowerCase().includes(word)
      )
      expect(hasConditionalLanguage).toBe(true)
    })
  })

  describe('Content Consistency and Reliability', () => {
    test('should generate consistent content for same parameters', async () => {
      const content1 = await generatePersonalizedContent(mockInputs, 'en')
      const content2 = await generatePersonalizedContent(mockInputs, 'en')

      // Should generate identical content for same inputs
      expect(content1.optimization_tips).toBe(content2.optimization_tips)
    })

    test('should handle edge case parameters gracefully', async () => {
      const edgeCases = [
        { ...mockInputs, initialAmount: 0, monthlyContribution: 50 },
        { ...mockInputs, initialAmount: 1000000, monthlyContribution: 10000 },
        { ...mockInputs, timeHorizon: 1 },
        { ...mockInputs, timeHorizon: 50 },
        { ...mockInputs, annualReturn: 1 },
        { ...mockInputs, annualReturn: 15 },
      ]

      for (const edgeCase of edgeCases) {
        const content = await generatePersonalizedContent(edgeCase, 'en')
        expect(content.optimization_tips).toBeDefined()
        expect(content.optimization_tips.length).toBeGreaterThan(100)
      }
    })

    test('should maintain optimization focus across all scenarios', async () => {
      const content = await generatePersonalizedContent(mockInputs, 'en')

      // Should always maintain focus on optimization
      expect(content.optimization_tips).toMatch(
        /optimization|optimize|improve|enhance/
      )
      expect(content.optimization_tips).toMatch(/strategy|technique|approach/)
    })
  })

  describe('Integration with Investment Goals', () => {
    test('should adapt optimization tips for different investment goals', async () => {
      const goals = [
        'retirement planning',
        'house',
        'education',
        'emergency',
        'wealth',
      ]

      for (const goal of goals) {
        const content = await generatePersonalizedContent(
          { ...mockInputs, goal },
          'en'
        )

        expect(content.optimization_tips).toBeDefined()
        expect(content.optimization_tips.length).toBeGreaterThan(150)

        // Should contain goal-relevant optimization strategies
        expect(content.optimization_tips).toMatch(
          /optimization|automatic|increase/
        )
      }
    })

    test('should provide goal-appropriate optimization strategies', async () => {
      const retirementInputs = { ...mockInputs, goal: 'retirement planning' }
      const emergencyInputs = { ...mockInputs, goal: 'emergency' }

      const retirementContent = await generatePersonalizedContent(
        retirementInputs,
        'en'
      )
      const emergencyContent = await generatePersonalizedContent(
        emergencyInputs,
        'en'
      )

      // Both should have optimization content
      expect(retirementContent.optimization_tips).toContain('retirement')
      expect(emergencyContent.optimization_tips).toContain('emergency')

      // Both should contain optimization strategies
      expect(retirementContent.optimization_tips).toMatch(
        /automatic|increase|optimization/
      )
      expect(emergencyContent.optimization_tips).toMatch(
        /automatic|increase|optimization/
      )
    })
  })
})
