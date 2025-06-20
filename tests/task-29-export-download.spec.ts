import { test, expect } from '@playwright/test'

test.describe('Task 29: Export Button Download Test', () => {
  test('CSV export download works correctly', async ({ page }) => {
    // Navigate to the calculator
    await page.goto('http://localhost:3000')

    // Fill form
    await page.fill('#initialAmount', '15000')
    await page.fill('#monthlyContribution', '750')
    await page.fill('#annualReturn', '8')
    await page.fill('#timeHorizon', '25')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for results
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Open export dropdown and click CSV
    await page.locator('button').filter({ hasText: 'Export' }).click()
    await page.locator('button').filter({ hasText: 'Download CSV' }).click()

    // Wait for download
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
    expect(download.url()).toContain('/api/export')
    expect(download.url()).toContain('format=csv')
    expect(download.url()).toContain('initial=15000')
    expect(download.url()).toContain('monthly=750')
    expect(download.url()).toContain('return=8')
    expect(download.url()).toContain('years=25')
    expect(download.url()).toContain('currency=USD')

    console.log('CSV export download test passed!')
  })

  test('PDF export download works correctly', async ({ page }) => {
    // Navigate to the calculator
    await page.goto('http://localhost:3000')

    // Fill form
    await page.fill('#initialAmount', '20000')
    await page.fill('#monthlyContribution', '800')
    await page.fill('#annualReturn', '7')
    await page.fill('#timeHorizon', '20')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for results
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // Set up download listener
    const downloadPromise = page.waitForEvent('download')

    // Open export dropdown and click PDF
    await page.locator('button').filter({ hasText: 'Export' }).click()
    await page.locator('button').filter({ hasText: 'Download PDF' }).click()

    // Wait for download
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
    expect(download.url()).toContain('/api/export')
    expect(download.url()).toContain('format=pdf')
    expect(download.url()).toContain('initial=20000')
    expect(download.url()).toContain('monthly=800')
    expect(download.url()).toContain('return=7')
    expect(download.url()).toContain('years=20')
    expect(download.url()).toContain('currency=USD')

    console.log('PDF export download test passed!')
  })
})
