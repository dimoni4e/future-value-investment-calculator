# Test info

- Name: Calculator Flow Integration >> form validation prevents submission with invalid data
- Location: /Users/reshtei/work/Vibe projects/Future Value Investment Calculator/future-value-app/tests/calculator-flow.spec.ts:88:7

# Error details

```
Error: page.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('[data-testid="time-horizon-input"]')

    at /Users/reshtei/work/Vibe projects/Future Value Investment Calculator/future-value-app/tests/calculator-flow.spec.ts:92:16
```

# Test source

```ts
   1 | /**
   2 |  * Integration tests for calculator flow
   3 |  * Tests complete flow: form submission → loading → redirect to scenario page
   4 |  */
   5 | import { test, expect } from '@playwright/test'
   6 |
   7 | test.describe('Calculator Flow Integration', () => {
   8 |   test.beforeEach(async ({ page }) => {
   9 |     await page.goto('/')
   10 |   })
   11 |
   12 |   test('complete flow: form submission → loading → redirect to scenario page', async ({
   13 |     page,
   14 |   }) => {
   15 |     // Fill out the calculator form
   16 |     await page.fill('[data-testid="initial-amount-input"]', '15000')
   17 |     await page.fill('[data-testid="monthly-contribution-input"]', '750')
   18 |     await page.fill('[data-testid="annual-return-input"]', '8')
   19 |     await page.fill('[data-testid="time-horizon-input"]', '25')
   20 |
   21 |     // Click calculate button
   22 |     const calculateButton = page.getByRole('button', { name: /calculate/i })
   23 |     await calculateButton.click()
   24 |
   25 |     // Verify loading state appears
   26 |     await expect(page.getByText(/generating.*scenario/i)).toBeVisible()
   27 |     await expect(calculateButton).toBeDisabled()
   28 |
   29 |     // Wait for redirect to scenario page
   30 |     await page.waitForURL(/\/scenario\/.*/)
   31 |
   32 |     // Verify we're on a scenario page with correct slug pattern
   33 |     const url = page.url()
   34 |     expect(url).toMatch(
   35 |       /\/scenario\/invest-\d+-monthly-\d+-\d+percent-\d+years-\w+/
   36 |     )
   37 |   })
   38 |
   39 |   test('handles various parameter combinations correctly', async ({ page }) => {
   40 |     const testCases = [
   41 |       { initial: '5000', monthly: '250', rate: '6', years: '15' },
   42 |       { initial: '50000', monthly: '2000', rate: '10', years: '30' },
   43 |       { initial: '1000', monthly: '100', rate: '5', years: '10' },
   44 |     ]
   45 |
   46 |     for (const testCase of testCases) {
   47 |       await page.goto('/')
   48 |
   49 |       await page.fill('[data-testid="initial-amount-input"]', testCase.initial)
   50 |       await page.fill(
   51 |         '[data-testid="monthly-contribution-input"]',
   52 |         testCase.monthly
   53 |       )
   54 |       await page.fill('[data-testid="annual-return-input"]', testCase.rate)
   55 |       await page.fill('[data-testid="time-horizon-input"]', testCase.years)
   56 |
   57 |       await page.getByRole('button', { name: /calculate/i }).click()
   58 |
   59 |       // Wait for redirect
   60 |       await page.waitForURL(/\/scenario\/.*/)
   61 |
   62 |       // Verify URL contains expected parameters
   63 |       const url = page.url()
   64 |       expect(url).toContain(`invest-${testCase.initial}`)
   65 |       expect(url).toContain(`monthly-${testCase.monthly}`)
   66 |       expect(url).toContain(`${testCase.rate}percent`)
   67 |       expect(url).toContain(`${testCase.years}years`)
   68 |     }
   69 |   })
   70 |
   71 |   test('error handling for invalid parameters', async ({ page }) => {
   72 |     // Test negative initial amount
   73 |     await page.fill('[data-testid="initial-amount-input"]', '-1000')
   74 |     await page.fill('[data-testid="monthly-contribution-input"]', '500')
   75 |     await page.fill('[data-testid="annual-return-input"]', '7')
   76 |     await page.fill('[data-testid="time-horizon-input"]', '20')
   77 |
   78 |     const calculateButton = page.getByRole('button', { name: /calculate/i })
   79 |     await calculateButton.click()
   80 |
   81 |     // Should show validation error and not redirect
   82 |     await expect(page.getByText(/cannot be negative/i)).toBeVisible()
   83 |
   84 |     // Verify we're still on the same page (no redirect occurred)
   85 |     await expect(page).toHaveURL('/')
   86 |   })
   87 |
   88 |   test('form validation prevents submission with invalid data', async ({
   89 |     page,
   90 |   }) => {
   91 |     // Test with zero time horizon
>  92 |     await page.fill('[data-testid="time-horizon-input"]', '0')
      |                ^ Error: page.fill: Target page, context or browser has been closed
   93 |
   94 |     const calculateButton = page.getByRole('button', { name: /calculate/i })
   95 |     await calculateButton.click()
   96 |
   97 |     // Should show validation message
   98 |     await expect(
   99 |       page.getByText(/time horizon must be at least 1 year/i)
  100 |     ).toBeVisible()
  101 |
  102 |     // Button should not trigger navigation
  103 |     await expect(page).toHaveURL('/')
  104 |   })
  105 |
  106 |   test('loading state is accessible', async ({ page }) => {
  107 |     await page.fill('[data-testid="initial-amount-input"]', '10000')
  108 |     await page.fill('[data-testid="monthly-contribution-input"]', '500')
  109 |     await page.fill('[data-testid="annual-return-input"]', '7')
  110 |     await page.fill('[data-testid="time-horizon-input"]', '20')
  111 |
  112 |     const calculateButton = page.getByRole('button', { name: /calculate/i })
  113 |     await calculateButton.click()
  114 |
  115 |     // Check that loading message is accessible
  116 |     const loadingMessage = page.getByText(/generating.*scenario/i)
  117 |     await expect(loadingMessage).toBeVisible()
  118 |
  119 |     // Verify button is properly disabled for screen readers
  120 |     await expect(calculateButton).toHaveAttribute('disabled')
  121 |   })
  122 | })
  123 |
```
