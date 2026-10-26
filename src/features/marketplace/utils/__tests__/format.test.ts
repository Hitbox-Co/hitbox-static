import { formatPrice, formatRewardPoints, MARKETPLACE_PLACEHOLDER_IMAGE } from '../format'

/**
 * Unit tests for the marketplace formatting helpers.
 * See src/features/marketplace/__tests__/README.md for the documented matrix.
 */

describe('formatPrice', () => {
  it('formats a decimal string as USD currency', () => {
    expect(formatPrice('89.99')).toBe('$89.99')
  })

  it('adds thousands separators and pads cents', () => {
    expect(formatPrice('1250.5')).toBe('$1,250.50')
    expect(formatPrice('1000000')).toBe('$1,000,000.00')
  })

  it('formats zero', () => {
    expect(formatPrice('0')).toBe('$0.00')
  })

  it('falls back to a $-prefixed raw value when not a number', () => {
    expect(formatPrice('N/A')).toBe('$N/A')
  })
})

describe('formatRewardPoints', () => {
  it('appends the "pts" suffix with separators', () => {
    expect(formatRewardPoints(4500)).toBe('4,500 pts')
    expect(formatRewardPoints(0)).toBe('0 pts')
  })
})

describe('MARKETPLACE_PLACEHOLDER_IMAGE', () => {
  it('is a valid https URL', () => {
    expect(MARKETPLACE_PLACEHOLDER_IMAGE).toMatch(/^https:\/\//)
  })
})
