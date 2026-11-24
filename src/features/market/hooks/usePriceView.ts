import { formatMoney } from '@/features/checkout/utils/money'
import { useMarkets } from '@/features/payments/api/quote'
import { useMarketState } from '../store/marketStore'
import { marketCountryName } from '../utils/format'

/** The shape of every `price` object the API returns. `marketId` is the market the amount belongs to. */
export interface MarketPrice {
    amount: string
    currency: string
    isFree: boolean
    marketId?: string | null
}

export interface PriceView {
    /** "₹899.00", "$15.00", "Free"; null when the drop has no price (hide it). */
    text: string | null
    /** False when the drop is not sold in the selected market: show the note, disable Buy / Add to cart. */
    soldHere: boolean
    /** "Not sold in India" / "Priced in USD"; null when the price is from the selected market. */
    note: string | null
}

/**
 * The single rule for showing a price. The amount is always formatted from the
 * price's OWN currency (nothing is converted). If `price.marketId` is not the
 * selected market, the server fell back to the default market's price — so this
 * drop is not sold in the selected market, and is flagged instead of shown as normal.
 */
export function usePriceView(price: MarketPrice | null | undefined): PriceView {
    const { marketId: selectedId } = useMarketState()
    const markets = useMarkets().data

    if (!price) return { text: null, soldHere: true, note: null }

    const text = price.isFree ? 'Free' : formatMoney(price.amount, price.currency)
    // No market selected yet, or the price carries none: nothing to compare against.
    if (!selectedId || !price.marketId || price.marketId === selectedId) return { text, soldHere: true, note: null }

    const selected = markets?.find((m) => m.id === selectedId)
    return {
        text,
        soldHere: false,
        note: selected ? `Not sold in ${marketCountryName(selected)}` : `Priced in ${price.currency}`,
    }
}
