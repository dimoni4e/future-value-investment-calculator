import { test, expect } from '@playwright/test'

test.describe('Task 25: Robots.txt & Dynamic Sitemap', () => {
  test('should serve robots.txt with correct content', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/robots.txt')
    expect(response?.status()).toBe(200)
    expect(response?.headers()['content-type']).toBe('text/plain')

    const content = await response?.text()

    // Check for required robots.txt content
    expect(content).toContain('User-agent: *')
    expect(content).toContain('Allow: /')
    expect(content).toContain('Sitemap: http://localhost:3001/sitemap.xml')
    expect(content).toContain('Crawl-delay: 1')

    // Check for specific search engine bots
    expect(content).toContain('User-agent: Googlebot')
    expect(content).toContain('User-agent: Bingbot')
    expect(content).toContain('User-agent: facebookexternalhit')
    expect(content).toContain('User-agent: Twitterbot')
    expect(content).toContain('User-agent: LinkedInBot')
  })

  test('should serve sitemap.xml with valid XML structure', async ({
    page,
  }) => {
    const response = await page.goto('http://localhost:3001/sitemap.xml')
    expect(response?.status()).toBe(200)
    expect(response?.headers()['content-type']).toBe('application/xml')

    const content = await response?.text()

    // Check for valid XML structure
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(content).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'
    )
    expect(content).toContain('</urlset>')

    // Check that it contains <url> entries
    expect(content).toContain('<url>')
    expect(content).toContain('</url>')
    expect(content).toContain('<loc>')
    expect(content).toContain('<lastmod>')
    expect(content).toContain('<changefreq>')
    expect(content).toContain('<priority>')
  })

  test('should include all locales in sitemap', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/sitemap.xml')
    const content = await response?.text()

    // Check for all supported locales
    expect(content).toContain('<loc>http://localhost:3001/en</loc>')
    expect(content).toContain('<loc>http://localhost:3001/pl</loc>')
    expect(content).toContain('<loc>http://localhost:3001/es</loc>')
  })

  test('should include future pages in sitemap', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/sitemap.xml')
    const content = await response?.text()

    // Check for future pages that will be implemented
    expect(content).toContain('/en/about</loc>')
    expect(content).toContain('/en/legal</loc>')
    expect(content).toContain('/en/legal/privacy</loc>')
    expect(content).toContain('/en/legal/terms</loc>')

    // Should be included for other locales too
    expect(content).toContain('/pl/about</loc>')
    expect(content).toContain('/es/about</loc>')
  })

  test('should include API endpoints in sitemap', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/sitemap.xml')
    const content = await response?.text()

    // Check for public API endpoints
    expect(content).toContain('<loc>http://localhost:3001/api/share</loc>')
  })

  test('should have proper cache headers', async ({ page }) => {
    // Test robots.txt cache headers
    const robotsResponse = await page.goto('http://localhost:3001/robots.txt')
    expect(robotsResponse?.headers()['cache-control']).toContain('public')
    expect(robotsResponse?.headers()['cache-control']).toContain('max-age=3600')

    // Test sitemap.xml cache headers
    const sitemapResponse = await page.goto('http://localhost:3001/sitemap.xml')
    expect(sitemapResponse?.headers()['cache-control']).toContain('public')
    expect(sitemapResponse?.headers()['cache-control']).toContain(
      'max-age=3600'
    )
  })

  test('should have correct priority values in sitemap', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/sitemap.xml')
    const content = await response?.text()

    // Home pages should have highest priority (1.0)
    const homePageMatch = content.match(
      /<url>[\s\S]*?\/en<\/loc>[\s\S]*?<priority>(.*?)<\/priority>/
    )
    expect(homePageMatch?.[1]).toBe('1')

    // About pages should have high priority (0.8)
    const aboutPageMatch = content.match(
      /<url>[\s\S]*?\/en\/about<\/loc>[\s\S]*?<priority>(.*?)<\/priority>/
    )
    expect(aboutPageMatch?.[1]).toBe('0.8')

    // Legal pages should have medium priority (0.6)
    const legalPageMatch = content.match(
      /<url>[\s\S]*?\/en\/legal<\/loc>[\s\S]*?<priority>(.*?)<\/priority>/
    )
    expect(legalPageMatch?.[1]).toBe('0.6')
  })

  test('should have appropriate changefreq values', async ({ page }) => {
    const response = await page.goto('http://localhost:3001/sitemap.xml')
    const content = await response?.text()

    // Home pages should change daily
    expect(content).toMatch(
      /\/en<\/loc>[\s\S]*?<changefreq>daily<\/changefreq>/
    )

    // Legal pages should change monthly
    expect(content).toMatch(
      /\/en\/legal<\/loc>[\s\S]*?<changefreq>monthly<\/changefreq>/
    )
  })
})
