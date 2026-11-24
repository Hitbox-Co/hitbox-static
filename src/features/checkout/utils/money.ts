import { OrderTotals } from '../types/checkout'

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
    const delivery = 0
    const tax = 0
    return { subtotal, delivery, tax, total: round2(subtotal + delivery + tax) }
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Any currency, for the cart's live prices. Cart rows carry the drop's own
 * currency (and `summary.subtotals` is one entry per currency), unlike the
 * later checkout steps, which are USD.
 */
export function formatMoney(amount: string | number, currency: string): string {
    const n = Number(amount)
    if (!Number.isFinite(n)) return `${currency} ${amount}`
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
    } catch {
        return `${currency} ${n.toFixed(2)}`
    }
}

/** A cart drop's price: "Free", an amount, or a dash when it has none. */
export function formatDropPrice(price: { amount: string; currency: string; isFree: boolean } | null | undefined): string {
    if (!price) return '—'
    if (price.isFree) return 'Free'
    return formatMoney(price.amount, price.currency)
}
