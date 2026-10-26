import { useInfiniteQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { DiscoverProductFilters, DiscoverProductItem } from '../types/discover'
import { buildDiscoverProductsPath, discoverKeys } from './routes'

/**
 * GET /api/v1/discover/products with page-by-page accumulation — backs the
 * "See All" screen. Flatten `data.pages` for the items; `fetchNextPage` /
 * `hasNextPage` come off the response `meta` (`page` < `totalPages`).
 *
 * Public, like every discover route.
 */
export function useDiscoverProductsInfinite(filters: Omit<DiscoverProductFilters, 'page'> = {}) {
    const api = useApi()
    const limit = filters.limit ?? 20

    return useInfiniteQuery({
        queryKey: [...discoverKeys.products({ ...filters, limit }), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getPage<DiscoverProductItem>(
                buildDiscoverProductsPath({ ...filters, limit, page: pageParam }),
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
        staleTime: 1000 * 60 * 2,
    })
}
