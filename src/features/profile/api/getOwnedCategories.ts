import { useQueries } from '@tanstack/react-query'

import { PRODUCT_ROUTES, isUuid } from '@/features/products/api/routes'
import { useApi } from '@/lib/api'

/**
 * A shelf row (`GET /collections/me`) does not say what kind of thing it is, but
 * each drop's detail (`GET /products/:id`, public, cached server-side) does. This
 * reads the `category` of every distinct drop in `productIds` — one request per
 * drop, kept for 10 minutes, retried once — so the products screen can offer
 * "Figures", "Apparel"… chips for exactly what the collector owns.
 *
 * Returns `{ [productId]: category | null }`. A drop whose lookup is still
 * loading or has failed is simply absent: it shows under "All" and under no chip.
 */
export function useOwnedCategories(productIds: string[]): Record<string, string | null> {
    const api = useApi()
    const ids = [...new Set(productIds)].filter(isUuid)

    const results = useQueries({
        queries: ids.map((id) => ({
            queryKey: ['owned', 'category', id],
            queryFn: async () => {
                const product = await api.get<{ category?: string | null }>(PRODUCT_ROUTES.byId(id))
                return product.category ?? null
            },
            staleTime: 1000 * 60 * 10,
            retry: 1,
        })),
    })

    const byId: Record<string, string | null> = {}
    ids.forEach((id, i) => {
        const value = results[i]?.data
        if (value !== undefined) byId[id] = value
    })
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
