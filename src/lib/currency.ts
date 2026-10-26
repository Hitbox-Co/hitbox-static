import * as Location from 'expo-location'

/**
 * Display currency for prices.
 *
 * ⚠️ **Display only.** The API returns `priceInDollars` — the price *is* USD.
 * Everything here converts that figure for presentation at a **static rate**;
 * nothing about what a user would be charged changes. Two consequences:
 *
 *  1. `BY_REGION` rates are a hardcoded snapshot, not a live feed, so a converted
 *     price drifts from the real rate over time.
 *  2. If checkout is ever wired up it will charge USD. Someone shown ₹7,514 and
 *     charged $89.99 sees a different number on their statement.
 *
 * The durable fix is per-region prices from the backend, so the amount shown is
 * the amount charged. Until then this is presentational.
 */

type Grouping = 'western' | 'indian'

/** Rough lat/lon box, used to place a GPS fix without a geocoder. */
interface Bounds {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
}

interface CurrencyConfig {
    code: string
    symbol: string
    /** Units of this currency per 1 USD. */
    rate: number
    /** Digits after the decimal separator. Rupee prices read better whole. */
    decimals: number
    /** `indian` groups as 1,23,456 (lakh/crore); `western` as 123,456. */
    grouping: Grouping
    /** Omit for the fallback currency, which is never matched by coordinates. */
    bounds?: Bounds
}

const USD: CurrencyConfig = {
    code: 'USD',
    symbol: '$',
    rate: 1,
    decimals: 2,
    grouping: 'western',
}

/**
 * Region (ISO 3166-1 alpha-2) → currency. Anything unlisted stays USD, which is
 * correct rather than merely safe: the underlying price is in dollars.
 */
const BY_REGION: Record<string, CurrencyConfig> = {
    IN: {
        code: 'INR',
        symbol: '₹',
        rate: 83.5,
        decimals: 0,
        grouping: 'indian',
        // Mainland India plus its island territories, generously drawn. A box is
        // enough because it only has to separate the regions listed here from
        // everywhere else — a fix just outside it lands on USD, which is the
        // correct answer for an unsupported region anyway.
        bounds: { minLat: 6.5, maxLat: 35.7, minLon: 68.1, maxLon: 97.5 },
    },
}

/**
 * Resolved once per launch and read synchronously afterwards, so `formatPrice`
 * can stay a plain function rather than every price becoming a hook.
 */
let activeCurrency: CurrencyConfig = USD

/**
 * The device's region from its locale, e.g. `"IN"` from `"en-IN"`.
 *
 * Read through `Intl` deliberately. Hermes' Intl on Android can't be trusted to
 * *honour* a requested locale — which is why the formatting below is by hand —
 * but it does faithfully report the device's own locale, which is all this needs.
 */
function regionFromLocale(): string | null {
    try {
        const locale = Intl.DateTimeFormat().resolvedOptions().locale
        const region = locale.replace('_', '-').split('-').pop()
        return region && /^[A-Za-z]{2}$/.test(region) ? region.toUpperCase() : null
    } catch {
        return null
    }
}

/**
 * The region a GPS fix falls in, matched against the boxes in `BY_REGION`.
 *
 * Deliberately *not* `Location.reverseGeocodeAsync`: that needs a geocoder
 * provider and a network round-trip, and returns nothing on devices without one
 * (Android emulators and AOSP builds among them) — which would silently demote
 * every user to the locale fallback. Comparing coordinates is offline,
 * synchronous and deterministic, and only has to be accurate enough to tell the
 * supported regions apart from everywhere else.
 */
function regionFromCoords(latitude: number, longitude: number): string | null {
    for (const [region, config] of Object.entries(BY_REGION)) {
        const box = config.bounds
        if (!box) continue
        if (
            latitude >= box.minLat &&
            latitude <= box.maxLat &&
            longitude >= box.minLon &&
            longitude <= box.maxLon
        ) {
            return region
        }
    }
    return null
}

/**
 * The country the device is physically in, from a coarse fix.
 *
 * Returns null on every failure path — permission denied, location services off,
 * no fix, or a fix outside every supported region. The caller falls back to the
 * locale, so denying the prompt costs the user nothing.
 */
async function regionFromGeolocation(): Promise<string | null> {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== Location.PermissionStatus.GRANTED) return null

        // Lowest accuracy that can still place a country, and much faster to fix.
        const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Lowest,
        })

        return regionFromCoords(position.coords.latitude, position.coords.longitude)
    } catch {
        return null
    }
}

/** Never let a slow GPS fix hold up app start. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ])
}

/**
 * Picks the display currency for this launch: physical location first, the
 * device locale second, USD last. Call once, before prices are rendered.
 *
 * Resolves to the currency code actually chosen, which is handy for logging.
 */
export async function initCurrency(timeoutMs = 4000): Promise<string> {
    const geoRegion = await withTimeout(regionFromGeolocation(), timeoutMs)
    const region = geoRegion ?? regionFromLocale()

    activeCurrency = (region && BY_REGION[region]) || USD
    return activeCurrency.code
}

export function activeCurrencyCode(): string {
    return activeCurrency.code
}

/** 1234567 → "12,34,567" — last three digits, then pairs. */
function groupIndian(digits: string): string {
    if (digits.length <= 3) return digits
    const last3 = digits.slice(-3)
    const rest = digits.slice(0, -3)
    return `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}`
}

/** 1234567 → "1,234,567". */
export function groupThousands(digits: string): string {
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * A USD amount from the API → the viewer's display currency.
 *
 * `"89.99"` → `"$89.99"` in the US, `"₹7,514"` in India.
 *
 * Grouped and padded by hand rather than via `toLocaleString`, because Hermes on
 * Android ignores the locale/options arguments and would format to the device's
 * own conventions regardless of what was asked for — the original bug where a
 * $89.99 item rendered as ₹89.99.
 */
export function formatMoneyFromUsd(priceInDollars: string | number): string {
    const value = Number(priceInDollars)
    // Unparseable input: show it as-is rather than "$NaN".
    if (Number.isNaN(value)) return `${USD.symbol}${priceInDollars}`

    const currency = activeCurrency
    const [whole, fraction] = (value * currency.rate).toFixed(currency.decimals).split('.')
    const grouped = currency.grouping === 'indian' ? groupIndian(whole) : groupThousands(whole)

    return fraction ? `${currency.symbol}${grouped}.${fraction}` : `${currency.symbol}${grouped}`
}
