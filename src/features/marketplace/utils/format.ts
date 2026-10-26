import { formatMoneyFromUsd, groupThousands } from '@/lib/currency'

/** Shown when a listing has no image yet (imageUrl is null). */
export const MARKETPLACE_PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=60'

/**
 * "89.99" (USD decimal-as-string from the API) → the viewer's display currency:
 * "$89.99" in the US, "₹7,514" in India. See `@/lib/currency` for how the region
 * is resolved and why this is display-only.
 */
export function formatPrice(priceInDollars: string) {
    return formatMoneyFromUsd(priceInDollars)
}

/** Points are a count, not money — always grouped Western, never converted. */
export function formatRewardPoints(points: number) {
    return `${groupThousands(String(Math.round(points)))} pts`
}
