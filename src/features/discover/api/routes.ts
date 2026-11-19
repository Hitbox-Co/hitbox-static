import { DiscoverCategory, DiscoverCreatorFilters, DiscoverProductFilters } from '../types/discover'

/** Discover module endpoints (public — a token is optional and only adds `isWishlisted`). */
export const DISCOVER_ROUTES = {
    /** GET — featured carousel + every section in one round-trip. `?category=` narrows the drop lists. */
    feed: '/api/v1/discover',
    /** GET — paginated drop list backing "View all" and the search bar. */
    products: '/api/v1/discover/products',
    /** GET — paginated creator list backing "Explore" next to "Meet the creators". */
    creators: '/api/v1/discover/creators',
} as const

/**
 * The heart on a card (backend `wishlist-api.md`, referenced by the Discover doc):
 * POST to turn it on, DELETE to turn it off. Both need a session.
 */
/** TanStack Query keys for the discover feature. */
export const discoverKeys = {
    all: ['discover'] as const,
    feed: (category?: DiscoverCategory) => ['discover', 'feed', category ?? 'all'] as const,
    products: (filters: DiscoverProductFilters = {}) => ['discover', 'products', filters] as const,
    creators: (filters: DiscoverCreatorFilters = {}) => ['discover', 'creators', filters] as const,
}

function withQuery(path: string, params: URLSearchParams) {
    const qs = params.toString()
    return qs ? `${path}?${qs}` : path
}

export function buildDiscoverFeedPath(category?: DiscoverCategory) {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    return withQuery(DISCOVER_ROUTES.feed, params)
}

export function buildDiscoverProductsPath(filters: DiscoverProductFilters) {
    const params = new URLSearchParams()
    if (filters.section) params.append('section', filters.section)
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    return withQuery(DISCOVER_ROUTES.products, params)
}

export function buildDiscoverCreatorsPath(filters: DiscoverCreatorFilters) {
    const params = new URLSearchParams()
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    return withQuery(DISCOVER_ROUTES.creators, params)
}
