import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { CheckoutQuote, CheckoutQuoteInput, Market } from '../types/payments'
import { PAYMENT_ROUTES, quoteKeys } from './routes'

/**
 * GET /api/v1/markets — public. The active markets (currency + countries), default
 * first, cached 5 minutes server-side. Pick the one whose `countryCodes` holds the
 * buyer's country, else the first.
 */
export function useMarkets() {
    const api = useApi()
    return useQuery({
        queryKey: quoteKeys.markets,
        queryFn: () => api.get<Market[]>(PAYMENT_ROUTES.markets),
        staleTime: 1000 * 60 * 5,
    })
}

export function pickMarket(markets: Market[] | undefined, countryCode: string | null | undefined): Market | undefined {
    if (!markets?.length) return undefined
    return markets.find((m) => countryCode && m.countryCodes.includes(countryCode)) ?? markets[0]
}

/**
 * POST /api/v1/checkout/quote 🔒 — what the buyer will pay, before paying. No order,
 * no hold, no Stripe call. Prices are tax-inclusive: `totalAmount` is exactly what
 * the card is charged (and what the invoice shows). Re-quoted when the variant,
 * market or address changes.
 */
export function useCheckoutQuote(input: CheckoutQuoteInput | null) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    return useQuery({
        queryKey: quoteKeys.quote(input),
        queryFn: () => api.post<CheckoutQuote>(PAYMENT_ROUTES.quote, input),
        enabled: !!isSignedIn && !!input,
        retry: retryAuthAware,
        // A quote is a snapshot: stock moves, so never reuse it for long.
        staleTime: 1000 * 15,
    })
}
