import { useEffect } from 'react'

import { useAddresses } from '@/features/addresses/api/addresses'
import { useMarkets } from '@/features/payments/api/quote'
import { Market } from '@/features/payments/types/payments'
import { regionFromLocale } from '@/lib/currency'
import { marketActions, setKnownMarkets, useMarketState } from '../store/marketStore'

/** The market whose `countryCodes` holds this country, if any. */
function marketForCountry(markets: Market[], country: string | null | undefined): Market | undefined {
    return country ? markets.find((m) => m.countryCodes.includes(country.toUpperCase())) : undefined
}

/**
 * The one market every price the buyer sees should come from.
 *
 * Manual: the market they chose (if it still exists). Automatic, in order: the
 * default address's country, the device region, then the first market from
 * `GET /markets` (the server's default). It re-runs when the address, the market
 * list or the mode changes.
 */
export function useActiveMarket() {
    const { mode, marketId } = useMarketState()
    const marketsQuery = useMarkets()
    // Signed-out buyers have no addresses: the query is disabled and falls through to the device region.
    const addressesQuery = useAddresses()

    const markets = marketsQuery.data ?? []
    const defaultAddress = addressesQuery.data?.find((a) => a.isDefault) ?? addressesQuery.data?.[0]

    const manual = mode === 'manual' ? markets.find((m) => m.id === marketId) : undefined
    const auto =
        marketForCountry(markets, defaultAddress?.countryCode) ??
        marketForCountry(markets, regionFromLocale()) ??
        markets[0]
    const market = manual ?? auto

    useEffect(() => {
        if (markets.length) setKnownMarkets(markets.map((m) => m.id))
    }, [markets])

    // A saved manual choice that no longer exists (market retired): fall back to automatic.
    const staleManual = mode === 'manual' && markets.length > 0 && !manual
    useEffect(() => {
        if (staleManual) marketActions.chooseAutomatic()
    }, [staleManual])

    // Keep the persisted id in step with what automatic resolved to.
    useEffect(() => {
        if (mode === 'auto' && market && market.id !== marketId) marketActions.recordResolved(market.id)
    }, [mode, market, marketId])

    return {
        market,
        markets,
        mode,
        isLoading: marketsQuery.isLoading,
    }
}
