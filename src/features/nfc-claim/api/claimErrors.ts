/**
 * What a failed claim request means, and whether sending it again is safe.
 *
 * Duck-typed on `error.error.code` (the shape of `ApiRequestError`) rather than
 * imported, so this stays a pure module that tests can load.
 */

/** The backend's code for "your sign-in is valid, but we have no account row for you yet". */
export const ACCOUNT_NOT_FOUND = 'AUTH_ACCOUNT_NOT_FOUND'

export function apiErrorCode(error: unknown): string | null {
    const code = (error as { error?: { code?: unknown } } | null)?.error?.code
    return typeof code === 'string' ? code : null
}

export type ClaimFailure =
    /** Signed in with Clerk, but the backend has not created this account yet. */
    | 'ACCOUNT_NOT_READY'
    /** The session is no longer valid. */
    | 'SESSION_EXPIRED'
    /** Anything else: network, server, timeout. Unknown whether the server saw the tap. */
    | 'UNKNOWN'

export function classifyClaimFailure(error: unknown): ClaimFailure {
    const code = apiErrorCode(error)
    if (code === ACCOUNT_NOT_FOUND) return 'ACCOUNT_NOT_READY'
    if (code === 'AUTH_INVALID_TOKEN' || code === 'AUTH_UNAUTHENTICATED') return 'SESSION_EXPIRED'
    return 'UNKNOWN'
}

/** Waits this long between tries while the backend finishes creating the account. */
export const ACCOUNT_RETRY_DELAY_MS = 2500
export const ACCOUNT_RETRY_LIMIT = 4

/**
 * Retry rule for the claim request.
 *
 * ONLY "account not found" is retried. That refusal comes from the sign-in check,
 * before the server looks at the tap, so the tap URL is still unused and sending
 * it again is safe — and a new sign-up genuinely can be a few seconds ahead of the
 * webhook that creates its row. Every other failure is NOT retried: after a network
 * error or a 5xx there is no telling whether the server already spent the tap, and
 * resending it would be refused as a replay.
 */
export function shouldRetryClaim(failureCount: number, error: unknown): boolean {
    return classifyClaimFailure(error) === 'ACCOUNT_NOT_READY' && failureCount < ACCOUNT_RETRY_LIMIT
}
