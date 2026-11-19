import { MarketplaceCategory, MarketplaceListingFilters } from '../types/marketplace'

/** Marketplace module endpoints (browse routes are public; a token only fills in the heart). */
export const MARKETPLACE_ROUTES = {
    /** GET — featured + new listings in one round-trip. `?category=` narrows both lists. */
    feed: '/api/v1/marketplace',
    /** GET — paginated listings behind "See All", the category chips and search. */
    listings: '/api/v1/marketplace/listings',
} as const

/** TanStack Query keys for the marketplace feature. */
export const marketplaceKeys = {
    all: ['marketplace'] as const,
    feed: (category?: MarketplaceCategory) => ['marketplace', 'feed', category ?? 'all'] as const,
    listings: (filters: MarketplaceListingFilters = {}) => ['marketplace', 'listings', filters] as const,
}

export function buildMarketplaceFeedPath(category?: MarketplaceCategory) {
    return category ? `${MARKETPLACE_ROUTES.feed}?category=${category}` : MARKETPLACE_ROUTES.feed
}

export function buildMarketplaceListingsPath(filters: MarketplaceListingFilters) {
    const params = new URLSearchParams()
    // `featured` takes only the literal strings "true" / "false" (anything else is a 422).
    if (filters.featured !== undefined) params.append('featured', filters.featured ? 'true' : 'false')
    if (filters.category) params.append('category', filters.category)
    if (filters.search) params.append('search', filters.search)
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    const qs = params.toString()
    return qs ? `${MARKETPLACE_ROUTES.listings}?${qs}` : MARKETPLACE_ROUTES.listings
}
