import { test, expect } from '@playwright/test'

test.describe('Scenarios Page Basic Translation Test', () => {
  test('should load scenarios page in Spanish', async ({ page }) => {
    await page.goto('/es/scenario')

    // Just check that the page loads and has some content
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).toContainText('Biblioteca')
    await expect(page.locator('body')).toContainText('Categoría')
  })

  test('should load scenarios page in Polish', async ({ page }) => {
    await page.goto('/pl/scenario')

    // Just check that the page loads and has some content
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).toContainText('Biblioteka')
    await expect(page.locator('body')).toContainText('Kategorii')
  })

  test('should load scenarios page in English', async ({ page }) => {
    await page.goto('/en/scenario')

    // Just check that the page loads and has some content
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('body')).toContainText('Library')
    await expect(page.locator('body')).toContainText('Category')
  })
})
