/**
 * Address book endpoints (backend `addresses-api.md`). All need the Clerk session
 * and are scoped to the caller: someone else's address is a 404, the same as one
 * that does not exist or was deleted.
 */
export const ADDRESS_ROUTES = {
    /** GET — my addresses, default first. POST — save a new one. */
    list: '/api/v1/users/me/addresses',
    /** GET / PATCH / DELETE (archives it). */
    byId: (id: string) => `/api/v1/users/me/addresses/${encodeURIComponent(id)}`,
    /** POST — make it my default. */
    makeDefault: (id: string) => `/api/v1/users/me/addresses/${encodeURIComponent(id)}/default`,
} as const

export const addressKeys = {
    all: ['addresses'] as const,
    list: ['addresses', 'list'] as const,
}
