import { test, expect } from '@playwright/test'

test('Task 29 Manual Verification', async ({ page }) => {
  // Navigate to calculator
  await page.goto('http://localhost:3000')

  // Wait for page to load
  await page.waitForLoadState('networkidle')

  // Check page title
  await expect(page).toHaveTitle(/Financial Growth Planner/)

  // Fill the form
  await page.fill('#initialAmount', '10000')
  await page.fill('#monthlyContribution', '500')
  await page.fill('#annualReturn', '7')
  await page.fill('#timeHorizon', '20')

  // Submit form
  await page.click('button[type="submit"]')

  // Wait a bit for calculation
  await page.waitForTimeout(2000)

  // Check if results appear
  const resultsContainer = page.locator('[data-testid="future-value"]')
  await expect(resultsContainer).toBeVisible({ timeout: 15000 })

  // Check if export button appears
  const exportButton = page.locator('button').filter({ hasText: 'Export' })
  await expect(exportButton).toBeVisible()

  // Test dropdown
  await exportButton.click()
  await expect(
    page.locator('button').filter({ hasText: 'Download CSV' })
  ).toBeVisible()
  await expect(
    page.locator('button').filter({ hasText: 'Download PDF' })
  ).toBeVisible()

  console.log('✅ All Task 29 functionality verified manually!')
})
