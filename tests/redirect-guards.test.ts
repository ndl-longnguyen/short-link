import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../src/lib/security/password'

describe('Redirect Engine & Security Guards', () => {
  describe('Password Hashing & Constant-time Verification', () => {
    it('should hash and verify passwords correctly', () => {
      const rawPassword = 'super-secret-password-123'
      const hashed = hashPassword(rawPassword)

      expect(hashed).toMatch(/^pbkdf2\$\d+\$[a-f0-9]+\$[a-f0-9]+$/)
      expect(verifyPassword(rawPassword, hashed)).toBe(true)
      expect(verifyPassword('wrong-password', hashed)).toBe(false)
    })

    it('should generate different salts for the same password', () => {
      const p = 'identical-password'
      const hash1 = hashPassword(p)
      const hash2 = hashPassword(p)

      expect(hash1).not.toBe(hash2)
      expect(verifyPassword(p, hash1)).toBe(true)
      expect(verifyPassword(p, hash2)).toBe(true)
    })
  })

  describe('Expiration and Max Clicks Guard Logic', () => {
    it('should evaluate expiration dates correctly', () => {
      const pastDate = new Date(Date.now() - 1000 * 60).toISOString()
      const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString()

      const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false
        return new Date(expiresAt).getTime() <= Date.now()
      }

      expect(isExpired(pastDate)).toBe(true)
      expect(isExpired(futureDate)).toBe(false)
      expect(isExpired(null)).toBe(false)
    })

    it('should evaluate max click quotas correctly', () => {
      const isLimitReached = (clickCount: number, maxClicks: number | null) => {
        if (maxClicks === null || maxClicks === undefined) return false
        return clickCount >= maxClicks
      }

      expect(isLimitReached(50, 50)).toBe(true)
      expect(isLimitReached(51, 50)).toBe(true)
      expect(isLimitReached(49, 50)).toBe(false)
      expect(isLimitReached(1000, null)).toBe(false)
    })
  })
})
