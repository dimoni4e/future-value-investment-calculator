/**
 * Integration tests for calculator flow
 * Tests complete flow: form submission → loading → redirect to scenario page
 */
import { test, expect } from '@playwright/test'

test.describe('Calculator Flow Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('complete flow: form submission → loading → redirect to scenario page', async ({
    page,
  }) => {
    // Fill out the calculator form
    await page.fill('[data-testid="initial-amount-input"]', '15000')
    await page.fill('[data-testid="monthly-contribution-input"]', '750')
    await page.fill('[data-testid="annual-return-input"]', '8')
    await page.fill('[data-testid="time-horizon-input"]', '25')

    // Click calculate button
    const calculateButton = page.getByRole('button', { name: /calculate/i })
    await calculateButton.click()

    // Verify loading state appears
    await expect(page.getByText(/generating.*scenario/i)).toBeVisible()
    await expect(calculateButton).toBeDisabled()

    // Wait for redirect to scenario page
    await page.waitForURL(/\/scenario\/.*/)

    // Verify we're on a scenario page with correct slug pattern
    const url = page.url()
    expect(url).toMatch(
      /\/scenario\/invest-\d+-monthly-\d+-\d+percent-\d+years-\w+/
    )
  })

  test('handles various parameter combinations correctly', async ({ page }) => {
    const testCases = [
      { initial: '5000', monthly: '250', rate: '6', years: '15' },
      { initial: '50000', monthly: '2000', rate: '10', years: '30' },
      { initial: '1000', monthly: '100', rate: '5', years: '10' },
    ]

    for (const testCase of testCases) {
      await page.goto('/')

      await page.fill('[data-testid="initial-amount-input"]', testCase.initial)
      await page.fill(
        '[data-testid="monthly-contribution-input"]',
        testCase.monthly
      )
      await page.fill('[data-testid="annual-return-input"]', testCase.rate)
      await page.fill('[data-testid="time-horizon-input"]', testCase.years)

      await page.getByRole('button', { name: /calculate/i }).click()

      // Wait for redirect
      await page.waitForURL(/\/scenario\/.*/)

      // Verify URL contains expected parameters
      const url = page.url()
      expect(url).toContain(`invest-${testCase.initial}`)
      expect(url).toContain(`monthly-${testCase.monthly}`)
      expect(url).toContain(`${testCase.rate}percent`)
      expect(url).toContain(`${testCase.years}years`)
    }
  })

  test('error handling for invalid parameters', async ({ page }) => {
    // Test negative initial amount
    await page.fill('[data-testid="initial-amount-input"]', '-1000')
    await page.fill('[data-testid="monthly-contribution-input"]', '500')
    await page.fill('[data-testid="annual-return-input"]', '7')
    await page.fill('[data-testid="time-horizon-input"]', '20')

    const calculateButton = page.getByRole('button', { name: /calculate/i })
    await calculateButton.click()

    // Should show validation error and not redirect
    await expect(page.getByText(/cannot be negative/i)).toBeVisible()

    // Verify we're still on the same page (no redirect occurred)
    await expect(page).toHaveURL('/')
  })

  test('form validation prevents submission with invalid data', async ({
    page,
  }) => {
    // Test with zero time horizon
    await page.fill('[data-testid="time-horizon-input"]', '0')

    const calculateButton = page.getByRole('button', { name: /calculate/i })
    await calculateButton.click()

    // Should show validation message
    await expect(
      page.getByText(/time horizon must be at least 1 year/i)
    ).toBeVisible()

    // Button should not trigger navigation
    await expect(page).toHaveURL('/')
  })

  test('loading state is accessible', async ({ page }) => {
    await page.fill('[data-testid="initial-amount-input"]', '10000')
    await page.fill('[data-testid="monthly-contribution-input"]', '500')
    await page.fill('[data-testid="annual-return-input"]', '7')
    await page.fill('[data-testid="time-horizon-input"]', '20')

    const calculateButton = page.getByRole('button', { name: /calculate/i })
    await calculateButton.click()

    // Check that loading message is accessible
    const loadingMessage = page.getByText(/generating.*scenario/i)
    await expect(loadingMessage).toBeVisible()

    // Verify button is properly disabled for screen readers
    await expect(calculateButton).toHaveAttribute('disabled')
  })
})
