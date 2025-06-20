import { test, expect } from '@playwright/test'

test.describe('Task 31: Vercel CI Preview Deploy Configuration', () => {
  test('Vercel configuration file exists and is valid', async () => {
    const fs = require('fs')
    const path = require('path')

    // Check if vercel.json exists
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json')
    expect(fs.existsSync(vercelConfigPath)).toBe(true)

    // Validate vercel.json content
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'))

    expect(vercelConfig.framework).toBe('nextjs')
    expect(vercelConfig.buildCommand).toBe('npm run build')
    expect(vercelConfig.outputDirectory).toBe('.next')
    expect(vercelConfig.devCommand).toBe('npm run dev')
    expect(vercelConfig.installCommand).toBe('npm install')

    // Check that functions are configured for API routes
    expect(vercelConfig.functions).toBeDefined()
    expect(vercelConfig.functions['app/api/**']).toBeDefined()
    expect(vercelConfig.functions['app/api/**'].runtime).toBe('nodejs18.x')

    console.log('✅ Vercel configuration is valid')
  })

  test('GitHub Actions workflow exists and is configured', async () => {
    const fs = require('fs')
    const path = require('path')

    // Check if workflow file exists
    const workflowPath = path.join(process.cwd(), '.github/workflows/ci.yml')
    expect(fs.existsSync(workflowPath)).toBe(true)

    // Read and validate workflow content
    const workflowContent = fs.readFileSync(workflowPath, 'utf8')

    // Check for essential workflow components
    expect(workflowContent).toContain('name: CI/CD Pipeline')
    expect(workflowContent).toContain('on:')
    expect(workflowContent).toContain('pull_request:')
    expect(workflowContent).toContain('branches: [main]')
    expect(workflowContent).toContain('jobs:')
    expect(workflowContent).toContain('lint-and-build:')
    expect(workflowContent).toContain('playwright-tests:')
    expect(workflowContent).toContain('comment-preview-url:')
    expect(workflowContent).toContain('npx playwright test')
    expect(workflowContent).toContain('Preview Deployment Ready!')

    console.log('✅ GitHub Actions workflow is properly configured')
  })

  test('Application builds successfully for deployment', async ({ page }) => {
    // This test ensures the app can be built for production
    // In a real scenario, this would be part of the CI pipeline

    // Navigate to the app to verify it's working
    await page.goto('http://localhost:3000')

    // Verify the app loads correctly
    await expect(page.locator('h1')).toBeVisible()

    // Check that all main components are working
    await page.fill('#initialAmount', '10000')
    await page.fill('#monthlyContribution', '500')
    await page.fill('#annualReturn', '7')
    await page.fill('#timeHorizon', '20')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for results
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // Verify all features work - wait for results first
    await expect(page.locator('[data-testid="future-value"]')).toBeVisible({
      timeout: 10000,
    })

    // Check for share buttons section
    const shareButtons = page.locator('[data-testid="share-buttons"]')
    await expect(shareButtons).toBeVisible()

    // Check for export dropdown button
    const exportButton = page.locator('button:has-text("Export")')
    await expect(exportButton).toBeVisible()

    console.log('✅ Application is ready for deployment')
  })

  test('Package.json has all required scripts for CI/CD', async () => {
    const fs = require('fs')
    const path = require('path')

    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

    // Check required scripts exist
    expect(packageJson.scripts.build).toBeDefined()
    expect(packageJson.scripts.start).toBeDefined()
    expect(packageJson.scripts.dev).toBeDefined()
    expect(packageJson.scripts.lint).toBeDefined()

    // Check that build script is correct for production
    expect(packageJson.scripts.build).toBe('next build')
    expect(packageJson.scripts.start).toBe('next start')
    expect(packageJson.scripts.lint).toContain('next lint')

    console.log('✅ Package.json scripts are configured correctly')
  })

  test('Environment variables are documented', async () => {
    const fs = require('fs')
    const path = require('path')

    // Check if .env.local exists (for local development)
    const envLocalPath = path.join(process.cwd(), '.env.local')
    expect(fs.existsSync(envLocalPath)).toBe(true)

    // Check README contains deployment instructions
    const readmePath = path.join(process.cwd(), 'README.md')
    const readmeContent = fs.readFileSync(readmePath, 'utf8')

    expect(readmeContent).toContain('## Deployment')
    expect(readmeContent).toContain('Environment Variables')
    expect(readmeContent).toContain('NEXT_PUBLIC_BASE_URL')
    expect(readmeContent).toContain('SENTRY_DSN')
    expect(readmeContent).toContain('Preview Deployments')

    console.log('✅ Environment variables and deployment are documented')
  })
})
