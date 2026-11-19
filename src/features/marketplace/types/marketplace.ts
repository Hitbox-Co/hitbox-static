/**
 * Types for the Marketplace module — mirrors `/api/v1/marketplace` in the
 * backend API reference (`marketplace-api.md`). Both endpoints are public; a
 * Clerk token is optional and only fills in `isWishlisted`.
 *
 * Every card is a primary drop sold by HitBox: there is no live peer-to-peer
 * trading API (the Peer-to-Peer banner is a static promo).
 */

import type { DiscoverCategory, DiscoverProductItem } from '@/features/discover/types/discover'

/**
 * One listing card. It is **the same card as Discover** — the server builds both
 * with one function — so the type is shared. Tap → `GET /products/:id`.
 *
 * `rarity` and `category` are free-form columns: format them for display, never
 * switch on them as a fixed list.
 */
export type MarketplaceListingItem = DiscoverProductItem

/**
 * GET /api/v1/marketplace — the whole screen in one round-trip. `featured` is
 * never empty while the selected category has any public drop (it is topped up
 * with the most popular ones); `newListings` can be empty.
 */
export interface MarketplaceFeed {
    /** ≤10, most minted first — Featured Listings. */
    featured: MarketplaceListingItem[]
    /** ≤10, newest first. Not in the Figma, free to use. */
    newListings: MarketplaceListingItem[]
}

/** Category chips — the same ids and meaning as Discover's. Omit for All Items. */
export type MarketplaceCategory = DiscoverCategory

/** There is no price sort: price lives in a per-market table, so it cannot be an ORDER BY. */
export type MarketplaceSort = 'newest' | 'popular'

/** Query params for GET /api/v1/marketplace/listings (chips, search and "See All"). */
export interface MarketplaceListingFilters {
    /**
     * `true` = only drops that qualify as featured (a release window), with no
     * top-up fallback — what "See All" on Featured Listings asks for.
     */
    featured?: boolean
    category?: MarketplaceCategory
    /** 1–100 chars, case-insensitive match on name. */
    search?: string
    /** Default `newest`. */
    sort?: MarketplaceSort
    /** int ≥ 1, default 1. */
    page?: number
    /** int 1–50, default 20. */
    limit?: number
}
