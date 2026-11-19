import { formatDropPrice } from '@/features/checkout/utils/money'
import { DiscoverPrice } from '../types/discover'

/** Shown when a product has no image yet (imageUrl is null). */
export const DISCOVER_PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=60'

/**
 * Points are a count, not money — always grouped Western, never converted.
 * Null when there are none to show: the API sends 0 for a drop with no points
 * set, and a drop without points must render without the badge, not "0 pts".
 */
export function formatRewardPoints(points: number | null | undefined): string | null {
    if (typeof points !== 'number' || !Number.isFinite(points) || points <= 0) return null
    return `${points.toLocaleString('en-US')} pts`
}

/**
 * The price as the API gave it (its own currency — no conversion here), "Free",
 * or null when the drop has no price, in which case hide the price.
 */
export function formatDiscoverPrice(price: DiscoverPrice | null | undefined): string | null {
    return price ? formatDropPrice(price) : null
}

/**
 * `rarity` is a free-form column, so it is formatted for display — underscores
 * to spaces, upper-cased — and never switched on as an enum. Null hides the badge.
 */
export function rarityLabel(rarity: string | null | undefined): string | null {
    return rarity ? rarity.replace(/_/g, ' ').toUpperCase() : null
}

/** "Edition of 200"; null when the supply is unknown. */
export function formatEdition(totalSupply: number | null | undefined): string | null {
    return typeof totalSupply === 'number' && totalSupply > 0 ? `Edition of ${totalSupply}` : null
}

/** "042 / 100" — units minted out of the supply. */
export function formatMinted(mintedCount: number, totalSupply: number): string {
    return `${String(mintedCount).padStart(3, '0')} / ${totalSupply}`
}

/** Plural-aware "12 drops". */
export function formatDropCount(count: number): string {
    return `${count} drop${count === 1 ? '' : 's'}`
}
