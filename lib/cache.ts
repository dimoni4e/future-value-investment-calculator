/**
 * Task 6.1: Caching Layer Implementation
 * Redis/memory cache for generated content with TTL-based invalidation
 */

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
}

export interface CacheConfig {
  defaultTTL: number // in milliseconds
  maxSize: number
  cleanupInterval: number
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry>()
  private config: CacheConfig
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 1000 * 60 * 60, // 1 hour
      maxSize: 1000,
      cleanupInterval: 1000 * 60 * 5, // 5 minutes
      ...config,
    }

    this.startCleanup()
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Enforce cache size limit before adding new entry
    while (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expired = 0
    let valid = 0

    const entries = Array.from(this.cache.values())
    for (const entry of entries) {
      if (this.isExpired(entry, now)) {
        expired++
      } else {
        valid++
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
    }
  }

  private isExpired(entry: CacheEntry, currentTime?: number): boolean {
    const now = currentTime || Date.now()
    return now - entry.timestamp > entry.ttl
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Date.now()

    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    const entries = Array.from(this.cache.entries())
    for (const [key, entry] of entries) {
      if (this.isExpired(entry, now)) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key))
  }

  private calculateHitRate(): number {
    // This would need hit/miss tracking in a real implementation
    // For now, return a placeholder
    return 0
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// Scenario-specific cache implementation
export interface ScenarioCache {
  content: string
  metadata: {
    slug: string
    params: any
    generatedAt: number
    locale: string
  }
}

export class ScenarioCacheManager {
  private cache: MemoryCache

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new MemoryCache({
      defaultTTL: 1000 * 60 * 60 * 24, // 24 hours for scenarios
      maxSize: 500,
      cleanupInterval: 1000 * 60 * 10, // 10 minutes
      ...config,
    })
  }

  cacheScenario(
    slug: string,
    content: string,
    params: any,
    locale: string
  ): void {
    const cacheData: ScenarioCache = {
      content,
      metadata: {
        slug,
        params,
        generatedAt: Date.now(),
        locale,
      },
    }

    this.cache.set(`scenario:${slug}:${locale}`, cacheData)
  }

  getScenario(slug: string, locale: string): ScenarioCache | null {
    return this.cache.get(`scenario:${slug}:${locale}`)
  }

  hasScenario(slug: string, locale: string): boolean {
    return this.cache.has(`scenario:${slug}:${locale}`)
  }

  invalidateScenario(slug: string, locale?: string): void {
    if (locale) {
      this.cache.delete(`scenario:${slug}:${locale}`)
    } else {
      // Invalidate all locales for this slug
      const keys = this.cache
        .keys()
        .filter((key) => key.startsWith(`scenario:${slug}:`))
      keys.forEach((key) => this.cache.delete(key))
    }
  }

  // Cache warming for popular scenarios
  warmCache(popularScenarios: Array<{ slug: string; locale: string }>): void {
    // This would be implemented to pre-populate cache with popular scenarios
    // For now, it's a placeholder that marks which scenarios should be warmed
    console.log(
      'Cache warming initiated for scenarios:',
      popularScenarios.length
    )
  }

  // Get trending scenarios based on cache access patterns
  getTrendingScenarios(limit: number = 10): string[] {
    // This would track access patterns in a real implementation
    // For now, return cache keys as placeholder
    return this.cache
      .keys()
      .filter((key) => key.startsWith('scenario:'))
      .slice(0, limit)
  }

  getStats() {
    return this.cache.getStats()
  }

  clear(): void {
    this.cache.clear()
  }

  destroy(): void {
    this.cache.destroy()
  }
}

// Global cache instance
export const scenarioCache = new ScenarioCacheManager()

// Cache utilities
export const CacheUtils = {
  generateCacheKey: (prefix: string, ...parts: string[]): string => {
    return `${prefix}:${parts.join(':')}`
  },

  isValidCacheKey: (key: string): boolean => {
    return typeof key === 'string' && key.length > 0 && key.length < 250
  },

  serializeParams: (params: Record<string, any>): string => {
    return JSON.stringify(params, Object.keys(params).sort())
  },
}
