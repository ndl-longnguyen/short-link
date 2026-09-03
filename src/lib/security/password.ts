import crypto from 'crypto'

const ITERATIONS = 100000
const KEY_LEN = 32
const DIGEST = 'sha256'

/**
 * Hashes a plaintext password using PBKDF2 with a unique cryptographically random salt.
 * Returns formatted string: pbkdf2$<iterations>$<saltHex>$<hashHex>
 */
export function hashPassword(password: string): string {
  if (!password) {
    throw new Error('Password cannot be empty')
  }

  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST)
  return `pbkdf2$${ITERATIONS}$${salt}$${derivedKey.toString('hex')}`
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash.
 * Constant-time comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false
  }

  try {
    const parts = storedHash.split('$')
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false
    }

    const iterations = parseInt(parts[1], 10)
    const salt = parts[2]
    const originalHash = parts[3]

    if (isNaN(iterations) || !salt || !originalHash) {
      return false
    }

    const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST)
    const derivedHash = derivedKey.toString('hex')

    // Constant-time buffer comparison
    const a = Buffer.from(derivedHash, 'hex')
    const b = Buffer.from(originalHash, 'hex')

    if (a.length !== b.length) {
      return false
    }

    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}
