import { useInfiniteQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { MarketplaceListingFilters, MarketplaceListingItem } from '../types/marketplace'
import { buildMarketplaceListingsPath, marketplaceKeys } from './routes'

/**
 * GET /api/v1/marketplace/listings with page-by-page accumulation — backs the
 * "See All" screen and search results. Flatten `data.pages` for the items;
 * `fetchNextPage` / `hasNextPage` come off the response `meta` (`page` <
 * `totalPages`).
 *
 * Public, so no auth gate; a token only fills in each card's `isWishlisted`.
 */
export function useMarketplaceListingsInfinite(
    filters: Omit<MarketplaceListingFilters, 'page'> = {},
    options?: { enabled?: boolean },
) {
    const api = useApi()
    const limit = filters.limit ?? 20

    return useInfiniteQuery({
        queryKey: [...marketplaceKeys.listings({ ...filters, limit }), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getPage<MarketplaceListingItem>(
                buildMarketplaceListingsPath({ ...filters, limit, page: pageParam }),
            ),
        enabled: options?.enabled ?? true,
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
        // Matches the server's 30-second list cache.
        staleTime: 1000 * 30,
    })
}
