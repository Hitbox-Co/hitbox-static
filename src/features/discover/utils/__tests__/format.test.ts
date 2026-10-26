import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from '../format'

/**
 * Unit tests for the discover formatting helpers.
 * See src/features/discover/__tests__/README.md for the documented matrix.
 */

describe('formatRewardPoints', () => {
  it('appends the "pts" suffix', () => {
    expect(formatRewardPoints(50)).toBe('50 pts')
  })

  it('formats zero', () => {
    expect(formatRewardPoints(0)).toBe('0 pts')
  })

  it('adds thousands separators', () => {
    expect(formatRewardPoints(12500)).toBe('12,500 pts')
    expect(formatRewardPoints(1000000)).toBe('1,000,000 pts')
  })

  it('handles small numbers without separators', () => {
    expect(formatRewardPoints(999)).toBe('999 pts')
  })
})

describe('DISCOVER_PLACEHOLDER_IMAGE', () => {
  it('is a valid https URL', () => {
    expect(DISCOVER_PLACEHOLDER_IMAGE).toMatch(/^https:\/\//)
  })
})
