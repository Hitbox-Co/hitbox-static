import { formatMoney } from '@/features/checkout/utils/money'
import { groupThousands } from '@/lib/currency'
import { MarketplaceStatus, Product, ProductCategory } from '../types/product'

/** Shown when a product has no images. */
export const PRODUCT_PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=60'

/**
 * "149.99" (USD decimal-as-string from the API) → the viewer's display currency:
 * "$149.99" in the US, "₹12,524" in India. See `@/lib/currency` for how the
 * region is resolved and why this is display-only.
 */
export function formatPrice(priceInDollars: string | null | undefined): string | undefined {
    // No price is "nothing to show", not "$0" — Number(null) would be 0.
    if (priceInDollars == null || priceInDollars === '') return undefined
    // The legacy field is the drop's USD price: shown as USD, never converted.
    return formatMoney(priceInDollars, 'USD')
}

/**
 * The drop's own price in its own currency ("$480.00", "Free"), or undefined when
 * it has none. Prefers the current `price` object; falls back to the legacy USD string.
 */
export function formatProductPrice(product: Pick<Product, 'price' | 'priceInDollars'>): string | undefined {
    const price = product.price
    if (price) {
        if (price.isFree) return 'Free'
        const n = Number(price.amount)
        if (!Number.isFinite(n)) return `${price.currency} ${price.amount}`
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(n)
        } catch {
            return `${price.currency} ${n.toFixed(2)}`
        }
    }
    return formatPrice(product.priceInDollars)
}

/**
 * Points are a count, not money — always grouped Western, never converted.
 * Null when there are none to show: the API stopped sending `rewardPoints` with
 * the catalog restructure, and an item without points must render without the
 * badge rather than crash the screen.
 */
export function formatRewardPoints(points: number | null | undefined): string | null {
    // 0 means "none set" — render without the badge.
    if (typeof points !== 'number' || !Number.isFinite(points) || points <= 0) return null
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

/** "LEGENDARY" → "Legendary". Null for a drop with no rarity set (the column is optional). */
export function formatRarity(rarity: string | null | undefined): string | null {
    // Free-form column: underscores to spaces, upper-cased, never switched on as an enum.
    return rarity ? rarity.replace(/_/g, ' ').toUpperCase() : null
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
