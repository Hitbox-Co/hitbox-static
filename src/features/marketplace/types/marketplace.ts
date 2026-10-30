/**
 * Types for the Marketplace module — mirrors `/api/v1/marketplace` in the
 * backend API reference. Items are lightweight listing cards; on tap the
 * client fetches the full product from GET /api/v1/products/:id.
 */

/** "HOT" ← TRENDING_NOW, "NEW" ← NEW_RELEASE, null otherwise. */
export type MarketplaceBadge = 'HOT' | 'NEW' | null

/** MarketplaceListingItem — the only shape this module returns. */
export interface MarketplaceListingItem {
    id: string
    name: string
    /** First product image; null if the product has none. */
    imageUrl: string | null
    /** Via the product's collection; null if none. */
    artistName: string | null
    /** Decimal serialized as string, e.g. "89.99". */
    priceInDollars: string
    /** No longer sent by the API; kept optional for older servers. */
    rewardPoints?: number | null
    badge: MarketplaceBadge
}

/** GET /api/v1/marketplace — the whole screen in one round-trip. */
export interface MarketplaceFeed {
    /** Curated products (any marketplace status), most-sold first. ≤10 */
    featured: MarketplaceListingItem[]
    /** Newest active products. ≤10 */
    newListings: MarketplaceListingItem[]
}

/**
 * Screen-level category tabs. Each maps to one or more product categories
 * on the backend (e.g. `cards` → TRADING_CARD + CARD_PACK). Omit for "All Items".
 */
export type MarketplaceCategory = 'cards' | 'figures' | 'apparel' | 'posters' | 'digital' | 'other'

export type MarketplaceSort = 'newest' | 'price_asc' | 'price_desc' | 'popular'

/** Query params for GET /api/v1/marketplace/listings (tabs, search, "See All"). */
export interface MarketplaceListingFilters {
    category?: MarketplaceCategory
    /** 1–100 chars, case-insensitive name match. */
    search?: string
    /** Default `newest`. */
    sort?: MarketplaceSort
    /** int ≥ 1, default 1. */
    page?: number
    /** int 1–50, default 20. */
    limit?: number
}
