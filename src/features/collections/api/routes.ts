import { MyCollectionFilters, UserCollectionFilters } from '../types/collection'

/** Collections module endpoints. `me` routes require auth (🔒); `user/:userId` is public. */
export const COLLECTION_ROUTES = {
    /** GET — the authenticated user's own shelf (private items included). */
    me: '/api/v1/collections/me',
    /** GET — aggregated stats (item count, collections, progress) for the shelf. */
    meStats: '/api/v1/collections/me/stats',
    /**
     * PATCH — change one owned item's visibility. `:skuId` is `item.sku.id`,
     * NOT the shelf-row id (`item.id`) and not the product id.
     */
    meItem: (skuId: string) => `/api/v1/collections/me/${encodeURIComponent(skuId)}`,
    /** GET — another user's showcase: PUBLIC items only. Public, ignores the token. */
    user: (userId: string) => `/api/v1/collections/user/${encodeURIComponent(userId)}`,
} as const

/** TanStack Query keys for the collections feature. */
export const collectionKeys = {
    all: ['collections'] as const,
    me: (filters: MyCollectionFilters = {}) => ['collections', 'me', filters] as const,
    stats: ['collections', 'me', 'stats'] as const,
    user: (userId: string, filters: UserCollectionFilters = {}) => ['collections', 'user', userId, filters] as const,
}

function withQuery(path: string, params: URLSearchParams) {
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
}

export function buildMyCollectionPath(filters: MyCollectionFilters) {
    const params = new URLSearchParams()
    if (filters.visibility) params.append('visibility', filters.visibility)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    return withQuery(COLLECTION_ROUTES.me, params)
}

export function buildUserCollectionPath(userId: string, filters: UserCollectionFilters) {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    return withQuery(COLLECTION_ROUTES.user(userId), params)
}
