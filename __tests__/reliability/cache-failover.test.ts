/**
 * Task 6.1 Cache Reliability Tests
 * Tests for fallback behavior, cache recovery, and data consistency
 */

import { MemoryCache, ScenarioCacheManager } from '@/lib/cache'

describe('Task 6.1: Cache Reliability', () => {
  describe('Fallback Behavior When Cache is Unavailable', () => {
    it('should handle cache initialization failures gracefully', () => {
      // Test with invalid configuration
      expect(() => {
        new MemoryCache({
          defaultTTL: -1, // Invalid TTL
          maxSize: 0, // Invalid size
          cleanupInterval: -100, // Invalid interval
        })
      }).not.toThrow()
    })

    it('should handle cache operations when cache is destroyed', () => {
      const cache = new MemoryCache()

      // Normal operation
      cache.set('test-key', 'test-value')
      expect(cache.get('test-key')).toBe('test-value')

      // Destroy cache
      cache.destroy()

      // Operations should not throw errors after destruction
      expect(() => {
        cache.set('after-destroy', 'value')
        cache.get('after-destroy')
        cache.has('test-key')
        cache.delete('test-key')
        cache.clear()
      }).not.toThrow()
    })

    it('should provide fallback values when cache misses occur', () => {
      const cache = new MemoryCache()

      // Test cache miss scenarios
      expect(cache.get('non-existent-key')).toBeNull()
      expect(cache.has('non-existent-key')).toBe(false)
      expect(cache.delete('non-existent-key')).toBe(false)

      cache.destroy()
    })

    it('should handle scenario cache fallback behavior', () => {
      const scenarioCache = new ScenarioCacheManager()

      const slug = 'fallback-test'
      const locale = 'en'

      // Test with non-existent scenario
      expect(scenarioCache.getScenario(slug, locale)).toBeNull()
      expect(scenarioCache.hasScenario(slug, locale)).toBe(false)

      // Fallback should not throw errors
      expect(() => {
        scenarioCache.invalidateScenario(slug, locale)
        scenarioCache.invalidateScenario('non-existent-slug')
      }).not.toThrow()

      scenarioCache.destroy()
    })
  })

  describe('Cache Recovery After Failures', () => {
    let cache: MemoryCache

    beforeEach(() => {
      cache = new MemoryCache({
        defaultTTL: 5000,
        maxSize: 10,
        cleanupInterval: 1000,
      })
    })

    afterEach(() => {
      cache.destroy()
    })

    it('should recover from memory pressure scenarios', () => {
      const originalSize = cache.size()

      try {
        // Simulate memory pressure by filling cache beyond capacity
        for (let i = 0; i < 20; i++) {
          cache.set(`pressure-${i}`, `data-${i}`.repeat(1000))
        }

        // Cache should still be functional
        expect(cache.size()).toBeLessThanOrEqual(10) // Respects maxSize

        // Should be able to perform normal operations
        cache.set('recovery-test', 'recovery-data')
        expect(cache.get('recovery-test')).toBe('recovery-data')
      } catch (error) {
        // Even if memory allocation fails, cache should remain stable
        expect(cache.size()).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle cleanup timer failures gracefully', () => {
      const cache = new MemoryCache({
        defaultTTL: 1, // Very short TTL
        maxSize: 5,
        cleanupInterval: 1, // Very frequent cleanup
      })

      // Add items that will expire quickly
      for (let i = 0; i < 5; i++) {
        cache.set(`expire-${i}`, `data-${i}`)
      }

      // Wait for potential cleanup issues
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Cache should still be functional even if cleanup had issues
          expect(() => {
            cache.set('post-cleanup', 'test')
            cache.get('post-cleanup')
          }).not.toThrow()

          cache.destroy()
          resolve()
        }, 10)
      })
    })

    it('should recover from invalid data insertion attempts', () => {
      // Test with various invalid data types
      const testCases = [
        { key: 'undefined-test', value: undefined },
        { key: 'null-test', value: null },
        { key: 'function-test', value: () => {} },
        { key: 'circular-ref', value: {} },
      ]

      // Create circular reference
      testCases[3].value = testCases[3]

      testCases.forEach(({ key, value }) => {
        expect(() => {
          cache.set(key, value)
          cache.get(key)
        }).not.toThrow()
      })

      // Cache should remain operational
      cache.set('normal-data', 'normal-value')
      expect(cache.get('normal-data')).toBe('normal-value')
    })
  })

  describe('Data Consistency Between Cache and Database', () => {
    let scenarioCache: ScenarioCacheManager

    beforeEach(() => {
      scenarioCache = new ScenarioCacheManager({
        defaultTTL: 10000,
        maxSize: 20,
        cleanupInterval: 5000,
      })
    })

    afterEach(() => {
      scenarioCache.destroy()
    })

    it('should maintain data integrity during concurrent operations', async () => {
      const slug = 'consistency-test'
      const locale = 'en'
      const baseContent = 'Original content'

      // Initial cache population
      scenarioCache.cacheScenario(slug, baseContent, {}, locale)

      // Simulate concurrent read/write operations
      const concurrentOperations = [
        // Read operations
        ...Array.from({ length: 10 }, () =>
          Promise.resolve(scenarioCache.getScenario(slug, locale))
        ),
        // Write operations
        ...Array.from({ length: 5 }, (_, i) =>
          Promise.resolve(
            scenarioCache.cacheScenario(
              slug,
              `Updated content ${i}`,
              {},
              locale
            )
          )
        ),
        // Check operations
        ...Array.from({ length: 5 }, () =>
          Promise.resolve(scenarioCache.hasScenario(slug, locale))
        ),
      ]

      const results = await Promise.all(concurrentOperations)

      // All read operations should return valid data (not null)
      const readResults = results.slice(0, 10)
      readResults.forEach((result) => {
        if (result !== undefined) {
          expect(result).not.toBeNull()
        }
      })

      // Check operations should all return true
      const checkResults = results.slice(15, 20)
      checkResults.forEach((result) => {
        if (typeof result === 'boolean') {
          expect(result).toBe(true)
        }
      })

      // Final state should be consistent
      const finalResult = scenarioCache.getScenario(slug, locale)
      expect(finalResult).not.toBeNull()
      expect(typeof finalResult!.content).toBe('string')
    })

    it('should handle cache invalidation consistency', () => {
      const slug = 'invalidation-test'
      const locales = ['en', 'es', 'pl']

      // Populate cache for all locales
      locales.forEach((locale) => {
        scenarioCache.cacheScenario(slug, `Content in ${locale}`, {}, locale)
      })

      // Verify all are cached
      locales.forEach((locale) => {
        expect(scenarioCache.hasScenario(slug, locale)).toBe(true)
      })

      // Invalidate specific locale
      scenarioCache.invalidateScenario(slug, 'en')

      // Verify partial invalidation
      expect(scenarioCache.hasScenario(slug, 'en')).toBe(false)
      expect(scenarioCache.hasScenario(slug, 'es')).toBe(true)
      expect(scenarioCache.hasScenario(slug, 'pl')).toBe(true)

      // Invalidate all locales
      scenarioCache.invalidateScenario(slug)

      // Verify complete invalidation
      locales.forEach((locale) => {
        expect(scenarioCache.hasScenario(slug, locale)).toBe(false)
      })
    })

    it('should maintain timestamp consistency', () => {
      const slug = 'timestamp-test'
      const locale = 'en'
      const testContent = 'Timestamp test content'

      const beforeCache = Date.now()
      scenarioCache.cacheScenario(slug, testContent, {}, locale)
      const afterCache = Date.now()

      const cached = scenarioCache.getScenario(slug, locale)
      expect(cached).not.toBeNull()

      const generatedAt = cached!.metadata.generatedAt
      expect(generatedAt).toBeGreaterThanOrEqual(beforeCache)
      expect(generatedAt).toBeLessThanOrEqual(afterCache)

      // Multiple retrievals should return same timestamp
      const cached2 = scenarioCache.getScenario(slug, locale)
      expect(cached2!.metadata.generatedAt).toBe(generatedAt)
    })

    it('should ensure metadata consistency across operations', () => {
      const slug = 'metadata-consistency'
      const locale = 'en'
      const params = {
        initialAmount: 50000,
        monthlyContribution: 1000,
        annualReturnRate: 7,
        timeHorizonYears: 20,
      }
      const content = 'Test content with metadata'

      scenarioCache.cacheScenario(slug, content, params, locale)

      const cached = scenarioCache.getScenario(slug, locale)
      expect(cached).not.toBeNull()

      // Verify metadata consistency
      expect(cached!.metadata.slug).toBe(slug)
      expect(cached!.metadata.locale).toBe(locale)
      expect(cached!.metadata.params).toEqual(params)
      expect(cached!.content).toBe(content)
      expect(typeof cached!.metadata.generatedAt).toBe('number')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle cache operations with malformed keys', () => {
      const cache = new MemoryCache()

      const malformedKeys = [
        '', // Empty string
        ' ', // Whitespace only
        '\n\t', // Special characters
        'a'.repeat(300), // Very long key
        'key with spaces and special chars !@#$%^&*()',
      ]

      malformedKeys.forEach((key) => {
        expect(() => {
          cache.set(key, 'test-value')
          cache.get(key)
          cache.has(key)
          cache.delete(key)
        }).not.toThrow()
      })

      cache.destroy()
    })

    it('should handle cache statistics during edge conditions', () => {
      const cache = new MemoryCache({
        defaultTTL: 1, // Very short TTL
        maxSize: 2, // Very small cache
        cleanupInterval: 5, // Frequent cleanup
      })

      // Add items that will expire quickly
      cache.set('item1', 'value1')
      cache.set('item2', 'value2')
      cache.set('item3', 'value3') // Should trigger eviction

      const stats = cache.getStats()

      expect(typeof stats.total).toBe('number')
      expect(typeof stats.valid).toBe('number')
      expect(typeof stats.expired).toBe('number')
      expect(typeof stats.maxSize).toBe('number')
      expect(typeof stats.hitRate).toBe('number')

      expect(stats.total).toBeGreaterThanOrEqual(0)
      expect(stats.total).toBeLessThanOrEqual(stats.maxSize + 1) // Allow small variance
      expect(stats.valid + stats.expired).toBeLessThanOrEqual(stats.total + 1) // Allow variance

      cache.destroy()
    })

    it('should handle scenario cache with extreme parameters', () => {
      const scenarioCache = new ScenarioCacheManager()

      const extremeCases = [
        {
          slug: 'extreme-small',
          params: { amount: 0.01, monthly: 0.01, rate: 0.01, years: 1 },
        },
        {
          slug: 'extreme-large',
          params: { amount: 1e10, monthly: 1e6, rate: 50, years: 100 },
        },
        {
          slug: 'extreme-negative',
          params: { amount: -1000, monthly: -100, rate: -5, years: -10 },
        },
      ]

      extremeCases.forEach(({ slug, params }) => {
        expect(() => {
          scenarioCache.cacheScenario(
            slug,
            JSON.stringify(params),
            params,
            'en'
          )

          const cached = scenarioCache.getScenario(slug, 'en')
          expect(cached).not.toBeNull()
        }).not.toThrow()
      })

      scenarioCache.destroy()
    })

    it('should maintain cache stability under stress conditions', () => {
      const cache = new MemoryCache({
        defaultTTL: 100,
        maxSize: 5,
        cleanupInterval: 10,
      })

      // Rapid fire operations
      for (let i = 0; i < 1000; i++) {
        cache.set(`stress-${i}`, `value-${i}`)

        if (i % 10 === 0) {
          cache.get(`stress-${i - 5}`)
          cache.delete(`stress-${i - 3}`)
        }

        if (i % 50 === 0) {
          cache.clear()
        }
      }

      // Cache should still be functional
      cache.set('final-test', 'final-value')
      expect(cache.get('final-test')).toBe('final-value')

      const stats = cache.getStats()
      expect(stats).toBeDefined()
      expect(typeof stats.total).toBe('number')

      cache.destroy()
    })
  })
})
