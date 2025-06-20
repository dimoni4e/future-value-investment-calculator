import { test, expect } from '@playwright/test'

test.describe('Task 24: OG Image Generation', () => {
  test('should generate default OG image', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/og')
    expect(response?.status()).toBe(200)
    expect(response?.headers()['content-type']).toBe('image/png')
  })

  test('should generate parametrized OG image', async ({ page }) => {
    const response = await page.goto(
      'http://localhost:3001/api/og?initial=5000&monthly=1000&return=10&years=15'
    )
    expect(response?.status()).toBe(200)
    expect(response?.headers()['content-type']).toBe('image/png')
  })

  test('should include OG image in share route meta tags', async ({ page }) => {
    const response = await page.goto(
      'http://localhost:3001/api/share?initial=5000&monthly=1000&return=10&years=15'
    )
    expect(response?.status()).toBe(200)

    const html = await response?.text()

    // Check for OG image meta tags
    expect(html).toContain('property="og:image"')
    expect(html).toContain(
      'content="http://localhost:3001/api/og?initial=5000&monthly=1000&return=10&years=15"'
    )
    expect(html).toContain('property="og:image:width"')
    expect(html).toContain('content="1200"')
    expect(html).toContain('property="og:image:height"')
    expect(html).toContain('content="630"')

    // Check for Twitter image meta tags
    expect(html).toContain('name="twitter:image"')
    expect(html).toContain(
      'content="http://localhost:3001/api/og?initial=5000&monthly=1000&return=10&years=15"'
    )
  })

  test('should include OG image in basic share route', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/api/share')
    expect(response?.status()).toBe(200)

    const html = await response?.text()

    // Check for basic OG image meta tags
    expect(html).toContain('property="og:image"')
    expect(html).toContain('content="/api/og"')
    expect(html).toContain('name="twitter:image"')
    expect(html).toContain('content="/api/og"')
  })

  test('should handle OG image generation errors gracefully', async ({
    page,
  }) => {
    // Test with invalid parameters that might cause calculation errors
    const response = await page.goto(
      'http://localhost:3001/api/og?initial=invalid&monthly=bad&return=error&years=wrong'
    )
    expect(response?.status()).toBe(200) // Should fallback to default values
    expect(response?.headers()['content-type']).toBe('image/png')
  })
})
