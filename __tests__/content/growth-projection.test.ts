/**
 * Task 7.1.2: Growth Projection Template Tests
 * Test mathematical accuracy in projections
 * Test milestone calculation correctness
 * Test content engagement potential
 */

import {
  generatePersonalizedContent,
  type CalculatorInputs,
} from '../../lib/contentGenerator'

describe('Task 7.1.2: Growth Projection Template', () => {
  const testParams: CalculatorInputs = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    timeHorizon: 20,
    goal: 'retirement',
  }

  const supportedLanguages = ['en', 'es', 'pl']

  describe('Mathematical Accuracy in Projections', () => {
    test('should contain accurate future value calculations', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Test should contain calculated future value
      // With $10,000 initial + $500/month for 20 years at 7%, FV = $300,851
      expect(projectionContent).toMatch(/\$300,851/)

      // Should not contain placeholder values
      expect(projectionContent).not.toContain('{{ futureValue }}')
      expect(projectionContent).not.toContain('{{futureValue}}')
    })

    test('should show accurate 5-year milestone calculations', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // 5-year value should be $49,822
      expect(projectionContent).toMatch(/\$49,822/)
      expect(projectionContent).not.toContain('{{ fiveYearValue }}')
    })

    test('should show accurate 10-year milestone calculations', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // 10-year value should be $106,214
      expect(projectionContent).toMatch(/\$106,214/)
      expect(projectionContent).not.toContain('{{ tenYearValue }}')
    })

    test('should calculate total contributions correctly', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Total contributions = $10,000 + ($500 × 12 × 20) = $130,000
      expect(projectionContent).toMatch(/\$130,000/)
      expect(projectionContent).not.toContain('{{ monthlyTotal }}')
    })

    test('should handle edge case calculations correctly', () => {
      const edgeParams: CalculatorInputs = {
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 12,
        timeHorizon: 5,
        goal: 'wealth building',
      }

      const content = generatePersonalizedContent(edgeParams, 'en')
      const projectionContent = content.growth_projection

      // Should contain large amount formatting
      expect(projectionContent).toMatch(/\$1,000,000/)
      expect(projectionContent).toMatch(/\$10,000/)
      expect(projectionContent).toContain('12%')
      expect(projectionContent).toContain('5 years')
    })

    test('should maintain calculation consistency across languages', () => {
      supportedLanguages.forEach((locale) => {
        const content = generatePersonalizedContent(testParams, locale)
        const projectionContent = content.growth_projection

        // Financial calculations should be the same regardless of language
        expect(projectionContent).toMatch(/\$300,851/) // Future value
        expect(projectionContent).toMatch(/\$130,000/) // Total contributions
      })
    })
  })

  describe('Milestone Calculation Correctness', () => {
    test('should include year-by-year progression milestones', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Should mention different phases of growth
      expect(projectionContent).toMatch(/year 1[-–]5|years 1[-–]5/i)
      expect(projectionContent).toMatch(/year 6[-–]10|years 6[-–]10/i)
      expect(projectionContent).toMatch(/year 11[-–]20|years 11[-–]20/i)
    })

    test('should show compound interest acceleration over time', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should explain compound interest concept
      expect(projectionContent).toContain('compound')
      expect(projectionContent).toMatch(/accelerat|exponential|snowball/)

      // Should mention how returns generate returns
      expect(projectionContent).toMatch(
        /gains.*generating|returns.*returns|interest.*interest/
      )
    })

    test('should highlight key financial milestones', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should mention investment phases and milestones
      const milestoneTerms = [
        'foundation',
        'growth',
        'acceleration',
        'milestone',
        'phase',
      ]
      const hasMilestoneTerms = milestoneTerms.some((term) =>
        projectionContent.includes(term)
      )
      expect(hasMilestoneTerms).toBe(true)
    })

    test('should explain contribution vs growth dynamics', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should explain the role of monthly contributions
      expect(projectionContent).toMatch(
        /monthly.*contribution|contribution.*monthly/
      )
      expect(projectionContent).toMatch(/consistent|discipline|regular/)
    })

    test('should provide realistic timeline expectations', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Should reference the actual time horizon
      expect(projectionContent).toContain('20')
      expect(projectionContent).toMatch(/year|timeline|horizon/)

      // Should not promise unrealistic returns
      const unrealisticTerms = [
        'guaranteed',
        'certain',
        'definitely will',
        'promise',
      ]
      const hasUnrealisticTerms = unrealisticTerms.some((term) =>
        projectionContent.toLowerCase().includes(term)
      )
      expect(hasUnrealisticTerms).toBe(false)
    })
  })

  describe('Content Engagement Potential', () => {
    test('should have appropriate content length for engagement', () => {
      supportedLanguages.forEach((locale) => {
        const content = generatePersonalizedContent(testParams, locale)
        const projectionContent = content.growth_projection

        // Remove HTML tags for word count
        const textContent = projectionContent
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        const wordCount = textContent.split(' ').length

        // Should be substantial content for engagement
        const minWords = locale === 'pl' ? 200 : 250
        expect(wordCount).toBeGreaterThanOrEqual(minWords)
        expect(wordCount).toBeLessThanOrEqual(500) // Not too verbose
      })
    })

    test('should use engaging storytelling language', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should use narrative elements
      const narrativeTerms = [
        'journey',
        'story',
        'begins',
        'phase',
        'demonstrates',
        'showcases',
      ]
      const hasNarrativeTerms = narrativeTerms.some((term) =>
        projectionContent.includes(term)
      )
      expect(hasNarrativeTerms).toBe(true)
    })

    test('should include visual progression indicators', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Should structure content with clear phases
      expect(projectionContent).toMatch(/<strong>.*year.*<\/strong>/i)
      expect(projectionContent).toMatch(/<h2>/i) // Should have heading
      expect(projectionContent).toMatch(/<p>/i) // Should have paragraphs
    })

    test('should maintain professional yet accessible tone', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should avoid overly technical jargon
      const technicalTerms = [
        'algorithm',
        'derivative',
        'stochastic',
        'quantitative',
      ]
      const hasTechnicalTerms = technicalTerms.some((term) =>
        projectionContent.includes(term)
      )
      expect(hasTechnicalTerms).toBe(false)

      // Should use accessible financial terms
      const accessibleTerms = [
        'growth',
        'investment',
        'returns',
        'contributions',
      ]
      const hasAccessibleTerms = accessibleTerms.some((term) =>
        projectionContent.includes(term)
      )
      expect(hasAccessibleTerms).toBe(true)
    })

    test('should encourage long-term thinking', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should emphasize long-term benefits
      const longTermTerms = [
        'long-term',
        'patience',
        'time',
        'horizon',
        'persist',
      ]
      const hasLongTermTerms = longTermTerms.some((term) =>
        projectionContent.includes(term)
      )
      expect(hasLongTermTerms).toBe(true)
    })
  })

  describe('SEO and Structure Optimization', () => {
    test('should include growth-related keywords', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      const growthKeywords = [
        'growth projection',
        'compound interest',
        'investment growth',
        'financial projection',
        'wealth accumulation',
      ]

      growthKeywords.forEach((keyword) => {
        expect(projectionContent).toContain(keyword.toLowerCase())
      })
    })

    test('should have proper HTML structure', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Should have proper heading
      expect(projectionContent).toMatch(/<h2>.*growth.*projection.*<\/h2>/i)

      // Should have structured paragraphs
      expect(projectionContent).toMatch(/<p>.*<\/p>/)

      // Should have emphasized amounts
      expect(projectionContent).toMatch(/<strong>.*\$.*<\/strong>/)
    })

    test('should not have unclosed HTML tags', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Basic check for unclosed tags
      const openTags = (projectionContent.match(/<[^/][^>]*>/g) || []).length
      const closeTags = (projectionContent.match(/<\/[^>]*>/g) || []).length
      const selfClosingTags = (projectionContent.match(/<[^>]*\/>/g) || [])
        .length

      expect(openTags - selfClosingTags).toBe(closeTags)
    })

    test('should include parameter-specific SEO terms', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should include specific investment parameters for SEO
      expect(projectionContent).toMatch(/10,?000/) // Initial amount
      expect(projectionContent).toMatch(/500/) // Monthly contribution
      expect(projectionContent).toMatch(/7.*percent|7%/) // Return rate
      expect(projectionContent).toMatch(/20.*year/) // Time horizon
    })
  })

  describe('Educational Value and Clarity', () => {
    test('should explain compound interest clearly', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection.toLowerCase()

      // Should explain the concept of compound interest
      expect(projectionContent).toContain('compound')
      expect(projectionContent).toMatch(/mathematical|principle|wonder/)
      expect(projectionContent).toMatch(/earn.*returns.*gains|gains.*returns/)
    })

    test('should provide clear phase explanations', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const projectionContent = content.growth_projection

      // Should have clear phase breakdowns
      expect(projectionContent).toMatch(/initial.*phase|foundation/i)
      expect(projectionContent).toMatch(/middle.*phase|acceleration/i)
      expect(projectionContent).toMatch(/final.*phase|exponential/i)
    })

    test('should maintain accuracy across different parameter sets', () => {
      const scenarios = [
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
          timeHorizon: 25,
          goal: 'retirement',
        },
        {
          initialAmount: 1000,
          monthlyContribution: 100,
          annualReturn: 5,
          timeHorizon: 10,
          goal: 'emergency fund',
        },
      ]

      scenarios.forEach((params) => {
        const content = generatePersonalizedContent(params, 'en')
        const projectionContent = content.growth_projection

        // Should contain the actual parameter values
        expect(projectionContent).toContain(
          `$${params.initialAmount.toLocaleString()}`
        )
        expect(projectionContent).toContain(
          `$${params.monthlyContribution.toLocaleString()}`
        )
        expect(projectionContent).toContain(`${params.annualReturn}%`)
        expect(projectionContent).toContain(`${params.timeHorizon}`)

        // Goals are translated, so check for translated values
        const goalMappings = {
          house: 'home purchase',
          retirement: 'retirement planning',
          'emergency fund': 'emergency fund',
        }
        const expectedGoal =
          goalMappings[params.goal as keyof typeof goalMappings] || params.goal
        expect(projectionContent.toLowerCase()).toContain(
          expectedGoal.toLowerCase()
        )
      })
    })
  })
})
