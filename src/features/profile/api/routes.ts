/** Users module endpoints. */
export const PROFILE_ROUTES = {
    /** GET / PATCH 🔒 — my profile (GET includes my stats; PATCH's answer does not). */
    me: '/api/v1/users/me',
    /** GET (token optional) — a collector's profile, public or private; 404 only when deleted/deactivated. */
    byId: (id: string) => `/api/v1/users/${encodeURIComponent(id)}`,
    /** GET (token optional) — the same profile by handle; case and a leading "@" are ignored. */
    byHandle: (handle: string) => `/api/v1/users/handle/${encodeURIComponent(handle.replace(/^@/, ''))}`,
} as const

/**
 * Ids are uuids. The doc says a malformed one is a 404, but the current dev
 * server answers it with a 500 — so it is never sent.
 */
export const isUserId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
