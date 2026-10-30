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
    /** Optional on the drop, so it can be null. */
    rarity: ProductRarity | null
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
}
