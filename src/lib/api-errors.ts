import { ApiRequestError, ValidationDetail } from './api'

/**
 * Helpers for reading the backend's error envelope
 * `{ error: { code, message, details } }`. Always branch on `code`, never on the
 * message text. Pure (no React, no native modules).
 */

export function apiErrorCode(err: unknown): string | null {
    return err instanceof ApiRequestError ? err.error.code : null
}

/**
 * The account-level failures `requireAuth` can answer with. What the app does
 * about each is decided by the caller (see `AccountStateWatcher`).
 */
export type AccountProblem =
    | 'UNAUTHENTICATED'
    | 'INVALID_TOKEN'
    | 'ACCOUNT_NOT_FOUND'
    | 'SUSPENDED'
    | 'EMAIL_UNVERIFIED'

const ACCOUNT_CODES: Record<string, AccountProblem> = {
    AUTH_UNAUTHENTICATED: 'UNAUTHENTICATED',
    AUTH_INVALID_TOKEN: 'INVALID_TOKEN',
    AUTH_ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
    AUTH_ACCOUNT_SUSPENDED: 'SUSPENDED',
    AUTH_EMAIL_UNVERIFIED: 'EMAIL_UNVERIFIED',
}

/** Which account problem an error is, or null when it is something else. */
export function accountProblemOf(err: unknown): AccountProblem | null {
    const code = apiErrorCode(err)
    return code ? (ACCOUNT_CODES[code] ?? null) : null
}

/**
 * A 422 VALIDATION_ERROR as `{ fieldName: message }` — the first message per
 * field — ready to put under each form input. Empty when the error is not a
 * validation error.
 */
export function validationFieldErrors(err: unknown): Record<string, string> {
    if (!(err instanceof ApiRequestError) || err.error.code !== 'VALIDATION_ERROR') return {}
    const details = err.error.details
    if (!Array.isArray(details)) return {}
    const out: Record<string, string> = {}
    for (const d of details as ValidationDetail[]) {
        if (d && typeof d.path === 'string' && typeof d.message === 'string' && !(d.path in out)) {
            out[d.path] = d.message
        }
    }
    return out
}

/** A sentence for an error the screen has no better words for. */
export function describeApiError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
    // fetch() itself failed: no connection, or the server is not there at all.
    if (err instanceof TypeError || (err instanceof Error && /network request failed|failed to fetch/i.test(err.message))) {
        return "Can't reach HitBox. Check your connection and try again."
    }
    if (!(err instanceof ApiRequestError)) return fallback
    if (err.error.code === 'RATE_LIMITED') return 'Too many requests. Please wait a moment and try again.'
    if (err.error.code === 'AUTHZ_FORBIDDEN') return "Your account doesn't have access to this yet."
    // 502 / 503 / 504 come from the host in front of the API when the API itself is down.
    if ([502, 503, 504].includes(err.status)) return "HitBox can't be reached right now. Please try again in a moment."
    if (err.status >= 500) return 'HitBox is having trouble right now. Please try again shortly.'
    return err.error.message || fallback
}
