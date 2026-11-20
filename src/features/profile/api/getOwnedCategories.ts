import { useQueries } from '@tanstack/react-query'

import { PRODUCT_ROUTES, isUuid } from '@/features/products/api/routes'
import { useApi } from '@/lib/api'

/** What a drop's detail tells us that a shelf row does not. */
export interface OwnedProductInfo {
    category: string | null
    /** The artist collection the drop belongs to; null for a drop outside any collection. */
    collectionId: string | null
    artistName: string | null
}

/**
 * A shelf row (`GET /collections/me`) does not say what kind of thing it is, or
 * which collection it belongs to, but each drop's detail (`GET /products/:id`,
 * public, cached server-side) does. This reads that for every distinct drop in
 * `productIds` — one request per drop, kept for 10 minutes, retried once.
 *
 * Returns `{ [productId]: info }`. A drop whose lookup is still loading or has
 * failed is simply absent.
 */
export function useOwnedProductInfo(productIds: string[]): Record<string, OwnedProductInfo> {
    const api = useApi()
    const ids = [...new Set(productIds)].filter(isUuid)

    const results = useQueries({
        queries: ids.map((id) => ({
            queryKey: ['owned', 'info', id],
            queryFn: async (): Promise<OwnedProductInfo> => {
                const p = await api.get<{ category?: string | null; collectionId?: string | null; artistName?: string | null }>(
                    PRODUCT_ROUTES.byId(id),
                )
                return { category: p.category ?? null, collectionId: p.collectionId ?? null, artistName: p.artistName ?? null }
            },
            staleTime: 1000 * 60 * 10,
            retry: 1,
        })),
    })

    const byId: Record<string, OwnedProductInfo> = {}
    ids.forEach((id, i) => {
        const value = results[i]?.data
        if (value !== undefined) byId[id] = value
    })
    return byId
}

/** `{ [productId]: category | null }` — the part the category chips need. */
export function useOwnedCategories(productIds: string[]): Record<string, string | null> {
    const info = useOwnedProductInfo(productIds)
    const byId: Record<string, string | null> = {}
    for (const id of Object.keys(info)) byId[id] = info[id]!.category
    return byId
}

/** What the chip says. Known categories get the shop's own word; others are title-cased. */
export function categoryChipLabel(category: string): string {
    const known: Record<string, string> = {
        FIGURE: 'Figures',
        APPAREL: 'Apparel',
        TRADING_CARD: 'Cards',
        CARD_PACK: 'Card packs',
        POSTER: 'Posters',
        DIGITAL_ASSET: 'Digital',
        ACCESSORY: 'Accessories',
        AUTOGRAPH: 'Autographs',
        JERSEY: 'Jerseys',
        BOOK: 'Books',
        GAME_BOX: 'Game boxes',
        OTHER: 'Other',
    }
    if (known[category]) return known[category]
    const words = category.replace(/_/g, ' ').toLowerCase()
    return words.charAt(0).toUpperCase() + words.slice(1)
}
