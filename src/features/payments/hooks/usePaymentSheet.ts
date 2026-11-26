import { PaymentSheetError, useStripe } from '@stripe/stripe-react-native'
import * as Linking from 'expo-linking'
import { useCallback } from 'react'

import { CheckoutView } from '../types/payments'

export type PaymentSheetResult =
    | { status: 'success' }
    /** The buyer closed the sheet. The order stays PENDING_PAYMENT and can be resumed. */
    | { status: 'canceled' }
    | { status: 'failed'; message: string }

/**
 * Shows Stripe's payment sheet for a `CheckoutView.clientToken`.
 *
 * "success" only means Stripe accepted the payment — the order is still
 * PENDING_PAYMENT until the server's webhook moves it to PAID. The caller shows
 * "Confirming payment…" and polls `GET /orders/:orderId`; it never decides itself.
 */
export function usePaymentSheet() {
    const { initPaymentSheet, presentPaymentSheet } = useStripe()

    return useCallback(
        async (checkout: CheckoutView, customer?: { name?: string; email?: string }): Promise<PaymentSheetResult> => {
            if (!checkout.clientToken) {
                return { status: 'failed', message: 'Payments are not available on this server right now.' }
            }

            try {
                const init = await initPaymentSheet({
                    paymentIntentClientSecret: checkout.clientToken,
                    merchantDisplayName: 'HitBox',
                    returnURL: Linking.createURL('stripe-redirect'),
                    allowsDelayedPaymentMethods: false,
                    defaultBillingDetails: { name: customer?.name, email: customer?.email },
                })
                if (init.error) {
                    console.warn('[stripe] initPaymentSheet failed', init.error)
                    return { status: 'failed', message: init.error.message }
                }

                const { error } = await presentPaymentSheet()
                if (!error) return { status: 'success' }
                if (error.code === PaymentSheetError.Canceled) return { status: 'canceled' }
                console.warn('[stripe] presentPaymentSheet failed', error)
                return { status: 'failed', message: error.message }
            } catch (err) {
                // Typically the native Stripe module is missing: an old dev build, or Expo Go.
                console.warn('[stripe] payment sheet threw', err)
                return {
                    status: 'failed',
                    message: `Stripe could not open (${err instanceof Error ? err.message : 'unknown error'}). Reinstall the app from a fresh build.`,
                }
            }
        },
        [initPaymentSheet, presentPaymentSheet],
    )
}
