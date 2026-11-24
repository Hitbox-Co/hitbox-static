/**
 * Payments module endpoints (backend `payments-api.md`). The paths sit directly
 * under `/api/v1`. All need the Clerk session. Stripe's own webhook is
 * server-to-server and never called by the app.
 */
export const PAYMENT_ROUTES = {
    /** GET — public: the markets (currencies) a buyer can shop in. */
    markets: '/api/v1/markets',
    /** POST — the price breakdown before paying; no hold, no Stripe call. */
    quote: '/api/v1/checkout/quote',
    /** POST — place an order, hold one piece for 15 min, start a Stripe payment. */
    checkout: '/api/v1/checkout',
    /** POST — back to paying for an unpaid order (same order, same charge). */
    resume: (orderId: string) => `/api/v1/checkout/${encodeURIComponent(orderId)}/resume`,
    /** POST — an upload URL for ONE photo of an item being returned. */
    evidenceUploadUrl: '/api/v1/refunds/evidence/upload-url',
    /** POST — request a refund (also how to cancel a PAID order). */
    refunds: '/api/v1/refunds',
    /** GET — one of my refunds, with its photos. */
    refund: (refundId: string) => `/api/v1/refunds/${encodeURIComponent(refundId)}`,
} as const

export const quoteKeys = {
    markets: ['markets'] as const,
    quote: (input: unknown) => ['checkout', 'quote', input] as const,
}

export const refundKeys = {
    detail: (refundId: string) => ['refunds', 'detail', refundId] as const,
}
