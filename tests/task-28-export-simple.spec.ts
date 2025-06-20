import { test, expect } from '@playwright/test'

test.describe('Task 28: PDF/CSV Export Edge Route', () => {
  test('CSV export works with default parameters', async ({ page }) => {
    const response = await page.goto(
      'http://localhost:3000/api/export?format=csv'
    )
    expect(response?.status()).toBe(200)

    const headers = response?.headers()
    expect(headers?.['content-type']).toBe('text/csv')
    expect(headers?.['content-disposition']).toContain('attachment')

    const content = await page.textContent('body')
    expect(content).toContain('Future Value Investment Calculator Export')
    expect(content).toContain('Initial Investment,10000')
    expect(content).toContain('Year-by-Year Breakdown')
  })

  test('PDF export works with default parameters', async ({ page }) => {
    const response = await page.goto(
      'http://localhost:3000/api/export?format=pdf'
    )
    expect(response?.status()).toBe(200)

    const headers = response?.headers()
    expect(headers?.['content-type']).toBe('application/pdf')
    expect(headers?.['content-disposition']).toContain('attachment')

    const content = await page.textContent('body')
    expect(content).toContain('Future Value Investment Calculator Report')
  })

  test('returns error for invalid format', async ({ page }) => {
    const response = await page.goto(
      'http://localhost:3000/api/export?format=invalid'
    )
    expect(response?.status()).toBe(400)

    const content = await page.textContent('body')
    expect(content).toContain('Invalid format. Use csv or pdf.')
  })

  test('CSV export works with custom parameters', async ({ page }) => {
    const response = await page.goto(
      'http://localhost:3000/api/export?format=csv&initial=5000&monthly=1000'
    )
    expect(response?.status()).toBe(200)

    const content = await page.textContent('body')
    expect(content).toContain('Initial Investment,5000')
    expect(content).toContain('Monthly Contribution,1000')
  })

  test('defaults to CSV when no format specified', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/api/export')
    expect(response?.status()).toBe(200)

    const headers = response?.headers()
    expect(headers?.['content-type']).toBe('text/csv')
  })
})
