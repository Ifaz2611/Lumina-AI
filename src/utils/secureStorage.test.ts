import { describe, it, expect } from 'vitest'
import { secureStorage } from './secureStorage'

describe('secureStorage', () => {
  it('stores in sessionStorage', () => {
    secureStorage.setApiKey('AIza-test-12345678901234567890123456789')
    expect(secureStorage.getApiKey()).toBe('AIza-test-12345678901234567890123456789')
    secureStorage.clearApiKey()
    expect(secureStorage.getApiKey()).toBe('')
  })
})
