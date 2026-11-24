import { useSyncExternalStore } from 'react'

/**
 * Where the buyer is in the cart → checkout flow. In-memory and per session: it
 * holds only the in-progress choices. Addresses, prices and orders are server
 * state (`features/addresses`, `features/payments`) and are never copied here.
 */
interface CheckoutState {
    /** The product in the cart (or being bought now); null when nothing is. */
    productId: string | null
    /** The chosen variant's label ("Size M"), shown on the item rows. */
    variantLabel: string | null
    /** The chosen variant's id — what `POST /checkout` takes. */
    variantId: string | null
    quantity: number
    /**
     * The saved address the order ships to and is billed from (`Address.id`).
     * Null until the buyer picks one; the Delivery step falls back to their default.
     */
    selectedAddressId: string | null
}

let state: CheckoutState = {
    productId: null,
    variantLabel: null,
    variantId: null,
    quantity: 1,
    selectedAddressId: null,
}

const listeners = new Set<() => void>()
const set = (patch: Partial<CheckoutState>) => {
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
}

export const checkoutActions = {
    /**
     * Buy Now, and "Checkout" on a cart row, both start here: one drop, one unit.
     * (Each cart row is paid for on its own, so the flow only ever holds one.)
     */
    startWith(productId: string, variantLabel: string | null = null, variantId: string | null = null) {
        set({ productId, variantLabel, variantId, quantity: 1 })
    },
    setQuantity(quantity: number) {
        set({ quantity: Math.max(1, quantity) })
    },
    clearCart() {
        set({ productId: null, variantLabel: null, variantId: null, quantity: 1 })
    },
    selectAddress(id: string | null) {
        set({ selectedAddressId: id })
    },
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function useCheckoutState(): CheckoutState {
    return useSyncExternalStore(subscribe, () => state, () => state)
}
