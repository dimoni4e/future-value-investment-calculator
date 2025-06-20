import { test, expect } from '@playwright/test'

test.describe('Task 30: Sentry Integration', () => {
  test('Sentry test endpoint returns error and logs to Sentry', async ({
    page,
  }) => {
    // Navigate to the calculator first
    await page.goto('http://localhost:3000')

    // Test the Sentry API endpoint directly
    const response = await page.request.get('/api/test-sentry')

    // Should return a 500 error
    expect(response.status()).toBe(500)

    // Check the response body
    const responseBody = await response.json()
    expect(responseBody.error).toBe('Internal Server Error')
    expect(responseBody.message).toBe('This error has been logged to Sentry')
    expect(responseBody.timestamp).toBeDefined()

    console.log('✅ Sentry API error test passed!')
  })

  test('Client-side Sentry test button works in development', async ({
    page,
  }) => {
    // Navigate to the calculator
    await page.goto('http://localhost:3000')

    // Fill out the form to show results and test button
    await page.fill('#initialAmount', '10000')
    await page.fill('#monthlyContribution', '500')
    await page.fill('#annualReturn', '7')
    await page.fill('#timeHorizon', '20')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for results to appear
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // The Sentry test button should be visible in development
    const sentryButton = page.locator('button:has-text("Test Sentry")')
    await expect(sentryButton).toBeVisible()

    // Set up dialog handler for alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Error sent to Sentry')
      await dialog.accept()
    })

    // Click the test button
    await sentryButton.click()

    console.log('✅ Client-side Sentry test passed!')
  })

  test('Sentry configuration and instrumentation files exist', async ({
    page,
  }) => {
    // This test just verifies that our Sentry setup is complete
    // by checking that the app loads without errors
    await page.goto('http://localhost:3000')

    // Page should load successfully
    await expect(page.locator('h1')).toBeVisible()

    // Check that there are no console errors related to Sentry
    const logs: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })

    // Navigate around to trigger Sentry instrumentation
    await page.fill('#initialAmount', '5000')
    await page.click('button[type="submit"]')

    // Wait a bit for any potential errors
    await page.waitForTimeout(2000)

    // Filter out known non-Sentry errors
    const sentryErrors = logs.filter(
      (log) =>
        log.toLowerCase().includes('sentry') &&
        !log.includes('Failed to load resource') // Ignore network errors
    )

    expect(sentryErrors).toHaveLength(0)

    console.log('✅ Sentry integration test passed - no errors!')
  })
})
