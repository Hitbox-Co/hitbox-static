import { useProduct } from '@/features/products/api/getProduct'
import { CheckoutItem, OrderTotals } from '../types/checkout'
import { useCheckoutState } from '../store/checkoutStore'
import { computeTotals } from '../utils/money'

/**
 * The drop in the cart, read from the real product (`GET /products/:id`) so the
 * name, artwork, price and rarity are live — only the surrounding checkout
 * (address, payment, tax, delivery) is mock for now.
 */
export function useCheckoutItem() {
    const { productId, quantity } = useCheckoutState()
    const { data: product, isLoading, isError, refetch } = useProduct(productId ?? undefined)

    const unitPriceUsd = product?.priceInDollars != null ? Number(product.priceInDollars) : NaN

    const item: CheckoutItem | null =
        product && Number.isFinite(unitPriceUsd)
            ? {
                productId: product.id,
                name: product.name,
                imageUrl: product.images[0]?.url ?? null,
                creator: product.collection?.artist.name ?? product.collection?.name ?? null,
                unitPriceUsd,
                rarity: product.rarity,
                rewardPoints: product.rewardPoints,
                quantity,
            }
            : null

    const totals: OrderTotals | null = item ? computeTotals(item.unitPriceUsd, item.quantity) : null

    return {
        productId,
        item,
        totals,
        isLoading: !!productId && isLoading,
        isError: !!productId && isError,
        /** A product loaded but has no price, so it cannot be bought. */
        notForSale: !!product && !item,
        refetch,
    }
}
