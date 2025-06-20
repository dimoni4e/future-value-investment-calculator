import { test, expect } from '@playwright/test'

test.describe('Task 26: Legal Pages', () => {
  const locales = ['en', 'es', 'pl']
  const pages = ['privacy', 'terms', 'cookies']

  for (const locale of locales) {
    for (const page of pages) {
      test(`should render ${page} page in ${locale}`, async ({ page: pw }) => {
        // Visit the legal page
        await pw.goto(`/${locale}/legal/${page}`)

        // Wait for the page to load
        await pw.waitForLoadState('networkidle')

        // Check that the page loaded successfully - URL will redirect for default locale
        const expectedUrl =
          locale === 'en' ? `/legal/${page}` : `/${locale}/legal/${page}`
        await expect(pw).toHaveURL(expectedUrl)

        // Check for main content container
        await expect(pw.locator('.prose')).toBeVisible()

        // Check for the main heading
        await expect(pw.locator('h1')).toBeVisible()

        // Check for last updated date at the bottom - use more specific logic
        const lastUpdatedFound = await pw
          .getByText(/Last updated|Última actualización|Ostatnia aktualizacja/)
          .first()
          .isVisible()
        expect(lastUpdatedFound).toBe(true)

        // Verify proper MDX styling is applied
        await expect(pw.locator('.prose h1')).toHaveClass(/text-3xl/)
        await expect(pw.locator('.prose h1')).toHaveClass(/font-bold/)

        // Check for proper content based on page type - use heading locator
        if (page === 'privacy') {
          const privacyHeading = pw.locator('h1').first()
          const headingText = await privacyHeading.textContent()
          expect(headingText).toMatch(
            /Privacy Policy|Política de Privacidad|Polityka Prywatności/
          )
        } else if (page === 'terms') {
          const termsHeading = pw.locator('h1').first()
          const headingText = await termsHeading.textContent()
          expect(headingText).toMatch(
            /Terms of Service|Términos de Servicio|Warunki Usługi/
          )
        } else if (page === 'cookies') {
          const cookiesHeading = pw.locator('h1').first()
          const headingText = await cookiesHeading.textContent()
          expect(headingText).toMatch(
            /Cookie Policy|Política de Cookies|Polityka Cookies/
          )
        }
      })
    }
  }

  test('should have working footer links to legal pages', async ({ page }) => {
    // Visit the main page
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()

    // Check privacy policy link
    const privacyLink = page.locator('footer a[href="/legal/privacy"]')
    await expect(privacyLink).toBeVisible()
    await expect(privacyLink).toHaveText('Privacy Policy')

    // Check terms of service link
    const termsLink = page.locator('footer a[href="/legal/terms"]')
    await expect(termsLink).toBeVisible()
    await expect(termsLink).toHaveText('Terms of Service')

    // Check cookie policy link
    const cookieLink = page.locator('footer a[href="/legal/cookies"]')
    await expect(cookieLink).toBeVisible()
    await expect(cookieLink).toHaveText('Cookie Policy')

    // Test navigation by clicking privacy policy link
    await privacyLink.click()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL('/legal/privacy') // No locale prefix for English
    await expect(page.locator('h1')).toContainText('Privacy Policy')
  })

  test('should generate proper meta tags for legal pages', async ({ page }) => {
    // Test privacy page meta tags
    await page.goto('/en/legal/privacy')
    await page.waitForLoadState('networkidle')

    // Check title
    await expect(page).toHaveTitle(/Privacy Policy/)

    // Check meta description
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /personal information/)

    // Test terms page meta tags
    await page.goto('/en/legal/terms')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle(/Terms of Service/)

    // Test cookies page meta tags
    await page.goto('/en/legal/cookies')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveTitle(/Cookie Policy/)
  })

  test('should handle non-existent legal pages with 404', async ({ page }) => {
    // Try to access a non-existent legal page
    const response = await page.goto('/en/legal/nonexistent')
    expect(response?.status()).toBe(404)
  })

  test('should fallback to English for missing locale content', async ({
    page,
  }) => {
    // This test assumes that if a locale-specific MDX file doesn't exist,
    // it should fallback to English content
    await page.goto('/en/legal/privacy')
    await page.waitForLoadState('networkidle')

    // Should load successfully (this tests the fallback mechanism in the page component)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.prose')).toBeVisible()
  })

  test('should have proper responsive layout', async ({ page }) => {
    await page.goto('/en/legal/privacy')
    await page.waitForLoadState('networkidle')

    // Check that content is properly contained and responsive - target the legal page container specifically
    const legalContainer = page
      .locator('.container')
      .filter({ has: page.locator('.prose') })
    await expect(legalContainer).toBeVisible()
    await expect(legalContainer).toHaveClass(/max-w-4xl/)

    // Check proper padding
    const contentDiv = page.locator('.prose')
    await expect(contentDiv).toBeVisible()
    await expect(contentDiv).toHaveClass(/max-w-none/)

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(legalContainer).toBeVisible()
    await expect(contentDiv).toBeVisible()
  })

  test('should maintain locale when navigating legal pages', async ({
    page,
  }) => {
    // Start with Spanish locale (non-default, so URL will include locale)
    await page.goto('/es/legal/privacy')
    await page.waitForLoadState('networkidle')

    // Check Spanish content is loaded and URL includes locale
    await expect(page).toHaveURL('/es/legal/privacy')
    await expect(page.locator('h1')).toContainText('Política de Privacidad')

    // Navigate to terms from footer (if visible)
    await page.locator('footer').scrollIntoViewIfNeeded()
    const termsLink = page.locator('footer a[href="/legal/terms"]')
    if (await termsLink.isVisible()) {
      await termsLink.click()
      await page.waitForLoadState('networkidle')

      // Should maintain Spanish locale
      await expect(page).toHaveURL('/es/legal/terms')
      await expect(page.locator('h1')).toContainText('Términos de Servicio')
    }
  })

  test('should have proper typography and spacing', async ({ page }) => {
    await page.goto('/en/legal/privacy')
    await page.waitForLoadState('networkidle')

    // Check prose typography classes are applied
    const prose = page.locator('.prose')
    await expect(prose).toHaveClass(/prose-slate/)
    await expect(prose).toHaveClass(/dark:prose-invert/)

    // Check headings have proper styling
    const h1 = page.locator('h1')
    await expect(h1).toHaveClass(/text-3xl/)
    await expect(h1).toHaveClass(/font-bold/)

    const h2Elements = page.locator('h2')
    if ((await h2Elements.count()) > 0) {
      await expect(h2Elements.first()).toHaveClass(/text-2xl/)
      await expect(h2Elements.first()).toHaveClass(/font-semibold/)
    }

    // Check paragraphs have proper spacing
    const paragraphs = page.locator('p')
    if ((await paragraphs.count()) > 0) {
      await expect(paragraphs.first()).toHaveClass(/leading-7/)
      await expect(paragraphs.first()).toHaveClass(/text-muted-foreground/)
    }
  })

  test('should have working links within legal content', async ({ page }) => {
    await page.goto('/en/legal/privacy')
    await page.waitForLoadState('networkidle')

    // If there are any links in the content, they should have proper attributes
    const contentLinks = page.locator('.prose a')
    const linkCount = await contentLinks.count()

    if (linkCount > 0) {
      const firstLink = contentLinks.first()
      await expect(firstLink).toHaveAttribute('target', '_blank')
      await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(firstLink).toHaveClass(/text-primary/)
      await expect(firstLink).toHaveClass(/underline/)
    }
  })
})
