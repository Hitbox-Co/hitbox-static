import { useAuth } from '@clerk/clerk-expo'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { discoverKeys } from '@/features/discover/api/routes'
import { marketplaceKeys } from '@/features/marketplace/api/routes'
import { useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { UpdateWishlistItemInput, WishlistItemView } from '../types/wishlist'
import { WISHLIST_ROUTES, buildWishlistPath, wishlistKeys } from './routes'

/** Everything that shows a heart or a wishlist row reads the same table, so refresh all of it. */
function useRefreshWishlistViews() {
    const queryClient = useQueryClient()
    return () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
            queryClient.invalidateQueries({ queryKey: discoverKeys.all }),
            queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
        ])
}

/** GET /api/v1/wishlist 🔒 — my saved drops, newest first, page by page. */
export function useWishlistInfinite(limit = 20) {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useInfiniteQuery({
        queryKey: [...wishlistKeys.list(limit), 'infinite'],
        queryFn: ({ pageParam }) => api.getPage<WishlistItemView>(buildWishlistPath(pageParam, limit)),
        enabled: !!isSignedIn,
        initialPageParam: 1,
        getNextPageParam: (last) => (last.meta.page < (last.meta.totalPages ?? 1) ? last.meta.page + 1 : undefined),
        retry: retryAuthAware,
        staleTime: 1000 * 30,
    })
}

/** PATCH /api/v1/wishlist/:itemId 🔒 — change the alert toggle or note. 404 if the row is not yours. */
export function useUpdateWishlistItem() {
    const api = useApi()
    const refresh = useRefreshWishlistViews()
    return useMutation({
        mutationFn: ({ itemId, ...body }: UpdateWishlistItemInput & { itemId: string }) =>
            api.patch<WishlistItemView>(WISHLIST_ROUTES.item(itemId), body),
        onSuccess: refresh,
    })
}

/** DELETE /api/v1/wishlist/:itemId 🔒 — remove one row (204). */
export function useRemoveWishlistItem() {
    const api = useApi()
    const refresh = useRefreshWishlistViews()
    return useMutation({
        mutationFn: (itemId: string) => api.delete(WISHLIST_ROUTES.item(itemId)),
        onSuccess: refresh,
    })
}
