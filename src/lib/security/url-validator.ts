/**
 * URL Security Validator
 * Blocks SSRF, private/internal IP ranges, malicious protocols, and dangerous destinations.
 */

// Known hardcoded dangerous domains/patterns
const DEFAULT_BLOCKED_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  'grabify.link',
  'iplogger.org',
  '2no.co',
])

export interface URLValidationResult {
  isValid: boolean
  error?: string
  normalizedUrl?: string
}

/**
 * Checks if an IP string is an IPv4 address in private/internal or reserved ranges.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return false
  }

  const [a, b] = parts

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true
  // 10.0.0.0/8 (Private network)
  if (a === 10) return true
  // 172.16.0.0/12 (Private network: 172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true
  // 192.168.0.0/16 (Private network)
  if (a === 192 && b === 168) return true
  // 169.254.0.0/16 (Link-local)
  if (a === 169 && b === 254) return true
  // 0.0.0.0/8 (Current network)
  if (a === 0) return true

  return false
}

/**
 * Checks if an IPv6 string is private, loopback, or link-local.
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '')
  if (normalized === '::1' || normalized === '::') return true
  // Link-local: fe80::/10
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true
  // Unique local address: fc00::/7 (fc00 - fdff)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true
  return false
}

/**
 * Validates a destination URL against security rules.
 */
export function validateDestinationUrl(
  inputUrl: string,
  extraBlockedDomains: string[] = []
): URLValidationResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { isValid: false, error: 'URL cannot be empty' }
  }

  const trimmed = inputUrl.trim()

  if (trimmed.length > 2048) {
    return { isValid: false, error: 'URL exceeds maximum length of 2048 characters' }
  }

  // Prevent dangerous protocol schemes
  const lowerTrimmed = trimmed.toLowerCase()
  if (
    lowerTrimmed.startsWith('javascript:') ||
    lowerTrimmed.startsWith('data:') ||
    lowerTrimmed.startsWith('file:') ||
    lowerTrimmed.startsWith('vbscript:') ||
    lowerTrimmed.startsWith('blob:')
  ) {
    return { isValid: false, error: 'Protocol not allowed. Only HTTP and HTTPS are permitted' }
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { isValid: false, error: 'Malformed URL format' }
  }

  // Strictly enforce http: or https:
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, error: 'Only http:// and https:// URLs are supported' }
  }

  const hostname = parsed.hostname.toLowerCase()

  // Disallow empty hostnames
  if (!hostname) {
    return { isValid: false, error: 'Invalid URL hostname' }
  }

  // Prevent infinite redirect loops (cannot shorten this platform itself)
  if (hostname === 'ndllink.vercel.app' || hostname.endsWith('.ndllink.vercel.app')) {
    return { isValid: false, error: 'Cannot create short links that redirect to this service itself' }
  }

  // Check default blocked hosts
  if (DEFAULT_BLOCKED_HOSTS.has(hostname)) {
    return { isValid: false, error: 'Destination hostname is blocked' }
  }

  // Check custom blocked domains
  for (const blocked of extraBlockedDomains) {
    const b = blocked.toLowerCase().trim()
    if (hostname === b || hostname.endsWith(`.${b}`)) {
      return { isValid: false, error: `Domain ${blocked} is blocked by safety policy` }
    }
  }

  // Check private IPv4
  if (isPrivateIPv4(hostname)) {
    return { isValid: false, error: 'Private and internal IP addresses are prohibited' }
  }

  // Check private IPv6
  if (isPrivateIPv6(hostname)) {
    return { isValid: false, error: 'Private and internal IPv6 addresses are prohibited' }
  }

  // Check for common local / internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { isValid: false, error: 'Internal hostnames cannot be used as destinations' }
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
  }
}
