import { describe, it, expect } from 'vitest'
import { generateRandomSlug, validateSlug } from '../src/lib/security/slug-generator'
import { isReservedSlug } from '../src/lib/security/reserved-slugs'

describe('Slug Generator and Validator', () => {
  it('should generate random slug with specified length', () => {
    const slug6 = generateRandomSlug(6)
    const slug8 = generateRandomSlug(8)

    expect(slug6).toHaveLength(6)
    expect(slug8).toHaveLength(8)
    expect(slug6).toMatch(/^[a-zA-Z0-9]+$/)
  })

  it('should generate distinct random slugs', () => {
    const set = new Set<string>()
    for (let i = 0; i < 50; i++) {
      set.add(generateRandomSlug(6))
    }
    expect(set.size).toBe(50)
  })

  it('should validate valid custom aliases', () => {
    expect(validateSlug('summer-sale').isValid).toBe(true)
    expect(validateSlug('product_2026').isValid).toBe(true)
    expect(validateSlug('abc').isValid).toBe(true)
  })

  it('should reject slugs that are too short or too long', () => {
    expect(validateSlug('ab').isValid).toBe(false)
    expect(validateSlug('a'.repeat(51)).isValid).toBe(false)
  })

  it('should reject slugs containing invalid characters', () => {
    expect(validateSlug('hello world').isValid).toBe(false)
    expect(validateSlug('sale!').isValid).toBe(false)
    expect(validateSlug('product/details').isValid).toBe(false)
    expect(validateSlug('link@here').isValid).toBe(false)
  })

  it('should identify and block system reserved slugs', () => {
    expect(isReservedSlug('admin')).toBe(true)
    expect(isReservedSlug('ADMIN')).toBe(true)
    expect(isReservedSlug('api')).toBe(true)
    expect(isReservedSlug('dashboard')).toBe(true)
    expect(isReservedSlug('login')).toBe(true)
    expect(isReservedSlug('signup')).toBe(true)
    expect(isReservedSlug('tools')).toBe(true)
    expect(isReservedSlug('robots.txt')).toBe(true)
    expect(isReservedSlug('sitemap.xml')).toBe(true)

    // validateSlug should fail on reserved slugs
    const res = validateSlug('dashboard')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/reserved/i)
  })
})
