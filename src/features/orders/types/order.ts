/**
 * Types for the Orders module — mirrors `/api/v1/orders` in the backend API
 * reference (`orders-api.md`): the buyer's own orders. Money is always a decimal
 * **string** in the order's own currency; dates are ISO-8601 UTC strings.
 *
 * Placing an order and paying for it live in the payments module (`/checkout`),
 * not here. **The app never decides an order is paid**: Stripe tells the server,
 * the server moves the order to PAID, and the app polls `GET /orders/:orderId`.
 */

export type OrderStatus =
    | 'PENDING_PAYMENT'
    | 'PAID'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED'

/** The "My orders" tabs. */
export type OrderTab = 'all' | 'active' | 'completed' | 'cancelled'

export type OrderPaymentStatus = 'AWAITING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'

export interface OrderProduct {
    /** The drop id → GET /products/:id. */
    id: string
    name: string
    /** The drop's group code. */
    code: string
    imageUrl: string | null
    artistName: string | null
}

/** Carrier details. There is no live parcel-scan feed: just name, number and a link. */
export interface OrderListTracking {
    carrierName: string
    trackingNumber: string
    /** An https link when the carrier has one. */
    trackingUrl: string | null
}

/** One row on "My orders". */
export interface BuyerOrderListItem {
    id: string
    /** Short code to show and quote to support; null on old orders. */
    reference: string | null
    status: OrderStatus
    /** English label from the API. */
    statusLabel: string
    placedAt: string
    deliveredAt: string | null
    product: OrderProduct
    /** Null for a drop without variants. */
    variantLabel: string | null
    /** Always 1 today. */
    quantity: number
    amount: string
    currency: string
    /** Null until shipped. */
    tracking: OrderListTracking | null
    /** True while a refund is REQUESTED / AWAITING_RETURN / APPROVED. */
    refundInProgress: boolean
}

/** GET /api/v1/orders — **no `data` envelope**: the fields sit at the top level. */
export interface BuyerOrderListResponse {
    page: number
    limit: number
    /** Rows in the selected tab. */
    total: number
    /** Every tab's count, always — use it for the tab badges. */
    counts: Record<OrderTab, number>
    items: BuyerOrderListItem[]
}

export interface OrderVariantOption {
    dimension: string
    value: string
    hexCode: string | null
}

/** A copy taken at checkout; it does not change when the address book does. */
export interface BuyerAddress {
    recipientName: string
    line1: string
    line2: string | null
    city: string
    state: string | null
    postalCode: string
    countryCode: string
    phone: string | null
}

export type RefundStatus = 'REQUESTED' | 'AWAITING_RETURN' | 'APPROVED' | 'PROCESSED' | 'REJECTED'

export interface BuyerOrderRefund {
    /** → GET /refunds/:refundId for the photos. */
    id: string
    status: RefundStatus
    statusLabel: string
    reasonCode: string
    reason: string
    /** Null only on very old rows. */
    amount: string | null
    currency: string
    requestedAt: string
    /** The item must come back before approval. */
    returnRequired: boolean
    /** Set when the warehouse receives it. */
    returnReceivedAt: string | null
    photoCount: number
    /** Set when REJECTED. */
    rejectionReason: string | null
    /** When HitBox sent the money; banks take 5–10 business days after this. */
    processedAt: string | null
    /** True: Stripe reported the refund failed; support will contact the buyer. */
    failed: boolean
}

export type DeliveredVia = 'ADMIN' | 'NFC_CLAIM' | null

export interface OrderShipment {
    carrierName: string
    trackingNumber: string
    trackingUrl: string | null
    shippedAt: string | null
    deliveredAt: string | null
    deliveredVia: DeliveredVia
}

export interface OrderTimelineEntry {
    status: OrderStatus
    at: string
}

export type RefundBlockedReason =
    | 'ORDER_NOT_REFUNDABLE'
    | 'REFUND_IN_PROGRESS'
    | 'RETURN_WINDOW_CLOSED'
    | 'FULLY_REFUNDED'

/** Which buttons to show — render from these, never from the status. */
export interface BuyerOrderActions {
    /** → POST /orders/:orderId/cancel (an unpaid order only). */
    canCancel: boolean
    /** → POST /checkout/:orderId/resume. */
    canResumePayment: boolean
    /** → POST /refunds. */
    canRequestRefund: boolean
    /** Why not, when canRequestRefund is false. */
    refundBlockedReason: RefundBlockedReason | null
    /** Null until delivered. "Return by 4 Nov". */
    returnWindowEndsAt: string | null
    /** A shipment exists. */
    canTrack: boolean
    /** An invoice exists → `invoice.id`. */
    canDownloadInvoice: boolean
}

/** The order screen. */
export interface BuyerOrderDetail extends Omit<BuyerOrderListItem, 'tracking' | 'refundInProgress'> {
    paidAt: string | null
    shippedAt: string | null
    /** Null for a drop without variants. */
    variant: { id: string; label: string; options: OrderVariantOption[] } | null
    /** Null until a packer scans the numbered piece. */
    unit: {
        skuCode: string
        /** "#14". */
        serialNumber: number
        /** The buyer tapped the tag and owns it. */
        claimed: boolean
        claimedAt: string | null
    } | null
    unitPrice: string
    shippingAddress: BuyerAddress | null
    billingAddress: BuyerAddress | null
    payment: {
        status: OrderPaymentStatus
        paidAt: string | null
        /** While AWAITING_PAYMENT: when the held piece is released. */
        payBy: string | null
        /** The last declined attempt's reason ("Your card was declined."). */
        failureReason: string | null
    }
    /** Newest first; [] when none. */
    refunds: BuyerOrderRefund[]
    /** Null until shipped. */
    tracking: OrderShipment | null
    /** One entry per status reached, oldest first. */
    timeline: OrderTimelineEntry[]
    /** Null until an invoice is issued — "not ready yet", not an error. */
    invoice: {
        /** → GET /invoices/:invoiceId/download. */
        id: string
        number: string
        date: string
        totalAmount: string
        currency: string
    } | null
    actions: BuyerOrderActions
}

/** GET /api/v1/orders/:orderId/tracking — the tracking part on its own, for a light refresh. */
export interface OrderTracking {
    orderId: string
    status: OrderStatus
    placedAt: string
    paidAt: string | null
    shippedAt: string | null
    deliveredAt: string | null
    /** Null until shipped. */
    shipment: OrderShipment | null
    timeline: OrderTimelineEntry[]
}

/** Query params for GET /api/v1/orders. */
export interface OrderFilters {
    tab?: OrderTab
    page?: number
    /** int 1–50, default 10. */
    limit?: number
}
