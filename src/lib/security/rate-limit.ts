import { RateLimitResult } from '@/types'

interface RateLimitRecord {
  timestamps: number[]
}

// In-memory sliding window cache for rate limiting
const store = new Map<string, RateLimitRecord>()

// Clean up stale records periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  const cutoff = now - windowMs
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter(ts => ts > cutoff)
    if (record.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

/**
 * Checks and records an action under a sliding-window rate limiter.
 *
 * @param key Unique identifier (e.g. `shorten:203.0.113.195` or `report:203.0.113.195`)
 * @param limit Maximum allowed requests within the window
 * @param windowSeconds Window duration in seconds
 */
export function rateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  cleanup(windowMs)

  const record = store.get(key) || { timestamps: [] }
  const cutoff = now - windowMs

  // Keep only timestamps within the current sliding window
  const validTimestamps = record.timestamps.filter(ts => ts > cutoff)

  if (validTimestamps.length >= limit) {
    const oldestTimestamp = validTimestamps[0]
    const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000))
    return {
      success: false,
      remaining: 0,
      resetInSeconds,
    }
  }

  validTimestamps.push(now)
  store.set(key, { timestamps: validTimestamps })

  return {
    success: true,
    remaining: limit - validTimestamps.length,
    resetInSeconds: windowSeconds,
  }
}

/**
 * Extracts a client identifier (IP address) from request headers.
 */
export function getClientIp(headers: Headers): string {
  const xForwardedFor = headers.get('x-forwarded-for')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  const cfConnectingIp = headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }
  return '127.0.0.1'
}
