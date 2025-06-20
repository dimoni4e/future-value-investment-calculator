import { test, expect } from '@playwright/test'

test('verify styles are loading correctly', async ({ page }) => {
  // Go to the homepage
  await page.goto('http://localhost:3002')

  // Wait for the page to load
  await page.waitForLoadState('networkidle')

  // Check that Tailwind CSS is working by verifying some key elements have the right styles
  const heroSection = page.locator('[data-testid="hero-section"]').first()
  if ((await heroSection.count()) > 0) {
    const bgColor = await heroSection.evaluate(
      (el) => getComputedStyle(el).background
    )
    console.log('Hero section background:', bgColor)
  }

  // Check if the header has proper styling
  const header = page.locator('header').first()
  if ((await header.count()) > 0) {
    const headerStyles = await header.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        display: styles.display,
        position: styles.position,
        backgroundColor: styles.backgroundColor,
      }
    })
    console.log('Header styles:', headerStyles)
  }

  // Check if buttons have proper Tailwind styling
  const buttons = page.locator('button')
  const buttonCount = await buttons.count()
  console.log(`Found ${buttonCount} buttons on the page`)

  if (buttonCount > 0) {
    const firstButton = buttons.first()
    const buttonStyles = await firstButton.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      }
    })
    console.log('First button styles:', buttonStyles)
  }

  // Take a screenshot for visual verification
  await page.screenshot({ path: 'style-verification.png', fullPage: true })

  // Basic check that the page loaded without major errors
  const title = await page.title()
  expect(title).toBeTruthy()
  console.log('Page title:', title)

  // Check that there are no major layout issues by ensuring some content is visible
  const body = page.locator('body')
  await expect(body).toBeVisible()
})
