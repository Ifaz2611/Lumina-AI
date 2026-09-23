import { describe, it, expect } from 'vitest'
const API_KEY_REGEX = /^AIza[0-9A-Za-z\-_]{35,}$/
describe('API key validation', () => {
  it('validates correct key', () => expect(API_KEY_REGEX.test('AIza123456789012345678901234567890123')).toBe(true))
  it('rejects invalid', () => expect(API_KEY_REGEX.test('invalid')).toBe(false))
  it('rejects empty', () => expect(API_KEY_REGEX.test('')).toBe(false))
})
