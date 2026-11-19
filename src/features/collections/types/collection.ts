/**
 * Types for the Collections module — mirrors `/api/v1/collections` in the
 * backend API reference (`collections-api.md`). Backs the "My Collection" tab:
 * the physical items a user owns, their stats, and the public/private switch per
 * item. There is no "add to collection" endpoint: items reach the shelf only by
 * an NFC claim.
 */

export type CollectionVisibility = 'PUBLIC' | 'PRIVATE'

export type ClaimedStatus = 'UNCLAIMED' | 'CLAIMED' | 'IN_TRANSFER' | 'FLAGGED'

/** The serialized unit a shelf row is: copy #14 of an edition. */
export interface CollectionSku {
    /** What `PATCH /collections/me/:skuId` takes — not the shelf-row id, not the product id. */
    id: string
    skuCode: string
    /** "#14" — position in the edition. */
    serialNumber: number
    claimedStatus: ClaimedStatus
}

/** Product card embedded in a shelf row — tap → GET /products/:id for full detail. */
export interface CollectionProductCard {
    /** The drop id. */
    id: string
    name: string
    /** Primary image; null when the drop has none (or the server has no storage bucket). */
    imageUrl: string | null
    /** Free-form text, null when not set. Format it for display; never switch on it as an enum. */
    rarity: string | null
    /** 0 when none is set. */
    rewardPoints: number
}

/**
 * One shelf row = **one serialized unit**. A user who owns three copies of the
 * same drop has three rows.
 */
export interface CollectionItem {
    /** Shelf-row id (not used in any path). */
    id: string
    visibility: CollectionVisibility
    /** When it reached the shelf — the claim. */
    acquiredAt: string
    sku: CollectionSku
    product: CollectionProductCard
}

/** Query params for GET /api/v1/collections/me. (There is no genre filter any more.) */
export interface MyCollectionFilters {
    visibility?: CollectionVisibility
    /** int ≥ 1, default 1. */
    page?: number
    /** int 1–50, default 20. */
    limit?: number
}

/** Query params for GET /api/v1/collections/user/:userId (always PUBLIC items only). */
export interface UserCollectionFilters {
    page?: number
    limit?: number
}

/** Body for PATCH /api/v1/collections/me/:skuId. */
export interface UpdateVisibilityInput {
    visibility: CollectionVisibility
}

/** GET /api/v1/collections/me/stats — aggregated stats for the Collections screen. */
export interface CollectionStats {
    /** Every live shelf row. */
    totalClaimedItems: number
    /** Artist collections the user owns at least one item from. */
    totalArtistCollections: number
    collectionProgress: {
        /** The user's items that belong to an artist collection (units, so two copies count twice). */
        owned: number
        /** Σ maximumLimit of those collections. */
        total: number
        /** round(owned / total × 100), 0–100; 0 when total is 0. */
        percentage: number
    }
}
