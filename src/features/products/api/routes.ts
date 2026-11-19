/** Products module endpoints (reads are public). */
export const PRODUCT_ROUTES = {
    list: '/api/v1/products',
    byId: (id: string) => `/api/v1/products/${id}`,
    byCode: (productCode: string) => `/api/v1/products/code/${productCode}`,
} as const

/** TanStack Query keys for the products feature. */
export const productKeys = {
    all: ['products'] as const,
    detail: (id: string) => ['products', 'byId', id] as const,
    byCode: (productCode: string) => ['products', 'byCode', productCode] as const,
    list: (filters: ProductListFilters = {}) => ['products', 'list', filters] as const,
}

/**
 * Query params for GET /api/v1/products. `category`, `vertical` and `rarity` are the
 * RAW stored values (e.g. `FIGURE`, `ULTRA_RARE`), exact and case-sensitive — not
 * the screen chips (use Discover / Marketplace for those). Never send `status`:
 * that is for admin tooling.
 */
export interface ProductListFilters {
    category?: string
    vertical?: string
    rarity?: string
    collectionId?: string
    artistId?: string
    search?: string
    sort?: 'newest' | 'popular'
    page?: number
    limit?: number
}

export function buildProductsPath(filters: ProductListFilters) {
    const params = new URLSearchParams()
    for (const key of ['category', 'vertical', 'rarity', 'collectionId', 'artistId', 'search', 'sort'] as const) {
        const value = filters[key]
        if (value) params.append(key, value)
    }
    if (filters.page) params.append('page', String(filters.page))
    if (filters.limit) params.append('limit', String(filters.limit))
    const qs = params.toString()
    return qs ? `${PRODUCT_ROUTES.list}?${qs}` : PRODUCT_ROUTES.list
}

/** The id format the server accepts — anything else makes it answer 500, not 404. */
export const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
