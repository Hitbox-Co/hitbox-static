import { OrderStatus, RefundBlockedReason, RefundStatus } from '../types/order'

/** "20 Oct 2026". */
export function formatOrderDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** "20 Oct 2026, 09:03". */
export function formatOrderDateTime(iso: string | null | undefined): string {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return `${formatOrderDate(iso)}, ${time}`
}

/** The badge colours for each status. */
export const ORDER_STATUS_BADGES: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    PENDING_PAYMENT: { bg: '#fffaed', text: '#d97706', border: '#fcd34d' },
    PAID: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    PROCESSING: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    SHIPPED: { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
    DELIVERED: { bg: '#b6ffd6', text: '#0fab48', border: 'rgba(24,116,69,0.4)' },
    CANCELLED: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' },
    REFUNDED: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
}

/** The happy-path steps shown as the stepper, in order. */
export const ORDER_STEPS: { status: OrderStatus; label: string }[] = [
    { status: 'PENDING_PAYMENT', label: 'Placed' },
    { status: 'PAID', label: 'Confirmed' },
    { status: 'PROCESSING', label: 'Being packed' },
    { status: 'SHIPPED', label: 'Shipped' },
    { status: 'DELIVERED', label: 'Delivered' },
]

/** Words for a status that is not one of the happy-path steps. */
export const STATUS_WORDS: Record<OrderStatus, string> = {
    PENDING_PAYMENT: 'Awaiting payment',
    PAID: 'Order confirmed',
    PROCESSING: 'Being packed',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
}

export const REFUND_BADGES: Record<RefundStatus, { bg: string; text: string }> = {
    REQUESTED: { bg: '#fffaed', text: '#d97706' },
    AWAITING_RETURN: { bg: '#fffaed', text: '#d97706' },
    APPROVED: { bg: '#eff6ff', text: '#2563eb' },
    PROCESSED: { bg: '#b6ffd6', text: '#0fab48' },
    REJECTED: { bg: '#fef2f2', text: '#dc2626' },
}

/** Why the refund button is unavailable. */
export const REFUND_BLOCKED_TEXT: Record<RefundBlockedReason, string> = {
    ORDER_NOT_REFUNDABLE: "This order can't be refunded right now.",
    REFUND_IN_PROGRESS: 'A refund is already in progress for this order.',
    RETURN_WINDOW_CLOSED: 'The return window for this order has closed.',
    FULLY_REFUNDED: 'This order has already been refunded.',
}

/** "2 : 05" style countdown to `payBy`, or null when it has passed / is unknown. */
export function minutesLeft(payBy: string | null | undefined, now = Date.now()): number | null {
    if (!payBy) return null
    const ms = new Date(payBy).getTime() - now
    return Number.isFinite(ms) && ms > 0 ? Math.ceil(ms / 60000) : null
}

/** The delivered-via line: "Delivered: you tapped your item" / "Delivered". */
export function deliveredText(via: 'ADMIN' | 'NFC_CLAIM' | null): string {
    return via === 'NFC_CLAIM' ? 'Delivered: you tapped your item' : 'Delivered'
}

const NEUTRAL_BADGE = { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' }

/** "SOME_NEW_STATUS" → "Some new status" — for a value the app does not know yet. */
function humanize(value: string): string {
    const text = value.replace(/_/g, ' ').toLowerCase()
    return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Safe lookups. The server may add a status, refund state or blocked reason the
 * app has not heard of; indexing the maps directly would give `undefined` and
 * crash the screen, so each of these falls back to something neutral.
 */
export const orderBadge = (status: string) => ORDER_STATUS_BADGES[status as OrderStatus] ?? NEUTRAL_BADGE
export const statusWord = (status: string) => STATUS_WORDS[status as OrderStatus] ?? humanize(status)
export const refundBadge = (status: string) =>
    REFUND_BADGES[status as RefundStatus] ?? { bg: NEUTRAL_BADGE.bg, text: NEUTRAL_BADGE.text }
export const refundBlockedText = (reason: string) =>
    REFUND_BLOCKED_TEXT[reason as RefundBlockedReason] ?? "A refund isn't available for this order right now."
