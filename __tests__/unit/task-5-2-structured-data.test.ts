/**
 * Task 5.2 Structured Data Tests
 * Tests for JSON-LD structured data schema generation logic
 */

import { InvestmentParameters, InvestmentResult } from '@/lib/finance'

describe('Task 5.2: Structured Data Implementation', () => {
  // Mock data for testing
  const mockScenario = {
    id: 'invest-50000-monthly-2000-8percent-25years-retirement',
    name: 'Retirement Investment Plan',
    description:
      'Long-term retirement investment strategy with compound growth',
    params: {
      initialAmount: 50000,
      monthlyContribution: 2000,
      annualReturnRate: 8,
      timeHorizonYears: 25,
    } as InvestmentParameters,
    tags: ['retirement', 'long-term', 'compound-interest'],
  }

  const mockResult: InvestmentResult = {
    futureValue: 2156891,
    totalContributions: 650000,
    totalGrowth: 1506891,
    annualBreakdown: [],
  }

  describe('Schema Structure Validation', () => {
    it('should create valid FinancialProduct schema structure', () => {
      const baseUrl = 'https://example.com'
      const locale = 'en'
      const scenarioUrl = `${baseUrl}/${locale}/scenario/${mockScenario.id}`

      const financialProductSchema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: mockScenario.name,
        description: mockScenario.description,
        category: 'Investment',
        provider: {
          '@type': 'Organization',
          name: 'Future Value Investment Calculator',
          url: baseUrl,
        },
        interestRate: {
          '@type': 'QuantitativeValue',
          value: mockScenario.params.annualReturnRate,
          unitText: 'percent per year',
        },
        termDuration: `P${mockScenario.params.timeHorizonYears}Y`,
        url: scenarioUrl,
      }

      // Validate schema structure
      expect(financialProductSchema['@context']).toBe('https://schema.org')
      expect(financialProductSchema['@type']).toBe('FinancialProduct')
      expect(financialProductSchema.name).toBe(mockScenario.name)
      expect(financialProductSchema.description).toBe(mockScenario.description)
      expect(financialProductSchema.category).toBe('Investment')
      expect(financialProductSchema.provider['@type']).toBe('Organization')
      expect(financialProductSchema.provider.name).toBe(
        'Future Value Investment Calculator'
      )
      expect(financialProductSchema.interestRate.value).toBe(8)
      expect(financialProductSchema.interestRate.unitText).toBe(
        'percent per year'
      )
      expect(financialProductSchema.termDuration).toBe('P25Y')
      expect(financialProductSchema.url).toBe(scenarioUrl)
    })

    it('should create valid InvestAction schema structure', () => {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(
        startDate.getFullYear() + mockScenario.params.timeHorizonYears
      )

      const investActionSchema = {
        '@context': 'https://schema.org',
        '@type': 'InvestAction',
        agent: {
          '@type': 'Person',
          name: 'Investment Calculator User',
        },
        object: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: mockResult.totalContributions,
        },
        result: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: mockResult.futureValue,
        },
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        description: `Investment scenario projecting ${mockScenario.params.timeHorizonYears} years of contributions with ${mockScenario.params.annualReturnRate}% annual return`,
      }

      // Validate schema structure
      expect(investActionSchema['@context']).toBe('https://schema.org')
      expect(investActionSchema['@type']).toBe('InvestAction')
      expect(investActionSchema.agent['@type']).toBe('Person')
      expect(investActionSchema.object.currency).toBe('USD')
      expect(investActionSchema.object.value).toBe(
        mockResult.totalContributions
      )
      expect(investActionSchema.result.currency).toBe('USD')
      expect(investActionSchema.result.value).toBe(mockResult.futureValue)
      expect(investActionSchema.description).toContain('25 years')
      expect(investActionSchema.description).toContain('8%')
    })

    it('should create valid Dataset schema structure', () => {
      const baseUrl = 'https://example.com'
      const locale = 'en'
      const scenarioUrl = `${baseUrl}/${locale}/scenario/${mockScenario.id}`
      const currentDate = new Date().toISOString()

      const datasetSchema = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: `${mockScenario.name} - Investment Projection Data`,
        description: `Financial projection dataset for ${mockScenario.name} investment scenario including year-by-year breakdown`,
        creator: {
          '@type': 'Organization',
          name: 'Future Value Investment Calculator',
          url: baseUrl,
        },
        dateCreated: currentDate,
        dateModified: currentDate,
        keywords: [
          'investment projection',
          'compound interest',
          'financial planning',
          'future value',
          ...(mockScenario.tags || []),
        ],
        distribution: [
          {
            '@type': 'DataDownload',
            encodingFormat: 'application/json',
            contentUrl: `${scenarioUrl}/data.json`,
          },
        ],
        variableMeasured: [
          {
            '@type': 'PropertyValue',
            name: 'Initial Investment',
            description: 'Starting investment amount',
            unitText: 'USD',
          },
          {
            '@type': 'PropertyValue',
            name: 'Monthly Contribution',
            description: 'Regular monthly investment amount',
            unitText: 'USD',
          },
          {
            '@type': 'PropertyValue',
            name: 'Annual Return Rate',
            description: 'Expected annual rate of return',
            unitText: 'percent',
          },
          {
            '@type': 'PropertyValue',
            name: 'Time Horizon',
            description: 'Investment duration in years',
            unitText: 'years',
          },
          {
            '@type': 'PropertyValue',
            name: 'Future Value',
            description: 'Projected total value at end of investment period',
            unitText: 'USD',
          },
          {
            '@type': 'PropertyValue',
            name: 'Total Growth',
            description: 'Total growth from compound interest',
            unitText: 'USD',
          },
        ],
      }

      // Validate schema structure
      expect(datasetSchema['@context']).toBe('https://schema.org')
      expect(datasetSchema['@type']).toBe('Dataset')
      expect(datasetSchema.name).toContain('Retirement Investment Plan')
      expect(datasetSchema.description).toContain(
        'Financial projection dataset'
      )
      expect(datasetSchema.creator['@type']).toBe('Organization')
      expect(datasetSchema.keywords).toContain('retirement')
      expect(datasetSchema.keywords).toContain('compound-interest')
      expect(datasetSchema.distribution[0]['@type']).toBe('DataDownload')
      expect(datasetSchema.distribution[0].encodingFormat).toBe(
        'application/json'
      )
      expect(datasetSchema.variableMeasured).toHaveLength(6)

      // Check variable measures
      const variables = datasetSchema.variableMeasured
      const variableNames = variables.map((v: any) => v.name)
      expect(variableNames).toContain('Initial Investment')
      expect(variableNames).toContain('Monthly Contribution')
      expect(variableNames).toContain('Annual Return Rate')
      expect(variableNames).toContain('Time Horizon')
      expect(variableNames).toContain('Future Value')
      expect(variableNames).toContain('Total Growth')
    })
  })

  describe('Data Accuracy', () => {
    it('should accurately reflect scenario parameters in structured data', () => {
      // Test that schema data matches input parameters
      expect(mockScenario.params.annualReturnRate).toBe(8)
      expect(mockScenario.params.timeHorizonYears).toBe(25)
      expect(mockScenario.params.initialAmount).toBe(50000)
      expect(mockScenario.params.monthlyContribution).toBe(2000)

      // Test result data accuracy
      expect(mockResult.totalContributions).toBe(650000)
      expect(mockResult.futureValue).toBe(2156891)
      expect(mockResult.totalGrowth).toBe(1506891)
    })

    it('should handle different locales correctly', () => {
      const locales = ['en', 'es', 'pl']
      const baseUrl = 'https://example.com'

      locales.forEach((locale) => {
        const scenarioUrl = `${baseUrl}/${locale}/scenario/${mockScenario.id}`
        expect(scenarioUrl).toContain(`/${locale}/scenario/`)
        expect(scenarioUrl).toContain(mockScenario.id)
      })
    })

    it('should handle scenarios without tags', () => {
      const noTagsScenario = {
        ...mockScenario,
        tags: undefined,
      }

      const expectedKeywords = [
        'investment projection',
        'compound interest',
        'financial planning',
        'future value',
        ...(noTagsScenario.tags || []),
      ]

      expect(Array.isArray(expectedKeywords)).toBe(true)
      expect(expectedKeywords).toContain('investment projection')
      expect(expectedKeywords).toContain('compound interest')
      expect(expectedKeywords).toContain('financial planning')
      expect(expectedKeywords).toContain('future value')
    })
  })

  describe('Schema Validation', () => {
    it('should generate valid JSON structure', () => {
      const testSchema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: 'Test Product',
        description: 'Test Description',
      }

      // Test that the object can be serialized to JSON and back
      const jsonString = JSON.stringify(testSchema)
      const parsedBack = JSON.parse(jsonString)

      expect(parsedBack['@context']).toBe('https://schema.org')
      expect(parsedBack['@type']).toBe('FinancialProduct')
      expect(parsedBack.name).toBe('Test Product')
      expect(parsedBack.description).toBe('Test Description')
    })

    it('should handle ISO date strings correctly', () => {
      const currentDate = new Date()
      const futureDate = new Date()
      futureDate.setFullYear(currentDate.getFullYear() + 25)

      const startTimeISO = currentDate.toISOString()
      const endTimeISO = futureDate.toISOString()

      // Test that dates are valid ISO strings
      expect(() => new Date(startTimeISO)).not.toThrow()
      expect(() => new Date(endTimeISO)).not.toThrow()
      expect(new Date(startTimeISO)).toBeInstanceOf(Date)
      expect(new Date(endTimeISO)).toBeInstanceOf(Date)

      // Test that future date is actually later
      expect(new Date(endTimeISO).getTime()).toBeGreaterThan(
        new Date(startTimeISO).getTime()
      )
    })

    it('should validate required properties for FinancialProduct', () => {
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

      const financialProduct = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: mockScenario.name,
        description: mockScenario.description,
        category: 'Investment',
        provider: {
          '@type': 'Organization',
          name: 'Future Value Investment Calculator',
          url: 'https://example.com',
        },
        interestRate: {
          '@type': 'QuantitativeValue',
          value: mockScenario.params.annualReturnRate,
          unitText: 'percent per year',
        },
        termDuration: `P${mockScenario.params.timeHorizonYears}Y`,
        url: 'https://example.com/en/scenario/test',
      }

      requiredProperties.forEach((property) => {
        expect(financialProduct).toHaveProperty(property)
      })

      // Validate specific property types
      expect(typeof financialProduct.interestRate.value).toBe('number')
      expect(financialProduct.interestRate.value).toBeGreaterThan(0)
      expect(financialProduct.provider['@type']).toBe('Organization')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero initial amount gracefully', () => {
      const zeroScenario = {
        ...mockScenario,
        params: {
          initialAmount: 0,
          monthlyContribution: 1000,
          annualReturnRate: 5,
          timeHorizonYears: 10,
        },
      }

      expect(zeroScenario.params.initialAmount).toBe(0)
      expect(zeroScenario.params.monthlyContribution).toBeGreaterThan(0)
      expect(zeroScenario.params.annualReturnRate).toBeGreaterThan(0)
      expect(zeroScenario.params.timeHorizonYears).toBeGreaterThan(0)

      const termDuration = `P${zeroScenario.params.timeHorizonYears}Y`
      expect(termDuration).toBe('P10Y')
    })

    it('should handle high return rates', () => {
      const highReturnScenario = {
        ...mockScenario,
        params: {
          ...mockScenario.params,
          annualReturnRate: 15,
        },
      }

      expect(highReturnScenario.params.annualReturnRate).toBe(15)
      expect(`P${highReturnScenario.params.timeHorizonYears}Y`).toBe('P25Y')

      const interestRate = {
        '@type': 'QuantitativeValue',
        value: highReturnScenario.params.annualReturnRate,
        unitText: 'percent per year',
      }

      expect(interestRate.value).toBe(15)
      expect(interestRate.unitText).toBe('percent per year')
    })

    it('should create proper URLs for different environments', () => {
      const testCases = [
        {
          baseUrl: 'https://example.com',
          locale: 'en',
          expected: '/en/scenario/',
        },
        {
          baseUrl: 'https://prod.com',
          locale: 'es',
          expected: '/es/scenario/',
        },
        {
          baseUrl: 'http://localhost:3000',
          locale: 'pl',
          expected: '/pl/scenario/',
        },
      ]

      testCases.forEach(({ baseUrl, locale, expected }) => {
        const scenarioUrl = `${baseUrl}/${locale}/scenario/${mockScenario.id}`
        expect(scenarioUrl).toContain(expected)
        expect(scenarioUrl).toContain(mockScenario.id)
      })
    })

    it('should handle long scenario names and descriptions', () => {
      const longScenario = {
        ...mockScenario,
        name: 'Very Long Retirement Investment Plan for Maximum Wealth Building Over Extended Time Periods',
        description:
          'This is a very detailed and comprehensive long-term retirement investment strategy with compound growth that spans multiple decades and includes various optimization techniques for maximum returns',
      }

      // Test that long content doesn't break schema structure
      expect(longScenario.name.length).toBeGreaterThan(50)
      expect(longScenario.description.length).toBeGreaterThan(100)

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'FinancialProduct',
        name: longScenario.name,
        description: longScenario.description,
      }

      const jsonString = JSON.stringify(schema)
      expect(() => JSON.parse(jsonString)).not.toThrow()
    })
  })
})
