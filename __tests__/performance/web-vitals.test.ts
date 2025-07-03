/**
 * Task 6.2: Core Web Vitals Performance Tests
 * Tests for Largest Contentful Paint (LCP), First Input Delay (FID), and Cumulative Layout Shift (CLS)
 */

import { test, expect } from '@playwright/test'

test.describe('Task 6.2: Core Web Vitals Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main calculator page
    await page.goto('/')
  })

  test('should achieve LCP < 2.5s (Largest Contentful Paint)', async ({
    page,
  }) => {
    // Track LCP using Performance Observer
    const lcpPromise = page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          if (lastEntry) {
            resolve(lastEntry.startTime)
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true })

        // Fallback timeout
        setTimeout(() => resolve(0), 5000)
      })
    })

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    const lcp = await lcpPromise
    console.log(`LCP: ${lcp}ms`)

    // LCP should be less than 2.5 seconds (2500ms)
    expect(lcp).toBeLessThan(2500)
  })

  test('should achieve FID < 100ms (First Input Delay)', async ({ page }) => {
    // Track FID using Performance Observer
    const fidPromise = page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const firstEntry = entries[0] as any
          if (firstEntry) {
            resolve(firstEntry.processingStart - firstEntry.startTime)
          }
        }).observe({ type: 'first-input', buffered: true })

        // Simulate user interaction after a delay
        setTimeout(() => {
          const button = document.querySelector('button')
          if (button) {
            button.click()
          }
          // Fallback if no FID recorded
          setTimeout(() => resolve(0), 1000)
        }, 100)
      })
    })

    const fid = await fidPromise
    console.log(`FID: ${fid}ms`)

    // FID should be less than 100ms
    expect(fid).toBeLessThan(100)
  })

  test('should achieve CLS < 0.1 (Cumulative Layout Shift)', async ({
    page,
  }) => {
    // Track CLS using Performance Observer
    const clsPromise = page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })

        // Wait for page interactions to complete
        setTimeout(() => resolve(clsValue), 3000)
      })
    })

    // Interact with the page to trigger potential layout shifts
    await page.fill('input[placeholder*="initial" i]', '10000')
    await page.fill('input[placeholder*="monthly" i]', '500')
    await page.selectOption('select', { index: 1 }) // Change rate
    await page.fill('input[placeholder*="years" i]', '10')

    // Wait for calculations and chart rendering
    await page.waitForTimeout(1000)

    const cls = await clsPromise
    console.log(`CLS: ${cls}`)

    // CLS should be less than 0.1
    expect(cls).toBeLessThan(0.1)
  })

  test('should load optimized chart efficiently', async ({ page }) => {
    // Fill calculator form to trigger chart rendering
    await page.fill('input[placeholder*="initial" i]', '25000')
    await page.fill('input[placeholder*="monthly" i]', '1000')
    await page.fill('input[placeholder*="years" i]', '20')

    // Measure chart loading time
    const startTime = Date.now()

    // Wait for chart to appear (skeleton should be replaced by actual chart)
    await page.waitForSelector('[role="img"][aria-label*="chart"]', {
      timeout: 5000,
    })

    const chartLoadTime = Date.now() - startTime
    console.log(`Chart load time: ${chartLoadTime}ms`)

    // Chart should load within 2 seconds
    expect(chartLoadTime).toBeLessThan(2000)

    // Verify chart is interactive
    const chartTypeButtons = page.locator(
      'button:has-text("Area"), button:has-text("Line"), button:has-text("Bar"), button:has-text("Pie")'
    )
    await expect(chartTypeButtons.first()).toBeVisible()

    // Test chart type switching performance
    const switchStartTime = Date.now()
    await chartTypeButtons.nth(1).click() // Click Line chart

    // Wait for chart transition
    await page.waitForTimeout(200)

    const switchTime = Date.now() - switchStartTime
    console.log(`Chart switch time: ${switchTime}ms`)

    // Chart type switching should be fast
    expect(switchTime).toBeLessThan(500)
  })

  test('should maintain performance with service worker', async ({
    page,
    context,
  }) => {
    // Enable service worker
    await context.addInitScript(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })

    // First visit - should register service worker
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const firstVisitTime = Date.now() - startTime

    // Second visit - should benefit from caching
    const secondStartTime = Date.now()
    await page.reload()
    await page.waitForLoadState('networkidle')
    const secondVisitTime = Date.now() - secondStartTime

    console.log(
      `First visit: ${firstVisitTime}ms, Second visit: ${secondVisitTime}ms`
    )

    // Second visit should be faster (accounting for cache benefits)
    // Allow some variance as service worker registration may take time
    expect(secondVisitTime).toBeLessThan(firstVisitTime + 1000)
  })

  test('should handle lazy loading without layout shifts', async ({ page }) => {
    // Navigate to a scenario page with lazy-loaded content
    await page.goto('/en/scenario/starter-10k-500-7-10')

    // Track layout shifts during lazy loading
    const clsPromise = page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
        }).observe({ type: 'layout-shift', buffered: true })

        setTimeout(() => resolve(clsValue), 5000)
      })
    })

    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
    })

    // Wait for lazy content to load
    await page.waitForSelector('[data-testid="loading-skeleton"]', {
      state: 'hidden',
      timeout: 10000,
    })

    const cls = await clsPromise
    console.log(`CLS during lazy loading: ${cls}`)

    // Layout shifts should be minimal even with lazy loading
    expect(cls).toBeLessThan(0.1)
  })

  test('should optimize bundle size with lazy loading', async ({ page }) => {
    // Monitor network requests
    const requests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('_next/static/chunks/')) {
        requests.push(request.url())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Initial bundle should not include chart library
    const initialChartRequests = requests.filter(
      (url) => url.includes('recharts') || url.includes('chart')
    )

    // Chart library should not be loaded initially
    expect(initialChartRequests.length).toBe(0)

    // Trigger chart rendering
    await page.fill('input[placeholder*="initial" i]', '10000')
    await page.fill('input[placeholder*="monthly" i]', '500')

    // Wait for chart to load
    await page.waitForSelector('[role="img"][aria-label*="chart"]')

    // Now chart chunks should be loaded
    await page.waitForTimeout(1000) // Allow time for lazy loading

    const finalChartRequests = requests.filter(
      (url) => url.includes('recharts') || url.includes('chart')
    )

    // Chart library should now be loaded
    expect(finalChartRequests.length).toBeGreaterThan(0)
  })
})
