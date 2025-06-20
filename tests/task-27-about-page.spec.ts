import { test, expect } from '@playwright/test'

const locales = [
  { code: 'en', path: '' },
  { code: 'es', path: '/es' },
  { code: 'pl', path: '/pl' },
]

test.describe('Task 27: About Page', () => {
  for (const locale of locales) {
    test.describe(`Locale: ${locale.code}`, () => {
      test(`should load About page successfully - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Check for locale-specific title content
        if (locale.code === 'en') {
          await expect(page).toHaveTitle(/About Us/i)
        } else if (locale.code === 'es') {
          await expect(page).toHaveTitle(/Acerca de Nosotros/i)
        } else if (locale.code === 'pl') {
          await expect(page).toHaveTitle(/O Nas/i)
        }

        await expect(page.locator('h1')).toBeVisible()
      })

      test(`should display hero section with mission content - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Check hero section
        const heroSection = page.locator('section').first()
        await expect(heroSection).toBeVisible()
        await expect(heroSection.locator('h1')).toBeVisible()
        await expect(heroSection.locator('p')).toBeVisible()

        // Check for icon container (should have gradient background)
        await expect(heroSection.locator('.bg-gradient-to-br')).toBeVisible()
      })

      test(`should display mission section with features - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Find mission section (second section with white background)
        const missionSection = page.locator('section.bg-white').first()
        await expect(missionSection).toBeVisible()

        // Check mission title and description
        await expect(missionSection.locator('h2')).toBeVisible()
        await expect(missionSection.locator('p').first()).toBeVisible()

        // Check mission points with icons (look for icon containers)
        const missionFeatures = missionSection.locator(
          '.flex.items-center.space-x-3'
        )
        await expect(missionFeatures).toHaveCount(4)

        // Check feature cards (look for card containers)
        const featureCards = missionSection.locator('.rounded-lg')
        await expect(featureCards.first()).toBeVisible()
      })

      test(`should display values section with three pillars - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Find values section (gray background)
        const valuesSection = page.locator('section.bg-gray-50').first()
        await expect(valuesSection).toBeVisible()

        // Check values title
        await expect(valuesSection.locator('h2')).toBeVisible()

        // Check three value cards with colored backgrounds
        const valueCards = valuesSection.locator('.text-center')
        await expect(valueCards).toHaveCount(3)

        // Check for colored icon backgrounds
        await expect(valuesSection.locator('.bg-blue-100')).toBeVisible()
        await expect(valuesSection.locator('.bg-emerald-100')).toBeVisible()
        await expect(valuesSection.locator('.bg-purple-100')).toBeVisible()
      })

      test(`should display technology section with tech stack - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Find technology section (white background, not first)
        const techSection = page.locator('section.bg-white').nth(1)
        await expect(techSection).toBeVisible()

        // Check technology title
        await expect(techSection.locator('h2')).toBeVisible()

        // Check tech stack items
        const techItems = techSection.locator('.text-center')
        await expect(techItems).toHaveCount(4)

        // Check for Next.js, React, TypeScript, Tailwind
        await expect(techSection.getByText('Next.js')).toBeVisible()
        await expect(techSection.getByText('React')).toBeVisible()
        await expect(techSection.getByText('TS')).toBeVisible()
        await expect(techSection.getByText('TW')).toBeVisible()
      })

      test(`should display contact section with email and privacy links - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Find contact section (gray background, last)
        const contactSection = page.locator('section.bg-gray-50').nth(1)
        await expect(contactSection).toBeVisible()

        // Check contact title
        await expect(contactSection.locator('h2')).toBeVisible()

        // Check email link
        const emailLink = contactSection.locator(
          'a[href="mailto:hello@futurevaluecalculator.com"]'
        )
        await expect(emailLink).toBeVisible()

        // Check privacy policy link
        const privacyLink = contactSection.locator('a[href="/legal/privacy"]')
        await expect(privacyLink).toBeVisible()
      })

      test(`should have proper SEO metadata - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Check title
        await expect(page).toHaveTitle(/About Us.*Future Value/i)

        // Check meta description
        const metaDescription = page.locator('meta[name="description"]')
        await expect(metaDescription).toHaveAttribute(
          'content',
          /.*(mission|democratiz|financial|planning).*/i
        )

        // Check keywords meta tag
        const metaKeywords = page.locator('meta[name="keywords"]')
        await expect(metaKeywords).toHaveAttribute(
          'content',
          /.*(about|financial|planning|mission).*/i
        )

        // Check Open Graph tags
        const ogTitle = page.locator('meta[property="og:title"]')
        await expect(ogTitle).toHaveAttribute(
          'content',
          /About Us.*Future Value/i
        )

        const ogDescription = page.locator('meta[property="og:description"]')
        await expect(ogDescription).toHaveAttribute(
          'content',
          /.*(mission|democratiz|financial|planning).*/i
        )

        const ogType = page.locator('meta[property="og:type"]')
        await expect(ogType).toHaveAttribute('content', 'website')

        // Check Twitter Card
        const twitterCard = page.locator('meta[name="twitter:card"]')
        await expect(twitterCard).toHaveAttribute(
          'content',
          'summary_large_image'
        )

        const twitterTitle = page.locator('meta[name="twitter:title"]')
        await expect(twitterTitle).toHaveAttribute(
          'content',
          /About Us.*Future Value/i
        )
      })

      test(`should have proper navigation links from header and footer - ${locale.code}`, async ({
        page,
      }) => {
        await page.goto(`http://localhost:3000${locale.path}`)

        // Check header navigation to About page
        const headerAboutLink = page
          .locator('header')
          .locator('a[href="/about"]')
        await expect(headerAboutLink).toBeVisible()

        // Click header About link
        await headerAboutLink.click()
        await expect(page).toHaveURL(new RegExp(`.*${locale.path}/about`))
        await expect(page.locator('h1')).toBeVisible()

        // Go back to home
        await page.goto(`http://localhost:3000${locale.path}`)

        // Check footer navigation to About page
        const footerAboutLink = page
          .locator('footer')
          .locator('a[href="/about"]')
        await expect(footerAboutLink).toBeVisible()

        // Click footer About link
        await footerAboutLink.click()
        await expect(page).toHaveURL(new RegExp(`.*${locale.path}/about`))
        await expect(page.locator('h1')).toBeVisible()
      })

      test(`should display correctly on mobile viewports - ${locale.code}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto(`http://localhost:3000${locale.path}/about`)

        // Check that all sections are visible on mobile
        await expect(page.locator('h1')).toBeVisible()

        // Check hero section
        const heroSection = page.locator('section').first()
        await expect(heroSection).toBeVisible()

        // Check mission section
        const missionSection = page.locator('section.bg-white').first()
        await expect(missionSection).toBeVisible()

        // Check values section
        const valuesSection = page.locator('section.bg-gray-50').first()
        await expect(valuesSection).toBeVisible()

        // Check technology section
        const techSection = page.locator('section.bg-white').nth(1)
        await expect(techSection).toBeVisible()

        // Check contact section
        const contactSection = page.locator('section.bg-gray-50').nth(1)
        await expect(contactSection).toBeVisible()

        // Verify email link is clickable on mobile
        const emailLink = contactSection.locator(
          'a[href="mailto:hello@futurevaluecalculator.com"]'
        )
        await expect(emailLink).toBeVisible()
      })
    })
  }

  test('should have correct locale-specific content', async ({ page }) => {
    // Test English content (default, no prefix)
    await page.goto('http://localhost:3000/about')
    await expect(page.locator('h1')).toContainText('About Our Mission')

    // Test Spanish content
    await page.goto('http://localhost:3000/es/about')
    await expect(page.locator('h1')).toContainText('Acerca de Nuestra Misión')

    // Test Polish content
    await page.goto('http://localhost:3000/pl/about')
    await expect(page.locator('h1')).toContainText('O Naszej Misji')
  })

  test('should handle locale fallback gracefully', async ({ page }) => {
    // Test with invalid locale - should fallback to English (no prefix)
    await page.goto('http://localhost:3000/invalid/about')
    await expect(page).toHaveURL(/.*\/about$/)
    await expect(page.locator('h1')).toContainText('About Our Mission')
  })

  test('should link to legal pages correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/about')

    // Find and click privacy policy link in contact section
    const privacyLink = page.locator('a[href="/legal/privacy"]')
    await expect(privacyLink).toBeVisible()
    await privacyLink.click()

    // Should navigate to privacy policy page (English default, no prefix)
    await expect(page).toHaveURL(/.*\/legal\/privacy$/)
    await expect(page.locator('h1')).toContainText('Privacy Policy')
  })
})
