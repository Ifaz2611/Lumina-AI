import { describe, it, expect } from 'vitest'

// Mirrors src/pages/Welcome/Setup/hooks.ts — permissive: 20-512 chars, no whitespace
const MIN = 20
const MAX = 512
const validate = (k: string) => {
  const t = k.trim()
  if (!t) return false
  if (/\s/.test(t)) return false
  if (t.length < MIN || t.length > MAX) return false
  return true
}

describe('API key validation', () => {
  it('validates classic AIza key', () =>
    expect(validate('AIza123456789012345678901234567890123')).toBe(true))
  it('validates new AQ. prefix key (reported bug)', () =>
    expect(validate('AQ.Ab8RN6J_example-token-1234567890')).toBe(true))

  it('validates other long tokens', () =>
    expect(validate('ya29.a0AfH6SMB_example-token_1234567890')).toBe(true))
  it('rejects invalid short', () => expect(validate('invalid')).toBe(false))
  it('rejects empty', () => expect(validate('')).toBe(false))
  it('rejects whitespace', () => expect(validate('AQ.Ab8 RN6J')).toBe(false))
})
