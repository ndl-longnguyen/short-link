import { describe, it, expect } from 'vitest'
import { validateDestinationUrl } from '../src/lib/security/url-validator'

describe('URL Security & SSRF Validator', () => {
  it('should accept valid HTTPS URLs', () => {
    const res = validateDestinationUrl('https://example.com/products/iphone?ref=summer')
    expect(res.isValid).toBe(true)
    expect(res.normalizedUrl).toBe('https://example.com/products/iphone?ref=summer')
  })

  it('should accept valid HTTP URLs', () => {
    const res = validateDestinationUrl('http://subdomain.example.org/blog')
    expect(res.isValid).toBe(true)
  })

  it('should block javascript: protocol schemes', () => {
    const res = validateDestinationUrl('javascript:alert(document.cookie)')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/protocol/i)
  })

  it('should block data: protocol schemes', () => {
    const res = validateDestinationUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/protocol/i)
  })

  it('should block file: protocol schemes', () => {
    const res = validateDestinationUrl('file:///etc/passwd')
    expect(res.isValid).toBe(false)
  })

  it('should block localhost and local hostnames', () => {
    expect(validateDestinationUrl('http://localhost:3000/api').isValid).toBe(false)
    expect(validateDestinationUrl('https://app.localhost/test').isValid).toBe(false)
    expect(validateDestinationUrl('http://internal.local/dashboard').isValid).toBe(false)
  })

  it('should block IPv4 loopback (127.0.0.1)', () => {
    const res = validateDestinationUrl('http://127.0.0.1:8080/admin')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/private|blocked|loopback/i)
  })

  it('should block IPv4 private class A range (10.0.0.0/8)', () => {
    const res = validateDestinationUrl('http://10.1.2.3/confidential')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/private/i)
  })

  it('should block IPv4 private class B range (172.16.0.0/12)', () => {
    const res = validateDestinationUrl('http://172.20.10.5/api')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/private/i)
  })

  it('should block IPv4 private class C range (192.168.0.0/16)', () => {
    const res = validateDestinationUrl('http://192.168.1.1/router')
    expect(res.isValid).toBe(false)
    expect(res.error).toMatch(/private/i)
  })

  it('should block IPv6 loopback (::1)', () => {
    const res = validateDestinationUrl('http://[::1]:3000')
    expect(res.isValid).toBe(false)
  })

  it('should block default and custom safety blacklisted domains', () => {
    const resDefault = validateDestinationUrl('https://grabify.link/track123')
    expect(resDefault.isValid).toBe(false)

    const resCustom = validateDestinationUrl('https://phishing-site.test/login', ['phishing-site.test'])
    expect(resCustom.isValid).toBe(false)
  })

  it('should reject malformed or empty URLs', () => {
    expect(validateDestinationUrl('').isValid).toBe(false)
    expect(validateDestinationUrl('   ').isValid).toBe(false)
    expect(validateDestinationUrl('htp:/not-a-valid-url').isValid).toBe(false)
  })
})
