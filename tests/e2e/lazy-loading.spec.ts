import { test, expect } from '@playwright/test'

test.describe('Lazy Loading E2E Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main calculator page that should have lazy-loaded content
    await page.goto('/en')
  })

  test('should load page with lazy loading performance', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Measure page load performance
    const performanceEntries = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint:
          performance.getEntriesByName('first-contentful-paint')[0]
            ?.startTime || 0,
        totalPageLoad: navigation.loadEventEnd - navigation.navigationStart,
      }
    })

    // Assertions for performance benchmarks
    expect(performanceEntries.totalPageLoad).toBeLessThan(3000) // < 3 seconds
    expect(performanceEntries.domContentLoaded).toBeLessThan(1000) // < 1 second
    expect(performanceEntries.firstContentfulPaint).toBeLessThan(2000) // < 2 seconds

    console.log('Performance metrics:', performanceEntries)
  })

  test('should test Core Web Vitals metrics', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Measure Core Web Vitals
    const coreWebVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          lcp: 0,
          fid: 0,
          cls: 0,
        }

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            vitals.lcp = entries[entries.length - 1].startTime
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            vitals.fid =
              (entries[0] as any).processingStart - entries[0].startTime
          }
        }).observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (!(entry as any).hadRecentInput) {
              vitals.cls += (entry as any).value
            }
          })
        }).observe({ entryTypes: ['layout-shift'] })

        // Resolve after a short delay to collect metrics
        setTimeout(() => resolve(vitals), 2000)
      })
    })

    const vitals = coreWebVitals as { lcp: number; fid: number; cls: number }

    // Core Web Vitals thresholds
    expect(vitals.lcp).toBeLessThan(2500) // LCP < 2.5s
    expect(vitals.fid).toBeLessThan(100) // FID < 100ms
    expect(vitals.cls).toBeLessThan(0.1) // CLS < 0.1

    console.log('Core Web Vitals:', vitals)
  })

  test('should test network request optimization with lazy loading', async ({
    page,
  }) => {
    // Track network requests
    const requests: string[] = []

    page.on('request', (request) => {
      requests.push(request.url())
    })

    // Load page and wait for initial content
    await page.goto('/en/scenario/conservative-retirement-plan')
    await page.waitForSelector('[data-testid="loading-skeleton"]', {
      timeout: 5000,
    })

    const initialRequestCount = requests.length

    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })

    // Wait for lazy content to load
    await page.waitForSelector('[data-testid="loading-skeleton"]', {
      state: 'detached',
      timeout: 10000,
    })

    // Check that additional requests were made (lazy loading)
    await page.waitForTimeout(1000) // Allow time for any additional requests

    const finalRequestCount = requests.length

    // Should have reasonable number of requests (not too many, not too few)
    expect(initialRequestCount).toBeGreaterThan(0)
    expect(finalRequestCount).toBeGreaterThanOrEqual(initialRequestCount)
    expect(finalRequestCount).toBeLessThan(50) // Reasonable upper limit

    console.log(
      `Initial requests: ${initialRequestCount}, Final requests: ${finalRequestCount}`
    )
  })

  test('should test lazy loading intersection behavior', async ({ page }) => {
    await page.goto('/en/scenario/conservative-retirement-plan')

    // Check that loading skeletons are present initially
    const skeletons = await page
      .locator('[data-testid="loading-skeleton"]')
      .count()
    expect(skeletons).toBeGreaterThan(0)

    // Scroll down to trigger lazy loading
    await page.evaluate(() => {
      const element = document.querySelector('[data-testid="loading-skeleton"]')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    })

    // Wait for content to load and skeletons to disappear
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid="loading-skeleton"]'
        )
        return skeletons.length === 0
      },
      { timeout: 10000 }
    )

    // Verify actual content is now present
    const content = await page.locator('section').count()
    expect(content).toBeGreaterThan(3) // Should have multiple content sections
  })

  test('should test loading skeleton transitions', async ({ page }) => {
    await page.goto('/en/scenario/conservative-retirement-plan')

    // Check that skeletons have proper animation
    const skeleton = page.locator('[data-testid="loading-skeleton"]').first()
    await expect(skeleton).toHaveClass(/animate-pulse/)

    // Measure transition timing
    const transitionStart = Date.now()

    // Trigger lazy loading by scrolling
    await skeleton.scrollIntoViewIfNeeded()

    // Wait for skeleton to disappear
    await skeleton.waitFor({ state: 'detached', timeout: 10000 })

    const transitionTime = Date.now() - transitionStart

    // Transition should be reasonably fast
    expect(transitionTime).toBeLessThan(5000) // < 5 seconds

    console.log(`Skeleton transition time: ${transitionTime}ms`)
  })

  test('should test multiple lazy sections loading order', async ({ page }) => {
    await page.goto('/en/scenario/conservative-retirement-plan')

    // Get all lazy sections
    const sections = await page.locator('section').count()
    expect(sections).toBeGreaterThan(2)

    // Scroll through the page to trigger all lazy loading
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let currentScroll = 0
        const maxScroll = document.body.scrollHeight
        const scrollStep = 500

        const scrollInterval = setInterval(() => {
          currentScroll += scrollStep
          window.scrollTo(0, currentScroll)

          if (currentScroll >= maxScroll) {
            clearInterval(scrollInterval)
            resolve(undefined)
          }
        }, 100)
      })
    })

    // Wait for all lazy content to load
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid="loading-skeleton"]'
        )
        return skeletons.length === 0
      },
      { timeout: 15000 }
    )

    // Verify all sections are now loaded
    const loadedSections = await page.locator('section').count()
    expect(loadedSections).toBeGreaterThanOrEqual(sections)
  })

  test('should test viewport-based loading thresholds', async ({ page }) => {
    await page.goto('/en/scenario/conservative-retirement-plan')

    // Set viewport to specific size for consistent testing
    await page.setViewportSize({ width: 1200, height: 800 })

    // Check initial state - some content should be loading
    const initialSkeletons = await page
      .locator('[data-testid="loading-skeleton"]')
      .count()
    expect(initialSkeletons).toBeGreaterThan(0)

    // Scroll to 50% of page height (should trigger some lazy loading)
    await page.evaluate(() => {
      const scrollPosition = document.body.scrollHeight * 0.5
      window.scrollTo(0, scrollPosition)
    })

    // Wait a bit for intersection observer to trigger
    await page.waitForTimeout(500)

    // Check that some content has started loading
    const midScrollSkeletons = await page
      .locator('[data-testid="loading-skeleton"]')
      .count()
    expect(midScrollSkeletons).toBeLessThanOrEqual(initialSkeletons)

    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // Wait for all content to load
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid="loading-skeleton"]'
        )
        return skeletons.length === 0
      },
      { timeout: 10000 }
    )

    // All skeletons should be gone
    const finalSkeletons = await page
      .locator('[data-testid="loading-skeleton"]')
      .count()
    expect(finalSkeletons).toBe(0)
  })

  test('should test mobile performance with lazy loading', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/en/scenario/conservative-retirement-plan')

    // Measure mobile-specific performance
    const mobilePerformance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd -
          navigation.domContentLoadedEventStart,
        totalLoad: navigation.loadEventEnd - navigation.navigationStart,
      }
    })

    // Mobile performance should still be reasonable
    expect(mobilePerformance.totalLoad).toBeLessThan(4000) // < 4 seconds on mobile
    expect(mobilePerformance.domContentLoaded).toBeLessThan(1500) // < 1.5 seconds

    // Test mobile scrolling behavior
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let scrollPosition = 0
        const scrollInterval = setInterval(() => {
          scrollPosition += 200
          window.scrollTo(0, scrollPosition)

          if (scrollPosition >= document.body.scrollHeight) {
            clearInterval(scrollInterval)
            resolve(undefined)
          }
        }, 200)
      })
    })

    // Verify content loads properly on mobile
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '[data-testid="loading-skeleton"]'
        )
        return skeletons.length === 0
      },
      { timeout: 10000 }
    )

    const contentSections = await page.locator('section').count()
    expect(contentSections).toBeGreaterThan(3)
  })
})
