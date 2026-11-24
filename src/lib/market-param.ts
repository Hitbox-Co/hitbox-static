import { getMarketState, isSendableMarketId } from '@/features/market/store/marketStore'

/**
 * `?marketId=` on every price-bearing read, added in ONE place so no screen can
 * forget it (`useApi().request` calls this for every request).
 *
 * Sent on GET /discover, /discover/products, /marketplace, /marketplace/listings,
 * /products/:id, /products/code/:code, and GET + POST /cart. NOT sent on the plain
 * product list (`/products`), the wishlist, or `DELETE /cart…`, which ignore it.
 * `/checkout/quote` and `/checkout` take `marketId` in their JSON body instead.
 *
 * The server ignores an unknown or inactive id (the default market's price comes
 * back), but a non-uuid is never even sent.
 */
const PRICED_PATHS: RegExp[] = [
    /^\/api\/v1\/discover(\/products)?$/,
    /^\/api\/v1\/marketplace(\/listings)?$/,
    /^\/api\/v1\/products\/(code\/)?[^/?#]+$/,
    /^\/api\/v1\/cart$/,
]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function withMarketParam(path: string, method: string | undefined): string {
    const verb = (method ?? 'GET').toUpperCase()
    if (verb !== 'GET' && verb !== 'POST') return path

    const [pathname, query = ''] = path.split('?')
    if (!PRICED_PATHS.some((re) => re.test(pathname))) return path

    const marketId = getMarketState().marketId
    if (!marketId || !UUID.test(marketId) || !isSendableMarketId(marketId)) return path

    const params = new URLSearchParams(query)
    params.set('marketId', marketId)
    return `${pathname}?${params.toString()}`
}
