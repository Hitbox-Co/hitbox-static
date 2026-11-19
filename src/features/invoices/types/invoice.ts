/**
 * Types for the Invoices module — mirrors `/api/v1/invoices` in the backend API
 * reference (`invoices-api.md`): the buyer's own tax invoices (receipts).
 *
 * Every money value and every rate is a **string** ("2240.00", "12.000"). Never
 * sum them as floats; only format them for display.
 */

export type InvoiceStatus = 'ISSUED' | 'VOID' | 'CORRECTED'

export type InvoiceTaxType = 'GST' | 'SALES_TAX' | 'EXEMPT'

/** HitBox's legal entity for the invoice's country. India fills gstin/pan; the US fills ein. */
export interface InvoiceSupplier {
    name: string
    address: string
    gstin: string | null
    pan: string | null
    ein: string | null
}

export interface InvoiceCustomer {
    name: string
    email: string
    /** The billing address, lines joined by "\n"; null if none. */
    address: string | null
    /** Always null today. */
    gstin: string | null
}

export interface InvoiceLineItem {
    position: number
    description: string
    hsnCode: string | null
    sacCode: string | null
    quantity: number
    unitPrice: string
    lineSubtotal: string
    /** Percent, e.g. "12.000". */
    taxRate: string
    taxAmount: string
    lineTotal: string
}

export interface Invoice {
    id: string
    /** INV-<fiscal year>-<country>-<6-digit sequence>. Use it for the file name. */
    invoiceNumber: string
    invoiceDate: string
    /** India: "2026-27"; US: "2026". */
    fiscalYear: string
    status: InvoiceStatus
    /** → GET /orders/:orderId. */
    orderId: string
    countryCode: string
    stateCode: string | null
    currency: string
    taxType: InvoiceTaxType
    /** Percent, e.g. "12.000". */
    taxRate: string
    hsnCode: string | null
    /** Before tax. */
    subtotal: string
    taxAmount: string
    totalAmount: string
    supplier: InvoiceSupplier
    customer: InvoiceCustomer
    lineItems: InvoiceLineItem[]
    /** The PDF is already rendered; download works either way. */
    documentAvailable: boolean
    notes: string | null
    issuedAt: string
}

/** Query params for GET /api/v1/invoices (the buyer's own — `buyerId` would be ignored). */
export interface InvoiceFilters {
    status?: InvoiceStatus
    /** 2 uppercase letters, e.g. "IN". */
    countryCode?: string
    /** 2 uppercase letters, e.g. "KA". */
    stateCode?: string
    /** e.g. "2026-27". */
    fiscalYear?: string
    /** ISO date; invoiceDate >= issuedFrom. */
    issuedFrom?: string
    /** ISO date; invoiceDate < issuedTo. */
    issuedTo?: string
    page?: number
    /** int 1–100, default 20. */
    limit?: number
}

/** Response of GET /api/v1/invoices/:invoiceId/download — a link good for 5 minutes. */
export interface InvoiceDownload {
    url: string
    /** Seconds the link stays valid (300). */
    expiresIn: number
    invoiceNumber: string
}
