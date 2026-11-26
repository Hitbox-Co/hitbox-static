/**
 * Types for the Payments module — mirrors `payments-api.md`. Money is a decimal
 * **string**. The app never decides an order is paid: Stripe tells the server,
 * the server moves the order to PAID, and the app polls `GET /orders/:orderId`.
 */

export interface CheckoutInput {
    productId: string
    /** Omit for a drop without variants. */
    variantId?: string
    /** Needed when the drop is priced in more than one market. */
    marketId?: string
    termsAccepted: true
    shippingAddressId?: string
    billingAddressId?: string
}

export interface Market {
    id: string
    /** USD | INR | GBP */
    currency: string
    countryCodes: string[]
}

export interface CheckoutQuoteInput {
    productId: string
    variantId?: string
    marketId?: string
    shippingAddressId?: string
    billingAddressId?: string
}

export type QuoteUnavailableReason = 'NOT_PUBLISHED' | 'NOT_OPEN_YET' | 'CLOSED' | 'SOLD_OUT'

/** The price before paying. Money and rates are strings; prices are tax-inclusive. */
export interface CheckoutQuote {
    productId: string
    variantId: string | null
    /** Send it back to /checkout. */
    marketId: string
    currency: string
    unitPrice: string
    /** The price without tax. */
    subtotal: string
    taxType: 'GST' | 'SALES_TAX' | 'EXEMPT' | null
    taxRate: string
    /** The part of the price that is tax. */
    taxAmount: string
    shippingAmount: string
    /** Exactly what the card is charged. */
    totalAmount: string
    availability: 'IN_STOCK' | 'SOLD_OUT' | 'NOT_ON_SALE'
    unavailableReason: QuoteUnavailableReason | null
    /** true: POST /checkout refuses without a billing address. */
    billingAddressRequired: boolean
}

/** The result of checkout and resume. */
export interface CheckoutView {
    orderId: string
    paymentTransactionId: string
    skuId: string
    reservationId: string
    /** Pay before this; drives the countdown. */
    reservationExpiresAt: string
    amount: string
    currency: string
    gateway: 'STRIPE'
    status: 'INITIATED' | 'PENDING'
    /** Stripe PaymentIntent client secret; null when the server has no Stripe adapter. */
    clientToken: string | null
    gatewayRef: string | null
}

export type RefundReasonCode =
    | 'DEFECTIVE_ITEM'
    | 'DEFECTIVE_TAG'
    | 'NOT_AS_DESCRIBED'
    | 'NOT_DELIVERED'
    | 'DUPLICATE_CHARGE'
    | 'BUYER_CHANGED_MIND'
    | 'FRAUDULENT_CHARGE'
    | 'OTHER'

export interface RefundInput {
    orderId: string
    reasonCode: RefundReasonCode
    /** 1–1000 chars; at least 20 on a return. */
    reason: string
    /** Decimal string; defaults to the full order amount. */
    amount?: string
    /** true (default) for a delivered item; false to cancel a paid order that has not shipped. */
    physicalReturnRequired?: boolean
    /** 1–8 on a return. */
    evidenceAssetIds?: string[]
}

export interface RefundEvidence {
    assetId: string
    position: number
    fileName: string | null
    mimeType: string
    sizeBytes: number
    /** Signed GET url (5 min); null → show a placeholder. */
    url: string | null
    expiresIn: number
    attachedAt: string
}

export interface RefundView {
    id: string
    orderId: string
    reason: string
    reasonCode: RefundReasonCode
    status: 'REQUESTED' | 'AWAITING_RETURN' | 'APPROVED' | 'PROCESSED' | 'REJECTED'
    amount: string
    currency: string
    physicalReturnRequired: boolean
    physicalReturnConfirmedAt: string | null
    rejectionReason: string | null
    /** FAILED / CANCELED on a PROCESSED refund: the buyer did NOT get the money. */
    gatewayStatus: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | null
    gatewayFailureReason: string | null
    processedAt: string | null
    createdAt: string
    evidenceCount: number
    evidence: RefundEvidence[]
}

export type EvidenceMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/heic' | 'image/heif'

export interface ReturnEvidenceUploadInput {
    orderId: string
    fileName: string
    mimeType: EvidenceMimeType
    /** The exact file size in bytes; max 15 MB. */
    sizeBytes: number
}

export interface ReturnEvidenceUploadView {
    assetId: string
    uploadUrl: string
    expiresIn: number
    /** Send exactly these headers on the PUT. */
    requiredHeaders: Record<string, string>
}
