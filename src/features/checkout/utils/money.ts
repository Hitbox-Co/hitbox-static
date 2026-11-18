import { OrderTotals } from '../types/checkout'
import { MOCK_DELIVERY_FEE_USD, MOCK_TAX_RATE } from '../data/mockCheckout'

/**
 * Checkout amounts are always shown in **USD**, with a "USD" label, on purpose.
 *
 * The rest of the app converts prices into the viewer's display currency
 * (`@/lib/currency`), but that is display-only: an order is charged in USD
 * (AGENTS.md §6). A checkout that showed ₹ while charging $ would mislead, so
 * these screens bypass the display conversion.
 */

const fmt = (n: number, decimals: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

/** "$207.80" — totals and line amounts. */
export function formatUsd(amount: number): string {
    return `$${fmt(amount, 2)}`
}

/** "$185 USD" — an item's price; whole dollars drop the cents, like the Figma. */
export function formatItemPrice(amount: number): string {
    const whole = Math.abs(amount - Math.round(amount)) < 0.005
    return `$${fmt(amount, whole ? 0 : 2)} USD`
}

/** Subtotal, delivery, tax and total for a quantity of one item. */
export function computeTotals(unitPriceUsd: number, quantity: number): OrderTotals {
    const subtotal = round2(unitPriceUsd * quantity)
    const delivery = MOCK_DELIVERY_FEE_USD
    const tax = round2(subtotal * MOCK_TAX_RATE)
    return { subtotal, delivery, tax, total: round2(subtotal + delivery + tax) }
}

const round2 = (n: number) => Math.round(n * 100) / 100
