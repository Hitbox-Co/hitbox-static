import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'

/** A sentence for a failed checkout / resume / refund call, keyed on the error `code`. */
export function paymentErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
        switch (err.error.code) {
            case 'ORDERS_NOT_FOUND':
            case 'PAYMENTS_NOT_FOUND':
                return "We couldn't find that order."
            case 'ORDERS_NOT_PURCHASABLE':
                return 'This drop is not on sale right now.'
            case 'ORDERS_OUT_OF_STOCK':
                return 'Sold out — check back soon.'
            case 'ORDERS_NO_PRICE':
                return 'This drop has no price in your region yet.'
            case 'PAYMENTS_BILLING_ADDRESS_REQUIRED':
                return 'Add a billing address to continue — it decides the tax on your invoice.'
            case 'USERS_ADDRESS_ARCHIVED':
                return 'That address was deleted. Pick another one.'
            case 'USERS_ADDRESS_USAGE_MISMATCH':
                return 'That address is saved for a different use. Pick another one.'
            case 'PAYMENTS_NO_GATEWAY':
            case 'PAYMENTS_GATEWAY_UNAVAILABLE':
                return 'Payments are not available for this drop right now.'
            case 'PAYMENTS_GATEWAY_REJECTED':
                return 'The payment provider refused to start this payment. Please try again.'
            case 'PAYMENTS_GATEWAY_UNREACHABLE':
                return 'We could not reach the payment provider. Please try again.'
            case 'PAYMENTS_ORDER_NOT_PAYABLE':
                return 'This order can no longer be paid. Reload it to see its status.'
            case 'PAYMENTS_RESERVATION_EXPIRED':
                return 'Time ran out and the item was released. Start again from the drop.'
            case 'PAYMENTS_FORBIDDEN':
                return 'That order is not yours.'
            case 'PAYMENTS_NOT_REFUNDABLE':
                return "This order can't be refunded in its current state."
            case 'PAYMENTS_INVALID_TRANSITION':
                return 'A refund is already open for this order.'
            case 'PAYMENTS_RETURN_WINDOW_CLOSED':
                return 'The 10-day return window for this order has closed.'
            case 'PAYMENTS_AMOUNT_EXCEEDS_CAPTURE':
                return 'That is more than is left to refund on this order.'
            case 'PAYMENTS_RETURN_DESCRIPTION_TOO_SHORT':
                return 'Please describe the problem in at least 20 characters.'
            case 'PAYMENTS_RETURN_EVIDENCE_REQUIRED':
                return 'Add at least one photo of the item.'
            case 'PAYMENTS_RETURN_EVIDENCE_INVALID':
                return 'One of your photos could not be used. Remove it and add it again.'
            case 'PAYMENTS_EVIDENCE_STORAGE_UNAVAILABLE':
                return 'Returns are not available right now. Please contact support.'
        }
    }
    return describeApiError(err)
}
