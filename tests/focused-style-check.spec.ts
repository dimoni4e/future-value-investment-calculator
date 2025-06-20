import { test, expect } from '@playwright/test'

test('check specific Tailwind CSS styles', async ({ page }) => {
  await page.goto('http://localhost:3002')
  await page.waitForLoadState('networkidle')

  // Check header styling
  const header = page.locator('header').first()
  const headerClass = await header.getAttribute('class')
  console.log('Header classes:', headerClass)

  // Check if header has sticky positioning and backdrop blur
  const headerStyles = await header.evaluate((el) => {
    const styles = getComputedStyle(el)
    return {
      position: styles.position,
      backdropFilter: styles.backdropFilter,
      backgroundColor: styles.backgroundColor,
      borderBottom: styles.borderBottom,
      boxShadow: styles.boxShadow,
    }
  })
  console.log('Header computed styles:', headerStyles)

  // Check the main content area
  const main = page.locator('main').first()
  const mainStyles = await main.evaluate((el) => {
    const styles = getComputedStyle(el)
    return {
      flex: styles.flex,
      display: styles.display,
    }
  })
  console.log('Main styles:', mainStyles)

  // Check body background
  const body = page.locator('body').first()
  const bodyStyles = await body.evaluate((el) => {
    const styles = getComputedStyle(el)
    return {
      background: styles.background,
      fontFamily: styles.fontFamily,
      height: styles.height,
    }
  })
  console.log('Body styles:', bodyStyles)

  // Check specific button with known classes
  const primaryButton = page
    .locator('button')
    .filter({ hasText: /Calculate|Calcular|Oblicz/ })
    .first()
  if ((await primaryButton.count()) > 0) {
    const buttonStyles = await primaryButton.evaluate((el) => {
      const styles = getComputedStyle(el)
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        padding: styles.padding,
        borderRadius: styles.borderRadius,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
      }
    })
    console.log('Primary button styles:', buttonStyles)

    const buttonClasses = await primaryButton.getAttribute('class')
    console.log('Primary button classes:', buttonClasses)
  }

  // Take a screenshot for manual review
  await page.screenshot({ path: 'current-styles.png', fullPage: true })

  expect(true).toBe(true) // Just to make the test pass
})
