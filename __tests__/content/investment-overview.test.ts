/**
 * Task 7.1.1: Investment Overview Template Tests
 * Test content length and readability score
 * Test parameter integration accuracy
 * Test SEO keyword integration
 */

import {
  generatePersonalizedContent,
  type CalculatorInputs,
} from '../../lib/contentGenerator'

describe('Task 7.1.1: Investment Overview Template', () => {
  const testParams: CalculatorInputs = {
    initialAmount: 10000,
    monthlyContribution: 500,
    annualReturn: 7,
    timeHorizon: 20,
    goal: 'retirement',
  }

  const supportedLanguages = ['en', 'es', 'pl']

  describe('Content Length and Readability', () => {
    supportedLanguages.forEach((locale) => {
      test(`should have appropriate content length for ${locale}`, () => {
        const content = generatePersonalizedContent(testParams, locale)
        const overviewContent = content.investment_overview

        // Remove HTML tags for word count
        const textContent = overviewContent
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        const wordCount = textContent.split(' ').length

        // Should be substantial content (at least 120 words for overview section, relaxed for Polish)
        const minWords = locale === 'pl' ? 120 : 150
        expect(wordCount).toBeGreaterThanOrEqual(minWords)
        expect(wordCount).toBeLessThanOrEqual(400) // Not too verbose
      })

      test(`should have good readability score for ${locale}`, () => {
        const content = generatePersonalizedContent(testParams, locale)
        const overviewContent = content.investment_overview

        // Remove HTML tags for readability analysis
        const textContent = overviewContent
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        // Basic readability checks
        const sentences = textContent
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 0)
        const words = textContent.split(/\s+/)
        const avgWordsPerSentence = words.length / sentences.length

        // Should have reasonable sentence length (not too complex)
        expect(avgWordsPerSentence).toBeLessThanOrEqual(25)
        expect(avgWordsPerSentence).toBeGreaterThanOrEqual(8)
      })

      test(`should not have overly complex vocabulary for ${locale}`, () => {
        const content = generatePersonalizedContent(testParams, locale)
        const overviewContent = content.investment_overview

        // Check for overly complex words (basic heuristic)
        const textContent = overviewContent
          .replace(/<[^>]*>/g, ' ')
          .toLowerCase()
        const words = textContent.split(/\s+/).filter((w) => w.length > 0)
        const longWords = words.filter((w) => w.length > 12)
        const complexWordRatio = longWords.length / words.length

        // Should not have too many very long words (relaxed for Polish)
        const maxRatio = locale === 'pl' ? 0.15 : 0.1
        expect(complexWordRatio).toBeLessThanOrEqual(maxRatio)
      })
    })
  })

  describe('Parameter Integration Accuracy', () => {
    test('should correctly integrate initial amount', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      expect(overviewContent).toContain('$10,000')
      expect(overviewContent).not.toContain('{{ initialAmount }}')
      expect(overviewContent).not.toContain('{{initialAmount}}')
    })

    test('should correctly integrate monthly contribution', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      expect(overviewContent).toContain('$500')
      expect(overviewContent).not.toContain('{{ monthlyContribution }}')
      expect(overviewContent).not.toContain('{{monthlyContribution}}')
    })

    test('should correctly integrate time horizon', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      expect(overviewContent).toContain('20 years')
      expect(overviewContent).not.toContain('{{ timeHorizon }}')
      expect(overviewContent).not.toContain('{{timeHorizon}}')
    })

    test('should correctly integrate annual return', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      expect(overviewContent).toContain('7%')
      expect(overviewContent).not.toContain('{{ annualReturn }}')
      expect(overviewContent).not.toContain('{{annualReturn}}')
    })

    test('should correctly integrate investment goal', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      expect(overviewContent).toContain('retirement')
      expect(overviewContent).not.toContain('{{ goal }}')
      expect(overviewContent).not.toContain('{{goal}}')
    })

    test('should handle calculated values like future value', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should contain formatted future value (calculated from parameters)
      expect(overviewContent).toMatch(/\$[\d,]+/)
      expect(overviewContent).not.toContain('{{ futureValue }}')
      expect(overviewContent).not.toContain('{{futureValue}}')
    })

    test('should handle edge case parameters correctly', () => {
      const edgeParams: CalculatorInputs = {
        initialAmount: 1000000,
        monthlyContribution: 10000,
        annualReturn: 12.5,
        timeHorizon: 5,
        goal: 'emergency fund',
      }

      const content = generatePersonalizedContent(edgeParams, 'en')
      const overviewContent = content.investment_overview

      expect(overviewContent).toContain('$1,000,000')
      expect(overviewContent).toContain('$10,000')
      expect(overviewContent).toContain('12.5%')
      expect(overviewContent).toContain('5 years')
      expect(overviewContent).toContain('emergency fund')
    })
  })

  describe('SEO Keyword Integration', () => {
    test('should include relevant financial keywords', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview.toLowerCase()

      const expectedKeywords = [
        'investment',
        'compound interest',
        'growth',
        'returns',
      ]

      expectedKeywords.forEach((keyword) => {
        expect(overviewContent).toContain(keyword)
      })
    })

    test('should include goal-specific keywords', () => {
      const retirementParams = { ...testParams, goal: 'retirement' }
      const content = generatePersonalizedContent(retirementParams, 'en')
      const overviewContent = content.investment_overview.toLowerCase()

      expect(overviewContent).toContain('retirement')
    })

    test('should include amount-specific keywords for SEO', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview.toLowerCase()

      // Should mention specific amounts for long-tail SEO
      expect(overviewContent).toMatch(/10,?000/) // Initial amount
      expect(overviewContent).toMatch(/500/) // Monthly amount
    })

    test('should have appropriate keyword density', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      const textContent = overviewContent.replace(/<[^>]*>/g, ' ').toLowerCase()
      const words = textContent.split(/\s+/).filter((w) => w.length > 0)

      // Count occurrences of key terms
      const investmentCount = (textContent.match(/investment/g) || []).length
      const keywordDensity = investmentCount / words.length

      // Should have reasonable keyword density (not keyword stuffing)
      expect(keywordDensity).toBeGreaterThanOrEqual(0.01) // At least 1%
      expect(keywordDensity).toBeLessThanOrEqual(0.05) // No more than 5%
    })

    test('should include long-tail keyword combinations', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview.toLowerCase()

      // Should include natural long-tail combinations for SEO
      expect(overviewContent).toMatch(/invest.*10,?000|10,?000.*invest/)
      expect(overviewContent).toMatch(/500.*month|month.*500/)
      expect(overviewContent).toMatch(/20.*year|year.*20/)
    })
  })

  describe('Content Quality and Engagement', () => {
    test('should have engaging introduction', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should start with engaging content
      expect(overviewContent).toMatch(/<h2>.*overview.*<\/h2>/i)
      expect(overviewContent).toContain('Your')
    })

    test('should provide actionable insights', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should contain actionable language
      const actionWords = [
        'strategy',
        'approach',
        'plan',
        'path',
        'opportunity',
      ]
      const hasActionWords = actionWords.some((word) =>
        overviewContent.toLowerCase().includes(word)
      )
      expect(hasActionWords).toBe(true)
    })

    test('should maintain professional tone', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should not contain overly casual language
      const casualWords = ['awesome', 'amazing', 'fantastic', 'super']
      const hasCasualWords = casualWords.some((word) =>
        overviewContent.toLowerCase().includes(word)
      )
      expect(hasCasualWords).toBe(false)
    })

    test('should include educational value', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should explain concepts
      const educationalTerms = [
        'compound',
        'dollar-cost averaging',
        'volatility',
        'discipline',
      ]
      const hasEducationalContent = educationalTerms.some((term) =>
        overviewContent.toLowerCase().includes(term)
      )
      expect(hasEducationalContent).toBe(true)
    })
  })

  describe('HTML Structure and Formatting', () => {
    test('should have proper HTML structure', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should have proper heading
      expect(overviewContent).toMatch(/<h2>.*<\/h2>/)

      // Should have proper paragraph structure
      expect(overviewContent).toMatch(/<p>.*<\/p>/)

      // Should have emphasized text
      expect(overviewContent).toMatch(/<strong>.*<\/strong>/)
    })

    test('should not have unclosed HTML tags', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Basic check for unclosed tags
      const openTags = (overviewContent.match(/<[^/][^>]*>/g) || []).length
      const closeTags = (overviewContent.match(/<\/[^>]*>/g) || []).length
      const selfClosingTags = (overviewContent.match(/<[^>]*\/>/g) || []).length

      expect(openTags - selfClosingTags).toBe(closeTags)
    })

    test('should have semantic HTML elements', () => {
      const content = generatePersonalizedContent(testParams, 'en')
      const overviewContent = content.investment_overview

      // Should use semantic elements appropriately
      expect(overviewContent).toMatch(/<h2>/) // Proper heading level
      expect(overviewContent).toMatch(/<p>/) // Paragraphs
      expect(overviewContent).toMatch(/<strong>/) // Emphasis
    })
  })
})
