// Global type definitions for Jest environment
// Provide axe on the global scope used in accessibility tests
import type { AxeBuilder } from 'jest-axe'

declare global {
  // eslint-disable-next-line no-var
  var axe: typeof import('jest-axe').axe
}

export {}
