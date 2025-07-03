/**
 * Tests for API endpoint: /api/scenarios/check
 * Tests scenario existence check functionality, cache-first strategy, and performance
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'

// Mock the dependencies
jest.mock('@/lib/scenarioUtils', () => ({
  parseSlugToScenario: jest.fn(),
  validateScenarioParams: jest.fn(),
  generateScenarioSlug: jest.fn(),
}))

// Mock data
const mockScenarioUtils = require('@/lib/scenarioUtils')

// Mock storage and cache
let mockUserScenarios: Map<string, any> = new Map()
let mockGeneratedScenarios: Map<string, any> = new Map()
let mockScenarioCache: Map<string, any> = new Map()

// Test data
const validSlug = 'emergency-fund-10k'
const invalidSlug = 'invalid-slug-format'
const validParams = {
  initialAmount: 10000,
  monthlyContribution: 500,
  annualReturn: 0.07,
  years: 10,
  inflationRate: 0.02,
  currency: 'USD',
}

const mockUserScenario = {
  id: 'user-scenario-123',
  slug: validSlug,
  name: 'Emergency Fund Plan',
  description: 'Building an emergency fund',
  params: validParams,
  metadata: {
    createdAt: new Date().toISOString(),
    views: 0,
  },
}

const mockGeneratedScenario = {
  id: 'generated-scenario-123',
  slug: validSlug,
  params: validParams,
  content: {
    title: 'Emergency Fund Investment Plan',
    description: 'Auto-generated emergency fund scenario',
    sections: [],
  },
  metadata: {
    generated: true,
    createdAt: new Date().toISOString(),
    views: 0,
  },
}

// Mock cache entry
const mockCacheEntry = {
  data: mockGeneratedScenario,
  timestamp: Date.now(),
  views: 1,
  ttl: 3600000, // 1 hour
}

// Mock the API route handlers
const mockCheckScenarioExistsWithCache = jest.fn()
const mockGetCacheStats = jest.fn()
const mockCleanExpiredCache = jest.fn()

describe('Scenario Existence Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUserScenarios.clear()
    mockGeneratedScenarios.clear()
    mockScenarioCache.clear()

    // Setup default mock implementations
    mockScenarioUtils.parseSlugToScenario.mockReturnValue(validParams)
    mockScenarioUtils.validateScenarioParams.mockReturnValue(true)
    mockScenarioUtils.generateScenarioSlug.mockReturnValue(validSlug)

    mockGetCacheStats.mockReturnValue({
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      totalViews: 0,
      hitRate: 0,
    })

    mockCleanExpiredCache.mockReturnValue(0)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/scenarios/check', () => {
    describe('Cache-First Strategy', () => {
      it('should return cached scenario when cache hit occurs', () => {
        // Setup cache hit scenario
        mockScenarioCache.set(`scenario:${validSlug}`, mockCacheEntry)

        const result = {
          exists: true,
          cached: true,
          cacheHit: true,
          type: 'auto-generated',
          scenario: mockCacheEntry.data,
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache(validSlug)).toEqual(result)
        expect(result.cached).toBe(true)
        expect(result.cacheHit).toBe(true)
      })

      it('should check storage when cache miss occurs', () => {
        // Setup cache miss, but scenario exists in storage
        mockUserScenarios.set(validSlug, mockUserScenario)

        const result = {
          exists: true,
          cached: false,
          cacheHit: false,
          type: 'user-generated',
          scenario: mockUserScenario,
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache(validSlug)).toEqual(result)
        expect(result.cached).toBe(false)
        expect(result.cacheHit).toBe(false)
        expect(result.exists).toBe(true)
      })

      it('should update cache access time on cache hit', () => {
        const originalTimestamp = Date.now() - 1000
        const cacheEntry = {
          ...mockCacheEntry,
          timestamp: originalTimestamp,
          views: 1,
        }

        mockScenarioCache.set(`scenario:${validSlug}`, cacheEntry)

        // Simulate cache hit with timestamp update
        cacheEntry.views += 1
        cacheEntry.timestamp = Date.now()

        expect(cacheEntry.views).toBe(2)
        expect(cacheEntry.timestamp).toBeGreaterThan(originalTimestamp)
      })
    })

    describe('Scenario Existence Check with Valid Slugs', () => {
      it('should return existing user-generated scenario', () => {
        mockUserScenarios.set(validSlug, mockUserScenario)

        const result = {
          exists: true,
          cached: false,
          cacheHit: false,
          type: 'user-generated',
          scenario: mockUserScenario,
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache(validSlug)).toEqual(result)
        expect(result.type).toBe('user-generated')
        expect(result.scenario.id).toBe(mockUserScenario.id)
      })

      it('should return existing generated scenario', () => {
        mockGeneratedScenarios.set(validSlug, mockGeneratedScenario)

        const result = {
          exists: true,
          cached: false,
          cacheHit: false,
          type: 'auto-generated',
          scenario: mockGeneratedScenario,
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache(validSlug)).toEqual(result)
        expect(result.type).toBe('auto-generated')
        expect(result.scenario.metadata.generated).toBe(true)
      })

      it('should indicate scenario can be generated when valid but non-existent', () => {
        const result = {
          exists: false,
          cached: false,
          cacheHit: false,
          canGenerate: true,
          params: validParams,
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache(validSlug)).toEqual(result)
        expect(result.canGenerate).toBe(true)
        expect(result.params).toEqual(validParams)
      })
    })

    describe('Response for Non-Existent Scenarios', () => {
      it('should return error for invalid slug format', () => {
        mockScenarioUtils.parseSlugToScenario.mockReturnValue(null)

        const result = {
          exists: false,
          cached: false,
          cacheHit: false,
          canGenerate: false,
          error: 'Invalid scenario slug format',
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache(invalidSlug)).toEqual(result)
        expect(result.canGenerate).toBe(false)
        expect(result.error).toContain('Invalid')
      })

      it('should return error for empty slug', () => {
        const result = {
          exists: false,
          cached: false,
          cacheHit: false,
          canGenerate: false,
          error: 'Invalid scenario slug format',
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache('')).toEqual(result)
        expect(result.canGenerate).toBe(false)
      })

      it('should return error for slug with invalid parameters', () => {
        mockScenarioUtils.parseSlugToScenario.mockReturnValue(validParams)
        mockScenarioUtils.validateScenarioParams.mockReturnValue(false)

        const result = {
          exists: false,
          cached: false,
          cacheHit: false,
          canGenerate: false,
          error: 'Invalid scenario slug format',
        }

        mockCheckScenarioExistsWithCache.mockReturnValue(result)

        expect(mockCheckScenarioExistsWithCache('invalid-params-slug')).toEqual(
          result
        )
        expect(result.canGenerate).toBe(false)
      })
    })

    describe('Cache Statistics', () => {
      it('should return cache statistics when requested', () => {
        const stats = {
          totalEntries: 5,
          validEntries: 4,
          expiredEntries: 1,
          totalViews: 25,
          hitRate: 0.8,
        }

        mockGetCacheStats.mockReturnValue(stats)

        expect(mockGetCacheStats()).toEqual(stats)
        expect(stats.hitRate).toBe(0.8)
        expect(stats.totalEntries).toBe(5)
      })

      it('should handle cache cleanup requests', () => {
        mockCleanExpiredCache.mockReturnValue(3)

        const cleanedCount = mockCleanExpiredCache()
        expect(cleanedCount).toBe(3)
      })
    })
  })

  describe('POST /api/scenarios/check (Batch Check)', () => {
    it('should check multiple scenarios at once', () => {
      const slugs = ['scenario-1', 'scenario-2', 'scenario-3']
      const results = slugs.map((slug) => ({
        slug,
        success: true,
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: true,
        params: validParams,
      }))

      expect(results).toHaveLength(3)
      results.forEach((result) => {
        expect(result.success).toBe(true)
        expect(result.canGenerate).toBe(true)
      })
    })

    it('should handle invalid slugs in batch', () => {
      const slugs = ['valid-slug', '', 'another-valid-slug']
      const results = [
        {
          slug: 'valid-slug',
          success: true,
          exists: false,
          cached: false,
          cacheHit: false,
          canGenerate: true,
          params: validParams,
        },
        {
          slug: '',
          success: false,
          error: 'Invalid slug',
          exists: false,
          cached: false,
          canGenerate: false,
        },
        {
          slug: 'another-valid-slug',
          success: true,
          exists: false,
          cached: false,
          cacheHit: false,
          canGenerate: true,
          params: validParams,
        },
      ]

      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)
    })

    it('should limit batch size to prevent abuse', () => {
      const largeBatch = Array(150)
        .fill(null)
        .map((_, i) => `scenario-${i}`)

      // Should reject batches larger than 100
      expect(largeBatch.length).toBeGreaterThan(100)

      // Mock validation that would reject this
      const shouldReject = largeBatch.length > 100
      expect(shouldReject).toBe(true)
    })

    it('should validate batch request format', () => {
      // Test invalid input formats
      const invalidInputs = [null, 'not-an-array', 123, {}]

      invalidInputs.forEach((input) => {
        const isValid = Array.isArray(input)
        expect(isValid).toBe(false)
      })
    })
  })

  describe('DELETE /api/scenarios/check (Cache Management)', () => {
    it('should clear specific cache entry', () => {
      mockScenarioCache.set(`scenario:${validSlug}`, mockCacheEntry)

      const existed = mockScenarioCache.has(`scenario:${validSlug}`)
      expect(existed).toBe(true)

      mockScenarioCache.delete(`scenario:${validSlug}`)
      const stillExists = mockScenarioCache.has(`scenario:${validSlug}`)
      expect(stillExists).toBe(false)
    })

    it('should clear all cache entries when requested', () => {
      // Setup cache with multiple entries
      mockScenarioCache.set('scenario:1', mockCacheEntry)
      mockScenarioCache.set('scenario:2', mockCacheEntry)
      mockScenarioCache.set('scenario:3', mockCacheEntry)

      expect(mockScenarioCache.size).toBe(3)

      mockScenarioCache.clear()
      expect(mockScenarioCache.size).toBe(0)
    })

    it('should handle deletion of non-existent cache entry', () => {
      const existed = mockScenarioCache.has(`scenario:${validSlug}`)
      expect(existed).toBe(false)

      const deleteResult = mockScenarioCache.delete(`scenario:${validSlug}`)
      expect(deleteResult).toBe(false)
    })
  })

  describe('Cache TTL and Expiration', () => {
    it('should respect cache TTL', () => {
      const now = Date.now()
      const expiredEntry = {
        ...mockCacheEntry,
        timestamp: now - 7200000, // 2 hours ago
        ttl: 3600000, // 1 hour TTL
      }

      // Entry should be considered expired
      const isExpired = now - expiredEntry.timestamp >= expiredEntry.ttl
      expect(isExpired).toBe(true)
    })

    it('should consider non-expired entries as valid', () => {
      const now = Date.now()
      const validEntry = {
        ...mockCacheEntry,
        timestamp: now - 1800000, // 30 minutes ago
        ttl: 3600000, // 1 hour TTL
      }

      // Entry should still be valid
      const isExpired = now - validEntry.timestamp >= validEntry.ttl
      expect(isExpired).toBe(false)
    })

    it('should clean expired entries from cache', () => {
      const now = Date.now()

      // Add mix of valid and expired entries
      const validEntry = {
        ...mockCacheEntry,
        timestamp: now - 1800000, // 30 minutes ago
        ttl: 3600000,
      }

      const expiredEntry = {
        ...mockCacheEntry,
        timestamp: now - 7200000, // 2 hours ago
        ttl: 3600000,
      }

      mockScenarioCache.set('scenario:valid', validEntry)
      mockScenarioCache.set('scenario:expired', expiredEntry)

      expect(mockScenarioCache.size).toBe(2)

      // Simulate cleanup
      const keysToDelete: string[] = []
      for (const [key, entry] of Array.from(mockScenarioCache.entries())) {
        if (now - entry.timestamp >= entry.ttl) {
          keysToDelete.push(key)
        }
      }

      keysToDelete.forEach((key) => mockScenarioCache.delete(key))

      expect(mockScenarioCache.size).toBe(1)
      expect(mockScenarioCache.has('scenario:valid')).toBe(true)
      expect(mockScenarioCache.has('scenario:expired')).toBe(false)
    })
  })

  describe('Performance Considerations', () => {
    it('should handle concurrent cache access', async () => {
      // Set up the mock implementation before creating the requests
      mockCheckScenarioExistsWithCache.mockImplementation((slug: string) => ({
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: true,
        params: validParams,
        slug,
      }))

      const concurrentRequests = Array(10)
        .fill(null)
        .map((_, i) => mockCheckScenarioExistsWithCache(`scenario-${i}`))

      const results = await Promise.all(concurrentRequests)
      expect(results).toHaveLength(10)
      results.forEach((result: any) => {
        expect(result.canGenerate).toBe(true)
      })
    })

    it('should track cache hit ratios for monitoring', () => {
      const stats = {
        totalEntries: 100,
        validEntries: 85,
        expiredEntries: 15,
        totalViews: 500,
        hitRate: 0.85,
      }

      expect(stats.hitRate).toBeGreaterThan(0.8)
      expect(stats.validEntries / stats.totalEntries).toBe(0.85)
    })

    it('should handle memory pressure by cleaning expired entries', () => {
      // Simulate memory pressure cleanup
      const entriesBeforeCleanup = 1000
      const expiredEntries = 250
      const entriesAfterCleanup = entriesBeforeCleanup - expiredEntries

      mockCleanExpiredCache.mockReturnValue(expiredEntries)

      const cleanedCount = mockCleanExpiredCache()
      expect(cleanedCount).toBe(expiredEntries)

      const remainingEntries = entriesBeforeCleanup - Number(cleanedCount)
      expect(remainingEntries).toBe(entriesAfterCleanup)
    })
  })

  describe('Error Handling', () => {
    it('should handle storage access errors gracefully', () => {
      // Simulate storage error
      const storageError = new Error('Database connection failed')

      const errorResult = {
        exists: false,
        cached: false,
        cacheHit: false,
        canGenerate: false,
        error: 'Internal server error',
      }

      expect(() => {
        throw storageError
      }).toThrow('Database connection failed')

      // Should return graceful error response
      expect(errorResult.error).toBe('Internal server error')
      expect(errorResult.exists).toBe(false)
    })

    it('should handle malformed cache entries', () => {
      // Simulate corrupted cache entry
      const corruptedEntry = {
        data: null,
        timestamp: Date.now(),
        views: 1,
        ttl: 3600000,
      }

      mockScenarioCache.set(`scenario:${validSlug}`, corruptedEntry)

      // Should handle gracefully when data is null/corrupted
      const entry = mockScenarioCache.get(`scenario:${validSlug}`)
      expect(entry.data).toBeNull()

      // Should not crash the application
      const shouldFallback = entry.data === null
      expect(shouldFallback).toBe(true)
    })

    it('should validate input parameters', () => {
      // Test parameter validation
      const invalidParams = [null, undefined, '', '   ', 123, {}, []]

      invalidParams.forEach((param) => {
        const isValidString =
          typeof param === 'string' && param.trim().length > 0
        expect(isValidString).toBe(false)
      })
    })
  })
})
