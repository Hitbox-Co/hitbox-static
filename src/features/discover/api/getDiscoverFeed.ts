import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { DiscoverCategory, DiscoverFeed } from '../types/discover'
import { buildDiscoverFeedPath, discoverKeys } from './routes'

/**
 * GET /api/v1/discover — featured carousel + trending / creators / latest
 * drops, queried by the backend in parallel. Public; a signed-in token only
 * fills in each card's `isWishlisted` (and a stale token quietly serves a
 * guest view — never a 401).
 *
 * `category` is a chip (`cards`, `figures`, …); omit it for All Items. It
 * narrows the three drop sections, while `creators` is the same for every chip.
 * `keepPreviousData` holds the old sections while a new chip loads, so the
 * screen doesn't flash empty.
 */
export function useDiscoverFeed(category?: DiscoverCategory) {
    const api = useApi()

    return useQuery({
        queryKey: discoverKeys.feed(category),
        queryFn: () => api.get<DiscoverFeed>(buildDiscoverFeedPath(category)),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 2,
    })
}
