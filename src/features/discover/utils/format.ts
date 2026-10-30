/** Shown when a product has no image yet (imageUrl is null). */
export const DISCOVER_PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=60'

/**
 * Points are a count, not money — always grouped Western, never converted.
 * Null when there are none to show: the API stopped sending `rewardPoints` with
 * the catalog restructure, and an item without points must render without the
 * badge rather than crash the screen.
 */
export function formatRewardPoints(points: number | null | undefined): string | null {
    if (typeof points !== 'number' || !Number.isFinite(points)) return null
    return `${points.toLocaleString('en-US')} pts`
}
