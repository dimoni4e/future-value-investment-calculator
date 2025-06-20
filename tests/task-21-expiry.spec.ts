import { test, expect } from '@playwright/test'

test.describe('Task #21: Cache Expiry Test', () => {
  test('cache expiry after 1 hour simulation', async ({ page }) => {
    // Clear localStorage
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())

    // First load - create cache
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(3000)

    // Verify cache was created
    const originalCache = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached) : null
    })

    expect(originalCache).toBeTruthy()
    console.log(
      '✅ Original cache created at:',
      new Date(originalCache.timestamp)
    )

    // Simulate cache expiry by manually setting timestamp to 2 hours ago
    const expiredTime = Date.now() - 2 * 60 * 60 * 1000 // 2 hours ago
    await page.evaluate((timestamp) => {
      const cached = localStorage.getItem('fx_rates_cache')
      if (cached) {
        const data = JSON.parse(cached)
        data.timestamp = timestamp
        localStorage.setItem('fx_rates_cache', JSON.stringify(data))
      }
    }, expiredTime)

    console.log('⏰ Cache timestamp set to 2 hours ago')

    // Reload page - should fetch fresh data and update cache
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(3000)

    // Check that cache was updated with new timestamp
    const newCache = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached) : null
    })

    expect(newCache).toBeTruthy()
    expect(newCache.timestamp).toBeGreaterThan(expiredTime)

    const timeDiff = newCache.timestamp - originalCache.timestamp
    console.log('✅ New cache created at:', new Date(newCache.timestamp))
    console.log(
      '⏰ Time difference from original:',
      Math.round(timeDiff / 1000),
      'seconds'
    )

    // Verify that new timestamp is very recent (within last 10 seconds)
    const ageInSeconds = (Date.now() - newCache.timestamp) / 1000
    expect(ageInSeconds).toBeLessThan(10)
    console.log('✅ Fresh cache is', Math.round(ageInSeconds), 'seconds old')
  })

  test('valid cache within 1 hour is used', async ({ page }) => {
    // Clear localStorage and load page
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Get the cache timestamp
    const firstTimestamp = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached).timestamp : null
    })

    expect(firstTimestamp).toBeTruthy()
    console.log('✅ First cache timestamp:', new Date(firstTimestamp))

    // Simulate cache that's 30 minutes old (still valid)
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
    await page.evaluate((timestamp) => {
      const cached = localStorage.getItem('fx_rates_cache')
      if (cached) {
        const data = JSON.parse(cached)
        data.timestamp = timestamp
        localStorage.setItem('fx_rates_cache', JSON.stringify(data))
      }
    }, thirtyMinutesAgo)

    console.log('⏰ Cache timestamp set to 30 minutes ago (still valid)')

    // Reload - should use cached data
    await page.reload()
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    await page.waitForTimeout(2000)

    // Verify timestamp didn't change (cache was used)
    const secondTimestamp = await page.evaluate(() => {
      const cached = localStorage.getItem('fx_rates_cache')
      return cached ? JSON.parse(cached).timestamp : null
    })

    expect(secondTimestamp).toBe(thirtyMinutesAgo)
    console.log('✅ Cache timestamp unchanged - cached data was used')
    console.log(
      '⏰ Cache age:',
      Math.round((Date.now() - secondTimestamp) / 1000 / 60),
      'minutes'
    )
  })
})
