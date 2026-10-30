/** Shapes returned by the claims module (see hitbox-backend docs/nfc-claim-verify-api.md). */

/** Someone's public face. Null wherever the owner keeps the item private. */
export interface ClaimOwner {
    id: string
    handle: string | null
    displayName: string | null
}

/** The product a tap resolved to — enough to render a card without a second call. */
export interface TapProduct {
    id: string
    groupCode: string
    name: string
    status: string
    rarity: string | null
    imageUrl: string | null
    /** Decimal string, e.g. "89.99". Null when the drop has no base price. */
    priceInDollars: string | null
    currency: string | null
}

export interface TapSku {
    id: string
    skuCode: string
    serialNumber: number
}

/**
 * A tap that did not authenticate. Deliberately says nothing about why (forged,
 * replayed, retired, unknown): the server will not tell, and neither can we.
 */
export interface NotVerified {
    verified: false
    message: string
}

/** GET /api/v1/verify?b=&e=&c= — authenticity + current state. Never claims. */
export interface TapVerified {
    verified: true
    claimed: boolean
    claimedStatus: 'UNCLAIMED' | 'CLAIMED' | 'IN_TRANSFER' | 'FLAGGED'
    sku: TapSku
    product: TapProduct
    /** Null when unclaimed, or when the owner keeps this item private. */
    owner: ClaimOwner | null
    claimedAt: string | null
    verifiedAt: string
}

export type VerifyTapResult = TapVerified | NotVerified

/**
 * POST /api/v1/claim, once the tap authenticated.
 *
 *   CLAIMED                    this tap claimed it
 *   ALREADY_CLAIMED            it belonged to someone before this tap
 *   CLAIMED_BY_OTHER_JUST_NOW  lost a simultaneous race by milliseconds
 *   UNAVAILABLE                authentic, but frozen or in transfer right now
 */
export interface ClaimResult {
    verified: true
    outcome: 'CLAIMED' | 'ALREADY_CLAIMED' | 'CLAIMED_BY_OTHER_JUST_NOW' | 'UNAVAILABLE'
    claimedByYou: boolean
    message: string
    /** Null when someone else owns it and keeps it private. */
    owner: ClaimOwner | null
    sku: TapSku & { claimedStatus: string }
    product: TapProduct
    claimedAt: string | null
    claim: { id: string; claimCode: string; claimedNo: number } | null
}

/** POST /api/v1/claim when the tap did not authenticate (still HTTP 200). */
export interface ClaimNotVerified extends NotVerified {
    outcome: 'NOT_VERIFIED'
}

export type ClaimTapResult = ClaimResult | ClaimNotVerified

/** What the success / owned screens render. */
export type OwnedView = Pick<ClaimResult, 'owner' | 'claimedByYou' | 'claimedAt' | 'product' | 'sku'>
