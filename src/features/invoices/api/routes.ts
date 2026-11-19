import { InvoiceFilters } from '../types/invoice'

/**
 * Invoices module endpoints. All need the Clerk session and always answer in
 * buyer scope: you only ever see your own, and someone else's is a 404, never a 403.
 * (The router is mounted at `/`, so the path really is `/api/v1/invoices`.)
 */
export const INVOICE_ROUTES = {
    /** GET — my invoices, newest first. */
    list: '/api/v1/invoices',
    /** GET — one invoice: number, amounts, tax, line items. */
    byId: (invoiceId: string) => `/api/v1/invoices/${encodeURIComponent(invoiceId)}`,
    /** GET — a presigned PDF link, valid 300 seconds. */
    download: (invoiceId: string) => `/api/v1/invoices/${encodeURIComponent(invoiceId)}/download`,
} as const

/** TanStack Query keys for the invoices feature. (No key for a download: a link is never cached.) */
export const invoiceKeys = {
    all: ['invoices'] as const,
    list: (filters: InvoiceFilters = {}) => ['invoices', 'list', filters] as const,
    detail: (invoiceId: string) => ['invoices', 'detail', invoiceId] as const,
}

export function buildInvoicesPath(filters: InvoiceFilters) {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.countryCode) params.append('countryCode', filters.countryCode)
    if (filters.stateCode) params.append('stateCode', filters.stateCode)
    if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear)
    if (filters.issuedFrom) params.append('issuedFrom', filters.issuedFrom)
    if (filters.issuedTo) params.append('issuedTo', filters.issuedTo)
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    const qs = params.toString()
    return qs ? `${INVOICE_ROUTES.list}?${qs}` : INVOICE_ROUTES.list
}
