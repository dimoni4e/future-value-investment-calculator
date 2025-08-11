// Load environment variables for tests (use .env.local)
try {
  require('dotenv').config({ path: '.env.local' })
} catch {}

require('@testing-library/jest-dom')
// Add jest-axe accessibility matchers and global axe helper
try {
  const { axe, toHaveNoViolations } = require('jest-axe')
  // Extend expect with accessibility matcher
  expect.extend(toHaveNoViolations)
  // Provide global axe so tests can call axe(container)
  global.axe = axe
} catch (e) {
  // If jest-axe isn't installed yet, tests importing axe will fail; we'll install it in dev deps.
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'en',
}))

// Global test setup
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Polyfill TextEncoder/TextDecoder for libraries that expect them (e.g., Neon/Drizzle)
if (
  typeof global.TextEncoder === 'undefined' ||
  typeof global.TextDecoder === 'undefined'
) {
  const { TextEncoder, TextDecoder } = require('util')
  if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder
  }
  if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder
  }
}
