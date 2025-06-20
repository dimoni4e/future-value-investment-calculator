import { test, expect } from '@playwright/test'

test.describe('DaisyUI Layout Tests', () => {
  test('should have daisyUI theme applied and components working', async ({
    page,
  }) => {
    await page.goto('/')

    // Check if the main layout structure is present
    await expect(page.locator('.drawer')).toBeVisible()

    // Check if navbar is using daisyUI classes
    await expect(page.locator('.navbar')).toBeVisible()

    // Check if the theme is properly applied
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'nature2pixel')

    // Check if footer is using daisyUI classes
    await expect(page.locator('.footer')).toBeVisible()

    // Test language switcher dropdown
    await page.click('.dropdown label')
    await expect(page.locator('.dropdown-content')).toBeVisible()

    // Check if daisyUI buttons are working
    const buttonCount = await page.locator('.btn').count()
    expect(buttonCount).toBeGreaterThan(0)

    // Test responsive drawer (mobile menu)
    const drawerToggle = page.locator('#drawer-toggle')
    await expect(drawerToggle).toBeHidden() // Hidden by default

    // Test gradient backgrounds are applied
    const gradientCount = await page.locator('[class*="from-primary"]').count()
    expect(gradientCount).toBeGreaterThan(0)
  })

  test('should have proper color scheme with custom nature2pixel theme', async ({
    page,
  }) => {
    await page.goto('/')

    // Check primary colors are applied
    const primaryElements = page.locator('.btn-primary')
    if ((await primaryElements.count()) > 0) {
      const computedStyle = await primaryElements.first().evaluate((el) => {
        return getComputedStyle(el).backgroundColor
      })
      expect(computedStyle).toBeTruthy()
    }

    // Check secondary colors
    const gradientElements = page.locator(
      '[class*="from-primary"][class*="to-secondary"]'
    )
    const gradientCount = await gradientElements.count()
    expect(gradientCount).toBeGreaterThan(0)
  })

  test('should maintain responsive behavior', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')

    // Desktop navigation should be visible
    await expect(page.locator('.menu-horizontal')).toBeVisible()

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    // Mobile drawer button should be visible
    await expect(page.locator('label[for="drawer-toggle"]')).toBeVisible()

    // Desktop navigation should be hidden
    await expect(page.locator('.menu-horizontal')).toBeHidden()
  })
})
