import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { useActiveMarket } from './useActiveMarket'

/** Query roots that carry prices: refetched when the market changes. */
const PRICE_ROOTS = ['discover', 'marketplace', 'products', 'cart']

/**
 * Mount once, under the QueryClientProvider. When the active market changes it
 * clears every cached quote (a quote belongs to exactly one market), list, detail
 * and cart, and refetches what is on screen.
 */
export function useSyncMarket() {
    const queryClient = useQueryClient()
    const { market } = useActiveMarket()
    const previous = useRef<string | undefined>(undefined)

    useEffect(() => {
        const id = market?.id
        if (!id) return
        // Also on the first resolution: reads made before the market was known carried no marketId.
        if (previous.current !== id) {
            // Reset = clear the cached lists, details, cart and quotes AND refetch what is on screen.
            queryClient.resetQueries({
                predicate: (q) => {
                    const root = q.queryKey[0]
                    return (typeof root === 'string' && PRICE_ROOTS.includes(root)) ||
                        (root === 'checkout' && q.queryKey[1] === 'quote')
                },
            })
        }
        previous.current = id
    }, [market?.id, queryClient])
}
