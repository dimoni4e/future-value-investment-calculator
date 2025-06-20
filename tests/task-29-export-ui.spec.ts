import { test, expect } from '@playwright/test'

test.describe('Task 29: Export Button UI Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the calculator and ensure results are shown
    await page.goto('http://localhost:3000')

    // Fill in some values to ensure calculator shows results and export button appears
    await page.fill('#initialAmount', '15000')
    await page.fill('#monthlyContribution', '750')
    await page.fill('#annualReturn', '8')
    await page.fill('#timeHorizon', '25')

    // Submit the form to trigger calculations
    await page.click('button[type="submit"]')

    // Wait for results to be calculated and displayed
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // Ensure export button is visible (it should appear once results are calculated)
    await expect(
      page.locator('button').filter({ hasText: 'Export' })
    ).toBeVisible()
  })

  test('export button appears after calculator results are shown', async ({
    page,
  }) => {
    // Export button should be visible
    const exportButton = page.locator('button').filter({ hasText: 'Export' })
    await expect(exportButton).toBeVisible()

    // It should have the download icon (use first() to avoid strict mode violation)
    await expect(exportButton.locator('svg').first()).toBeVisible()
  })

  test('CSV export download is triggered correctly', async ({ page }) => {
    // Set up download listening using context
    const downloadPromise = page.waitForEvent('download')

    // Open export dropdown
    await page.locator('button').filter({ hasText: 'Export' }).click()

    // Click CSV export
    await page.locator('button').filter({ hasText: 'Download CSV' }).click()

    // Wait for download to start
    const download = await downloadPromise

    // Check that download was triggered
    expect(download.suggestedFilename()).toMatch(/\.csv$/)

    // Verify the download URL contains the correct parameters
    expect(download.url()).toContain('/api/export')
    expect(download.url()).toContain('format=csv')
    expect(download.url()).toContain('initial=15000')
    expect(download.url()).toContain('monthly=750')
    expect(download.url()).toContain('return=8')
    expect(download.url()).toContain('years=25')
    expect(download.url()).toContain('currency=USD')
  })

  test('PDF export download is triggered correctly', async ({ page }) => {
    // Set up download listening using context
    const downloadPromise = page.waitForEvent('download')

    // Open export dropdown
    await page.locator('button').filter({ hasText: 'Export' }).click()

    // Click PDF export
    await page.locator('button').filter({ hasText: 'Download PDF' }).click()

    // Wait for download to start
    const download = await downloadPromise

    // Check that download was triggered
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)

    // Verify the download URL contains the correct parameters
    expect(download.url()).toContain('/api/export')
    expect(download.url()).toContain('format=pdf')
    expect(download.url()).toContain('initial=15000')
    expect(download.url()).toContain('monthly=750')
    expect(download.url()).toContain('return=8')
    expect(download.url()).toContain('years=25')
    expect(download.url()).toContain('currency=USD')
  })

  test('export button is positioned correctly next to share buttons', async ({
    page,
  }) => {
    // Check that both share and export buttons are in the same container
    const buttonsContainer = page.locator('div').filter({
      has: page.locator('button').filter({ hasText: 'Export' }),
    })

    // Should also contain share buttons
    await expect(
      buttonsContainer.locator('button').filter({ hasText: 'Copy Link' })
    ).toBeVisible()

    // Export button should be visible in the same row/container
    await expect(
      buttonsContainer.locator('button').filter({ hasText: 'Export' })
    ).toBeVisible()
  })
})
