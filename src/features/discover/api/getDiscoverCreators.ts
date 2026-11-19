import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { DiscoverCreatorFilters, DiscoverCreatorItem } from '../types/discover'
import { buildDiscoverCreatorsPath, discoverKeys } from './routes'

/**
 * GET /api/v1/discover/creators — a paginated creator list (artists with at
 * least one public drop, most drops first). Backs "Explore" next to **Meet the
 * creators**. Public; there is nothing per-user on it.
 */
export function useDiscoverCreators(filters: DiscoverCreatorFilters = {}) {
    const api = useApi()

    return useQuery({
        queryKey: discoverKeys.creators(filters),
        queryFn: () => api.getPage<DiscoverCreatorItem>(buildDiscoverCreatorsPath(filters)),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 2,
    })
}

/** The same list with page-by-page accumulation, for the "Explore" screen. */
export function useDiscoverCreatorsInfinite(filters: Omit<DiscoverCreatorFilters, 'page'> = {}) {
    const api = useApi()
    const limit = filters.limit ?? 20

    return useInfiniteQuery({
        queryKey: [...discoverKeys.creators({ ...filters, limit }), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getPage<DiscoverCreatorItem>(buildDiscoverCreatorsPath({ ...filters, limit, page: pageParam })),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
        staleTime: 1000 * 60 * 2,
    })
}
