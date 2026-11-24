import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { UnavailableReason } from '../types/checkout'

/** The words for why a row (or a drop you tried to add) cannot be bought now. */
export const UNAVAILABLE_LABELS: Record<UnavailableReason, string> = {
    REMOVED: 'No longer available',
    NOT_ON_SALE: 'Not on sale right now',
    NOT_RELEASED_YET: 'Not released yet',
    CLOSED: 'Sale has closed',
    NO_PRICE: 'No price yet',
    NOT_AVAILABLE_IN_REGION: 'Not available in your region',
}

export function unavailableLabel(reason: string | null | undefined): string {
    return (reason && UNAVAILABLE_LABELS[reason as UnavailableReason]) || 'Not available right now'
}

/**
 * A sentence for a failed cart call, keyed on the error `code` (never the
 * message text). The codes are the backend's `ORDERS_*` set — the cart lives in
 * the orders module and shares them with checkout.
 */
export function cartErrorMessage(err: unknown): string {
    if (!(err instanceof ApiRequestError)) return describeApiError(err)

    switch (err.error.code) {
        case 'ORDERS_NOT_PURCHASABLE': {
            const reason = (err.error.details as { reason?: string } | undefined)?.reason
            return `This drop can't be added: ${unavailableLabel(reason).toLowerCase()}.`
        }
        case 'ORDERS_NO_PRICE':
            return 'This drop is not available in your region.'
        case 'ORDERS_NOT_FOUND':
            return "This drop isn't available."
        case 'ORDERS_VARIANT_NOT_FOUND':
            return "That option isn't available. Choose another."
        case 'ORDERS_CART_FULL':
            return 'Your cart is full (50 items). Remove something to add more.'
        case 'ORDERS_CART_ITEM_NOT_FOUND':
            return 'That item is no longer in your cart.'
        default:
            return describeApiError(err)
    }
}
