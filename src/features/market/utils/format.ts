import { ApiRequestError } from '@/lib/api'
import { Market } from '@/features/payments/types/payments'

const COUNTRY_NAMES: Record<string, string> = {
    IN: 'India',
    US: 'United States',
    GB: 'United Kingdom',
    CA: 'Canada',
}

/** 🇮🇳 from "IN" — regional-indicator letters, no assets needed. */
export function flagEmoji(countryCode: string | undefined): string {
    if (!countryCode || countryCode.length !== 2) return '🌐'
    return String.fromCodePoint(...[...countryCode.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

/** "India" — the market's main country, or its currency when unnamed. */
export function marketCountryName(market: Market): string {
    const code = market.countryCodes[0]
    return code ? (COUNTRY_NAMES[code] ?? code) : market.currency
}

/** "India · INR" — the market's main country and its currency. */
export function marketLabel(market: Market): string {
    const code = market.countryCodes[0]
    const name = code ? (COUNTRY_NAMES[code] ?? code) : market.currency
    return `${name} · ${market.currency}`
}

/**
 * `ORDERS_NO_PRICE` with `details.marketIds`: the drop is priced in several
 * markets and none was sent (or the sent one has no price). Returns the markets
 * it IS sold in, or null for any other error.
 */
export function marketIdsFromNoPrice(err: unknown): string[] | null {
    if (!(err instanceof ApiRequestError) || err.error.code !== 'ORDERS_NO_PRICE') return null
    const ids = (err.error.details as { marketIds?: unknown } | undefined)?.marketIds
    return Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : null
}
