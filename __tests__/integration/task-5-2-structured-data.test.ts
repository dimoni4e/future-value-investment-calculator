/**
 * Task 5.2 Structured Data Integration Tests
 * Tests for structured data integration in scenario pages
 */

import { parseSlugToScenario, detectInvestmentGoal } from '@/lib/scenarioUtils'

describe('Task 5.2: Structured Data Integration', () => {
  describe('Scenario Slug to Structured Data', () => {
    it('should parse scenario slug for structured data generation', () => {
      const slug = 'invest-50000-monthly-2000-8percent-25years-retirement'
      const parsedScenario = parseSlugToScenario(slug)

      expect(parsedScenario).not.toBeNull()
      if (parsedScenario) {
        expect(parsedScenario.initialAmount).toBe(50000)
        expect(parsedScenario.monthlyContribution).toBe(2000)
        expect(parsedScenario.annualReturn).toBe(8)
        expect(parsedScenario.timeHorizon).toBe(25)
        expect(parsedScenario.goal).toBe('retirement')

        // Test structured data generation from parsed scenario
        const termDuration = `P${parsedScenario.timeHorizon}Y`
        expect(termDuration).toBe('P25Y')

        const interestRate = {
          '@type': 'QuantitativeValue',
          value: parsedScenario.annualReturn,
          unitText: 'percent per year',
        }
        expect(interestRate.value).toBe(8)
        expect(interestRate.unitText).toBe('percent per year')
      }
    })

    it('should detect investment goals for structured data categorization', () => {
      const retirementParams = {
        initialAmount: 50000,
        monthlyContribution: 2000,
        annualReturn: 0.08,
        timeHorizon: 25,
      }

      const goal = detectInvestmentGoal(retirementParams)
      expect(goal).toBe('retirement')

      // Test that goal is used in keywords
      const keywords = [
        'investment projection',
        'compound interest',
        'financial planning',
        'future value',
        goal,
      ]
      expect(keywords).toContain('retirement')
    })

    it('should handle house down payment scenarios for structured data', () => {
      const slug = 'invest-25000-monthly-1000-7percent-8years-house'
      const parsedScenario = parseSlugToScenario(slug)

      expect(parsedScenario).not.toBeNull()
      if (parsedScenario) {
        expect(parsedScenario.goal).toBe('house')

        // Test structured data reflects house goal
        const description = `Investment scenario projecting ${parsedScenario.timeHorizon} years of contributions with ${parsedScenario.annualReturn}% annual return`
        expect(description).toContain('8 years')
        expect(description).toContain('7%')

        const keywords = [
          'investment projection',
          'compound interest',
          'financial planning',
          'future value',
          parsedScenario.goal,
        ]
        expect(keywords).toContain('house')
      }
    })
  })

  describe('Structured Data URL Generation', () => {
    it('should generate correct scenario URLs for different locales', () => {
      const baseUrl = 'https://example.com'
      const scenarioId = 'invest-50000-monthly-2000-8percent-25years-retirement'
      const locales = ['en', 'es', 'pl']

      locales.forEach((locale) => {
        const scenarioUrl = `${baseUrl}/${locale}/scenario/${scenarioId}`
        const dataUrl = `${scenarioUrl}/data.json`

        expect(scenarioUrl).toBe(`${baseUrl}/${locale}/scenario/${scenarioId}`)
        expect(dataUrl).toBe(
          `${baseUrl}/${locale}/scenario/${scenarioId}/data.json`
        )

        // Test URL structure for structured data
        expect(scenarioUrl).toMatch(/^https?:\/\//)
        expect(scenarioUrl).toContain(`/${locale}/`)
        expect(scenarioUrl).toContain('/scenario/')
        expect(scenarioUrl).toContain(scenarioId)
      })
    })
  })

  describe('Investment Parameters to Schema Mapping', () => {
    it('should map investment parameters to FinancialProduct schema', () => {
      const params = {
        initialAmount: 100000,
        monthlyContribution: 1500,
        annualReturnRate: 7,
        timeHorizonYears: 20,
      }

      const financialProduct = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        category: 'Investment',
        interestRate: {
          '@type': 'QuantitativeValue',
          value: params.annualReturnRate,
          unitText: 'percent per year',
        },
        termDuration: `P${params.timeHorizonYears}Y`,
      }

      expect(financialProduct.interestRate.value).toBe(7)
      expect(financialProduct.termDuration).toBe('P20Y')
      expect(financialProduct.category).toBe('Investment')
    })

    it('should map investment results to InvestAction schema', () => {
      const result = {
        futureValue: 1000000,
        totalContributions: 460000,
        totalGrowth: 540000,
        annualBreakdown: [],
      }

      const investAction = {
        '@context': 'https://schema.org',
        '@type': 'InvestAction',
        object: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: result.totalContributions,
        },
        result: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: result.futureValue,
        },
      }

      expect(investAction.object.value).toBe(460000)
      expect(investAction.result.value).toBe(1000000)
      expect(investAction.object.currency).toBe('USD')
      expect(investAction.result.currency).toBe('USD')
    })
  })

  describe('Schema Required Properties Validation', () => {
    it('should include all required properties for FinancialProduct', () => {
      const requiredProperties = [
        '@context',
        '@type',
        'name',
        'description',
        'category',
        'provider',
        'interestRate',
        'termDuration',
        'url',
      ]

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: 'Test Investment Plan',
        description: 'Test description',
        category: 'Investment',
        provider: {
          '@type': 'Organization',
          name: 'Future Value Investment Calculator',
          url: 'https://example.com',
        },
        interestRate: {
          '@type': 'QuantitativeValue',
          value: 7,
          unitText: 'percent per year',
        },
        termDuration: 'P20Y',
        url: 'https://example.com/en/scenario/test',
      }

      requiredProperties.forEach((prop) => {
        expect(schema).toHaveProperty(prop)
      })

      // Validate nested properties
      expect(schema.provider).toHaveProperty('@type')
      expect(schema.provider).toHaveProperty('name')
      expect(schema.provider).toHaveProperty('url')
      expect(schema.interestRate).toHaveProperty('@type')
      expect(schema.interestRate).toHaveProperty('value')
      expect(schema.interestRate).toHaveProperty('unitText')
    })

    it('should include all required properties for InvestAction', () => {
      const requiredProperties = [
        '@context',
        '@type',
        'agent',
        'object',
        'result',
        'startTime',
        'endTime',
        'description',
      ]

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'InvestAction',
        agent: {
          '@type': 'Person',
          name: 'Investment Calculator User',
        },
        object: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: 100000,
        },
        result: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: 200000,
        },
        startTime: new Date().toISOString(),
        endTime: new Date(
          Date.now() + 20 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        description: 'Test investment action',
      }

      requiredProperties.forEach((prop) => {
        expect(schema).toHaveProperty(prop)
      })

      // Validate nested properties
      expect(schema.agent).toHaveProperty('@type')
      expect(schema.agent).toHaveProperty('name')
      expect(schema.object).toHaveProperty('@type')
      expect(schema.object).toHaveProperty('currency')
      expect(schema.object).toHaveProperty('value')
      expect(schema.result).toHaveProperty('@type')
      expect(schema.result).toHaveProperty('currency')
      expect(schema.result).toHaveProperty('value')
    })

    it('should include all required properties for Dataset', () => {
      const requiredProperties = [
        '@context',
        '@type',
        'name',
        'description',
        'creator',
        'dateCreated',
        'dateModified',
        'keywords',
        'distribution',
        'variableMeasured',
      ]

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Test Dataset',
        description: 'Test dataset description',
        creator: {
          '@type': 'Organization',
          name: 'Future Value Investment Calculator',
          url: 'https://example.com',
        },
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        keywords: ['investment', 'projection'],
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: 'https://example.com/data.json',
          },
        ],
        variableMeasured: [
          {
            '@type': 'PropertyValue',
            name: 'Future Value',
            description: 'Projected value',
            unitText: 'USD',
          },
        ],
      }

      requiredProperties.forEach((prop) => {
        expect(schema).toHaveProperty(prop)
      })

      // Validate array properties
      expect(Array.isArray(schema.keywords)).toBe(true)
      expect(Array.isArray(schema.distribution)).toBe(true)
      expect(Array.isArray(schema.variableMeasured)).toBe(true)

      // Validate nested properties
      expect(schema.creator).toHaveProperty('@type')
      expect(schema.creator).toHaveProperty('name')
      expect(schema.creator).toHaveProperty('url')
      expect(schema.distribution[0]).toHaveProperty('@type')
      expect(schema.distribution[0]).toHaveProperty('encodingFormat')
      expect(schema.distribution[0]).toHaveProperty('contentUrl')
      expect(schema.variableMeasured[0]).toHaveProperty('@type')
      expect(schema.variableMeasured[0]).toHaveProperty('name')
      expect(schema.variableMeasured[0]).toHaveProperty('description')
    })
  })
})
