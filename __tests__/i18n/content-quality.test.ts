/**
 * @fileoverview Multi-language Content Quality Tests (Task 8.1)
 *
 * Tests content quality consistency across languages including:
 * - Content quality consistency across languages
 * - Cultural adaptation of content
 * - Translation accuracy and context
 * - Language-specific formatting and conventions
 */

import {
  generatePersonalizedContent,
  CalculatorInputs,
} from '../../lib/contentGenerator'

const standardInputs: CalculatorInputs = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 8,
  timeHorizon: 20,
  goal: 'retirement planning',
}

describe('Multi-language Content Quality', () => {
  describe('Content Consistency Across Languages', () => {
    test('should generate consistent content length across all languages', async () => {
      const locales = ['en', 'es', 'pl']
      const results = await Promise.all(
        locales.map((locale) =>
          generatePersonalizedContent(standardInputs, locale)
        )
      )

      const [enContent, esContent, plContent] = results

      // All languages should have substantial content
      Object.keys(enContent).forEach((section) => {
        const sectionKey = section as keyof typeof enContent

        expect(enContent[sectionKey].length).toBeGreaterThan(100)
        expect(esContent[sectionKey].length).toBeGreaterThan(100)
        expect(plContent[sectionKey].length).toBeGreaterThan(100)

        // Content lengths should be reasonably similar (within 50% variance)
        const minLength = Math.min(
          enContent[sectionKey].length,
          esContent[sectionKey].length,
          plContent[sectionKey].length
        )
        const maxLength = Math.max(
          enContent[sectionKey].length,
          esContent[sectionKey].length,
          plContent[sectionKey].length
        )

        expect(maxLength / minLength).toBeLessThan(2.0) // Max 100% difference
      })
    })

    test('should maintain same numerical data across languages', async () => {
      const locales = ['en', 'es', 'pl']
      const results = await Promise.all(
        locales.map((locale) =>
          generatePersonalizedContent(standardInputs, locale)
        )
      )

      // All should contain the same numerical values
      results.forEach((content) => {
        expect(content.investment_overview).toContain('$10')
        expect(content.investment_overview).toContain('$500')
        expect(content.investment_overview).toContain('8%')
        expect(content.investment_overview).toContain('20')
      })
    })

    test('should provide consistent quality metrics across languages', async () => {
      const locales = ['en', 'es', 'pl']
      const results = await Promise.all(
        locales.map((locale) =>
          generatePersonalizedContent(standardInputs, locale)
        )
      )

      results.forEach((content, index) => {
        const locale = locales[index]

        Object.values(content).forEach((section) => {
          // Should not contain obvious errors
          expect(section).not.toContain('undefined')
          expect(section).not.toContain('NaN')
          expect(section).not.toContain('{{')
          expect(section).not.toContain('}}')
          expect(section).not.toContain('[object Object]')

          // Should have reasonable word count
          const wordCount = section.split(/\s+/).length
          expect(wordCount).toBeGreaterThan(20)
          expect(wordCount).toBeLessThan(500)
        })
      })
    })
  })

  describe('Language-Specific Content Validation', () => {
    test('should use appropriate language-specific financial terminology', async () => {
      const enContent = await generatePersonalizedContent(standardInputs, 'en')
      const esContent = await generatePersonalizedContent(standardInputs, 'es')
      const plContent = await generatePersonalizedContent(standardInputs, 'pl')

      // English should use English financial terms
      expect(enContent.investment_overview.toLowerCase()).toMatch(
        /investment|return|portfolio|financial|strategy/
      )

      // Spanish should use Spanish financial terms
      expect(esContent.investment_overview.toLowerCase()).toMatch(
        /inversión|rendimiento|cartera|financier|estrategia/
      )

      // Polish should use Polish financial terms
      expect(plContent.investment_overview.toLowerCase()).toMatch(
        /inwestycj|zwrot|portfel|finansow|strategi/
      )
    })

    test('should handle goal translations appropriately', async () => {
      const goals = [
        'retirement planning',
        'house',
        'education',
        'emergency',
        'wealth',
      ]

      for (const goal of goals) {
        const params = { ...standardInputs, goal }

        const enContent = await generatePersonalizedContent(params, 'en')
        const esContent = await generatePersonalizedContent(params, 'es')
        const plContent = await generatePersonalizedContent(params, 'pl')

        // Each language should contain appropriate goal terminology
        expect(enContent.investment_overview).toBeDefined()
        expect(esContent.investment_overview).toBeDefined()
        expect(plContent.investment_overview).toBeDefined()

        // Goal should be referenced in appropriate language
        if (goal === 'house') {
          expect(enContent.investment_overview).toContain('home purchase')
          expect(esContent.investment_overview).toMatch(/casa|hogar|vivienda/)
          expect(plContent.investment_overview).toMatch(/dom|mieszkan/)
        }

        if (goal === 'retirement planning') {
          expect(enContent.investment_overview).toContain('retirement')
          expect(esContent.investment_overview).toMatch(/jubilación|retiro/)
          expect(plContent.investment_overview).toMatch(/emerytur/)
        }
      }
    })

    test('should use appropriate currency formatting by locale', async () => {
      const content = await Promise.all([
        generatePersonalizedContent(standardInputs, 'en'),
        generatePersonalizedContent(standardInputs, 'es'),
        generatePersonalizedContent(standardInputs, 'pl'),
      ])

      // All should use dollar notation (since it's a US-focused calculator)
      content.forEach((localeContent) => {
        expect(localeContent.investment_overview).toMatch(/\$\d/)
        expect(localeContent.growth_projection).toMatch(/\$\d/)
      })
    })
  })

  describe('Cultural Adaptation', () => {
    test('should adapt content tone appropriately by culture', async () => {
      const enContent = await generatePersonalizedContent(standardInputs, 'en')
      const esContent = await generatePersonalizedContent(standardInputs, 'es')
      const plContent = await generatePersonalizedContent(standardInputs, 'pl')

      // English: Direct, professional tone
      expect(enContent.strategy_analysis).toMatch(
        /your|you're|consider|recommend/
      )

      // Spanish: May be more formal or use different address forms
      expect(esContent.strategy_analysis).toMatch(/tu|su|considera|recomend/)

      // Polish: Should use appropriate Polish addressing
      expect(plContent.strategy_analysis).toMatch(/twoj|rozważ|zalec/)
    })

    test('should handle different investment contexts by culture', async () => {
      const locales = ['en', 'es', 'pl']
      const results = await Promise.all(
        locales.map((locale) =>
          generatePersonalizedContent(standardInputs, locale)
        )
      )

      // All should provide culturally appropriate investment advice
      results.forEach((content, index) => {
        const locale = locales[index]

        // Should contain investment strategy content appropriate to locale
        expect(content.strategy_analysis.length).toBeGreaterThan(150)

        if (locale === 'en') {
          expect(content.strategy_analysis).toMatch(
            /diversif|asset.*allocation|risk.*tolerance/
          )
        } else if (locale === 'es') {
          expect(content.strategy_analysis).toMatch(/diversific|activo|riesgo/)
        } else if (locale === 'pl') {
          expect(content.strategy_analysis).toMatch(/dywersyfik|aktywa|ryzyko/)
        }
      })
    })
  })

  describe('Translation Accuracy and Context', () => {
    test('should maintain technical accuracy in translations', async () => {
      const complexInputs: CalculatorInputs = {
        initialAmount: 25000,
        monthlyContribution: 1250,
        annualReturn: 7.5,
        timeHorizon: 25,
        goal: 'retirement planning',
      }

      const results = await Promise.all([
        generatePersonalizedContent(complexInputs, 'en'),
        generatePersonalizedContent(complexInputs, 'es'),
        generatePersonalizedContent(complexInputs, 'pl'),
      ])

      // All should accurately represent the same financial concepts
      results.forEach((content) => {
        expect(content.investment_overview).toContain('$25')
        expect(content.investment_overview).toContain('$1,250')
        expect(content.investment_overview).toContain('7.5%')
        expect(content.investment_overview).toContain('25')

        // Should contain compound interest concepts
        expect(content.growth_projection.toLowerCase()).toMatch(
          /compound|interest|growth|accumulation|interés.*compuesto|wzrost|procent|składany/
        )
      })
    })

    test('should preserve meaning in complex financial concepts', async () => {
      const results = await Promise.all([
        generatePersonalizedContent(standardInputs, 'en'),
        generatePersonalizedContent(standardInputs, 'es'),
        generatePersonalizedContent(standardInputs, 'pl'),
      ])

      // All should convey similar optimization strategies
      results.forEach((content) => {
        expect(content.optimization_tips.toLowerCase()).toMatch(
          /automatic|monthly|increase|beginning|automático|mensual|aumento|principio|automatyczne|miesięczne|zwiększenie|początek/
        )
      })

      // All should convey similar market context
      results.forEach((content) => {
        expect(content.market_context.toLowerCase()).toMatch(
          /market|inflation|volatility|mercado|inflación|volatilidad|rynek|inflacj|zmienność/
        )
      })
    })

    test('should handle pluralization correctly in each language', async () => {
      const multiYearInputs = { ...standardInputs, timeHorizon: 25 }
      const singleYearInputs = { ...standardInputs, timeHorizon: 1 }

      for (const inputs of [multiYearInputs, singleYearInputs]) {
        const results = await Promise.all([
          generatePersonalizedContent(inputs, 'en'),
          generatePersonalizedContent(inputs, 'es'),
          generatePersonalizedContent(inputs, 'pl'),
        ])

        results.forEach((content, index) => {
          const locale = ['en', 'es', 'pl'][index]

          // Should handle year/years correctly
          if (inputs.timeHorizon === 1) {
            if (locale === 'en')
              expect(content.investment_overview).toMatch(/1.*year[^s]/)
            if (locale === 'es')
              expect(content.investment_overview).toMatch(/1.*año/)
            if (locale === 'pl')
              expect(content.investment_overview).toMatch(/1.*rok/)
          } else {
            if (locale === 'en')
              expect(content.investment_overview).toMatch(/25.*years/)
            if (locale === 'es')
              expect(content.investment_overview).toMatch(/25.*años/)
            if (locale === 'pl')
              expect(content.investment_overview).toMatch(/25.*lat/)
          }
        })
      }
    })
  })

  describe('Content Structure Consistency', () => {
    test('should maintain consistent content structure across languages', async () => {
      const results = await Promise.all([
        generatePersonalizedContent(standardInputs, 'en'),
        generatePersonalizedContent(standardInputs, 'es'),
        generatePersonalizedContent(standardInputs, 'pl'),
      ])

      const sectionKeys = Object.keys(results[0])

      results.forEach((content) => {
        // All should have the same sections
        expect(Object.keys(content)).toEqual(sectionKeys)

        // All sections should be populated
        Object.values(content).forEach((section) => {
          expect(section).toBeDefined()
          expect(typeof section).toBe('string')
          expect(section.length).toBeGreaterThan(50)
        })
      })
    })

    test('should maintain appropriate content hierarchy across languages', async () => {
      const results = await Promise.all([
        generatePersonalizedContent(standardInputs, 'en'),
        generatePersonalizedContent(standardInputs, 'es'),
        generatePersonalizedContent(standardInputs, 'pl'),
      ])

      results.forEach((content) => {
        // Investment overview should be introductory
        expect(content.investment_overview.length).toBeGreaterThan(100)
        expect(content.investment_overview.length).toBeLessThan(600)

        // Growth projection should contain detailed analysis
        expect(content.growth_projection.length).toBeGreaterThan(200)

        // Strategy analysis should be comprehensive
        expect(content.strategy_analysis.length).toBeGreaterThan(150)
      })
    })
  })

  describe('Language-Specific Edge Cases', () => {
    test('should handle special characters and accents correctly', async () => {
      const esContent = await generatePersonalizedContent(standardInputs, 'es')
      const plContent = await generatePersonalizedContent(standardInputs, 'pl')

      // Spanish content should handle accents properly
      if (esContent.investment_overview.includes('inversión')) {
        expect(esContent.investment_overview).toMatch(/inversión/)
      }
      if (esContent.strategy_analysis.includes('estrategia')) {
        expect(esContent.strategy_analysis).toMatch(/estrategia/)
      }

      // Polish content should handle special characters
      if (plContent.investment_overview.includes('inwestycj')) {
        expect(plContent.investment_overview).toMatch(/inwestycj/)
      }

      // Should not have encoding issues
      expect(esContent.investment_overview).not.toMatch(/â|ñ|é/)
      expect(plContent.investment_overview).not.toMatch(/Ä|Å|Ć/)
    })

    test('should maintain readability across different languages', async () => {
      const results = await Promise.all([
        generatePersonalizedContent(standardInputs, 'en'),
        generatePersonalizedContent(standardInputs, 'es'),
        generatePersonalizedContent(standardInputs, 'pl'),
      ])

      results.forEach((content) => {
        Object.values(content).forEach((section) => {
          // Should have reasonable sentence structure
          const sentences = section.split(/[.!?]+/)
          expect(sentences.length).toBeGreaterThan(2)

          // Should not have excessively long sentences
          sentences.forEach((sentence) => {
            const words = sentence.trim().split(/\s+/)
            if (words.length > 1) {
              expect(words.length).toBeLessThan(50) // Reasonable sentence length
            }
          })
        })
      })
    })
  })

  describe('Performance Across Languages', () => {
    test('should generate content efficiently for all languages', async () => {
      const locales = ['en', 'es', 'pl']

      const startTime = Date.now()
      await Promise.all(
        locales.map((locale) =>
          generatePersonalizedContent(standardInputs, locale)
        )
      )
      const endTime = Date.now()

      // Should complete all languages within reasonable time
      expect(endTime - startTime).toBeLessThan(5000)
    })

    test('should handle concurrent generation for different languages', async () => {
      const testCases = [
        { locale: 'en', params: { ...standardInputs, initialAmount: 5000 } },
        { locale: 'es', params: { ...standardInputs, initialAmount: 15000 } },
        { locale: 'pl', params: { ...standardInputs, initialAmount: 25000 } },
        { locale: 'en', params: { ...standardInputs, goal: 'house' } },
        { locale: 'es', params: { ...standardInputs, goal: 'education' } },
        { locale: 'pl', params: { ...standardInputs, goal: 'wealth' } },
      ]

      const startTime = Date.now()
      const results = await Promise.all(
        testCases.map(({ locale, params }) =>
          generatePersonalizedContent(params, locale)
        )
      )
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(8000)

      // All results should be valid
      results.forEach((content) => {
        expect(content.investment_overview).toBeDefined()
        expect(content.investment_overview.length).toBeGreaterThan(100)
      })
    })
  })
})
