import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { marketplaceKeys } from '@/features/marketplace/api/routes'
import { WISHLIST_ROUTES, wishlistKeys } from '@/features/wishlist/api/routes'
import { discoverKeys } from './routes'

export interface ToggleWishlistInput {
    productId: string
    /** The state to move to: true adds the drop, false removes it. */
    wishlisted: boolean
}

/**
 * The heart. `POST /wishlist` turns it on, `DELETE /wishlist/products/:productId`
 * turns it off (both need a session — a guest should be asked to sign in first).
 * A drop counts as wishlisted if it was wishlisted with any variant.
 *
 * Both are idempotent (POST 201 added / 200 already saved; DELETE always 200
 * `{ removed }`), so a double tap is harmless. The POST body `{ productId }` is
 * confirmed by the Wishlist doc; the drop is saved as a whole (no variant).
 *
 * On success every Discover and Marketplace query and the Wishlist screen are
 * refetched, so each card's `isWishlisted` comes back from the server rather
 * than from a local guess.
 */
export function useToggleWishlist() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, wishlisted }: ToggleWishlistInput) => {
            if (wishlisted) {
                await api.post(WISHLIST_ROUTES.list, { productId })
            } else {
                await api.delete(WISHLIST_ROUTES.removeProduct(productId))
            }
        },
        onSuccess: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: discoverKeys.all }),
                queryClient.invalidateQueries({ queryKey: marketplaceKeys.all }),
                queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
            ]),
    })
}
