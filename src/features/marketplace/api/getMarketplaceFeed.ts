import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { MarketplaceCategory, MarketplaceFeed } from '../types/marketplace'
import { buildMarketplaceFeedPath, marketplaceKeys } from './routes'

/**
 * GET /api/v1/marketplace — featured + new listings, queried by the backend in
 * parallel. Public; a signed-in token only fills in each card's `isWishlisted`
 * (a stale token quietly serves a guest view — never a 401).
 *
 * `category` is a chip (`cards`, `figures`, …); omit it for All Items. It
 * narrows **both** lists, and `featured` is topped up so it is empty only when
 * the category has no public drop at all. `keepPreviousData` holds the old
 * sections while a new chip loads.
 */
export function useMarketplaceFeed(category?: MarketplaceCategory) {
    const api = useApi()

    return useQuery({
        queryKey: marketplaceKeys.feed(category),
        queryFn: () => api.get<MarketplaceFeed>(buildMarketplaceFeedPath(category)),
        placeholderData: keepPreviousData,
        // Matches the server's 30-second list cache.
        staleTime: 1000 * 30,
    })
}
