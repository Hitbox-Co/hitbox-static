/**
 * Unit tests for the Clerk error helpers that power login/registration error
 * handling. See src/features/auth/login/__tests__/README.md.
 */

// Control isClerkAPIResponseError per-test.
jest.mock('@clerk/clerk-expo', () => ({
  isClerkAPIResponseError: jest.fn(),
}))

import { isClerkAPIResponseError } from '@clerk/clerk-expo'
import { getClerkErrorMessage, isAccountNotFound } from '../clerk'

const mockIsClerkError = isClerkAPIResponseError as unknown as jest.Mock

beforeEach(() => jest.clearAllMocks())

describe('getClerkErrorMessage', () => {
  it('prefers longMessage from a Clerk API error', () => {
    mockIsClerkError.mockReturnValue(true)
    const err = { errors: [{ longMessage: 'That email is taken.', message: 'taken' }] }
    expect(getClerkErrorMessage(err)).toBe('That email is taken.')
  })

  it('falls back to message when longMessage is absent', () => {
    mockIsClerkError.mockReturnValue(true)
    const err = { errors: [{ message: 'Incorrect code.' }] }
    expect(getClerkErrorMessage(err)).toBe('Incorrect code.')
  })

  it('uses the default fallback when a Clerk error has no messages', () => {
    mockIsClerkError.mockReturnValue(true)
    expect(getClerkErrorMessage({ errors: [{}] })).toBe(
      'Something went wrong. Please try again.'
    )
  })

  it('returns the message of a plain Error', () => {
    mockIsClerkError.mockReturnValue(false)
    expect(getClerkErrorMessage(new Error('Network request failed'))).toBe(
      'Network request failed'
    )
  })

  it('returns the custom fallback for unknown values', () => {
    mockIsClerkError.mockReturnValue(false)
    expect(getClerkErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
    expect(getClerkErrorMessage('a string')).toBe('Something went wrong. Please try again.')
  })
})

describe('isAccountNotFound', () => {
  it('is true for a Clerk error containing form_identifier_not_found', () => {
    mockIsClerkError.mockReturnValue(true)
    const err = { errors: [{ code: 'form_identifier_not_found' }] }
    expect(isAccountNotFound(err)).toBe(true)
  })

  it('is false for a Clerk error with a different code', () => {
    mockIsClerkError.mockReturnValue(true)
    const err = { errors: [{ code: 'form_password_incorrect' }] }
    expect(isAccountNotFound(err)).toBe(false)
  })

  it('is false for a non-Clerk error', () => {
    mockIsClerkError.mockReturnValue(false)
    expect(isAccountNotFound(new Error('boom'))).toBe(false)
  })
})
