/** Users module endpoints. */
export const PROFILE_ROUTES = {
    /** GET / PATCH 🔒 — my profile. */
    me: '/api/v1/users/me',
    /** GET (public) — another user's profile; 404 when missing, archived OR PRIVATE. */
    byId: (id: string) => `/api/v1/users/${encodeURIComponent(id)}`,
} as const

/** A non-uuid id makes the server answer 500, so it is never sent. */
export const isUserId = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
