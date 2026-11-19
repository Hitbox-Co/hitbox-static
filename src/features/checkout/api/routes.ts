/**
 * Cart module endpoints (backend `cart-api.md`). All need the Clerk session; a
 * buyer only ever sees and changes their own cart.
 *
 * The cart is a list of drops the buyer means to buy — not a reservation (no
 * stock is held), with no stored price (price and availability are read live)
 * and no quantity (one row is one unit). Each row is checked out on its own.
 */
export const CART_ROUTES = {
    /** GET — the cart with live price/availability and a summary. DELETE — empty it. */
    cart: '/api/v1/cart',
    /** DELETE — remove one item (by CartItem id, not drop id). */
    item: (itemId: string) => `/api/v1/cart/${encodeURIComponent(itemId)}`,
} as const

/** TanStack Query keys for the cart. */
export const cartKeys = {
    all: ['cart'] as const,
    view: ['cart', 'view'] as const,
}
