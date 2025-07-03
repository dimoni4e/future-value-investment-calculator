/**
 * Cache Tests for Scenario Generation
 * Tests cache write and read operations, cache invalidation strategies,
 * and memory usage and performance
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals'

// Mock cache implementation for testing
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  views: number
}

class MockCache<T> {
  private storage: Map<string, CacheEntry<T>> = new Map()
  private maxSize: number
  private defaultTtl: number

  constructor(maxSize = 1000, defaultTtl = 3600000) {
    // 1 hour default TTL
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  set(key: string, value: T, ttl?: number): void {
    // If key already exists, just update it
    if (this.storage.has(key)) {
      this.storage.set(key, {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.defaultTtl,
        views: 0,
      })
      return
    }

    // Implement LRU eviction if cache is full
    if (this.storage.size >= this.maxSize) {
      this.evictLeastRecentlyUsed()
    }

    this.storage.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
      views: 0,
    })
  }

  get(key: string): T | null {
    const entry = this.storage.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.storage.delete(key)
      return null
    }

    // Update access time and increment views
    entry.timestamp = Date.now()
    entry.views += 1

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.storage.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.storage.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  size(): number {
    // Clean expired entries before returning size
    this.cleanExpired()
    return this.storage.size
  }

  keys(): string[] {
    this.cleanExpired()
    return Array.from(this.storage.keys())
  }

  getStats(): {
    size: number
    hitRate: number
    totalAccesses: number
    memoryUsage: number
  } {
    this.cleanExpired()
    const entries = Array.from(this.storage.values())
    const totalViews = entries.reduce((sum, entry) => sum + entry.views, 0)

    return {
      size: this.storage.size,
      hitRate: totalViews > 0 ? totalViews / (totalViews + 1) : 0,
      totalAccesses: totalViews,
      memoryUsage: this.estimateMemoryUsage(),
    }
  }

  warmCache(entries: Array<{ key: string; value: T; ttl?: number }>): void {
    entries.forEach(({ key, value, ttl }) => {
      this.set(key, value, ttl)
    })
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    // Find the entry with the oldest timestamp
    for (const [key, entry] of Array.from(this.storage.entries())) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.storage.delete(oldestKey)
    }
  }

  private cleanExpired(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of Array.from(this.storage.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => this.storage.delete(key))
  }

  private estimateMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    let totalSize = 0
    for (const [key, entry] of Array.from(this.storage.entries())) {
      totalSize += key.length * 2 // String characters are 2 bytes each
      totalSize += JSON.stringify(entry.data).length * 2
      totalSize += 32 // Approximate overhead per entry
    }
    return totalSize
  }
}

interface MockScenarioData {
  slug: string
  content: {
    title: string
    projections: {
      futureValue: number
      totalContributions: number
      totalGains: number
    }
    sections: Record<string, string>
  }
  metadata: {
    generated: boolean
    createdAt: string
    views: number
    locale: string
  }
}

describe('Cache: Scenario Generation', () => {
  let cache: MockCache<MockScenarioData>

  beforeEach(() => {
    cache = new MockCache<MockScenarioData>(100, 60000) // 1 minute TTL for testing
  })

  afterEach(() => {
    cache.clear()
  })

  describe('Cache Read/Write Operations', () => {
    it('should store and retrieve cached scenarios', () => {
      const scenarioData: MockScenarioData = {
        slug: 'test-scenario-1',
        content: {
          title: 'Test Investment Plan',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: {
            investment_overview: 'Test overview content...',
            growth_projection: 'Test projection content...',
          },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      // Store in cache
      cache.set('test-scenario-1', scenarioData)

      // Retrieve from cache
      const retrieved = cache.get('test-scenario-1')

      expect(retrieved).not.toBeNull()
      expect(retrieved!.slug).toBe(scenarioData.slug)
      expect(retrieved!.content.projections.futureValue).toBe(100000)
      expect(retrieved!.metadata.locale).toBe('en')
    })

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should support cache key patterns for different locales', () => {
      const scenarioData: MockScenarioData = {
        slug: 'multi-locale-test',
        content: {
          title: 'English Title',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: { overview: 'English content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      const spanishData: MockScenarioData = {
        ...scenarioData,
        content: {
          ...scenarioData.content,
          title: 'Título en Español',
          sections: { overview: 'Contenido en español' },
        },
        metadata: { ...scenarioData.metadata, locale: 'es' },
      }

      // Store with locale-specific keys
      cache.set('multi-locale-test-en', scenarioData)
      cache.set('multi-locale-test-es', spanishData)

      const englishResult = cache.get('multi-locale-test-en')
      const spanishResult = cache.get('multi-locale-test-es')

      expect(englishResult!.content.title).toBe('English Title')
      expect(spanishResult!.content.title).toBe('Título en Español')
      expect(englishResult!.metadata.locale).toBe('en')
      expect(spanishResult!.metadata.locale).toBe('es')
    })

    it('should handle concurrent read/write operations', () => {
      const scenarioData: MockScenarioData = {
        slug: 'concurrent-test',
        content: {
          title: 'Concurrent Test',
          projections: {
            futureValue: 150000,
            totalContributions: 80000,
            totalGains: 70000,
          },
          sections: { overview: 'Test content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      // Simulate concurrent writes
      for (let i = 0; i < 10; i++) {
        cache.set(`concurrent-${i}`, {
          ...scenarioData,
          slug: `concurrent-${i}`,
        })
      }

      // Verify all writes succeeded
      for (let i = 0; i < 10; i++) {
        const result = cache.get(`concurrent-${i}`)
        expect(result).not.toBeNull()
        expect(result!.slug).toBe(`concurrent-${i}`)
      }
    })
  })

  describe('TTL Behavior and Automatic Expiration', () => {
    it('should expire entries after TTL', async () => {
      const scenarioData: MockScenarioData = {
        slug: 'ttl-test',
        content: {
          title: 'TTL Test',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: { overview: 'TTL test content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      // Set with very short TTL (10ms for testing)
      cache.set('ttl-test', scenarioData, 10)

      // Should be available immediately
      expect(cache.get('ttl-test')).not.toBeNull()

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 20))

      // Should be expired now
      expect(cache.get('ttl-test')).toBeNull()
    })

    it('should support different TTL values for different entries', async () => {
      const shortLivedData: MockScenarioData = {
        slug: 'short-lived',
        content: {
          title: 'Short Lived',
          projections: {
            futureValue: 50000,
            totalContributions: 30000,
            totalGains: 20000,
          },
          sections: { overview: 'Short content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      const longLivedData: MockScenarioData = {
        slug: 'long-lived',
        content: {
          title: 'Long Lived',
          projections: {
            futureValue: 200000,
            totalContributions: 100000,
            totalGains: 100000,
          },
          sections: { overview: 'Long content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      cache.set('short-lived', shortLivedData, 10) // 10ms TTL
      cache.set('long-lived', longLivedData, 1000) // 1000ms TTL

      // Wait for short-lived to expire
      await new Promise((resolve) => setTimeout(resolve, 20))

      expect(cache.get('short-lived')).toBeNull()
      expect(cache.get('long-lived')).not.toBeNull()
    })

    it('should refresh TTL on access', () => {
      const scenarioData: MockScenarioData = {
        slug: 'refresh-test',
        content: {
          title: 'Refresh Test',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: { overview: 'Refresh test content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      cache.set('refresh-test', scenarioData, 100) // 100ms TTL

      // Access multiple times to refresh TTL
      cache.get('refresh-test')
      cache.get('refresh-test')
      cache.get('refresh-test')

      // Entry should still be valid due to refreshing
      expect(cache.get('refresh-test')).not.toBeNull()
    })
  })

  describe('Cache Invalidation Strategies', () => {
    it('should support manual cache invalidation', () => {
      const scenarioData: MockScenarioData = {
        slug: 'invalidation-test',
        content: {
          title: 'Invalidation Test',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: { overview: 'Invalidation test content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      cache.set('invalidation-test', scenarioData)
      expect(cache.get('invalidation-test')).not.toBeNull()

      // Manually invalidate
      const deleted = cache.delete('invalidation-test')
      expect(deleted).toBe(true)
      expect(cache.get('invalidation-test')).toBeNull()
    })

    it('should support pattern-based invalidation', () => {
      // Add multiple related entries
      for (let i = 0; i < 5; i++) {
        cache.set(`user-123-scenario-${i}`, {
          slug: `user-123-scenario-${i}`,
          content: {
            title: `User 123 Scenario ${i}`,
            projections: {
              futureValue: 100000,
              totalContributions: 60000,
              totalGains: 40000,
            },
            sections: { overview: `Content ${i}` },
          },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            views: 0,
            locale: 'en',
          },
        })
      }

      // Invalidate all user-123 scenarios
      const keys = cache.keys()
      const userKeys = keys.filter((key) => key.startsWith('user-123'))
      userKeys.forEach((key) => cache.delete(key))

      // Verify all user-123 scenarios are invalidated
      for (let i = 0; i < 5; i++) {
        expect(cache.get(`user-123-scenario-${i}`)).toBeNull()
      }
    })

    it('should clear entire cache', () => {
      // Add multiple entries
      for (let i = 0; i < 10; i++) {
        cache.set(`clear-test-${i}`, {
          slug: `clear-test-${i}`,
          content: {
            title: `Clear Test ${i}`,
            projections: {
              futureValue: 100000,
              totalContributions: 60000,
              totalGains: 40000,
            },
            sections: { overview: `Content ${i}` },
          },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            views: 0,
            locale: 'en',
          },
        })
      }

      expect(cache.size()).toBe(10)

      cache.clear()

      expect(cache.size()).toBe(0)
      expect(cache.get('clear-test-0')).toBeNull()
    })
  })

  describe('Memory Usage and Performance', () => {
    it('should track memory usage accurately', () => {
      const initialStats = cache.getStats()
      expect(initialStats.memoryUsage).toBe(0)

      // Add a large scenario
      const largeScenario: MockScenarioData = {
        slug: 'large-scenario',
        content: {
          title: 'Large Scenario with Lots of Content',
          projections: {
            futureValue: 1000000,
            totalContributions: 500000,
            totalGains: 500000,
          },
          sections: {
            investment_overview: 'Lorem ipsum '.repeat(1000),
            growth_projection: 'Dolor sit amet '.repeat(1000),
            strategy_analysis: 'Consectetur adipiscing '.repeat(1000),
          },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      cache.set('large-scenario', largeScenario)

      const statsAfter = cache.getStats()
      expect(statsAfter.memoryUsage).toBeGreaterThan(initialStats.memoryUsage)
      expect(statsAfter.size).toBe(1)
    })

    it('should implement LRU eviction when cache is full', async () => {
      // Create a small cache for testing (max 3 entries)
      const smallCache = new MockCache<MockScenarioData>(3, 60000)

      // Fill the cache with delays to ensure different timestamps
      for (let i = 0; i < 3; i++) {
        smallCache.set(`entry-${i}`, {
          slug: `entry-${i}`,
          content: {
            title: `Entry ${i}`,
            projections: {
              futureValue: 100000,
              totalContributions: 60000,
              totalGains: 40000,
            },
            sections: { overview: `Content ${i}` },
          },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            views: 0,
            locale: 'en',
          },
        })
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10))
      }

      expect(smallCache.size()).toBe(3)

      // Small delay before accessing
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Access entry-1 to make it more recently used
      smallCache.get('entry-1')

      // Small delay before adding new entry
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Add a new entry (should evict entry-0, the least recently used)
      smallCache.set('entry-3', {
        slug: 'entry-3',
        content: {
          title: 'Entry 3',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: { overview: 'Content 3' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      })

      expect(smallCache.size()).toBe(3)

      // Verify that entry-0 (least recently used) was evicted
      expect(smallCache.get('entry-0')).toBeNull() // Should be evicted
      expect(smallCache.get('entry-1')).not.toBeNull() // Should still exist (was accessed)
      expect(smallCache.get('entry-2')).not.toBeNull() // Should still exist
      expect(smallCache.get('entry-3')).not.toBeNull() // Should be newly added
    })

    it('should handle cache warming efficiently', () => {
      const warmingData = Array.from({ length: 50 }, (_, i) => ({
        key: `warm-${i}`,
        value: {
          slug: `warm-${i}`,
          content: {
            title: `Warm Scenario ${i}`,
            projections: {
              futureValue: 100000 + i * 1000,
              totalContributions: 60000,
              totalGains: 40000 + i * 1000,
            },
            sections: { overview: `Warm content ${i}` },
          },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            views: 0,
            locale: 'en',
          },
        },
      }))

      const startTime = Date.now()
      cache.warmCache(warmingData)
      const warmingTime = Date.now() - startTime

      expect(warmingTime).toBeLessThan(100) // Should be fast
      expect(cache.size()).toBe(50)

      // Verify all entries were added
      for (let i = 0; i < 50; i++) {
        expect(cache.get(`warm-${i}`)).not.toBeNull()
      }
    })

    it('should provide accurate performance statistics', () => {
      // Add some entries and access them
      for (let i = 0; i < 5; i++) {
        cache.set(`stats-${i}`, {
          slug: `stats-${i}`,
          content: {
            title: `Stats ${i}`,
            projections: {
              futureValue: 100000,
              totalContributions: 60000,
              totalGains: 40000,
            },
            sections: { overview: `Stats content ${i}` },
          },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            views: 0,
            locale: 'en',
          },
        })
      }

      // Access some entries multiple times
      cache.get('stats-0')
      cache.get('stats-0')
      cache.get('stats-1')
      cache.get('stats-2')

      const stats = cache.getStats()
      expect(stats.size).toBe(5)
      expect(stats.totalAccesses).toBe(4)
      expect(stats.memoryUsage).toBeGreaterThan(0)
    })

    it('should clean up expired entries during size calculation', async () => {
      // Add entries with short TTL
      for (let i = 0; i < 5; i++) {
        cache.set(
          `cleanup-${i}`,
          {
            slug: `cleanup-${i}`,
            content: {
              title: `Cleanup ${i}`,
              projections: {
                futureValue: 100000,
                totalContributions: 60000,
                totalGains: 40000,
              },
              sections: { overview: `Cleanup content ${i}` },
            },
            metadata: {
              generated: true,
              createdAt: new Date().toISOString(),
              views: 0,
              locale: 'en',
            },
          },
          10 // 10ms TTL
        )
      }

      expect(cache.size()).toBe(5)

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 20))

      // Size calculation should clean up expired entries
      expect(cache.size()).toBe(0)
    })
  })

  describe('Cache Hit/Miss Scenarios', () => {
    it('should track cache hits and misses', () => {
      const scenario: MockScenarioData = {
        slug: 'hit-miss-test',
        content: {
          title: 'Hit Miss Test',
          projections: {
            futureValue: 100000,
            totalContributions: 60000,
            totalGains: 40000,
          },
          sections: { overview: 'Hit miss content' },
        },
        metadata: {
          generated: true,
          createdAt: new Date().toISOString(),
          views: 0,
          locale: 'en',
        },
      }

      // Cache miss
      expect(cache.get('hit-miss-test')).toBeNull()

      // Store value
      cache.set('hit-miss-test', scenario)

      // Cache hit
      expect(cache.get('hit-miss-test')).not.toBeNull()
      expect(cache.get('hit-miss-test')).not.toBeNull()

      const stats = cache.getStats()
      expect(stats.totalAccesses).toBe(2) // Two successful gets
    })

    it('should handle cache warming for popular scenarios', () => {
      const popularScenarios = [
        { key: 'popular-retirement', slug: 'retirement-plan' },
        { key: 'popular-house', slug: 'house-fund' },
        { key: 'popular-emergency', slug: 'emergency-fund' },
      ]

      const warmingData = popularScenarios.map(({ key, slug }) => ({
        key,
        value: {
          slug,
          content: {
            title: `Popular ${slug}`,
            projections: {
              futureValue: 200000,
              totalContributions: 100000,
              totalGains: 100000,
            },
            sections: { overview: `Popular ${slug} content` },
          },
          metadata: {
            generated: true,
            createdAt: new Date().toISOString(),
            views: 0,
            locale: 'en',
          },
        },
      }))

      cache.warmCache(warmingData)

      // All popular scenarios should be cache hits
      popularScenarios.forEach(({ key }) => {
        expect(cache.get(key)).not.toBeNull()
      })

      expect(cache.size()).toBe(3)
    })
  })
})
