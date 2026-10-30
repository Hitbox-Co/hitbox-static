/**
 * Types for the Discover module — mirrors `/api/v1/discover` in the backend
 * API reference. Discover deliberately returns lightweight cards, not full
 * products; fetch `GET /api/v1/products/:id` when a card is opened.
 */

/** DiscoverProductItem — the only shape the discover module returns. */
export interface DiscoverProductItem {
    id: string
    name: string
    /** First product image; null if the product has none. */
    imageUrl: string | null
    /** No longer sent by the API; kept optional for older servers. */
    rewardPoints?: number | null
}

/** GET /api/v1/discover — the whole screen in one round-trip. */
export interface DiscoverFeed {
    featured: DiscoverProductItem[]      // ≤5
    trending: DiscoverProductItem[]      // ≤10, unitsSold desc
    newReleases: DiscoverProductItem[]   // ≤10, createdAt desc
    topCreators: DiscoverProductItem[]   // ≤10, unitsSold desc
}

/** `section` values accepted by GET /api/v1/discover/products. */
export type DiscoverSection = 'trending' | 'new_releases' | 'top_creators'

/** Query params for GET /api/v1/discover/products ("See All" + search). */
export interface DiscoverProductFilters {
    section?: DiscoverSection
    /** 1–100 chars, case-insensitive name match. */
    search?: string
    /** int ≥ 1, default 1. */
    page?: number
    /** int 1–50, default 20. */
    limit?: number
}
