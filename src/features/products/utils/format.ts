import { formatMoneyFromUsd, groupThousands } from '@/lib/currency'
import { MarketplaceStatus, ProductCategory, ProductRarity } from '../types/product'

/** Shown when a product has no images. */
export const PRODUCT_PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=60'

/**
 * "149.99" (USD decimal-as-string from the API) → the viewer's display currency:
 * "$149.99" in the US, "₹12,524" in India. See `@/lib/currency` for how the
 * region is resolved and why this is display-only.
 */
export function formatPrice(priceInDollars: string) {
    return formatMoneyFromUsd(priceInDollars)
}

/** Points are a count, not money — always grouped Western, never converted. */
export function formatRewardPoints(points: number) {
    return `${groupThousands(String(Math.round(points)))} pts`
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
    TRADING_CARD: 'Trading Card',
    FIGURE: 'Figure',
    POSTER: 'Poster',
    BOOK: 'Book',
    AUTOGRAPH: 'Autograph',
    JERSEY: 'Jersey',
    DIGITAL_ASSET: 'Digital Asset',
    ACCESSORY: 'Accessory',
    GAME_BOX: 'Game Box',
    CARD_PACK: 'Card Pack',
    OTHER: 'Collectible',
}

export function formatCategory(category: ProductCategory) {
    return CATEGORY_LABELS[category] ?? category
}

/** "LEGENDARY" → "Legendary". */
export function formatRarity(rarity: ProductRarity) {
    return rarity.charAt(0) + rarity.slice(1).toLowerCase()
}

/**
 * The card badge for a product's curation status — the same mapping the
 * marketplace feed applies server-side (`TRENDING_NOW` → HOT,
 * `NEW_RELEASE` → NEW), so a product carries the same label wherever it appears.
 *
 * The detail screen has to derive it rather than receive it: discover and
 * marketplace cards are handed a badge by their feed, but `GET /products/:id`
 * returns the raw `marketplaceStatus`.
 */
export function formatMarketplaceBadge(status: MarketplaceStatus | null): string | null {
    if (status === 'NEW_RELEASE') return 'NEW'
    if (status === 'TRENDING_NOW') return 'HOT'
    return null
}

export function formatDate(iso: string | null | undefined) {
    if (!iso) return null
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
