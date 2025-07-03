/**
 * Unit tests for Content Generation Templates
 * Tests template structure, completeness, validation, and content quality
 */

import {
  type ContentTemplate,
  englishTemplates,
  spanishTemplates,
  polishTemplates,
  getContentTemplates,
  getAvailableTemplateLanguages,
  validateTemplateCompleteness,
} from '../lib/contentTemplates'

describe('Content Templates', () => {
  const requiredSections: (keyof ContentTemplate)[] = [
    'investment_overview',
    'growth_projection',
    'investment_insights',
    'strategy_analysis',
    'comparative_scenarios',
    'community_insights',
    'optimization_tips',
    'market_context',
  ]

  const supportedLanguages = ['en', 'es', 'pl']

  describe('Template Structure Completeness', () => {
    test('should have all required sections for English templates', () => {
      const templates = getContentTemplates('en')

      requiredSections.forEach((section) => {
        expect(templates[section]).toBeDefined()
        expect(typeof templates[section]).toBe('string')
        expect(templates[section].trim().length).toBeGreaterThan(0)
      })
    })

    test('should have all required sections for Spanish templates', () => {
      const templates = getContentTemplates('es')

      requiredSections.forEach((section) => {
        expect(templates[section]).toBeDefined()
        expect(typeof templates[section]).toBe('string')
        expect(templates[section].trim().length).toBeGreaterThan(0)
      })
    })

    test('should have all required sections for Polish templates', () => {
      const templates = getContentTemplates('pl')

      requiredSections.forEach((section) => {
        expect(templates[section]).toBeDefined()
        expect(typeof templates[section]).toBe('string')
        expect(templates[section].trim().length).toBeGreaterThan(0)
      })
    })

    test('should validate template completeness for all languages', () => {
      expect(validateTemplateCompleteness('en')).toBe(true)
      expect(validateTemplateCompleteness('es')).toBe(true)
      expect(validateTemplateCompleteness('pl')).toBe(true)
    })

    test('should have consistent structure across all language templates', () => {
      const englishSections = Object.keys(englishTemplates).sort()
      const spanishSections = Object.keys(spanishTemplates).sort()
      const polishSections = Object.keys(polishTemplates).sort()

      expect(spanishSections).toEqual(englishSections)
      expect(polishSections).toEqual(englishSections)
    })
  })

  describe('Template Content Quality', () => {
    it.each(supportedLanguages)(
      'should have substantial content in each section for %s',
      (language) => {
        const templates = getContentTemplates(language)

        requiredSections.forEach((section) => {
          const content = templates[section]
          // Each section should have at least 200 characters of meaningful content
          expect(content.length).toBeGreaterThan(200)

          // Should contain HTML structure
          expect(content).toMatch(/<h2>.*<\/h2>/)
          expect(content).toMatch(/<p>.*<\/p>/)
        })
      }
    )

    it.each(supportedLanguages)(
      'should contain proper placeholder syntax for %s',
      (language) => {
        const templates = getContentTemplates(language)

        // Common placeholders that should appear in templates
        const commonPlaceholders = [
          '{{ initialAmount }}',
          '{{ monthlyContribution }}',
          '{{timeHorizon}}',
          '{{ futureValue }}',
          '{{goal}}',
          '{{annualReturn}}',
        ]

        const allTemplateContent = Object.values(templates).join(' ')

        commonPlaceholders.forEach((placeholder) => {
          expect(allTemplateContent).toContain(placeholder)
        })
      }
    )

    it.each(supportedLanguages)(
      'should not contain unescaped template literals for %s',
      (language) => {
        const templates = getContentTemplates(language)

        requiredSections.forEach((section) => {
          const content = templates[section]
          // Should not contain ${} syntax that would cause template literal issues
          expect(content).not.toMatch(/\$\{[^}]*\}/)
          // Should not contain unescaped single braces
          expect(content).not.toMatch(/(?<!\{)\{(?!\{)[^}]*(?<!\})\}(?!\})/)
        })
      }
    )

    it.each(supportedLanguages)(
      'should have appropriate word count per section for %s',
      (language) => {
        const templates = getContentTemplates(language)

        requiredSections.forEach((section) => {
          const content = templates[section]
          // Remove HTML tags and count words
          const textContent = content.replace(/<[^>]*>/g, ' ').trim()
          const wordCount = textContent
            .split(/\s+/)
            .filter((word) => word.length > 0).length

          // Each section should have substantial content (at least 50 words)
          expect(wordCount).toBeGreaterThan(50)

          // But not be excessively long (less than 1000 words)
          expect(wordCount).toBeLessThan(1000)
        })
      }
    )
  })

  describe('Placeholder Validation', () => {
    it.each(supportedLanguages)(
      'should have consistent placeholder usage across sections for %s',
      (language) => {
        const templates = getContentTemplates(language)

        // Extract all placeholders from all templates
        const allContent = Object.values(templates).join(' ')
        const placeholderMatches =
          allContent.match(/\{\{\s*[^}]+\s*\}\}/g) || []
        const uniquePlaceholders = Array.from(new Set(placeholderMatches))

        // Should have reasonable number of unique placeholders
        expect(uniquePlaceholders.length).toBeGreaterThan(10)
        expect(uniquePlaceholders.length).toBeLessThan(100)

        // All placeholders should follow consistent format
        uniquePlaceholders.forEach((placeholder) => {
          expect(placeholder).toMatch(/^\{\{\s*[a-zA-Z][a-zA-Z0-9_]*\s*\}\}$/)
        })
      }
    )

    it('should have core financial placeholders in all languages', () => {
      const corePlaceholders = [
        '{{ initialAmount }}',
        '{{ monthlyContribution }}',
        '{{ futureValue }}',
        '{{timeHorizon}}',
        '{{annualReturn}}',
        '{{goal}}',
      ]

      supportedLanguages.forEach((language) => {
        const templates = getContentTemplates(language)
        const allContent = Object.values(templates).join(' ')

        corePlaceholders.forEach((placeholder) => {
          expect(allContent).toContain(placeholder)
        })
      })
    })
  })

  describe('Utility Functions', () => {
    it('should return correct templates for supported languages', () => {
      expect(getContentTemplates('en')).toBe(englishTemplates)
      expect(getContentTemplates('es')).toBe(spanishTemplates)
      expect(getContentTemplates('pl')).toBe(polishTemplates)
    })

    it('should return English templates as fallback for unsupported languages', () => {
      expect(getContentTemplates('fr')).toBe(englishTemplates)
      expect(getContentTemplates('de')).toBe(englishTemplates)
      expect(getContentTemplates('')).toBe(englishTemplates)
      expect(getContentTemplates('invalid')).toBe(englishTemplates)
    })

    it('should return correct available languages', () => {
      const languages = getAvailableTemplateLanguages()
      expect(languages).toEqual(['en', 'es', 'pl'])
      expect(languages.length).toBe(3)
    })

    it('should validate completeness correctly', () => {
      // Valid languages should return true
      expect(validateTemplateCompleteness('en')).toBe(true)
      expect(validateTemplateCompleteness('es')).toBe(true)
      expect(validateTemplateCompleteness('pl')).toBe(true)

      // Invalid languages should still return true (fallback to English)
      expect(validateTemplateCompleteness('fr')).toBe(true)
      expect(validateTemplateCompleteness('')).toBe(true)
    })
  })

  describe('Language-Specific Content', () => {
    it('should have language-appropriate content for English', () => {
      const content = Object.values(englishTemplates).join(' ')
      expect(content).toContain('Your Investment')
      expect(content).toContain('Growth Projection')
      expect(content).toContain('portfolio')
      expect(content).toContain('return')
    })

    it('should have language-appropriate content for Spanish', () => {
      const content = Object.values(spanishTemplates).join(' ')
      expect(content).toContain('Tu Plan') // Your Plan
      expect(content).toContain('Proyección') // Projection
      expect(content).toContain('cartera') // portfolio
      expect(content).toContain('rendimiento') // return
    })

    it('should have language-appropriate content for Polish', () => {
      const content = Object.values(polishTemplates).join(' ')
      expect(content).toContain('Twojego') // Your (genitive)
      expect(content).toContain('inwestycyjn') // Investment (partial)
      expect(content).toContain('portfel') // portfolio
      expect(content).toContain('zwrot') // return
    })
  })

  describe('HTML Structure Validation', () => {
    it.each(supportedLanguages)(
      'should have proper HTML structure for %s',
      (language) => {
        const templates = getContentTemplates(language)

        requiredSections.forEach((section) => {
          const content = templates[section]

          // Should have h2 headers
          expect(content).toMatch(/<h2>.*<\/h2>/)

          // Should have paragraphs
          expect(content).toMatch(/<p>.*<\/p>/)

          // HTML should be well-formed (basic check)
          const openTags = (content.match(/<[^/][^>]*>/g) || []).length
          const closeTags = (content.match(/<\/[^>]*>/g) || []).length
          const selfClosingTags = (content.match(/<[^>]*\/>/g) || []).length

          // For basic tags like p, h2, strong, ul, li, the opens should equal closes
          // (This is a simplified check - real validation would need proper HTML parsing)
          expect(openTags - selfClosingTags).toBeGreaterThanOrEqual(
            closeTags - 5
          ) // Allow some margin for complex structures
        })
      }
    )

    it.each(supportedLanguages)(
      'should properly format financial values for %s',
      (language) => {
        const templates = getContentTemplates(language)

        // Check that templates contain properly formatted financial values
        // Look for strong tags containing Amount placeholders
        const allContent = Object.values(templates).join(' ')

        // Check for specific patterns we know exist
        const strongAmountPatterns = [
          '<strong>{{ initialAmount }}</strong>',
          '<strong>{{ monthlyContribution }}</strong>',
          '<strong>{{ futureValue }}</strong>',
        ]

        let foundStrongAmounts = 0
        strongAmountPatterns.forEach((pattern) => {
          if (allContent.includes(pattern)) {
            foundStrongAmounts++
          }
        })

        // Should have at least some financial values in strong tags
        expect(foundStrongAmounts).toBeGreaterThanOrEqual(2)
      }
    )
  })

  describe('Content Consistency', () => {
    it('should have similar content length across languages', () => {
      const languageContentLengths: Record<string, number> = {}

      supportedLanguages.forEach((language) => {
        const templates = getContentTemplates(language)
        const totalLength = Object.values(templates).join('').length
        languageContentLengths[language] = totalLength
      })

      const lengths = Object.values(languageContentLengths)
      const maxLength = Math.max(...lengths)
      const minLength = Math.min(...lengths)

      // Languages should have similar content lengths (within 30% of each other)
      expect(minLength / maxLength).toBeGreaterThan(0.7)
    })

    it('should have similar section structure across languages', () => {
      const getSectionStructure = (content: string) => {
        const headers = content.match(/<h2>.*?<\/h2>/g) || []
        const paragraphs = content.match(/<p>[\s\S]*?<\/p>/g) || []
        const lists = content.match(/<ul>[\s\S]*?<\/ul>/g) || []

        return {
          headerCount: headers.length,
          paragraphCount: paragraphs.length,
          listCount: lists.length,
        }
      }

      const structures: Record<string, any> = {}

      supportedLanguages.forEach((language) => {
        const templates = getContentTemplates(language)
        const allContent = Object.values(templates).join('')
        structures[language] = getSectionStructure(allContent)
      })

      // All languages should have similar structural elements
      const firstLang = structures[supportedLanguages[0]]
      supportedLanguages.slice(1).forEach((language) => {
        const currentStructure = structures[language]

        // Allow some variation but structures should be reasonably similar
        expect(
          Math.abs(currentStructure.headerCount - firstLang.headerCount)
        ).toBeLessThanOrEqual(2)
        expect(
          Math.abs(currentStructure.paragraphCount - firstLang.paragraphCount)
        ).toBeLessThanOrEqual(5)
        expect(
          Math.abs(currentStructure.listCount - firstLang.listCount)
        ).toBeLessThanOrEqual(2)
      })
    })
  })
})
