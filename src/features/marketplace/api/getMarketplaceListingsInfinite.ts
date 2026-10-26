import { useInfiniteQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { MarketplaceListingFilters, MarketplaceListingItem } from '../types/marketplace'
import { buildMarketplaceListingsPath, marketplaceKeys } from './routes'

/**
 * GET /api/v1/marketplace/listings with page-by-page accumulation — backs the
 * "See All" screen. Flatten `data.pages` for the items; `fetchNextPage` /
 * `hasNextPage` come off the response `meta` (`page` < `totalPages`).
 *
 * Browse routes are public, so no auth gate here.
 */
export function useMarketplaceListingsInfinite(
    filters: Omit<MarketplaceListingFilters, 'page'> = {},
) {
    const api = useApi()
    const limit = filters.limit ?? 20

    return useInfiniteQuery({
        queryKey: [...marketplaceKeys.listings({ ...filters, limit }), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getPage<MarketplaceListingItem>(
                buildMarketplaceListingsPath({ ...filters, limit, page: pageParam }),
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
        staleTime: 1000 * 60 * 2,
    })
}
