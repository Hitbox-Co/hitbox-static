import { useEffect } from 'react'

import { useAddresses } from '@/features/addresses/api/addresses'
import { Address } from '@/features/addresses/types/address'
import { useActiveMarket } from '@/features/market/hooks/useActiveMarket'
import { marketActions } from '@/features/market/store/marketStore'
import { useCheckoutQuote as useQuote } from '@/features/payments/api/quote'
import { CheckoutQuoteInput } from '@/features/payments/types/payments'
import { useCheckoutState } from '../store/checkoutStore'

/**
 * The checkout's server-side view of one purchase: the buyer's address (the one
 * they picked, else their default), the active market (automatic from the address
 * and device region, or the one they chose), and the live quote for all of it.
 * Price, tax and currency all come from the quote — `totalAmount` is exactly what
 * the card is charged — so the screens never compute money themselves.
 */
export function useCheckoutPlan() {
    const { productId, variantId, selectedAddressId } = useCheckoutState()
    const addressesQuery = useAddresses()
    const { market, isLoading: marketLoading } = useActiveMarket()

    const addresses = addressesQuery.data ?? []
    const address: Address | undefined =
        addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0]

    // Wait for the market so the first quote is already in the right currency.
    const input: CheckoutQuoteInput | null =
        productId && !marketLoading
            ? {
                productId,
                variantId: variantId ?? undefined,
                marketId: market?.id,
                shippingAddressId: address?.id,
                billingAddressId: address?.id,
            }
            : null
    const quoteQuery = useQuote(input)
    const quote = quoteQuery.data

    // The quote says which market its price belongs to. If that is not the one we
    // asked for, trust the server: adopt it, so every screen agrees (the quote key
    // changes with it, which refetches).
    useEffect(() => {
        if (quote && market && quote.marketId !== market.id) marketActions.chooseManual(quote.marketId)
    }, [quote, market])

    return {
        address,
        addresses,
        addressesLoading: addressesQuery.isLoading,
        addressesError: addressesQuery.isError,
        input,
        market,
        quote,
        quoteLoading: quoteQuery.isLoading,
        quoteError: (quoteQuery.isError ? quoteQuery.error : null) as unknown,
        refetchQuote: quoteQuery.refetch,
    }
}
