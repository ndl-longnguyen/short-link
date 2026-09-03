import crypto from 'crypto'
import { isReservedSlug } from './reserved-slugs'

// Non-confusing, secure base62 characters (numbers, lowercase, uppercase)
const ALPHABET = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
const ALPHABET_LEN = ALPHABET.length

/**
 * Generates a cryptographically random, non-sequential short slug.
 * Default length is 6 characters (~30 billion combinations).
 */
export function generateRandomSlug(length: number = 6): string {
  const bytes = crypto.randomBytes(length * 2)
  let result = ''
  for (let i = 0; i < bytes.length && result.length < length; i++) {
    const index = bytes[i] % ALPHABET_LEN
    result += ALPHABET[index]
  }
  return result
}

export interface SlugValidationResult {
  isValid: boolean
  error?: string
  normalizedSlug?: string
}

/**
 * Validates a custom or generated slug.
 * Rules:
 * - Length between 3 and 50 characters
 * - Only alphanumeric, hyphen, and underscore characters
 * - Not in the reserved slugs list
 */
export function validateSlug(rawSlug: string): SlugValidationResult {
  if (!rawSlug || typeof rawSlug !== 'string') {
    return { isValid: false, error: 'Slug cannot be empty' }
  }

  const slug = rawSlug.trim()

  if (slug.length < 3) {
    return { isValid: false, error: 'Slug must be at least 3 characters' }
  }

  if (slug.length > 50) {
    return { isValid: false, error: 'Slug cannot exceed 50 characters' }
  }

  const slugRegex = /^[a-zA-Z0-9_-]+$/
  if (!slugRegex.test(slug)) {
    return {
      isValid: false,
      error: 'Slug can only contain letters, numbers, hyphens (-), and underscores (_)',
    }
  }

  if (isReservedSlug(slug)) {
    return {
      isValid: false,
      error: `The alias "${slug}" is reserved for system routes`,
    }
  }

  return {
    isValid: true,
    normalizedSlug: slug,
  }
}
