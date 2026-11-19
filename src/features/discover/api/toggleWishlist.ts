import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { WISHLIST_ROUTES, discoverKeys } from './routes'

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
 * NOTE: the Discover doc names these two calls but not the POST body; `{ productId }`
 * is assumed, matching the cart's `POST /cart`. If the server rejects it (422), the
 * wishlist doc will show the real field names — change them here only.
 *
 * On success every Discover query is refetched, so each card's `isWishlisted`
 * comes back from the server rather than from a local guess.
 */
export function useToggleWishlist() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ productId, wishlisted }: ToggleWishlistInput) => {
            if (wishlisted) {
                await api.post(WISHLIST_ROUTES.add, { productId })
            } else {
                await api.delete(WISHLIST_ROUTES.remove(productId))
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: discoverKeys.all }),
    })
}
