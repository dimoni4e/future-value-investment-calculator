import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate URL with proper locale handling
 * English uses main domain, other locales use path prefix
 */
export function generateUrl(path: string, locale: string = 'en'): string {
  if (locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}
