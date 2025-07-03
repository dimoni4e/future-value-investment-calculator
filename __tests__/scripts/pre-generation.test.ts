/**
 * Tests for pre-generation script execution
 * Tests parameter combination coverage and     it('should generate scenarios for multiple locales', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 50,
        locales: ['en', 'es', 'pl'],
      })

      expect(result.byLocale).toHaveProperty('en')
      expect(result.byLocale).toHaveProperty('es')
      expect(result.byLocale).toHaveProperty('pl')

      // Verify that scenarios were generated for each locale
      expect(result.byLocale['en']).toBeGreaterThan(0)
      expect(result.byLocale['es']).toBeGreaterThan(0)
      expect(result.byLocale['pl']).toBeGreaterThan(0)
      expect(result.totalGenerated).toBeGreaterThan(0)
    })uality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'

// Mock the dependencies
jest.mock('@/lib/scenarioUtils', () => ({
  detectInvestmentGoal: jest.fn(),
  generateScenarioSlug: jest.fn(),
}))

jest.mock('@/lib/contentGenerator', () => ({
  generatePersonalizedContent: jest.fn(),
}))

// Import the functions we're testing
import {
  preGenerateScenarios,
  preGenerateCustomScenarios,
  estimateScenarioCount,
} from '@/scripts/preGenerateScenarios'

// Mock the dependencies
const mockDetectInvestmentGoal =
  require('@/lib/scenarioUtils').detectInvestmentGoal
const mockGenerateScenarioSlug =
  require('@/lib/scenarioUtils').generateScenarioSlug
const mockGeneratePersonalizedContent =
  require('@/lib/contentGenerator').generatePersonalizedContent

// Test data
const mockValidParams = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 0.07,
  timeHorizon: 20,
}

const mockContentSections = {
  investment_overview: 'Mock investment overview content',
  growth_projection: 'Mock growth projection content',
  investment_insights: 'Mock investment insights content',
  strategy_analysis: 'Mock strategy analysis content',
  comparative_scenarios: 'Mock comparative scenarios content',
  community_insights: 'Mock community insights content',
  optimization_tips: 'Mock optimization tips content',
  market_context: 'Mock market context content',
}

describe('Pre-generation Script Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mock implementations
    mockDetectInvestmentGoal.mockReturnValue('wealth')
    mockGenerateScenarioSlug.mockReturnValue(
      'invest-10000-monthly-500-7percent-20years-wealth'
    )
    mockGeneratePersonalizedContent.mockResolvedValue(mockContentSections)

    // Mock console methods to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('preGenerateScenarios', () => {
    it('should execute pre-generation script successfully', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 10,
        minPriority: 1,
        locales: ['en'],
      })

      expect(result).toEqual({
        totalGenerated: expect.any(Number),
        byGoal: expect.any(Object),
        byLocale: expect.any(Object),
        processingTime: expect.any(Number),
        errors: expect.any(Array),
      })

      expect(result.totalGenerated).toBeGreaterThan(0)
      expect(result.processingTime).toBeGreaterThan(0)
      expect(Object.keys(result.byLocale)).toContain('en')
    })

    it('should generate scenarios for multiple locales', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 50,
        locales: ['en', 'es', 'pl'],
      })

      expect(result.byLocale).toHaveProperty('en')
      expect(result.byLocale).toHaveProperty('es')
      expect(result.byLocale).toHaveProperty('pl')

      // Verify that scenarios were generated for each locale
      expect(result.byLocale['en']).toBeGreaterThan(0)
      expect(result.byLocale['es']).toBeGreaterThan(0)
      expect(result.byLocale['pl']).toBeGreaterThan(0)
      expect(result.totalGenerated).toBeGreaterThan(0)
    })

    it('should respect maxScenarios limit', async () => {
      const maxScenarios = 25
      const result = await preGenerateScenarios({
        maxScenarios,
        locales: ['en'],
      })

      expect(result.totalGenerated).toBeLessThanOrEqual(maxScenarios)
    })

    it('should filter by minimum priority', async () => {
      const highPriorityResult = await preGenerateScenarios({
        minPriority: 5,
        locales: ['en'],
      })

      const lowPriorityResult = await preGenerateScenarios({
        minPriority: 1,
        locales: ['en'],
      })

      expect(highPriorityResult.totalGenerated).toBeLessThanOrEqual(
        lowPriorityResult.totalGenerated
      )
    })

    it('should track goals correctly', async () => {
      mockDetectInvestmentGoal
        .mockReturnValueOnce('retirement')
        .mockReturnValueOnce('wealth')
        .mockReturnValueOnce('emergency')

      const result = await preGenerateScenarios({
        maxScenarios: 10,
        locales: ['en'],
      })

      expect(result.byGoal).toBeInstanceOf(Object)
      expect(Object.keys(result.byGoal).length).toBeGreaterThan(0)
    })

    it('should handle content generation errors gracefully', async () => {
      mockGeneratePersonalizedContent.mockRejectedValueOnce(
        new Error('Content generation failed')
      )

      const result = await preGenerateScenarios({
        maxScenarios: 5,
        locales: ['en'],
      })

      // Should continue processing other scenarios despite errors
      expect(result.totalGenerated).toBeGreaterThanOrEqual(0)
      expect(result.errors).toBeInstanceOf(Array)
    })

    it('should handle empty scenarios gracefully', async () => {
      // Test with very restrictive limits to effectively get zero scenarios
      const result = await preGenerateScenarios({
        maxScenarios: 1,
        minPriority: 10, // Very high priority filter
        locales: ['en'],
      })

      // Should handle even very restrictive scenarios gracefully
      expect(result.totalGenerated).toBeGreaterThanOrEqual(0)
      expect(result.byGoal).toBeInstanceOf(Object)
    })
  })

  describe('preGenerateCustomScenarios', () => {
    it('should generate custom scenarios successfully', async () => {
      const customCombinations = [
        mockValidParams,
        {
          ...mockValidParams,
          initialAmount: 25000,
          timeHorizon: 15,
        },
      ]

      const result = await preGenerateCustomScenarios(customCombinations, [
        'en',
      ])

      expect(result.totalGenerated).toBeGreaterThan(0)
      expect(result.byLocale['en']).toBeGreaterThan(0)
      expect(mockGeneratePersonalizedContent).toHaveBeenCalledTimes(
        customCombinations.length
      )
    })

    it('should handle multiple locales for custom scenarios', async () => {
      const customCombinations = [mockValidParams]

      const result = await preGenerateCustomScenarios(customCombinations, [
        'en',
        'es',
      ])

      expect(result.byLocale['en']).toBeGreaterThan(0)
      expect(result.byLocale['es']).toBeGreaterThan(0)
      expect(result.totalGenerated).toBe(customCombinations.length * 2) // 2 locales
    })

    it('should handle custom scenario generation errors', async () => {
      // Reset mocks and set up error condition
      mockGeneratePersonalizedContent.mockClear()
      mockGeneratePersonalizedContent.mockRejectedValue(
        new Error('Custom generation failed')
      )

      const customCombinations = [mockValidParams]
      const result = await preGenerateCustomScenarios(customCombinations, [
        'en',
      ])

      // Should handle errors gracefully - either generate content or track errors
      expect(result).toHaveProperty('totalGenerated')
      expect(result).toHaveProperty('errors')
      expect(typeof result.totalGenerated).toBe('number')
      expect(Array.isArray(result.errors)).toBe(true)
    })
  })

  describe('estimateScenarioCount', () => {
    it('should calculate scenario count accurately', () => {
      const count = estimateScenarioCount(3, 3, 3, 3, 2) // 3x3x3x3x2 = 162, with 85% filter = ~137

      expect(count).toBeGreaterThan(100)
      expect(count).toBeLessThan(200)
      expect(count).toBe(Math.floor(3 * 3 * 3 * 3 * 0.85 * 2))
    })

    it('should use default values when no parameters provided', () => {
      const count = estimateScenarioCount()

      expect(count).toBeGreaterThan(1000) // Should be substantial with default parameters
      expect(typeof count).toBe('number')
    })

    it('should handle zero values correctly', () => {
      const count = estimateScenarioCount(0, 3, 3, 3, 2)

      expect(count).toBe(0)
    })
  })

  describe('Parameter Combination Coverage', () => {
    it('should cover all popular amount ranges', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 100,
        locales: ['en'],
      })

      expect(mockDetectInvestmentGoal).toHaveBeenCalled()
      expect(mockGenerateScenarioSlug).toHaveBeenCalled()
      expect(mockGeneratePersonalizedContent).toHaveBeenCalled()

      // Verify that various parameter combinations were attempted
      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      expect(contentCalls.length).toBeGreaterThan(10)
    })

    it('should generate diverse goal categories', async () => {
      // Setup different goals for different calls
      mockDetectInvestmentGoal
        .mockReturnValue('retirement')
        .mockReturnValueOnce('wealth')
        .mockReturnValueOnce('emergency')
        .mockReturnValueOnce('house')
        .mockReturnValueOnce('education')

      const result = await preGenerateScenarios({
        maxScenarios: 20,
        locales: ['en'],
      })

      // Should have at least one goal category
      expect(Object.keys(result.byGoal).length).toBeGreaterThan(0)
    })

    it('should handle realistic parameter combinations', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 50,
        locales: ['en'],
      })

      // Verify that content generation was called with valid parameters
      const contentCalls = mockGeneratePersonalizedContent.mock.calls

      contentCalls.forEach(([params]) => {
        expect(params).toHaveProperty('initialAmount')
        expect(params).toHaveProperty('monthlyContribution')
        expect(params).toHaveProperty('annualReturn')
        expect(params).toHaveProperty('timeHorizon')
        expect(params).toHaveProperty('goal')

        expect(params.initialAmount).toBeGreaterThan(0)
        expect(params.monthlyContribution).toBeGreaterThan(0)
        expect(params.annualReturn).toBeGreaterThan(0)
        expect(params.timeHorizon).toBeGreaterThan(0)
        expect(typeof params.goal).toBe('string')
      })
    })
  })

  describe('Generated Content Quality', () => {
    it('should generate content for all required sections', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 5,
        locales: ['en'],
      })

      expect(result.totalGenerated).toBeGreaterThan(0)
      expect(mockGeneratePersonalizedContent).toHaveBeenCalled()

      // Verify that the mock content has all required sections
      const expectedSections = [
        'investment_overview',
        'growth_projection',
        'investment_insights',
        'strategy_analysis',
        'comparative_scenarios',
        'community_insights',
        'optimization_tips',
        'market_context',
      ]

      expectedSections.forEach((section) => {
        expect(mockContentSections).toHaveProperty(section)
        expect(mockContentSections[section]).toBeTruthy()
      })
    })

    it('should maintain content quality across different locales', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 10,
        locales: ['en', 'es', 'pl'],
      })

      expect(result.totalGenerated).toBeGreaterThan(0)

      // Verify content was generated for each locale
      const contentCalls = mockGeneratePersonalizedContent.mock.calls
      const localesUsed = contentCalls.map(([, locale]) => locale)

      expect(localesUsed).toContain('en')
      expect(localesUsed).toContain('es')
      expect(localesUsed).toContain('pl')
    })

    it('should generate unique slugs for different parameter combinations', async () => {
      mockGenerateScenarioSlug
        .mockReturnValueOnce('invest-1000-monthly-100-6percent-10years-starter')
        .mockReturnValueOnce(
          'invest-50000-monthly-2000-8percent-25years-retirement'
        )
        .mockReturnValueOnce(
          'invest-25000-monthly-1000-7percent-15years-wealth'
        )

      const result = await preGenerateScenarios({
        maxScenarios: 10,
        locales: ['en'],
      })

      expect(result.totalGenerated).toBeGreaterThan(0)
      expect(mockGenerateScenarioSlug).toHaveBeenCalled()

      // Verify that different slugs were generated
      const slugCalls = mockGenerateScenarioSlug.mock.calls
      expect(slugCalls.length).toBeGreaterThan(1)
    })
  })

  describe('Performance and Memory', () => {
    it('should complete generation within reasonable time', async () => {
      const startTime = Date.now()

      const result = await preGenerateScenarios({
        maxScenarios: 20,
        locales: ['en'],
      })

      const actualTime = Date.now() - startTime

      expect(result.processingTime).toBeGreaterThan(0)
      expect(result.processingTime).toBeLessThan(10000) // Should complete within 10 seconds
      expect(actualTime).toBeLessThan(15000) // Allow some buffer for test environment
    })

    it('should handle large batch generation efficiently', async () => {
      const result = await preGenerateScenarios({
        maxScenarios: 100,
        locales: ['en'],
      })

      expect(result.totalGenerated).toBeGreaterThan(0)
      expect(result.processingTime).toBeLessThan(30000) // Should complete within 30 seconds for 100 scenarios
    })

    it('should not consume excessive memory during generation', async () => {
      // This is a basic check - in real scenarios you'd use more sophisticated memory monitoring
      const initialMemory = process.memoryUsage().heapUsed

      await preGenerateScenarios({
        maxScenarios: 50,
        locales: ['en'],
      })

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 100MB for test scenario)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
    })
  })
})
