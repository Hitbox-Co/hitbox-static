/**
 * Wishlist endpoints. All need the Clerk session and only ever touch the
 * buyer's own rows (another user's item id is a 404).
 */
export const WISHLIST_ROUTES = {
    /** GET (page, limit ≤ 50) the list, newest first · POST save a drop (heart on). */
    list: '/api/v1/wishlist',
    /** DELETE — heart off, by DROP id. Always 200 `{ removed }`; `?variantId=` limits it to one variant. */
    removeProduct: (productId: string) => `/api/v1/wishlist/products/${encodeURIComponent(productId)}`,
    /** PATCH alert/note · DELETE one row (204), by WISHLIST ITEM id. */
    item: (itemId: string) => `/api/v1/wishlist/${encodeURIComponent(itemId)}`,
} as const

export const wishlistKeys = {
    all: ['wishlist'] as const,
    list: (limit: number) => ['wishlist', 'list', limit] as const,
}

export function buildWishlistPath(page: number, limit: number) {
    return `${WISHLIST_ROUTES.list}?page=${page}&limit=${limit}`
}
