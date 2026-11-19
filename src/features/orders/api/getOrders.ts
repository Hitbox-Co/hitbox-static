import { useAuth } from '@clerk/clerk-expo'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { BuyerOrderDetail, BuyerOrderListResponse, OrderFilters, OrderTracking } from '../types/order'
import { ORDER_ROUTES, buildOrdersPath, orderKeys } from './routes'

/**
 * GET /api/v1/orders 🔒 — "My orders", newest first, page by page. The body has
 * **no `data` envelope** (`{ page, limit, total, counts, items }`), so it is read
 * with `getRaw`. `counts` carries every tab's number whichever tab was asked for —
 * use it for the badges. The next page exists while `page × limit < total`.
 */
export function useOrdersInfinite(filters: Omit<OrderFilters, 'page'> = {}) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    const limit = filters.limit ?? 10

    return useInfiniteQuery({
        queryKey: [...orderKeys.list({ ...filters, limit }), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getRaw<BuyerOrderListResponse>(buildOrdersPath({ ...filters, limit, page: pageParam })),
        enabled: !!isSignedIn,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => (lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined),
        retry: retryAuthAware,
        staleTime: 1000 * 20,
    })
}

/**
 * GET /api/v1/orders/:orderId 🔒 — the order screen, plus `actions` (which buttons
 * to show). 404 ORDERS_NOT_FOUND for no such order *or* one that is not yours.
 *
 * `poll` re-reads every few seconds while the order is still PENDING_PAYMENT:
 * after Stripe's sheet reports success the app only shows "Confirming payment…"
 * and waits for the server to move the order to PAID — it never decides that itself.
 */
export function useOrder(orderId: string | undefined, options?: { poll?: boolean }) {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: orderKeys.detail(orderId ?? ''),
        queryFn: () => api.get<BuyerOrderDetail>(ORDER_ROUTES.byId(orderId!)),
        enabled: !!isSignedIn && !!orderId,
        retry: retryAuthAware,
        staleTime: 1000 * 10,
        refetchInterval: (query) =>
            options?.poll && query.state.data?.status === 'PENDING_PAYMENT' ? 5000 : false,
    })
}

/**
 * GET /api/v1/orders/:orderId/tracking 🔒 — the tracking part of the detail on its
 * own, for a light refresh. There is no live parcel feed: only the carrier's name,
 * the tracking number and (sometimes) a link.
 */
export function useOrderTracking(orderId: string | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: orderKeys.tracking(orderId ?? ''),
        queryFn: () => api.get<OrderTracking>(ORDER_ROUTES.tracking(orderId!)),
        enabled: !!isSignedIn && !!orderId,
        retry: retryAuthAware,
        staleTime: 1000 * 30,
    })
}
