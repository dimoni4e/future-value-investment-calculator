import { test, expect } from '@playwright/test'

test.describe('Task 23: /api/share edge route (OG tags)', () => {
  test('should return HTML with basic meta tags when no parameters', async ({
    request,
  }) => {
    const response = await request.get('/api/share')

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')

    const html = await response.text()

    // Check basic HTML structure
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain(
      '<title>Financial Growth Planner - Plan Your Financial Future</title>'
    )

    // Check basic meta tags
    expect(html).toContain(
      '<meta name="description" content="Advanced financial growth planning platform'
    )
    expect(html).toContain('<meta property="og:type" content="website">')
    expect(html).toContain(
      '<meta property="og:title" content="Financial Growth Planner">'
    )
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image">'
    )

    // Check redirect script
    expect(html).toContain("window.location.href = '/';")
  })

  test('should return HTML with dynamic meta tags when parameters provided', async ({
    request,
  }) => {
    const params = new URLSearchParams({
      initial: '10000',
      monthly: '500',
      return: '7',
      years: '10',
    })

    const response = await request.get(`/api/share?${params.toString()}`)

    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')

    const html = await response.text()

    // Check dynamic content based on parameters
    expect(html).toContain('$10,000') // Initial amount
    expect(html).toContain('$500') // Monthly contribution
    expect(html).toContain('7%') // Return rate
    expect(html).toContain('10 years') // Time horizon

    // Check Open Graph tags
    expect(html).toContain('<meta property="og:type" content="website">')
    expect(html).toContain('<meta property="og:title"')
    expect(html).toContain('<meta property="og:description"')
    expect(html).toContain('<meta property="og:url"')

    // Check Twitter Card tags
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image">'
    )
    expect(html).toContain('<meta name="twitter:title"')
    expect(html).toContain('<meta name="twitter:description"')

    // Check structured data
    expect(html).toContain('<script type="application/ld+json">')
    expect(html).toContain('"@context": "https://schema.org"')
    expect(html).toContain('"@type": "WebApplication"')

    // Check canonical URL
    expect(html).toContain('<link rel="canonical"')

    // Check redirect with parameters
    expect(html).toContain(`window.location.href = '/?${params.toString()}';`)
  })

  test('should handle invalid parameters gracefully', async ({ request }) => {
    const params = new URLSearchParams({
      initial: 'invalid',
      monthly: 'bad',
      return: 'wrong',
      years: 'error',
    })

    const response = await request.get(`/api/share?${params.toString()}`)

    // Should still return 200 with fallback handling
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')

    const html = await response.text()
    expect(html).toContain('<!DOCTYPE html>')
  })

  test('should include proper cache headers', async ({ request }) => {
    const response = await request.get('/api/share')

    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control']).toContain('public')
    expect(response.headers()['x-frame-options']).toBe('SAMEORIGIN')
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
  })

  test('should generate different meta content for different parameters', async ({
    request,
  }) => {
    // Test case 1: Small investment
    const params1 = new URLSearchParams({
      initial: '1000',
      monthly: '100',
      return: '5',
      years: '5',
    })

    const response1 = await request.get(`/api/share?${params1.toString()}`)
    const html1 = await response1.text()

    // Test case 2: Large investment
    const params2 = new URLSearchParams({
      initial: '100000',
      monthly: '2000',
      return: '10',
      years: '20',
    })

    const response2 = await request.get(`/api/share?${params2.toString()}`)
    const html2 = await response2.text()

    // The HTML content should be different
    expect(html1).not.toBe(html2)

    // Check that different values appear in the content
    expect(html1).toContain('$1,000')
    expect(html2).toContain('$100,000')
    expect(html1).toContain('5%')
    expect(html2).toContain('10%')
  })

  test('should include favicon and theme color', async ({ request }) => {
    const response = await request.get('/api/share')
    const html = await response.text()

    expect(html).toContain('<link rel="icon" href="/favicon.ico">')
    expect(html).toContain('<meta name="theme-color" content="#3B82F6">')
  })
})
