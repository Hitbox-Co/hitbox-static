import { InvoiceStatus, InvoiceTaxType } from '../types/invoice'

/** "20 Oct 2026" — an ISO date for an invoice row. */
export function formatInvoiceDate(iso: string | null | undefined): string {
    if (!iso) return '—'
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * "12.000" → "12%", "8.875" → "8.875%". A rate arrives as a string, so it is only
 * ever trimmed for display, never summed.
 */
export function formatTaxRate(rate: string): string {
    const n = Number(rate)
    return Number.isFinite(n) ? `${n}%` : rate
}

/** "GST 12%", "Sales tax 8.875%", or "Tax exempt". */
export function formatTax(taxType: InvoiceTaxType, rate: string): string {
    if (taxType === 'EXEMPT') return 'Tax exempt'
    const name = taxType === 'GST' ? 'GST' : 'Sales tax'
    return `${name} ${formatTaxRate(rate)}`
}

/**
 * The badge for each status. ISSUED is the normal final state; VOID is cancelled
 * (its number is kept, never reused); CORRECTED was replaced by a newer invoice
 * for the same order, so it reads "Superseded".
 */
export const STATUS_BADGES: Record<InvoiceStatus, { label: string; bg: string; text: string; border: string }> = {
    ISSUED: { label: 'ISSUED', bg: '#b6ffd6', text: '#0fab48', border: 'rgba(24,116,69,0.4)' },
    VOID: { label: 'VOID', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    CORRECTED: { label: 'SUPERSEDED', bg: '#fffaed', text: '#d97706', border: '#fcd34d' },
}

/** The list's one-line summary: first item, plus how many more. */
export function summariseLines(lineItems: { description: string }[]): string {
    if (lineItems.length === 0) return 'No items'
    const [first, ...rest] = lineItems
    return rest.length === 0 ? first!.description : `${first!.description} + ${rest.length} more`
}

/** Safe lookup: an invoice status the app does not know yet shows neutrally instead of crashing the screen. */
export function invoiceBadge(status: string) {
    return (
        STATUS_BADGES[status as InvoiceStatus] ?? {
            label: status.replace(/_/g, ' ').toUpperCase(),
            bg: '#f3f4f6',
            text: '#6b7280',
            border: '#d1d5db',
        }
    )
}
