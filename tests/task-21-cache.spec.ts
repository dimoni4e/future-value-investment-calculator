import { test, expect } from '@playwright/test'

test.describe('Task #21: Cache FX rates in localStorage', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('fresh load fetches from API and caches in localStorage', async ({
    page,
  }) => {
    // Monitor network requests
    const apiRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('exchangerate-api.com')) {
        apiRequests.push(request.url())
      }
    })

    // Start with console monitoring for cache logs
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      if (msg.text().includes('exchange rate')) {
        consoleMessages.push(msg.text())
      }
    })

    // Load the page
    await page.goto('/')
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Wait for exchange rates to load
    await page.waitForTimeout(3000)

    // Verify API was called
    expect(apiRequests.length).toBeGreaterThan(0)

    // Check that data was cached in localStorage
    const cachedData = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached) : null
    })

    expect(cachedData).toBeTruthy()
    expect(cachedData.rates).toBeTruthy()
    expect(cachedData.timestamp).toBeTruthy()
    expect(typeof cachedData.timestamp).toBe('number')

    // Verify cache timestamp is recent (within last 10 seconds)
    const now = Date.now()
    expect(now - cachedData.timestamp).toBeLessThan(10000)

    // Verify rates contain expected currencies
    expect(cachedData.rates.USD).toBe(1)
    expect(cachedData.rates.EUR).toBeTruthy()
    expect(cachedData.rates.GBP).toBeTruthy()
  })

  test('reload within 1 hour uses cached data and skips API', async ({
    page,
  }) => {
    // First, populate the cache
    await page.goto('/')
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Verify cache exists
    const cachedData = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached) : null
    })
    expect(cachedData).toBeTruthy()

    // Now reload and monitor for API calls
    const apiRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('exchangerate-api.com')) {
        apiRequests.push(request.url())
      }
    })

    // Monitor console for cache usage messages
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      if (
        msg.text().includes('cached exchange rates') ||
        msg.text().includes('fresh exchange rates')
      ) {
        consoleMessages.push(msg.text())
      }
    })

    // Reload the page
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Verify NO API calls were made (cache was used)
    expect(apiRequests.length).toBe(0)

    // Check console logs show cache usage
    const cacheUsageLog = consoleMessages.find((msg) =>
      msg.includes('Using cached exchange rates')
    )
    expect(cacheUsageLog).toBeTruthy()
  })

  test('expired cache (simulated) triggers fresh API call', async ({
    page,
  }) => {
    // First, load the page to populate cache
    await page.goto('/')
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Manually expire the cache by setting an old timestamp
    await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      if (cached) {
        const data = JSON.parse(cached)
        // Set timestamp to 2 hours ago (expired)
        data.timestamp = Date.now() - 2 * 60 * 60 * 1000
        localStorage.setItem('fx_rates_cache', JSON.stringify(data))
      }
    })

    // Monitor API requests
    const apiRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('exchangerate-api.com')) {
        apiRequests.push(request.url())
      }
    })

    // Monitor console for cache expiry messages
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      if (
        msg.text().includes('cache expired') ||
        msg.text().includes('fresh exchange rates')
      ) {
        consoleMessages.push(msg.text())
      }
    })

    // Reload the page
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(3000)

    // Verify API was called due to expired cache
    expect(apiRequests.length).toBeGreaterThan(0)

    // Check console logs show cache expiry
    const expiredLog = consoleMessages.find((msg) =>
      msg.includes('cache expired')
    )
    expect(expiredLog).toBeTruthy()

    // Verify new cache was created with fresh timestamp
    const newCachedData = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached) : null
    })

    expect(newCachedData).toBeTruthy()
    const now = Date.now()
    expect(now - newCachedData.timestamp).toBeLessThan(10000) // Recent timestamp
  })

  test('corrupted cache is handled gracefully', async ({ page }) => {
    // Start with corrupted cache data
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('fx_rates_cache', 'invalid json data')
    })

    // Monitor API requests (should be made due to corrupted cache)
    const apiRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('exchangerate-api.com')) {
        apiRequests.push(request.url())
      }
    })

    // Monitor console for error handling
    const consoleMessages: string[] = []
    page.on('console', (msg) => {
      if (msg.text().includes('Error reading cached')) {
        consoleMessages.push(msg.text())
      }
    })

    // Reload the page
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(3000)

    // Verify API was called (fallback due to corrupted cache)
    expect(apiRequests.length).toBeGreaterThan(0)

    // Verify corrupted cache was removed and new valid cache created
    const newCachedData = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached) : null
    })

    expect(newCachedData).toBeTruthy()
    expect(newCachedData.rates).toBeTruthy()
    expect(typeof newCachedData.timestamp).toBe('number')
  })

  test('cache works with currency conversion', async ({ page }) => {
    // Load page and let cache populate
    await page.goto('/')
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Enter some values
    await page.fill('#initialAmount', '1000')
    await page.fill('#monthlyContribution', '100')

    // Change currency to EUR (should use cached rates)
    await page.click('button:has-text("USD")')
    await page.click('text=Euro')
    await page.waitForTimeout(1000)

    // Verify EUR symbol appears (conversion worked)
    const initialAmountField = page.locator('#initialAmount').first()
    const parentDiv = initialAmountField.locator('..')
    await expect(parentDiv.locator('span', { hasText: '€' })).toBeVisible()

    // Verify future value shows EUR format
    const futureValue = await page
      .locator('[data-testid="future-value"]')
      .textContent()
    expect(futureValue).toContain('€')
  })
})
