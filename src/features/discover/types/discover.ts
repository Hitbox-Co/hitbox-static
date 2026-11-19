/**
 * Types for the Discover module — mirrors `/api/v1/discover` in the backend API
 * reference (`discover-api.md`). All three endpoints are public; a Clerk token is
 * optional and only fills in `isWishlisted`.
 */

/** Chip ids accepted by `?category=`. "All Items" is no filter at all. */
export type DiscoverCategory = 'cards' | 'figures' | 'apparel' | 'posters' | 'digital' | 'other'

/** Base price of the default market. `amount` is a decimal string ("480.00"). */
export interface DiscoverPrice {
    amount: string
    currency: string
    isFree: boolean
}

export interface DiscoverArtist {
    id: string
    name: string
    slug: string
}

/**
 * One drop card — the same shape for the hero, Trending now, Latest drops, "View
 * all" and search. Tap → `GET /products/:id`.
 *
 * `rarity` and `category` are free-form columns (whatever the admin typed):
 * format them for display and never switch on them as a fixed list.
 */
export interface DiscoverProductItem {
    id: string
    name: string
    /** Hero tagline ("Beyond the ordinary."); null if not set. */
    description: string | null
    /** Primary image; null if none. */
    imageUrl: string | null
    /** As stored, e.g. "ULTRA_RARE"; null if not set. */
    rarity: string | null
    category: string | null
    /** The drop's artist, else its collection's artist. */
    artist: DiscoverArtist | null
    /** Null when the drop has no price — hide the price then. */
    price: DiscoverPrice | null
    /** "Edition of 200". */
    totalSupply: number
    /** "042 / 100" = mintedCount / totalSupply. */
    mintedCount: number
    /** 0 when none is set. */
    rewardPoints: number
    /** The heart: true / false when signed in, null for a guest. */
    isWishlisted: boolean | null
}

/** One "Meet the creators" entry. */
export interface DiscoverCreatorItem {
    id: string
    name: string
    slug: string
    /** Round avatar; null if none. */
    avatarUrl: string | null
    /** The banner above the row (the first creator's); null if none. */
    coverUrl: string | null
    /** "12 drops" — public drops only. */
    dropCount: number
}

/**
 * GET /api/v1/discover — the whole screen in one round-trip. A list can be
 * empty (an empty category, a fresh database): hide a section whose list is empty.
 * `featured` is never empty while any public drop exists in the category.
 */
export interface DiscoverFeed {
    featured: DiscoverProductItem[]      // ≤5, hero carousel
    trending: DiscoverProductItem[]      // ≤10, most minted first
    creators: DiscoverCreatorItem[]      // ≤10, most drops first
    newReleases: DiscoverProductItem[]   // ≤10, newest first
}

/** `section` values accepted by GET /api/v1/discover/products. */
export type DiscoverSection = 'featured' | 'trending' | 'new_releases'

/** Query params for GET /api/v1/discover/products ("View all" + search). */
export interface DiscoverProductFilters {
    section?: DiscoverSection
    category?: DiscoverCategory
    /** 1–100 chars, case-insensitive match on name. */
    search?: string
    /** int ≥ 1, default 1. */
    page?: number
    /** int 1–50, default 20. */
    limit?: number
}

/** Query params for GET /api/v1/discover/creators ("Explore"). */
export interface DiscoverCreatorFilters {
    page?: number
    limit?: number
}
