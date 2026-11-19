import { DiscoverArtist, DiscoverPrice } from '@/features/discover/types/discover'

/** Why a saved drop cannot be bought right now (null = it can). */
export type UnavailableReason = 'REMOVED' | 'NOT_ON_SALE' | 'NOT_RELEASED_YET' | 'CLOSED' | 'NO_PRICE'

export interface WishlistVariant {
    id: string
    label: string
    isActive: boolean
}

/** The Discover card plus the drop's current state. No `isWishlisted`: everything here is saved. */
export interface WishlistDropCard {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    rarity: string | null
    category: string | null
    artist: DiscoverArtist | null
    price: DiscoverPrice | null
    totalSupply: number | null
    mintedCount: number | null
    rewardPoints: number | null
    /** DropStatus right now. */
    status: string
    /** GET /products/:id would show it. */
    isViewable: boolean
    /** POST /checkout would accept it right now (stock aside). */
    isPurchasable: boolean
    unavailableReason: UnavailableReason | null
    /** Non-archived variants, display order; [] if none. */
    variants: WishlistVariant[]
}

/** One saved row. */
export interface WishlistItemView {
    /** Use for PATCH / DELETE /wishlist/:itemId. */
    id: string
    productId: string
    /** Null = the drop as a whole. */
    variant: { id: string; label: string } | null
    notifyOnAvailable: boolean
    /** The buyer's own note, ≤500 chars. */
    note: string | null
    addedAt: string
    /** Null only if the drop row is gone. */
    product: WishlistDropCard | null
}

/** Body of PATCH /wishlist/:itemId — at least one field; `note: null` clears the note. */
export interface UpdateWishlistItemInput {
    notifyOnAvailable?: boolean
    note?: string | null
}
