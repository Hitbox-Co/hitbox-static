import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiRequestError, useApi } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { BuyerOrderDetail } from '../types/order'
import { ORDER_ROUTES, orderKeys } from './routes'

export interface CancelOrderInput {
    orderId: string
    /** Optional, trimmed, max 500 characters. */
    reason?: string
}

/**
 * POST /api/v1/orders/:orderId/cancel 🔒 — cancel an order **before paying**; the
 * held piece goes straight back on sale. Returns the updated order (CANCELLED).
 * Tapping twice is safe: an already-cancelled order comes back as-is.
 *
 * Once an order is paid, cancelling means a refund (`POST /refunds`), so the
 * server answers 400 ORDERS_CANCEL_REQUIRES_REFUND.
 */
export function useCancelOrder() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ orderId, reason }: CancelOrderInput) => {
            const trimmed = reason?.trim()
            return api.post<BuyerOrderDetail>(ORDER_ROUTES.cancel(orderId), trimmed ? { reason: trimmed } : {})
        },
        onSuccess: (order) => {
            // The server's answer is the truth: put it straight into the detail cache,
            // and refetch the lists so the tabs and badge counts move.
            queryClient.setQueryData(orderKeys.detail(order.id), order)
            queryClient.invalidateQueries({ queryKey: orderKeys.all })
        },
    })
}

/** A sentence for a failed orders call, keyed on the error `code`. */
export function orderErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
        switch (err.error.code) {
            case 'ORDERS_NOT_FOUND':
                return "We couldn't find that order."
            case 'ORDERS_CANCEL_REQUIRES_REFUND':
                return 'This order is already paid, so it can’t be cancelled — request a refund instead.'
            case 'ORDERS_INVALID_TRANSITION':
                return 'Your payment went through a moment before the cancel. Reload to see the order.'
        }
    }
    return describeApiError(err)
}
