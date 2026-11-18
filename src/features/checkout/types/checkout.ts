/**
 * Types for the Checkout module (cart → delivery → payment → review → result).
 *
 * STATIC FOR NOW: there is no cart, address, payment or order API yet, so these
 * shapes are the client's own. When the backend exists, mirror its DTOs here and
 * replace the mock data / store in this feature (see `data/mockCheckout.ts`).
 */

export interface DeliveryAddress {
    id: string
    /** "Home", "Work"… shown after the name. */
    label: string
    fullName: string
    email: string
    phone: string
    country: string
    street: string
    /** Apartment, suite, etc. */
    unit: string
    city: string
    state: string
    zip: string
}

export type PaymentMethodId = 'card' | 'apple_pay' | 'google_pay'

export interface SavedCard {
    brand: string
    last4: string
    holder: string
}

/** The one drop being bought. Cart and Buy Now both put a product id here. */
export interface CheckoutItem {
    productId: string
    name: string
    imageUrl: string | null
    /** Collection or artist name, when the product has one. */
    creator: string | null
    /** Unit price in USD. */
    unitPriceUsd: number
    rarity: string | null
    rewardPoints: number | null
    quantity: number
}

export interface OrderTotals {
    subtotal: number
    delivery: number
    tax: number
    total: number
}

export type PaymentOutcome = 'success' | 'failure'
