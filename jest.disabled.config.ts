import type { Config } from 'jest'

// Disabled Jest config: matches no tests and passes when none are found.
const config: Config = {
  passWithNoTests: true,
  testMatch: ['**/__tests__/__disabled__/*.test.ts'],
}

export default config
