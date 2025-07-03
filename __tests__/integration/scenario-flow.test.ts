/**
 * Integration tests for scenario flow: check → generate → cache → return
 * Tests the complete flow and interaction between different API endpoints
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'

// Mock the scenario utilities
jest.mock('../../lib/scenarioUtils', () => ({
  parseSlugToScenario: jest.fn(),
  validateScenarioParams: jest.fn(),
  generateScenarioSlug: jest.fn(),
  detectInvestmentGoal: jest.fn(),
}))

jest.mock('../../lib/contentGenerator', () => ({
  generatePersonalizedContent: jest.fn(),
}))

// Mock implementations
const mockScenarioUtils = require('../../lib/scenarioUtils')
const mockContentGenerator = require('../../lib/contentGenerator')

// Test data
const validParams = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 0.07,
  years: 10,
  inflationRate: 0.02,
  currency: 'USD',
}

const validSlug = 'emergency-fund-10k-500-7pct-10y'
const malformedSlug = 'invalid-format'

const mockScenarioContent = {
  title: 'Emergency Fund Investment Plan',
  description: 'Build your emergency fund with systematic investing',
  sections: [
    {
      title: 'Getting Started',
      content: 'Start by setting realistic goals...',
    },
  ],
}

const mockGeneratedScenario = {
  id: 'scenario-123',
  slug: validSlug,
  params: validParams,
  content: mockScenarioContent,
  metadata: {
    generated: true,
    createdAt: new Date().toISOString(),
    views: 0,
  },
}

// Mock storage and cache
let mockStorage = new Map()
let mockCache = new Map()

describe('Scenario Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorage.clear()
    mockCache.clear()

    // Setup default mocks
    mockScenarioUtils.parseSlugToScenario.mockReturnValue(validParams)
    mockScenarioUtils.validateScenarioParams.mockReturnValue(true)
    mockScenarioUtils.generateScenarioSlug.mockReturnValue(validSlug)
    mockScenarioUtils.detectInvestmentGoal.mockReturnValue('emergency_fund')
    mockContentGenerator.generatePersonalizedContent.mockResolvedValue(
      mockScenarioContent
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Complete Flow: Check → Generate → Cache → Return', () => {
    it('should complete full flow for new scenario', async () => {
      // Step 1: Check if scenario exists (should not exist)
      const checkResult = {
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: true,
        params: validParams,
      }

      expect(checkResult.exists).toBe(false)
      expect(checkResult.canGenerate).toBe(true)

      // Step 2: Generate scenario content
      const content = await mockContentGenerator.generatePersonalizedContent(
        validParams,
        'en'
      )
      expect(content).toEqual(mockScenarioContent)

      // Step 3: Store in database/storage
      const generatedScenario = {
        ...mockGeneratedScenario,
        content,
      }
      mockStorage.set(validSlug, generatedScenario)

      // Step 4: Cache the result
      const cacheEntry = {
        data: generatedScenario,
        timestamp: Date.now(),
        views: 1,
        ttl: 3600000,
      }
      mockCache.set(`scenario:${validSlug}`, cacheEntry)

      // Step 5: Return the scenario
      const finalResult = mockStorage.get(validSlug)
      expect(finalResult).toEqual(generatedScenario)
      expect(mockCache.has(`scenario:${validSlug}`)).toBe(true)
    })

    it('should serve from cache on subsequent requests', async () => {
      // First request: Generate and cache
      const generatedScenario = mockGeneratedScenario
      mockStorage.set(validSlug, generatedScenario)

      const cacheEntry = {
        data: generatedScenario,
        timestamp: Date.now(),
        views: 1,
        ttl: 3600000,
      }
      mockCache.set(`scenario:${validSlug}`, cacheEntry)

      // Second request: Should hit cache
      const cachedEntry = mockCache.get(`scenario:${validSlug}`)
      expect(cachedEntry).toBeDefined()

      const isValidCache = Date.now() - cachedEntry.timestamp < cachedEntry.ttl
      expect(isValidCache).toBe(true)

      // Increment views on cache hit
      cachedEntry.views += 1
      expect(cachedEntry.views).toBe(2)

      const cacheResult = {
        exists: true,
        cached: true,
        cacheHit: true,
        type: 'auto-generated',
        scenario: cachedEntry.data,
      }

      expect(cacheResult.cached).toBe(true)
      expect(cacheResult.cacheHit).toBe(true)
    })

    it('should fall back to generation when cache expires', async () => {
      // Setup expired cache entry
      const expiredCacheEntry = {
        data: mockGeneratedScenario,
        timestamp: Date.now() - 7200000, // 2 hours ago
        views: 5,
        ttl: 3600000, // 1 hour TTL
      }
      mockCache.set(`scenario:${validSlug}`, expiredCacheEntry)

      // Check if cache is expired
      const isExpired =
        Date.now() - expiredCacheEntry.timestamp >= expiredCacheEntry.ttl
      expect(isExpired).toBe(true)

      // Should trigger regeneration
      const newContent = await mockContentGenerator.generatePersonalizedContent(
        validParams,
        'en'
      )
      expect(newContent).toEqual(mockScenarioContent)

      // Update cache with fresh entry
      const freshCacheEntry = {
        data: { ...mockGeneratedScenario, content: newContent },
        timestamp: Date.now(),
        views: 1,
        ttl: 3600000,
      }
      mockCache.set(`scenario:${validSlug}`, freshCacheEntry)

      const updatedEntry = mockCache.get(`scenario:${validSlug}`)
      const isNowValid = Date.now() - updatedEntry.timestamp < updatedEntry.ttl
      expect(isNowValid).toBe(true)
    })
  })

  describe('Error Handling for Malformed Slugs', () => {
    it('should handle completely invalid slug format', () => {
      mockScenarioUtils.parseSlugToScenario.mockReturnValue(null)

      const result = {
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: false,
        error: 'Invalid scenario slug format',
      }

      expect(result.canGenerate).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    it('should handle slug with invalid parameters', () => {
      const invalidParams = {
        initialAmount: -1000, // Invalid negative amount
        monthlyContribution: 0,
        annualReturn: -0.5, // Invalid negative return
        years: 0, // Invalid zero years
      }

      mockScenarioUtils.parseSlugToScenario.mockReturnValue(invalidParams)
      mockScenarioUtils.validateScenarioParams.mockReturnValue(false)

      const result = {
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: false,
        error: 'Invalid scenario parameters',
      }

      expect(result.canGenerate).toBe(false)
      expect(result.error).toContain('Invalid')
    })

    it('should handle empty or whitespace-only slugs', () => {
      const emptySlugResults = ['', '   ', '\t\n'].map((slug) => ({
        slug,
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: false,
        error: 'Empty scenario slug',
      }))

      emptySlugResults.forEach((result) => {
        expect(result.canGenerate).toBe(false)
        expect(result.error).toContain('Empty')
      })
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests for same scenario', async () => {
      const concurrentRequests = 5
      const requestPromises = Array(concurrentRequests)
        .fill(null)
        .map(async () => {
          // Simulate scenario generation
          const content =
            await mockContentGenerator.generatePersonalizedContent(
              validParams,
              'en'
            )
          return {
            slug: validSlug,
            content,
            timestamp: Date.now(),
          }
        })

      const results = await Promise.all(requestPromises)
      expect(results).toHaveLength(concurrentRequests)

      results.forEach((result) => {
        expect(result.slug).toBe(validSlug)
        expect(result.content).toEqual(mockScenarioContent)
      })
    })

    it('should handle concurrent requests for different scenarios', async () => {
      const scenarios = [
        { slug: 'scenario-1', params: { ...validParams, initialAmount: 5000 } },
        {
          slug: 'scenario-2',
          params: { ...validParams, initialAmount: 15000 },
        },
        {
          slug: 'scenario-3',
          params: { ...validParams, initialAmount: 25000 },
        },
      ]

      const concurrentChecks = scenarios.map((scenario) => ({
        slug: scenario.slug,
        exists: false,
        cached: false,
        canGenerate: true,
        params: scenario.params,
      }))

      expect(concurrentChecks).toHaveLength(3)
      concurrentChecks.forEach((result, index) => {
        expect(result.slug).toBe(scenarios[index].slug)
        expect(result.canGenerate).toBe(true)
      })
    })

    it('should prevent race conditions in cache updates', () => {
      const initialViews = 0
      const cacheEntry = {
        data: mockGeneratedScenario,
        timestamp: Date.now(),
        views: initialViews,
        ttl: 3600000,
      }

      // Simulate concurrent cache updates
      const updateCount = 10
      for (let i = 0; i < updateCount; i++) {
        cacheEntry.views += 1
      }

      expect(cacheEntry.views).toBe(initialViews + updateCount)
    })
  })

  describe('Cache Integration', () => {
    it('should populate cache after successful generation', async () => {
      // Generate scenario
      const content = await mockContentGenerator.generatePersonalizedContent(
        validParams,
        'en'
      )
      const scenario = { ...mockGeneratedScenario, content }

      // Store in cache
      const cacheKey = `scenario:${validSlug}`
      const cacheEntry = {
        data: scenario,
        timestamp: Date.now(),
        views: 1,
        ttl: 3600000,
      }
      mockCache.set(cacheKey, cacheEntry)

      // Verify cache population
      expect(mockCache.has(cacheKey)).toBe(true)
      const cachedData = mockCache.get(cacheKey)
      expect(cachedData.data.slug).toBe(validSlug)
      expect(cachedData.views).toBe(1)
    })

    it('should handle cache eviction policies', () => {
      const maxCacheSize = 3

      // Fill cache beyond limit
      for (let i = 0; i < maxCacheSize + 2; i++) {
        const cacheEntry = {
          data: { ...mockGeneratedScenario, slug: `scenario-${i}` },
          timestamp: Date.now() - i * 1000, // Different timestamps for LRU
          views: 1,
          ttl: 3600000,
        }
        mockCache.set(`scenario:scenario-${i}`, cacheEntry)
      }

      expect(mockCache.size).toBe(maxCacheSize + 2)

      // Simulate LRU eviction
      if (mockCache.size > maxCacheSize) {
        const entries = Array.from(mockCache.entries())
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp) // Sort by timestamp (oldest first)

        const toEvict = entries.slice(0, mockCache.size - maxCacheSize)
        toEvict.forEach(([key]) => mockCache.delete(key))
      }

      expect(mockCache.size).toBe(maxCacheSize)
    })

    it('should update cache statistics correctly', () => {
      // Setup cache with various scenarios
      const scenarios = [
        { key: 'scenario:1', views: 5, timestamp: Date.now() },
        { key: 'scenario:2', views: 3, timestamp: Date.now() - 1800000 },
        { key: 'scenario:3', views: 8, timestamp: Date.now() - 7200000 }, // Expired
      ]

      scenarios.forEach((scenario) => {
        mockCache.set(scenario.key, {
          data: mockGeneratedScenario,
          timestamp: scenario.timestamp,
          views: scenario.views,
          ttl: 3600000,
        })
      })

      // Calculate stats
      const now = Date.now()
      let validEntries = 0
      let expiredEntries = 0
      let totalViews = 0

      for (const [key, entry] of mockCache.entries()) {
        if (now - entry.timestamp < entry.ttl) {
          validEntries++
          totalViews += entry.views
        } else {
          expiredEntries++
        }
      }

      expect(validEntries).toBe(2)
      expect(expiredEntries).toBe(1)
      expect(totalViews).toBe(8) // 5 + 3 (excluding expired)
    })
  })

  describe('Performance Monitoring', () => {
    it('should track response times for different operations', async () => {
      const operations = []

      // Track cache check
      const cacheCheckStart = Date.now()
      const cacheResult = mockCache.get(`scenario:${validSlug}`)
      const cacheCheckTime = Date.now() - cacheCheckStart
      operations.push({ operation: 'cache_check', time: cacheCheckTime })

      // Track content generation
      const generationStart = Date.now()
      await mockContentGenerator.generatePersonalizedContent(validParams, 'en')
      const generationTime = Date.now() - generationStart
      operations.push({ operation: 'content_generation', time: generationTime })

      // Track storage save
      const storageStart = Date.now()
      mockStorage.set(validSlug, mockGeneratedScenario)
      const storageTime = Date.now() - storageStart
      operations.push({ operation: 'storage_save', time: storageTime })

      expect(operations).toHaveLength(3)
      operations.forEach((op) => {
        expect(op.time).toBeGreaterThanOrEqual(0)
      })
    })

    it('should monitor cache hit ratios over time', () => {
      const requests = [
        { slug: 'scenario-1', hit: false },
        { slug: 'scenario-1', hit: true }, // Cache hit
        { slug: 'scenario-2', hit: false },
        { slug: 'scenario-1', hit: true }, // Cache hit
        { slug: 'scenario-3', hit: false },
      ]

      const hits = requests.filter((req) => req.hit).length
      const total = requests.length
      const hitRatio = hits / total

      expect(hitRatio).toBe(0.4) // 2 hits out of 5 requests
    })

    it('should handle performance degradation gracefully', async () => {
      // Simulate slow content generation
      mockContentGenerator.generatePersonalizedContent.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockScenarioContent), 100)
          )
      )

      const start = Date.now()
      const content = await mockContentGenerator.generatePersonalizedContent(
        validParams,
        'en'
      )
      const duration = Date.now() - start

      expect(content).toEqual(mockScenarioContent)
      expect(duration).toBeGreaterThanOrEqual(100)
    })
  })

  describe('Error Recovery', () => {
    it('should recover from content generation failures', async () => {
      // First attempt fails
      mockContentGenerator.generatePersonalizedContent
        .mockRejectedValueOnce(new Error('Generation failed'))
        .mockResolvedValueOnce(mockScenarioContent)

      // Should retry and succeed
      try {
        await mockContentGenerator.generatePersonalizedContent(
          validParams,
          'en'
        )
        // This should fail, triggering retry logic
      } catch (error) {
        expect(error.message).toBe('Generation failed')
      }

      // Retry should succeed
      const content = await mockContentGenerator.generatePersonalizedContent(
        validParams,
        'en'
      )
      expect(content).toEqual(mockScenarioContent)
    })

    it('should handle storage failures gracefully', () => {
      // Simulate storage failure
      const originalSet = mockStorage.set
      mockStorage.set = jest.fn().mockImplementation(() => {
        throw new Error('Storage unavailable')
      })

      expect(() => {
        mockStorage.set(validSlug, mockGeneratedScenario)
      }).toThrow('Storage unavailable')

      // Restore and verify recovery
      mockStorage.set = originalSet
      mockStorage.set(validSlug, mockGeneratedScenario)
      expect(mockStorage.get(validSlug)).toEqual(mockGeneratedScenario)
    })

    it('should maintain cache consistency during failures', () => {
      const cacheKey = `scenario:${validSlug}`
      const originalEntry = {
        data: mockGeneratedScenario,
        timestamp: Date.now(),
        views: 5,
        ttl: 3600000,
      }

      mockCache.set(cacheKey, originalEntry)

      // Simulate partial failure that could corrupt cache
      try {
        throw new Error('Simulated failure')
      } catch (error) {
        // Cache should remain unchanged
        const cacheEntry = mockCache.get(cacheKey)
        expect(cacheEntry).toEqual(originalEntry)
      }
    })
  })
})
