import { test, expect } from '@playwright/test'

test.describe('Task #20: Currency Selector with FX Fetch', () => {
  test('EUR→USD currency conversion changes output', async ({ page }) => {
    // Navigate to the calculator
    await page.goto('/')

    // Wait for the page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Enter some investment values
    await page.fill('#initialAmount', '10000')
    await page.fill('#monthlyContribution', '500')
    await page.fill('#annualReturn', '7')

    // Wait for results to appear with USD (default)
    await expect(page.locator('text=Future Value')).toBeVisible()

    // Get the initial USD result
    const usdResult = await page
      .locator('[data-testid="future-value"]')
      .textContent()

    // Click on currency selector to open dropdown
    await page.click('button:has-text("USD")')

    // Wait for dropdown to appear and select EUR
    await expect(page.locator('text=Euro')).toBeVisible()
    await page.click('text=Euro')

    // Wait for currency to change and results to update
    await expect(page.locator('button:has-text("EUR")')).toBeVisible()
    await page.waitForTimeout(1000) // Wait for exchange rate fetch and conversion

    // Get the new EUR result
    const eurResult = await page
      .locator('[data-testid="future-value"]')
      .textContent()

    // Verify that the values are different (converted)
    expect(usdResult).not.toBe(eurResult)

    // Verify EUR symbol appears in the result
    expect(eurResult).toContain('€')

    // Verify input field symbols changed to EUR
    const initialAmountField = page.locator('#initialAmount').first()
    const parentDiv = initialAmountField.locator('..')
    await expect(parentDiv.locator('span', { hasText: '€' })).toBeVisible()
  })

  test('currency selector displays all supported currencies', async ({
    page,
  }) => {
    await page.goto('/')

    // Wait for the page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Click on currency selector
    await page.click('button:has-text("USD")')

    // Verify all supported currencies are present
    await expect(page.locator('text=US Dollar')).toBeVisible()
    await expect(page.locator('text=Euro')).toBeVisible()
    await expect(page.locator('text=British Pound')).toBeVisible()
    await expect(page.locator('text=Polish Złoty')).toBeVisible()
    await expect(page.locator('text=Canadian Dollar')).toBeVisible()
    await expect(page.locator('text=Australian Dollar')).toBeVisible()

    // Verify flags are displayed
    await expect(page.locator('text=🇺🇸')).toBeVisible()
    await expect(page.locator('text=🇪🇺')).toBeVisible()
    await expect(page.locator('text=🇬🇧')).toBeVisible()
    await expect(page.locator('text=🇵🇱')).toBeVisible()

    // Close dropdown by clicking outside
    await page.click('body')
    await expect(page.locator('text=Euro')).not.toBeVisible()
  })

  test('exchange rates load and conversion works', async ({ page }) => {
    await page.goto('/')

    // Wait for the calculator form
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check if loading message appears briefly (exchange rates are fetching)
    // This might be fast, so we'll just verify the currency selector is not disabled
    const currencyButton = page.locator('button:has-text("USD")')
    await expect(currencyButton).toBeEnabled()

    // Enter values and test conversion
    await page.fill('#initialAmount', '1000')
    await page.fill('#monthlyContribution', '100')

    // Change to EUR
    await currencyButton.click()
    await page.click('text=Euro')

    // Verify the input field symbols changed
    const monthlyField = page.locator('#monthlyContribution').first()
    const monthlyParent = monthlyField.locator('..')
    await expect(monthlyParent.locator('span', { hasText: '€' })).toBeVisible()
  })
})
