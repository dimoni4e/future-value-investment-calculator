import { test, expect } from '@playwright/test'

test.describe('Task #10: i18n Configuration (next-intl)', () => {
  test('Polish route (/pl) renders Polish static text', async ({ page }) => {
    // Navigate to Polish locale
    await page.goto('/pl')

    // Check that Polish text is rendered
    await expect(
      page.locator('text=Kalkulator Wartości Przyszłej Inwestycji')
    ).toBeVisible()
    await expect(page.locator('h1')).toContainText(
      'Zaplanuj Swoją Przyszłość Finansową'
    )

    // Check navigation in Polish
    await expect(page.locator('text=Strona główna')).toBeVisible()
    await expect(page.locator('nav').locator('text=O nas')).toBeVisible()
    await expect(page.locator('nav').locator('text=Kontakt')).toBeVisible()

    // Check footer in Polish
    await expect(page.locator('text=Wszelkie prawa zastrzeżone')).toBeVisible()

    // Verify HTML lang attribute is set to Polish
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('pl')
  })

  test('English route (/) renders English static text', async ({ page }) => {
    // Navigate to English locale (main page)
    await page.goto('/')

    // Check that English text is rendered
    await expect(
      page.locator('text=Future Value Investment Calculator')
    ).toBeVisible()
    await expect(page.locator('h1')).toContainText('Plan Your Financial Future')

    // Check navigation in English
    await expect(page.locator('text=Home')).toBeVisible()
    await expect(page.locator('nav').locator('text=About')).toBeVisible()
    await expect(page.locator('nav').locator('text=Contact')).toBeVisible()

    // Check footer in English
    await expect(page.locator('text=All rights reserved')).toBeVisible()

    // Verify HTML lang attribute is set to English
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('en')
  })

  test('Spanish route (/es) renders Spanish static text', async ({ page }) => {
    // Navigate to Spanish locale
    await page.goto('/es')

    // Check that Spanish text is rendered
    await expect(
      page.locator('text=Calculadora de Valor Futuro de Inversión')
    ).toBeVisible()
    await expect(page.locator('h1').locator('span')).toContainText(
      'Planifica Tu Futuro Financiero'
    )

    // Check navigation in Spanish
    await expect(page.locator('text=Inicio')).toBeVisible()
    await expect(page.locator('nav').locator('text=Acerca de')).toBeVisible()
    await expect(page.locator('nav').locator('text=Contacto')).toBeVisible()

    // Check footer in Spanish
    await expect(
      page.locator('text=Todos los derechos reservados')
    ).toBeVisible()

    // Verify HTML lang attribute is set to Spanish
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('es')
  })
})
