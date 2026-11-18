import { useSyncExternalStore } from 'react'

import { MOCK_SAVED_ADDRESS } from '../data/mockCheckout'
import { DeliveryAddress, PaymentMethodId } from '../types/checkout'

/**
 * Where the buyer is in the cart → checkout flow. In-memory and per session:
 * with no cart or order API there is nothing to persist to. When one exists,
 * replace this with TanStack Query hooks (`features/checkout/api/…`) and keep
 * only the in-progress choices (selected address / payment method) here.
 */
interface CheckoutState {
    /** The product in the cart (or being bought now); null when nothing is. */
    productId: string | null
    quantity: number
    addresses: DeliveryAddress[]
    selectedAddressId: string
    paymentMethod: PaymentMethodId
}

let state: CheckoutState = {
    productId: null,
    quantity: 1,
    addresses: [MOCK_SAVED_ADDRESS],
    selectedAddressId: MOCK_SAVED_ADDRESS.id,
    paymentMethod: 'card',
}

const listeners = new Set<() => void>()
const set = (patch: Partial<CheckoutState>) => {
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
}

export const checkoutActions = {
    /** Add to Cart and Buy Now both start here: one drop, quantity 1. */
    startWith(productId: string) {
        set({ productId, quantity: 1 })
    },
    setQuantity(quantity: number) {
        set({ quantity: Math.max(1, quantity) })
    },
    clearCart() {
        set({ productId: null, quantity: 1 })
    },
    /** Saves an address and makes it the one the order ships to. */
    saveAddress(address: DeliveryAddress) {
        const exists = state.addresses.some((a) => a.id === address.id)
        set({
            addresses: exists
                ? state.addresses.map((a) => (a.id === address.id ? address : a))
                : [...state.addresses, address],
            selectedAddressId: address.id,
        })
    },
    selectAddress(id: string) {
        set({ selectedAddressId: id })
    },
    selectPayment(paymentMethod: PaymentMethodId) {
        set({ paymentMethod })
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

/** The address the order will ship to. */
export function selectedAddressOf(s: CheckoutState): DeliveryAddress {
    return s.addresses.find((a) => a.id === s.selectedAddressId) ?? s.addresses[0]
}
