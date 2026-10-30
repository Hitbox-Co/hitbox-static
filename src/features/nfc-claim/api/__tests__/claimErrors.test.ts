import {
  ACCOUNT_RETRY_LIMIT,
  apiErrorCode,
  classifyClaimFailure,
  shouldRetryClaim,
} from '../claimErrors'

/** What `ApiRequestError` looks like: a status plus `{ error: { code, message } }`. */
const apiError = (code: string) => ({ status: 401, error: { code, message: 'x' } })

describe('classifyClaimFailure', () => {
  it('knows an account that the backend has not created yet', () => {
    expect(classifyClaimFailure(apiError('AUTH_ACCOUNT_NOT_FOUND'))).toBe('ACCOUNT_NOT_READY')
  })

  it('knows an expired or missing session', () => {
    expect(classifyClaimFailure(apiError('AUTH_INVALID_TOKEN'))).toBe('SESSION_EXPIRED')
    expect(classifyClaimFailure(apiError('AUTH_UNAUTHENTICATED'))).toBe('SESSION_EXPIRED')
  })

  it('treats everything else as unknown', () => {
    expect(classifyClaimFailure(apiError('INTERNAL_ERROR'))).toBe('UNKNOWN')
    expect(classifyClaimFailure(new Error('Network request failed'))).toBe('UNKNOWN')
    expect(classifyClaimFailure(null)).toBe('UNKNOWN')
    expect(classifyClaimFailure(undefined)).toBe('UNKNOWN')
  })
})

describe('apiErrorCode', () => {
  it('reads the backend code, and nothing else', () => {
    expect(apiErrorCode(apiError('X_Y'))).toBe('X_Y')
    expect(apiErrorCode({ error: { code: 42 } })).toBeNull()
    expect(apiErrorCode('boom')).toBeNull()
  })
})

describe('shouldRetryClaim — only when the tap cannot have been spent', () => {
  it('retries a missing account, a limited number of times', () => {
    expect(shouldRetryClaim(0, apiError('AUTH_ACCOUNT_NOT_FOUND'))).toBe(true)
    expect(shouldRetryClaim(ACCOUNT_RETRY_LIMIT - 1, apiError('AUTH_ACCOUNT_NOT_FOUND'))).toBe(true)
    expect(shouldRetryClaim(ACCOUNT_RETRY_LIMIT, apiError('AUTH_ACCOUNT_NOT_FOUND'))).toBe(false)
  })

  it('never retries a network error or a server error: the tap may already be spent', () => {
    expect(shouldRetryClaim(0, new Error('Network request failed'))).toBe(false)
    expect(shouldRetryClaim(0, apiError('INTERNAL_ERROR'))).toBe(false)
    expect(shouldRetryClaim(0, apiError('RATE_LIMITED'))).toBe(false)
  })

  it('never retries an expired session', () => {
    expect(shouldRetryClaim(0, apiError('AUTH_INVALID_TOKEN'))).toBe(false)
  })
})
