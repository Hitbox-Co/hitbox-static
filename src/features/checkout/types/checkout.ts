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
    /** The chosen variant ("Size M"), when the drop has them. */
    variantLabel?: string | null
}

export interface OrderTotals {
    subtotal: number
    delivery: number
    tax: number
    total: number
}

export type PaymentOutcome = 'success' | 'failure'

/* ------------------------------------------------------------------ */
/* Cart API (backend cart-api.md)                                      */
/* ------------------------------------------------------------------ */

/** Why a cart row cannot be checked out right now. */
export type UnavailableReason = 'REMOVED' | 'NOT_ON_SALE' | 'NOT_RELEASED_YET' | 'CLOSED' | 'NO_PRICE'

export interface CartDropVariant {
    id: string
    label: string
    isActive: boolean
}

/** The same drop card Discover shows, plus live purchase state. */
export interface CartDropCard {
    id: string
    name: string
    imageUrl: string | null
    rarity: string | null
    artist: { id: string; name: string; slug: string } | null
    /** Decimal-as-string amount, e.g. "225.00". */
    price: { amount: string; currency: string; isFree: boolean } | null
    totalSupply: number
    mintedCount: number
    rewardPoints: number | null
    status: string
    isViewable: boolean
    /** False → disable Checkout for this row. */
    isPurchasable: boolean
    unavailableReason: UnavailableReason | null
    variants: CartDropVariant[]
}

/** One cart row: one drop (and variant), one unit. No quantity. */
export interface CartItemView {
    /** CartItem id — use it for DELETE /cart/:itemId. */
    id: string
    /** The drop id — what POST /checkout takes. */
    productId: string
    variant: { id: string; label: string } | null
    addedAt: string
    /** Null only if the drop row is gone. */
    product: CartDropCard | null
}

export interface CartSummary {
    itemCount: number
    /** Rows checkout would accept right now. */
    purchasableCount: number
    /** Purchasable rows only, one entry per currency. Indicative, not a charge. */
    subtotals: { currency: string; amount: string }[]
}

export interface CartView {
    /** Newest first. */
    items: CartItemView[]
    summary: CartSummary
}
