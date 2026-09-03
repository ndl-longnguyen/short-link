/**
 * Centralized list of reserved slugs that cannot be claimed as custom aliases.
 * Protects Next.js application routes, system endpoints, API paths, and standard static assets.
 */
export const RESERVED_SLUGS = new Set([
  // Core application routes
  'admin',
  'api',
  'app',
  'dashboard',
  'login',
  'logout',
  'register',
  'signup',
  'auth',
  'settings',
  'account',
  'pricing',
  'help',
  'about',
  'terms',
  'privacy',
  'contact',
  'status',
  'report',
  'verify-password',
  'error',

  // Locales
  'en',
  'vi',

  // Tools & features
  'tools',
  'tool',
  'qr',
  'qr-code',
  'analytics',
  'utm',
  'shorten',
  'links',
  'p',
  'u',
  'r',

  // Static files and system assets
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'assets',
  'static',
  '_next',
  '.well-known',
])

/**
 * Checks if a given slug is reserved.
 * Case-insensitive comparison and trimmed.
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return true
  const normalized = slug.trim().toLowerCase()
  return RESERVED_SLUGS.has(normalized)
}
