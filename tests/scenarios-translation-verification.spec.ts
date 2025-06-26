import { test, expect } from '@playwright/test'

test.describe('Scenarios Page Translation Verification', () => {
  test('should display correct Spanish translations', async ({ page }) => {
    await page.goto('/es/scenario')

    // Check key translated elements
    await expect(
      page.getByText('Biblioteca de Escenarios de Inversión')
    ).toBeVisible()
    await expect(
      page.getByText('Explora Estrategias de Inversión')
    ).toBeVisible()
    await expect(page.getByText('Navegar por Categoría')).toBeVisible()
    await expect(page.getByText('Estrategias Conservadoras')).toBeVisible()
    await expect(page.getByText('Crecimiento Moderado')).toBeVisible()
    await expect(page.getByText('Escenarios de Expertos')).toBeVisible()
    await expect(
      page.getByText('¿Listo para Crear Tu Propio Escenario?')
    ).toBeVisible()
  })

  test('should display correct Polish translations', async ({ page }) => {
    await page.goto('/pl/scenario')

    // Check key translated elements
    await expect(
      page.getByText('Biblioteka Scenariuszy Inwestycyjnych')
    ).toBeVisible()
    await expect(page.getByText('Odkryj Strategie Inwestycyjne')).toBeVisible()
    await expect(page.getByText('Przeglądaj według Kategorii')).toBeVisible()
    await expect(page.getByText('Strategie Konserwatywne')).toBeVisible()
    await expect(page.getByText('Wzrost Umiarkowany')).toBeVisible()
    await expect(page.getByText('Scenariusze Ekspertów')).toBeVisible()
    await expect(
      page.getByText('Gotowy na Stworzenie Własnego Scenariusza?')
    ).toBeVisible()
  })

  test('should display correct English content', async ({ page }) => {
    await page.goto('/en/scenario')

    // Check key English elements
    await expect(page.getByText('Investment Scenarios Library')).toBeVisible()
    await expect(page.getByText('Explore Investment Strategies')).toBeVisible()
    await expect(page.getByText('Browse by Category')).toBeVisible()
    await expect(page.getByText('Conservative Strategies')).toBeVisible()
    await expect(page.getByText('Moderate Growth')).toBeVisible()
    await expect(page.getByText('Expert Scenarios')).toBeVisible()
    await expect(
      page.getByText('Ready to Create Your Own Scenario?')
    ).toBeVisible()
  })
})
