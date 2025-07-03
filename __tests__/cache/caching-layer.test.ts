/**
 * Task 6.1 Cache Tests
 * Tests for cache read/write operations, TTL behavior, invalidation, and memory usage
 */

import { MemoryCache, ScenarioCacheManager, CacheUtils } from '@/lib/cache'

describe('Task 6.1: Caching Layer', () => {
  describe('MemoryCache Core Functionality', () => {
    let cache: MemoryCache

    beforeEach(() => {
      cache = new MemoryCache({
        defaultTTL: 1000, // 1 second for fast tests
        maxSize: 5,
        cleanupInterval: 100, // 100ms
      })
    })

    afterEach(() => {
      cache.destroy()
    })

    it('should store and retrieve cache entries', () => {
      const testData = { message: 'Hello, Cache!' }

      cache.set('test-key', testData)
      const retrieved = cache.get('test-key')

      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should check if key exists', () => {
      cache.set('existing-key', 'test-value')

      expect(cache.has('existing-key')).toBe(true)
      expect(cache.has('non-existent-key')).toBe(false)
    })

    it('should delete entries', () => {
      cache.set('delete-me', 'test-value')
      expect(cache.has('delete-me')).toBe(true)

      const deleted = cache.delete('delete-me')
      expect(deleted).toBe(true)
      expect(cache.has('delete-me')).toBe(false)
    })

    it('should clear all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)

      cache.clear()
      expect(cache.size()).toBe(0)
    })

    it('should track cache size', () => {
      expect(cache.size()).toBe(0)

      cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)

      cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
    })

    it('should return all cache keys', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      const keys = cache.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
      expect(keys.length).toBe(2)
    })
  })

  describe('TTL Behavior and Automatic Expiration', () => {
    let cache: MemoryCache

    beforeEach(() => {
      cache = new MemoryCache({
        defaultTTL: 50, // 50ms for fast tests
        maxSize: 10,
        cleanupInterval: 25, // 25ms
      })
    })

    afterEach(() => {
      cache.destroy()
    })

    it('should expire entries after TTL', async () => {
      cache.set('expiring-key', 'test-value')
      expect(cache.has('expiring-key')).toBe(true)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60))
      expect(cache.has('expiring-key')).toBe(false)
    })

    it('should use custom TTL when provided', async () => {
      const customTTL = 100 // 100ms
      cache.set('custom-ttl-key', 'test-value', customTTL)

      // Should still exist after default TTL
      await new Promise((resolve) => setTimeout(resolve, 60))
      expect(cache.has('custom-ttl-key')).toBe(true)

      // Should expire after custom TTL
      await new Promise((resolve) => setTimeout(resolve, 50))
      expect(cache.has('custom-ttl-key')).toBe(false)
    })

    it('should return null for expired entries on get', async () => {
      cache.set('get-expired', 'test-value')

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60))

      const result = cache.get('get-expired')
      expect(result).toBeNull()
    })

    it('should automatically clean up expired entries', async () => {
      cache.set('cleanup1', 'value1')
      cache.set('cleanup2', 'value2')
      cache.set('cleanup3', 'value3')

      expect(cache.size()).toBe(3)

      // Wait for automatic cleanup
      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(cache.size()).toBe(0)
    })
  })

  describe('Cache Invalidation Strategies', () => {
    let cache: MemoryCache

    beforeEach(() => {
      cache = new MemoryCache({
        defaultTTL: 10000, // Long TTL for these tests
        maxSize: 10,
        cleanupInterval: 1000,
      })
    })

    afterEach(() => {
      cache.destroy()
    })

    it('should invalidate single entries', () => {
      cache.set('invalidate-me', 'test-value')
      cache.set('keep-me', 'other-value')

      expect(cache.has('invalidate-me')).toBe(true)
      expect(cache.has('keep-me')).toBe(true)

      cache.delete('invalidate-me')

      expect(cache.has('invalidate-me')).toBe(false)
      expect(cache.has('keep-me')).toBe(true)
    })

    it('should invalidate all entries with clear', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.size()).toBe(3)

      cache.clear()

      expect(cache.size()).toBe(0)
      expect(cache.has('key1')).toBe(false)
      expect(cache.has('key2')).toBe(false)
      expect(cache.has('key3')).toBe(false)
    })

    it('should handle deletion of non-existent keys gracefully', () => {
      const result = cache.delete('non-existent-key')
      expect(result).toBe(false)
    })
  })

  describe('Memory Usage and Limits', () => {
    let cache: MemoryCache

    beforeEach(() => {
      cache = new MemoryCache({
        defaultTTL: 10000,
        maxSize: 3, // Small cache for testing limits
        cleanupInterval: 1000,
      })
    })

    afterEach(() => {
      cache.destroy()
    })

    it('should enforce maximum cache size', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.set('key3', 'value3')

      expect(cache.size()).toBe(3)

      // Adding a 4th item should evict the oldest
      cache.set('key4', 'value4')

      expect(cache.size()).toBeLessThanOrEqual(3) // Should respect maxSize
      expect(cache.has('key4')).toBe(true) // Newest should exist
    })

    it('should evict oldest entries when cache is full', () => {
      // Fill cache to capacity
      cache.set('oldest', 'value1')

      // Add some delay to ensure timestamp difference
      setTimeout(() => {
        cache.set('middle', 'value2')
        cache.set('newest', 'value3')

        // This should evict 'oldest'
        cache.set('trigger-eviction', 'value4')

        expect(cache.has('oldest')).toBe(false)
        expect(cache.has('middle')).toBe(true)
        expect(cache.has('newest')).toBe(true)
        expect(cache.has('trigger-eviction')).toBe(true)
      }, 10)
    })

    it('should provide accurate cache statistics', () => {
      cache.set('stat1', 'value1')
      cache.set('stat2', 'value2')

      const stats = cache.getStats()

      expect(stats.total).toBe(2)
      expect(stats.maxSize).toBe(3)
      expect(typeof stats.valid).toBe('number')
      expect(typeof stats.expired).toBe('number')
      expect(typeof stats.hitRate).toBe('number')
    })
  })

  describe('ScenarioCacheManager', () => {
    let scenarioCache: ScenarioCacheManager

    beforeEach(() => {
      scenarioCache = new ScenarioCacheManager({
        defaultTTL: 10000,
        maxSize: 10,
        cleanupInterval: 1000,
      })
    })

    afterEach(() => {
      scenarioCache.destroy()
    })

    it('should cache scenario data with metadata', () => {
      const slug = 'test-scenario'
      const content = 'Generated scenario content'
      const params = { initialAmount: 10000, monthlyContribution: 500 }
      const locale = 'en'

      scenarioCache.cacheScenario(slug, content, params, locale)

      const cached = scenarioCache.getScenario(slug, locale)

      expect(cached).not.toBeNull()
      expect(cached!.content).toBe(content)
      expect(cached!.metadata.slug).toBe(slug)
      expect(cached!.metadata.params).toEqual(params)
      expect(cached!.metadata.locale).toBe(locale)
      expect(typeof cached!.metadata.generatedAt).toBe('number')
    })

    it('should check scenario existence', () => {
      const slug = 'exists-scenario'
      const locale = 'en'

      expect(scenarioCache.hasScenario(slug, locale)).toBe(false)

      scenarioCache.cacheScenario(slug, 'content', {}, locale)

      expect(scenarioCache.hasScenario(slug, locale)).toBe(true)
    })

    it('should invalidate specific scenario and locale', () => {
      const slug = 'multi-locale-scenario'

      scenarioCache.cacheScenario(slug, 'English content', {}, 'en')
      scenarioCache.cacheScenario(slug, 'Spanish content', {}, 'es')

      expect(scenarioCache.hasScenario(slug, 'en')).toBe(true)
      expect(scenarioCache.hasScenario(slug, 'es')).toBe(true)

      scenarioCache.invalidateScenario(slug, 'en')

      expect(scenarioCache.hasScenario(slug, 'en')).toBe(false)
      expect(scenarioCache.hasScenario(slug, 'es')).toBe(true)
    })

    it('should invalidate all locales for a scenario', () => {
      const slug = 'invalidate-all-scenario'

      scenarioCache.cacheScenario(slug, 'English content', {}, 'en')
      scenarioCache.cacheScenario(slug, 'Spanish content', {}, 'es')
      scenarioCache.cacheScenario(slug, 'Polish content', {}, 'pl')

      expect(scenarioCache.hasScenario(slug, 'en')).toBe(true)
      expect(scenarioCache.hasScenario(slug, 'es')).toBe(true)
      expect(scenarioCache.hasScenario(slug, 'pl')).toBe(true)

      scenarioCache.invalidateScenario(slug) // No locale specified

      expect(scenarioCache.hasScenario(slug, 'en')).toBe(false)
      expect(scenarioCache.hasScenario(slug, 'es')).toBe(false)
      expect(scenarioCache.hasScenario(slug, 'pl')).toBe(false)
    })

    it('should provide cache warming functionality', () => {
      const popularScenarios = [
        { slug: 'popular1', locale: 'en' },
        { slug: 'popular2', locale: 'es' },
      ]

      // Should not throw error (basic functionality test)
      expect(() => {
        scenarioCache.warmCache(popularScenarios)
      }).not.toThrow()
    })

    it('should return trending scenarios', () => {
      scenarioCache.cacheScenario('trending1', 'content1', {}, 'en')
      scenarioCache.cacheScenario('trending2', 'content2', {}, 'en')
      scenarioCache.cacheScenario('other-cache', 'content3', {}, 'en') // Non-scenario cache

      const trending = scenarioCache.getTrendingScenarios(5)

      expect(Array.isArray(trending)).toBe(true)
      // Should only return scenario keys
      trending.forEach((key) => {
        expect(key).toMatch(/^scenario:/)
      })
    })

    it('should provide cache statistics', () => {
      scenarioCache.cacheScenario('stats-test', 'content', {}, 'en')

      const stats = scenarioCache.getStats()

      expect(typeof stats.total).toBe('number')
      expect(typeof stats.valid).toBe('number')
      expect(typeof stats.expired).toBe('number')
      expect(typeof stats.maxSize).toBe('number')
    })
  })

  describe('Cache Utilities', () => {
    it('should generate valid cache keys', () => {
      const key = CacheUtils.generateCacheKey('scenario', 'test-slug', 'en')
      expect(key).toBe('scenario:test-slug:en')
    })

    it('should validate cache keys', () => {
      expect(CacheUtils.isValidCacheKey('valid-key')).toBe(true)
      expect(CacheUtils.isValidCacheKey('')).toBe(false)
      expect(CacheUtils.isValidCacheKey('a'.repeat(300))).toBe(false) // Too long
    })

    it('should serialize parameters consistently', () => {
      const params1 = { b: 2, a: 1, c: 3 }
      const params2 = { a: 1, b: 2, c: 3 }

      const serialized1 = CacheUtils.serializeParams(params1)
      const serialized2 = CacheUtils.serializeParams(params2)

      expect(serialized1).toBe(serialized2) // Should be same despite different order
    })
  })
})
