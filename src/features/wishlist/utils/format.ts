import { UnavailableReason } from '../types/wishlist'

/** The buyer's word for each `unavailableReason`; null when it can be bought. */
export function unavailableLabel(reason: UnavailableReason | null | undefined, status?: string): string | null {
    switch (reason) {
        case 'REMOVED':
            return 'No longer available'
        case 'NOT_ON_SALE':
            return status === 'ENDED' ? 'Ended' : 'Sold out'
        case 'NOT_RELEASED_YET':
            return 'Coming soon'
        case 'CLOSED':
            return 'Ended'
        case 'NO_PRICE':
            return 'Unavailable'
        default:
            return null
    }
}
