import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^.*app/api/scenarios/generate/route$':
      '<rootDir>/app/api/scenarios/generate/route.ts',
    '^next-intl/server$': '<rootDir>/__mocks__/next-intl-server-mock.ts',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/__tests__/performance/web-vitals.test.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!(next-intl)/)'],
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(js|jsx|mjs)$': [
      'babel-jest',
      { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] },
    ],
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
        },
      },
    ],
  },
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
}

export default config
