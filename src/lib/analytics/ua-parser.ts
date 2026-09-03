/**
 * Lightweight, privacy-first User-Agent and Request Header parser
 * Extracts device type, browser, OS, and country without storing PII.
 */

export interface ParsedClientInfo {
  country: string | null
  city: string | null
  device: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown'
  browser: string
  os: string
  referrer: string | null
}

export function parseClientInfo(headers: Headers): ParsedClientInfo {
  // 1. Geolocation (provided securely by Vercel or Cloudflare headers)
  const country =
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    null

  const city =
    headers.get('x-vercel-ip-city') ||
    null

  // 2. Referrer
  const rawReferrer = headers.get('referer') || headers.get('referrer') || null
  let referrer: string | null = null
  if (rawReferrer) {
    try {
      const parsed = new URL(rawReferrer)
      // Extract hostname only for privacy
      referrer = parsed.hostname.replace(/^www\./, '')
    } catch {
      referrer = null
    }
  }

  // 3. User Agent
  const ua = headers.get('user-agent') || ''
  const lowerUa = ua.toLowerCase()

  // Detect bots
  if (/bot|crawler|spider|crawling|curl|wget|slurp|headless/i.test(lowerUa)) {
    return {
      country,
      city,
      device: 'Bot',
      browser: 'Bot / Crawler',
      os: 'Other',
      referrer,
    }
  }

  // Detect Device
  let device: ParsedClientInfo['device'] = 'Desktop'
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lowerUa)) {
    device = 'Tablet'
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(lowerUa)) {
    device = 'Mobile'
  }

  // Detect Browser
  let browser = 'Other'
  if (lowerUa.includes('edg/')) {
    browser = 'Microsoft Edge'
  } else if (lowerUa.includes('chrome/') && !lowerUa.includes('edg/')) {
    browser = 'Google Chrome'
  } else if (lowerUa.includes('safari/') && !lowerUa.includes('chrome/')) {
    browser = 'Apple Safari'
  } else if (lowerUa.includes('firefox/')) {
    browser = 'Mozilla Firefox'
  } else if (lowerUa.includes('opr/') || lowerUa.includes('opera/')) {
    browser = 'Opera'
  }

  // Detect OS
  let os = 'Other'
  if (lowerUa.includes('windows nt 10.0') || lowerUa.includes('windows nt 11.0')) {
    os = 'Windows'
  } else if (lowerUa.includes('windows')) {
    os = 'Windows'
  } else if (lowerUa.includes('macintosh') || lowerUa.includes('mac os x')) {
    os = 'macOS'
  } else if (lowerUa.includes('iphone') || lowerUa.includes('ipad') || lowerUa.includes('ipod')) {
    os = 'iOS'
  } else if (lowerUa.includes('android')) {
    os = 'Android'
  } else if (lowerUa.includes('linux')) {
    os = 'Linux'
  }

  return {
    country,
    city,
    device,
    browser,
    os,
    referrer,
  }
}
