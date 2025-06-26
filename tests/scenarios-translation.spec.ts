import { test, expect } from '@playwright/test'

test.describe('Scenarios Page Translations', () => {
  test('should display Spanish translations correctly', async ({ page }) => {
    await page.goto('/es/scenario')

    // Check the main title is translated
    await expect(
      page.locator('h1').filter({
        hasText: 'Explora Estrategias de Inversión',
      })
    ).toBeVisible()

    // Check statistics labels are translated
    await expect(page.getByText('Escenarios de Expertos')).toBeVisible()
    await expect(page.getByText('Creados por Usuarios')).toBeVisible()
    await expect(page.getByText('Escenarios Totales')).toBeVisible()
    await expect(page.getByText('Idiomas')).toBeVisible()

    // Check category cards are translated
    await expect(page.getByText('Estrategias Conservadoras')).toBeVisible()
    await expect(page.getByText('Crecimiento Moderado')).toBeVisible()
    await expect(page.getByText('Crecimiento Agresivo')).toBeVisible()
    await expect(page.getByText('Planes a Corto Plazo')).toBeVisible()
    await expect(page.getByText('Planificación de Jubilación')).toBeVisible()
    await expect(page.getByText('Todos los Escenarios')).toBeVisible()

    // Check category descriptions are translated
    await expect(
      page.getByText(
        'Planes de bajo riesgo y crecimiento constante para preservar el capital'
      )
    ).toBeVisible()

    // Check CTA section is translated
    await expect(
      page.getByText('¿Listo para Crear Tu Propio Escenario?')
    ).toBeVisible()
    await expect(page.getByText('Comenzar a Calcular')).toBeVisible()
  })

  test('should display Polish translations correctly', async ({ page }) => {
    await page.goto('/pl/scenario')

    // Check the main title is translated
    await expect(
      page.locator('h1').filter({
        hasText: 'Odkryj Strategie Inwestycyjne',
      })
    ).toBeVisible()

    // Check statistics labels are translated
    await expect(page.getByText('Scenariusze Ekspertów')).toBeVisible()
    await expect(page.getByText('Stworzone przez Użytkowników')).toBeVisible()
    await expect(page.getByText('Wszystkie Scenariusze')).toBeVisible()
    await expect(page.getByText('Języki')).toBeVisible()

    // Check category cards are translated
    await expect(page.getByText('Strategie Konserwatywne')).toBeVisible()
    await expect(page.getByText('Wzrost Umiarkowany')).toBeVisible()
    await expect(page.getByText('Wzrost Agresywny')).toBeVisible()
    await expect(page.getByText('Plany Krótkoterminowe')).toBeVisible()
    await expect(page.getByText('Planowanie Emerytury')).toBeVisible()

    // Check category descriptions are translated
    await expect(
      page.getByText(
        'Plany niskiego ryzyka i stałego wzrostu dla zachowania kapitału'
      )
    ).toBeVisible()

    // Check CTA section is translated
    await expect(
      page.getByText('Gotowy na Stworzenie Własnego Scenariusza?')
    ).toBeVisible()
    await expect(page.getByText('Zacznij Liczyć')).toBeVisible()
  })

  test('should display English translations correctly', async ({ page }) => {
    await page.goto('/en/scenario')

    // Check the main title is in English
    await expect(
      page.locator('h1').filter({
        hasText: 'Explore Investment Strategies',
      })
    ).toBeVisible()

    // Check statistics labels are in English
    await expect(page.getByText('Expert Scenarios')).toBeVisible()
    await expect(page.getByText('User Created')).toBeVisible()
    await expect(page.getByText('Total Scenarios')).toBeVisible()
    await expect(page.getByText('Languages')).toBeVisible()

    // Check category cards are in English
    await expect(page.getByText('Conservative Strategies')).toBeVisible()
    await expect(page.getByText('Moderate Growth')).toBeVisible()
    await expect(page.getByText('Aggressive Growth')).toBeVisible()
    await expect(page.getByText('Short-term Plans')).toBeVisible()
    await expect(page.getByText('Retirement Planning')).toBeVisible()
    await expect(page.getByText('All Scenarios')).toBeVisible()

    // Check CTA section is in English
    await expect(
      page.getByText('Ready to Create Your Own Scenario?')
    ).toBeVisible()
    await expect(page.getByText('Start Calculating')).toBeVisible()
  })

  test('should have translated scenario card labels', async ({ page }) => {
    // Test Spanish scenario card labels
    await page.goto('/es/scenario')
    await expect(page.getByText('Inicial').first()).toBeVisible()
    await expect(page.getByText('Mensual').first()).toBeVisible()
    await expect(page.getByText('Retorno').first()).toBeVisible()
    await expect(page.getByText('Años').first()).toBeVisible()
    await expect(page.getByText('Resultado Proyectado').first()).toBeVisible()

    // Test Polish scenario card labels
    await page.goto('/pl/scenario')
    await expect(page.getByText('Początkowy').first()).toBeVisible()
    await expect(page.getByText('Miesięczny').first()).toBeVisible()
    await expect(page.getByText('Zwrot').first()).toBeVisible()
    await expect(page.getByText('Lata').first()).toBeVisible()
    await expect(page.getByText('Przewidywany Wynik').first()).toBeVisible()
  })
})
