import React, { useEffect, useState } from 'react'

import { useActiveMarket } from '../hooks/useActiveMarket'
import { marketIdsFromNoPrice } from '../utils/format'
import MarketSheet from './MarketSheet'

/**
 * Opens the market sheet, limited to `details.marketIds`, when `error` is an
 * `ORDERS_NO_PRICE` that lists them. Picking one stores it as the manual market;
 * `onChosen` lets the caller retry (a quote refetches by itself, a checkout does not).
 */
export default function NoPriceMarketSheet({ error, onChosen }: { error: unknown; onChosen?: () => void }) {
    const { market, markets } = useActiveMarket()
    const ids = marketIdsFromNoPrice(error)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setOpen(!!ids?.length)
    }, [error]) // eslint-disable-line react-hooks/exhaustive-deps

    if (!ids?.length) return null
    return (
        <MarketSheet
            visible={open}
            onClose={() => setOpen(false)}
            markets={markets}
            selectedId={market?.id}
            automatic={false}
            onlyIds={ids}
            onChosen={() => onChosen?.()}
        />
    )
}
