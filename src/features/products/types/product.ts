/**
 * Types for the Products module — mirrors `/api/v1/products` in the backend
 * API reference. The products module owns all detail data: description, all
 * images, collection + artist, rarity, claim status.
 */

export type ProductType = 'GROUP' | 'INDIVIDUAL'

export type ProductCategory =
    | 'TRADING_CARD' | 'FIGURE' | 'POSTER' | 'BOOK' | 'AUTOGRAPH' | 'JERSEY'
    | 'DIGITAL_ASSET' | 'ACCESSORY' | 'GAME_BOX' | 'CARD_PACK' | 'OTHER'

export type ProductGenre =
    | 'MUSIC' | 'SPORTS' | 'FILM' | 'GAMING' | 'PUBLICATION' | 'ART' | 'ANIME' | 'OTHER'

export type ProductRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'EXCLUSIVE'

export type MarketplaceStatus = 'TRENDING_NOW' | 'NEW_RELEASE' | 'TOP_CREATORS'

export interface ProductImage {
    id: string
    title: string | null
    description: string | null
    url: string
}

export interface ProductArtist {
    id: string
    name: string
    slug: string
    bio: string | null
    imageUrl: string | null
    genre: ProductGenre | null
    isVerified: boolean
}

export interface ProductCollection {
    id: string
    name: string
    description: string | null
    coverImageUrl: string | null
    releaseDate: string | null
    artist: ProductArtist
}

export interface ProductVariantOption {
    /** "SIZE", "COLOR"… */
    dimension: string
    value: string
    label: string
    /** A swatch colour, for a colour dimension. */
    hexCode: string | null
}

/** Active-or-not, non-archived: filter on `isActive` before showing pickers. */
export interface ProductVariant {
    id: string
    variantCode?: string
    label: string
    options?: ProductVariantOption[]
    /** Null = not capped per variant. */
    totalSupply?: number | null
    isActive: boolean
}

/** Base price of the default market; null when none is set. `amount` is a decimal string. */
export interface ProductPrice {
    amount: string
    currency: string
    isFree: boolean
    marketId?: string | null
}

/** Matches GET /api/v1/products/:id and /code/:productCode (single product). */
export interface Product {
    id: string
    /** 12 digits: 8 unique + 4 group code. */
    productCode: string
    name: string
    type: ProductType
    category: ProductCategory
    genre: ProductGenre
    description: string | null
    /** Null when the API does not send points (it no longer does). */
    rewardPoints: number | null
    state: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    marketplaceStatus: MarketplaceStatus | null
    /** Free-form text the admin types ("ULTRA_RARE"); format it, never switch on it. Null if unset. */
    rarity: string | null
    /** Decimal serialized as string, e.g. "149.99". Null when no price is set. */
    priceInDollars: string | null
    inventoryUnit: number
    unitsSold: number
    /** NFC tag used for claiming. */
    tagId: string | null
    claimedStatus: 'UNCLAIMED' | 'CLAIMED'
    claimedAt: string | null
    releaseDate: string | null
    createdAt: string
    updatedAt: string
    images: ProductImage[]
    collection: ProductCollection | null
    /** Size / colour options. Empty or absent for a drop without variants. */
    variants?: ProductVariant[]

    // ---- Fields of the current `GET /products/:id` shape (see products-api.md) ----
    /** `ACTIVE` is on sale. `PUBLISHED` (coming soon) and `ENDED` are readable but not buyable. */
    status?: string
    groupCode?: string
    vertical?: string | null
    complianceStatus?: string
    /** Edition size. */
    totalSupply?: number
    /** Per buyer; null = unlimited. */
    purchaseLimit?: number | null
    releaseEnd?: string | null
    publishedAt?: string | null
    isAgeSpecific?: boolean
    minimumAge?: number | null
    artistId?: string | null
    /** The drop's artist, else its collection's artist. */
    artistName?: string | null
    collectionId?: string | null
    organizationId?: string | null
    /** Base price in the default market. Null when none — hide the price. */
    price?: ProductPrice | null
    /** False when the drop is not priced in the selected market (then `price` is null). */
    availableInMarket?: boolean
    /** "NOT_AVAILABLE_IN_REGION" when not sold in the selected market. */
    unavailableReason?: string | null
    /** `variantMode: "REQUIRED"` means a variant must be chosen to buy. */
    dropType?: { code: string; name: string; variantMode: string } | null
}
