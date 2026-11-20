import { useEffect } from 'react'

import { useMyCollectionInfinite } from '@/features/collections/api/getMyCollectionInfinite'

/** Safety stop: 10 pages × 50 items. A shelf bigger than that shows its running total. */
const MAX_PAGES = 10

/**
 * HIT POINTS for the profile card.
 *
 * The Users API no longer returns a points total, so this is the sum of the
 * `rewardPoints` of every item on the shelf (`GET /collections/me`, each row's
 * drop carries its own points; 0 where none is set). It reads the whole shelf —
 * 50 rows at a time — so the number is complete, not just the first page.
 *
 * `points` is null until the first page arrives; `complete` is false while more
 * pages are still loading (the number may still grow).
 */
export function useHitPoints() {
    const shelf = useMyCollectionInfinite({ limit: 50 })
    const { hasNextPage, isFetchingNextPage, fetchNextPage, data } = shelf
    const pageCount = data?.pages.length ?? 0

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && pageCount < MAX_PAGES) void fetchNextPage()
    }, [hasNextPage, isFetchingNextPage, pageCount, fetchNextPage])

    const rows = data?.pages.flatMap((p) => p.data) ?? []
    const points = data ? rows.reduce((sum, item) => sum + (item.product.rewardPoints || 0), 0) : null

    return {
        points,
        complete: !!data && !hasNextPage,
        isLoading: shelf.isLoading,
    }
}
