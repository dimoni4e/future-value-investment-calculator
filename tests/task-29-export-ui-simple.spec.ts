import { test, expect } from '@playwright/test'

test.describe('Task 29: Export Button UI - Basic Test', () => {
  test('basic export button functionality', async ({ page }) => {
    // Navigate to the calculator
    await page.goto('http://localhost:3000')

    // Wait for page to load
    await expect(page.locator('h1')).toBeVisible()

    // Check if form exists and fill it
    await expect(page.locator('#initialAmount')).toBeVisible()
    await page.fill('#initialAmount', '15000')
    await page.fill('#monthlyContribution', '750')
    await page.fill('#annualReturn', '8')
    await page.fill('#timeHorizon', '25')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for results to appear
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // Check if export button is visible
    await expect(
      page.locator('button').filter({ hasText: 'Export' })
    ).toBeVisible()

    // Test export dropdown functionality
    await page.locator('button').filter({ hasText: 'Export' }).click()

    // Check dropdown options appear
    await expect(
      page.locator('button').filter({ hasText: 'Download CSV' })
    ).toBeVisible()
    await expect(
      page.locator('button').filter({ hasText: 'Download PDF' })
    ).toBeVisible()

    console.log('Export button UI test passed!')
  })
})
