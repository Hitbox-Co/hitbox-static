/**
 * Auth module endpoints (see the backend's `auth-api.md`).
 *
 * Clerk does the authenticating — sign-up, sign-in, OTP, reset, sign-out all go
 * to Clerk's SDK. The backend only verifies Clerk's session token, keeps the
 * local user row in sync, and offers these four calls. The Clerk → backend
 * webhook (`POST /auth/webhooks/clerk`) is server-to-server; the app never
 * calls it.
 */
export const AUTH_ROUTES = {
    /** GET — public. Is the API up? (No `data` wrapper on this one.) */
    health: '/api/v1/health',
    /** POST — public. Check sign-up fields before calling Clerk. */
    validateRegistration: '/api/v1/auth/registration/validate',
    /** GET 🔒 — the signed-in account. (`useAuthMe` lives in `@/lib/queries`.) */
    me: '/api/v1/auth/me',
    /** GET 🔒 — the signed-in user's roles and permission keys. */
    authz: '/api/v1/authz/me',
} as const

/** TanStack Query keys for the auth feature (`auth/me` is `queryKeys.authMe`). */
export const authKeys = {
    health: ['auth', 'health'] as const,
    authz: ['auth', 'authz'] as const,
}
