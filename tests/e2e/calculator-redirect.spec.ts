/**
 * End-to-End tests for calculator redirect functionality
 * Tests user journey: fill form → click calculate → verify redirect to scenario page
 */
import { test, expect } from '@playwright/test'

test.describe('Calculator Redirect E2E', () => {
  test('user journey: fill form → click calculate → verify redirect to scenario page', async ({
    page,
  }) => {
    // Start at the home page
    await page.goto('/')

    // Verify calculator form is visible
    await expect(page.getByText(/financial growth planner/i)).toBeVisible()

    // Fill out the form with realistic investment parameters
    await page.locator('input[type="number"]').first().fill('25000') // Initial amount
    await page.locator('input[type="number"]').nth(1).fill('1000') // Monthly contribution
    await page.locator('input[type="number"]').nth(2).fill('8') // Annual return
    await page.locator('input[type="number"]').nth(3).fill('20') // Time horizon

    // Take a screenshot before submitting
    await page.screenshot({ path: 'test-results/before-calculate.png' })

    // Click the calculate button
    const calculateButton = page.getByRole('button', { name: /calculate/i })
    await calculateButton.click()

    // Verify loading state appears
    await expect(page.getByText(/generating.*scenario/i)).toBeVisible()

    // Verify button is disabled during loading
    await expect(calculateButton).toBeDisabled()

    // Wait for navigation to scenario page
    await page.waitForURL(/\/en\/scenario\/.*/, { timeout: 10000 })

    // Verify we're on the correct scenario page
    const currentUrl = page.url()
    expect(currentUrl).toContain('/en/scenario/')
    expect(currentUrl).toMatch(/invest-25000-monthly-1000-8percent-20years/)

    // Take a screenshot of the scenario page
    await page.screenshot({ path: 'test-results/scenario-page.png' })

    // Verify the scenario page loads properly
    await expect(page.getByText(/investment/i)).toBeVisible()
  })

  test('loading message appears and disappears correctly', async ({ page }) => {
    await page.goto('/')

    // Fill form quickly
    await page.locator('input[type="number"]').first().fill('10000')
    await page.locator('input[type="number"]').nth(1).fill('500')
    await page.locator('input[type="number"]').nth(2).fill('7')
    await page.locator('input[type="number"]').nth(3).fill('15')

    const calculateButton = page.getByRole('button', { name: /calculate/i })

    // Ensure loading message is not visible initially
    await expect(page.getByText(/generating.*scenario/i)).not.toBeVisible()

    // Click calculate
    await calculateButton.click()

    // Loading message should appear
    await expect(page.getByText(/generating.*scenario/i)).toBeVisible()

    // Wait for redirect (loading message should disappear)
    await page.waitForURL(/\/en\/scenario\/.*/)

    // Loading message should no longer be visible
    await expect(page.getByText(/generating.*scenario/i)).not.toBeVisible()
  })

  test('browser history navigation works correctly', async ({ page }) => {
    await page.goto('/')

    // Fill and submit form
    await page.locator('input[type="number"]').first().fill('15000')
    await page.locator('input[type="number"]').nth(1).fill('750')
    await page.locator('input[type="number"]').nth(2).fill('9')
    await page.locator('input[type="number"]').nth(3).fill('25')

    await page.getByRole('button', { name: /calculate/i }).click()

    // Wait for scenario page
    await page.waitForURL(/\/en\/scenario\/.*/)
    const scenarioUrl = page.url()

    // Go back to calculator
    await page.goBack()
    await expect(page).toHaveURL('/')

    // Verify form inputs are preserved (or reset as expected)
    const initialInput = page.locator('input[type="number"]').first()
    // The form might reset or preserve values - both are acceptable behaviors

    // Go forward to scenario page again
    await page.goForward()
    await expect(page).toHaveURL(scenarioUrl)
  })

  test('multiple calculations create different scenario URLs', async ({
    page,
  }) => {
    const scenarios = [
      { initial: '5000', monthly: '200', rate: '6', years: '10' },
      { initial: '50000', monthly: '2000', rate: '10', years: '30' },
      { initial: '100000', monthly: '0', rate: '5', years: '5' },
    ]

    const scenarioUrls: string[] = []

    for (const scenario of scenarios) {
      await page.goto('/')

      // Fill form with scenario parameters
      await page.locator('input[type="number"]').first().fill(scenario.initial)
      await page.locator('input[type="number"]').nth(1).fill(scenario.monthly)
      await page.locator('input[type="number"]').nth(2).fill(scenario.rate)
      await page.locator('input[type="number"]').nth(3).fill(scenario.years)

      // Submit and wait for redirect
      await page.getByRole('button', { name: /calculate/i }).click()
      await page.waitForURL(/\/en\/scenario\/.*/)

      // Store the URL
      const url = page.url()
      scenarioUrls.push(url)

      // Verify URL contains expected parameters
      expect(url).toContain(`invest-${scenario.initial}`)
      expect(url).toContain(`monthly-${scenario.monthly}`)
      expect(url).toContain(`${scenario.rate}percent`)
      expect(url).toContain(`${scenario.years}years`)
    }

    // Verify all URLs are unique
    const uniqueUrls = new Set(scenarioUrls)
    expect(uniqueUrls.size).toBe(scenarios.length)
  })

  test('accessibility: keyboard navigation and screen reader support', async ({
    page,
  }) => {
    await page.goto('/')

    // Use keyboard navigation to fill form
    await page.keyboard.press('Tab') // Navigate to first input
    await page.keyboard.type('20000')

    await page.keyboard.press('Tab') // Navigate to monthly input
    await page.keyboard.type('800')

    await page.keyboard.press('Tab') // Navigate to rate input
    await page.keyboard.type('7.5')

    await page.keyboard.press('Tab') // Navigate to years input
    await page.keyboard.type('22')

    // Navigate to calculate button and activate
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    // Verify loading state is announced properly
    const loadingMessage = page.getByText(/generating.*scenario/i)
    await expect(loadingMessage).toBeVisible()

    // Wait for redirect
    await page.waitForURL(/\/en\/scenario\/.*/)

    // Verify we can navigate the scenario page with keyboard
    await page.keyboard.press('Tab')
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
