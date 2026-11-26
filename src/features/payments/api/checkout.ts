import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cartKeys } from '@/features/checkout/api/routes'
import { orderKeys } from '@/features/orders/api/routes'
import { useApi } from '@/lib/api'
import { CheckoutInput, CheckoutView } from '../types/payments'
import { PAYMENT_ROUTES } from './routes'

/**
 * POST /api/v1/checkout 🔒 — places the order (PENDING_PAYMENT), holds one numbered
 * piece for 15 minutes and starts a Stripe payment. Retrying is safe: while the
 * buyer has an unpaid order with a live hold for the same drop, the server returns
 * that order (same charge) instead of placing a new one.
 */
export function useCheckout() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CheckoutInput) => api.post<CheckoutView>(PAYMENT_ROUTES.checkout, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    })
}

/**
 * POST /api/v1/checkout/:orderId/resume 🔒 — same order, same held piece, same
 * charge, with a fresh `clientToken`. Does not extend the 15-minute hold.
 */
export function useResumeCheckout() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (orderId: string) => api.post<CheckoutView>(PAYMENT_ROUTES.resume(orderId)),
        onSuccess: (view) => queryClient.invalidateQueries({ queryKey: orderKeys.detail(view.orderId) }),
    })
}

/** After a payment the server drops the cart row; refresh the cart and orders. */
export function useRefreshAfterPayment() {
    const queryClient = useQueryClient()
    return () => {
        queryClient.invalidateQueries({ queryKey: cartKeys.all })
        queryClient.invalidateQueries({ queryKey: orderKeys.all })
    }
}
