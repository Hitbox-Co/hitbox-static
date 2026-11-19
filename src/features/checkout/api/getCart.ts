import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { CartView } from '../types/checkout'
import { CART_ROUTES, cartKeys } from './routes'

/**
 * GET /api/v1/cart 🔒 — every item with live price and availability, newest
 * first, plus a summary. At most 50 items, so it is never paginated.
 *
 * Price and availability are read live on every call, so a row can flip to
 * `isPurchasable: false` between two views — render from `isPurchasable` and
 * `unavailableReason`, never from a remembered price.
 */
export function useCart() {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: cartKeys.view,
        queryFn: () => api.get<CartView>(CART_ROUTES.cart),
        enabled: !!isSignedIn,
        retry: retryAuthAware,
        // Always fresh: the cart changes outside this screen (a paid order
        // removes its row on the server) and stock/price are live.
        staleTime: 0,
    })
}
