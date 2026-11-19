import { OrderFilters } from '../types/order'

/**
 * Orders module endpoints. All need the Clerk session and are keyed on the
 * caller's own id — someone else's order is a 404, the same as one that does not
 * exist. Placing and paying for an order are in the payments module (`/checkout`).
 */
export const ORDER_ROUTES = {
    /** GET — my orders with tabs and badge counts. NOT wrapped in `data`. */
    list: '/api/v1/orders',
    /** GET — full detail plus which buttons to show. */
    byId: (orderId: string) => `/api/v1/orders/${encodeURIComponent(orderId)}`,
    /** GET — carrier, tracking number and the status timeline. */
    tracking: (orderId: string) => `/api/v1/orders/${encodeURIComponent(orderId)}/tracking`,
    /** POST — cancel an UNPAID order. */
    cancel: (orderId: string) => `/api/v1/orders/${encodeURIComponent(orderId)}/cancel`,
} as const

/** TanStack Query keys for the orders feature. */
export const orderKeys = {
    all: ['orders'] as const,
    list: (filters: OrderFilters = {}) => ['orders', 'list', filters] as const,
    detail: (orderId: string) => ['orders', 'detail', orderId] as const,
    tracking: (orderId: string) => ['orders', 'tracking', orderId] as const,
}

export function buildOrdersPath(filters: OrderFilters) {
    const params = new URLSearchParams()
    if (filters.tab) params.append('tab', filters.tab)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    const qs = params.toString()
    return qs ? `${ORDER_ROUTES.list}?${qs}` : ORDER_ROUTES.list
}
