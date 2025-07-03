/**
 * Validation tests for i18n content template integration
 * Tests for template validation, parameter checking, and translation consistency
 */

import { readFileSync } from 'fs'
import { join } from 'path'

describe('I18n Content Template Validation', () => {
  const SUPPORTED_LOCALES = ['en', 'es', 'pl']
  const messages: Record<string, any> = {}

  // Load all message files
  beforeAll(() => {
    SUPPORTED_LOCALES.forEach((locale) => {
      const filePath = join(process.cwd(), 'i18n', 'messages', `${locale}.json`)
      messages[locale] = JSON.parse(readFileSync(filePath, 'utf-8'))
    })
  })

  describe('Template Parameter Validation', () => {
    const REQUIRED_PARAMETERS = [
      'initialAmount',
      'monthlyContribution',
      'futureValue',
      'timeHorizon',
      'annualReturn',
      'goal',
    ]

    test.each(SUPPORTED_LOCALES)(
      'should have required parameters in templates for %s',
      (locale) => {
        const templates = messages[locale]?.content?.templates
        expect(templates).toBeDefined()

        const allTemplateText = Object.values(templates).join(' ')
        REQUIRED_PARAMETERS.forEach((param) => {
          expect(allTemplateText).toMatch(new RegExp(`\\{${param}\\}`))
        })
      }
    )

    test('should have consistent parameter usage across languages', () => {
      const templateKeys = Object.keys(messages.en?.content?.templates || {})

      templateKeys.forEach((templateKey) => {
        const parametersPerLanguage: Record<string, Set<string>> = {}

        SUPPORTED_LOCALES.forEach((locale) => {
          const template = messages[locale]?.content?.templates?.[templateKey]
          const parameters = new Set<string>()
          const matches = template.match(/\{(\w+)\}/g) || []
          matches.forEach((match: string) => {
            parameters.add(match.slice(1, -1))
          })
          parametersPerLanguage[locale] = parameters
        })

        // Check that core parameters are consistent across languages
        const coreParams = [
          'initialAmount',
          'monthlyContribution',
          'futureValue',
        ]
        coreParams.forEach((param) => {
          const hasParamInAllLangs = SUPPORTED_LOCALES.every((locale) =>
            parametersPerLanguage[locale]?.has(param)
          )
          // Allow some flexibility but ensure core params are widely used
          if (templateKey === 'investment_overview') {
            expect(hasParamInAllLangs).toBe(true)
          }
        })
      })
    })
  })

  describe('Content Completeness Validation', () => {
    test.each(SUPPORTED_LOCALES)(
      'should have all required content sections for %s',
      (locale) => {
        const content = messages[locale]?.content
        expect(content).toBeDefined()
        expect(content.templates).toBeDefined()
        expect(content.seo).toBeDefined()
        expect(content.goals).toBeDefined()
        expect(content.riskCategories).toBeDefined()
        expect(content.riskLevels).toBeDefined()
        expect(content.timeFrames).toBeDefined()
        expect(content.marketConditions).toBeDefined()
      }
    )

    test('should have non-empty template content', () => {
      const requiredTemplates = [
        'investment_overview',
        'growth_projection',
        'investment_insights',
        'strategy_analysis',
        'comparative_scenarios',
        'community_insights',
        'optimization_tips',
        'market_context',
      ]

      SUPPORTED_LOCALES.forEach((locale) => {
        const templates = messages[locale]?.content?.templates
        requiredTemplates.forEach((templateKey) => {
          const template = templates[templateKey]
          expect(template).toBeDefined()
          expect(template.trim()).not.toBe('')
          expect(template.length).toBeGreaterThan(50)
        })
      })
    })
  })

  describe('SEO Meta Tags Validation', () => {
    test.each(SUPPORTED_LOCALES)(
      'should have complete SEO metadata for %s',
      (locale) => {
        const seo = messages[locale]?.content?.seo
        expect(seo).toBeDefined()
        expect(seo.defaultTitle).toBeDefined()
        expect(seo.defaultDescription).toBeDefined()
        expect(seo.keywords).toBeDefined()
        expect(seo.scenarioTitle).toMatch(/\{scenarioName\}/)
        expect(seo.goalTitle).toMatch(/\{goal\}/)
        expect(seo.shareTitle).toMatch(/\{futureValue\}/)
      }
    )

    test('should have consistent SEO structure across languages', () => {
      const enSeoKeys = Object.keys(messages.en?.content?.seo || {})
      SUPPORTED_LOCALES.slice(1).forEach((locale) => {
        const localeKeys = Object.keys(messages[locale]?.content?.seo || {})
        expect(localeKeys.sort()).toEqual(enSeoKeys.sort())
      })
    })
  })

  describe('Goal Categories Validation', () => {
    test.each(SUPPORTED_LOCALES)(
      'should have all goal categories for %s',
      (locale) => {
        const goals = messages[locale]?.content?.goals
        expect(goals).toBeDefined()

        const expectedGoals = [
          'retirement',
          'house',
          'education',
          'emergency',
          'wealth',
          'general',
        ]
        expectedGoals.forEach((goal) => {
          expect(goals[goal]).toBeDefined()
          expect(goals[goal].trim()).not.toBe('')
        })
      }
    )

    test('should have consistent goal keys across languages', () => {
      const enGoalKeys = Object.keys(messages.en?.content?.goals || {})
      SUPPORTED_LOCALES.slice(1).forEach((locale) => {
        const localeKeys = Object.keys(messages[locale]?.content?.goals || {})
        expect(localeKeys.sort()).toEqual(enGoalKeys.sort())
      })
    })
  })

  describe('Risk and Market Categories Validation', () => {
    const categoryTypes = [
      'riskCategories',
      'riskLevels',
      'timeFrames',
      'marketConditions',
    ]

    test.each(categoryTypes)(
      'should have %s in all languages',
      (categoryType) => {
        SUPPORTED_LOCALES.forEach((locale) => {
          const categories = messages[locale]?.content?.[categoryType]
          expect(categories).toBeDefined()
          expect(Object.keys(categories).length).toBeGreaterThan(0)
        })
      }
    )

    test('should have consistent category structure', () => {
      categoryTypes.forEach((categoryType) => {
        const enKeys = Object.keys(
          messages.en?.content?.[categoryType] || {}
        ).sort()
        SUPPORTED_LOCALES.slice(1).forEach((locale) => {
          const localeKeys = Object.keys(
            messages[locale]?.content?.[categoryType] || {}
          ).sort()
          expect(localeKeys).toEqual(enKeys)
        })
      })
    })
  })

  describe('Translation Quality Validation', () => {
    test('should not have placeholder text in translations', () => {
      const placeholderPatterns = [
        /TODO/i,
        /FIXME/i,
        /\[PLACEHOLDER\]/i,
        /\[TO BE TRANSLATED\]/i,
        /XXX/,
      ]

      SUPPORTED_LOCALES.forEach((locale) => {
        const content = messages[locale]?.content
        const allContent = JSON.stringify(content)

        placeholderPatterns.forEach((pattern) => {
          expect(allContent).not.toMatch(pattern)
        })
      })
    })

    test('should have reasonable character lengths for translations', () => {
      const templateKeys = Object.keys(messages.en?.content?.templates || {})

      templateKeys.forEach((templateKey) => {
        const lengths: number[] = []
        SUPPORTED_LOCALES.forEach((locale) => {
          const template = messages[locale]?.content?.templates?.[templateKey]
          if (template) lengths.push(template.length)
        })

        // Calculate coefficient of variation (std dev / mean)
        const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length
        const variance =
          lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
          lengths.length
        const stdDev = Math.sqrt(variance)
        const cv = stdDev / mean

        // Coefficient of variation should be less than 0.5 (reasonable translation variance)
        expect(cv).toBeLessThan(0.5)
      })
    })
  })

  describe('Parameter Format Validation', () => {
    test.each(SUPPORTED_LOCALES)(
      'should use consistent parameter format for %s',
      (locale) => {
        const templates = messages[locale]?.content?.templates
        const allTemplateText = Object.values(templates).join(' ')

        // Check that all parameters use {paramName} format
        const parameterMatches = allTemplateText.match(/\{[^}]+\}/g) || []
        parameterMatches.forEach((match) => {
          expect(match).toMatch(/^\{\w+\}$/)
        })

        // Check that no invalid parameter formats exist
        expect(allTemplateText).not.toMatch(/\[\w+\]/) // [param] format
        expect(allTemplateText).not.toMatch(/%\w+%/) // %param% format
        expect(allTemplateText).not.toMatch(/\$\{\w+\}/) // ${param} format
      }
    )

    test('should have valid parameter names', () => {
      const validParameterNames = [
        'initialAmount',
        'monthlyContribution',
        'futureValue',
        'timeHorizon',
        'annualReturn',
        'goal',
        'totalContributions',
        'totalGains',
        'riskCategory',
        'riskLevel',
        'volatilityRange',
        'stockAllocation',
        'bondAllocation',
        'alternativeAllocation',
        'higherContribution',
        'higherContributionValue',
        'extendedTimeline',
        'extendedValue',
        'successRate',
        'escalationPercent',
        'escalatedValue',
        'currentInflation',
        'currentInterestRates',
        'marketVolatility',
        'scenarioName',
      ]

      SUPPORTED_LOCALES.forEach((locale) => {
        const templates = messages[locale]?.content?.templates
        const allTemplateText = Object.values(templates).join(' ')
        const parameterMatches = allTemplateText.match(/\{(\w+)\}/g) || []

        parameterMatches.forEach((param: string) => {
          const paramName = param.slice(1, -1)
          expect(validParameterNames).toContain(paramName)
        })
      })
    })
  })
})
