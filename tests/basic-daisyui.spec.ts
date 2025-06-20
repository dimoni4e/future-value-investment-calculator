import { test, expect } from '@playwright/test'

test.describe('Basic DaisyUI Layout Test', () => {
  test('should load page without component errors', async ({ page }) => {
    // Go to the page
    await page.goto('/')

    // Check if the page loads at all
    await expect(page.locator('html')).toBeVisible()

    // Check if daisyUI theme is applied
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      'nature2pixel'
    )

    // Check for the presence of basic structure
    await expect(page.locator('body')).toBeVisible()
  })

  test('should have navbar with daisyUI classes', async ({ page }) => {
    await page.goto('/')

    // Check navbar exists
    await expect(page.locator('.navbar')).toBeVisible()
  })

  test('should have footer with daisyUI classes', async ({ page }) => {
    await page.goto('/')

    // Check footer exists
    await expect(page.locator('.footer')).toBeVisible()
  })
})
