import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { CartItemView } from '../types/checkout'
import { CART_ROUTES, cartKeys } from './routes'

/** Body of POST /api/v1/cart. Anything else is rejected with a 422. */
export interface AddToCartInput {
    productId: string
    /** Optional. Must be one of the drop's active variants. */
    variantId?: string
}

/**
 * POST /api/v1/cart 🔒 — add a drop (and variant). Idempotent: 201 when added,
 * 200 with the existing row when that drop and variant were already there, so
 * calling it twice is harmless. Stock is not checked here — only that the drop
 * is on sale right now (otherwise 400 ORDERS_NOT_PURCHASABLE with the reason).
 */
export function useAddToCart() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: AddToCartInput) =>
            api.post<CartItemView>(CART_ROUTES.cart, {
                productId: input.productId,
                // Sent only when chosen: an undefined key would be dropped by JSON anyway,
                // but this keeps the intent explicit.
                ...(input.variantId ? { variantId: input.variantId } : {}),
            }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
    })
}

/** DELETE /api/v1/cart/:itemId 🔒 — remove one item. 404 if it is not yours. */
export function useRemoveCartItem() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (itemId: string) => api.delete(CART_ROUTES.item(itemId)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
    })
}

/** DELETE /api/v1/cart 🔒 — empty the cart. Always 200, even when it already was. */
export function useClearCart() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => api.delete(CART_ROUTES.cart),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
    })
}
