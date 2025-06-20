import { test, expect } from '@playwright/test'

test.describe('Task #22: SEO Helper', () => {
  test('default title is shown when no parameters', async ({ page }) => {
    await page.goto('/')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check default title
    const title = await page.title()
    expect(title).toContain('Financial Growth Planner')

    console.log('✅ Default title:', title)
  })

  test('dynamic title reflects input values', async ({ page }) => {
    // Go to page with specific parameters
    await page.goto('/?initial=50000&monthly=1000&return=8&years=20')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check that title contains the input values
    const title = await page.title()

    // Should contain formatted amounts and timeframe
    expect(title).toContain('$50,000')
    expect(title).toContain('20 Years')
    expect(title).toContain('Future Value Calculator')

    console.log('✅ Dynamic title:', title)
  })

  test('meta description reflects input values', async ({ page }) => {
    // Go to page with specific parameters
    await page.goto('/?initial=25000&monthly=750&return=7&years=15')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check meta description
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content')

    // Should contain the investment details
    expect(description).toContain('$25,000')
    expect(description).toContain('$750')
    expect(description).toContain('7%')
    expect(description).toContain('15 years')

    console.log('✅ Dynamic description:', description)
  })

  test('open graph meta tags are present', async ({ page }) => {
    await page.goto('/?initial=100000&monthly=2000&return=9&years=25')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check Open Graph tags
    const ogTitle = await page
      .locator('meta[property="og:title"]')
      .getAttribute('content')
    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content')
    const ogType = await page
      .locator('meta[property="og:type"]')
      .getAttribute('content')
    const ogLocale = await page
      .locator('meta[property="og:locale"]')
      .getAttribute('content')

    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
    expect(ogType).toBe('website')
    expect(ogLocale).toBe('en')

    console.log('✅ Open Graph title:', ogTitle)
    console.log('✅ Open Graph description:', ogDescription)
  })

  test('twitter card meta tags are present', async ({ page }) => {
    await page.goto('/?initial=75000&monthly=1500&return=6&years=30')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check Twitter Card tags
    const twitterCard = await page
      .locator('meta[name="twitter:card"]')
      .getAttribute('content')
    const twitterTitle = await page
      .locator('meta[name="twitter:title"]')
      .getAttribute('content')
    const twitterDescription = await page
      .locator('meta[name="twitter:description"]')
      .getAttribute('content')

    expect(twitterCard).toBe('summary_large_image')
    expect(twitterTitle).toBeTruthy()
    expect(twitterDescription).toBeTruthy()

    console.log('✅ Twitter card:', twitterCard)
    console.log('✅ Twitter title:', twitterTitle)
  })

  test('keywords meta tag contains relevant terms', async ({ page }) => {
    await page.goto('/?initial=40000&monthly=800&return=5&years=12')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Check keywords
    const keywords = await page
      .locator('meta[name="keywords"]')
      .getAttribute('content')

    expect(keywords).toContain('future value calculator')
    expect(keywords).toContain('investment calculator')
    expect(keywords).toContain('compound interest')
    expect(keywords).toContain('financial planning')

    console.log('✅ Keywords:', keywords)
  })

  test('page source contains expected meta data', async ({ page }) => {
    await page.goto('/?initial=60000&monthly=1200&return=7.5&years=18')

    // Wait for page to load
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()

    // Get page source to verify meta tags are in head
    const pageSource = await page.content()

    // Verify meta tags are present in source
    expect(pageSource).toContain('<title>')
    expect(pageSource).toContain('name="description"')
    expect(pageSource).toContain('property="og:title"')
    expect(pageSource).toContain('name="twitter:card"')
    expect(pageSource).toContain('name="keywords"')

    // Verify specific values appear in source
    expect(pageSource).toContain('$60,000')
    expect(pageSource).toContain('7.5%')
    expect(pageSource).toContain('18 years')

    console.log('✅ Page source contains dynamic SEO tags')
  })

  test('different parameter combinations generate different titles', async ({
    page,
  }) => {
    // Test first set of parameters
    await page.goto('/?initial=10000&monthly=500&return=7&years=10')
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    const title1 = await page.title()

    // Test second set of parameters
    await page.goto('/?initial=50000&monthly=1000&return=8&years=20')
    await expect(page.locator('[data-testid="calculator-form"]')).toBeVisible()
    const title2 = await page.title()

    // Titles should be different
    expect(title1).not.toBe(title2)

    // Both should contain relevant information
    expect(title1).toContain('$10,000')
    expect(title1).toContain('10 Years')
    expect(title2).toContain('$50,000')
    expect(title2).toContain('20 Years')

    console.log('✅ Title 1:', title1)
    console.log('✅ Title 2:', title2)
  })
})
