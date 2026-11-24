import { useAddresses } from '@/features/addresses/api/addresses'
import { Address } from '@/features/addresses/types/address'
import { pickMarket, useCheckoutQuote as useQuote, useMarkets } from '@/features/payments/api/quote'
import { CheckoutQuoteInput } from '@/features/payments/types/payments'
import { useCheckoutState } from '../store/checkoutStore'

/**
 * The checkout's server-side view of one purchase: the buyer's address (the one
 * they picked, else their default), the market for that address's country, and the
 * live quote for all of it. Price, tax and currency all come from the quote —
 * `totalAmount` is exactly what the card is charged — so the screens never compute
 * money themselves.
 */
export function useCheckoutPlan() {
    const { productId, variantId, selectedAddressId } = useCheckoutState()
    const addressesQuery = useAddresses()
    const marketsQuery = useMarkets()

    const addresses = addressesQuery.data ?? []
    const address: Address | undefined =
        addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.isDefault) ?? addresses[0]
    const market = pickMarket(marketsQuery.data, address?.countryCode)

    // Wait for the markets so the first quote is already in the right currency.
    const input: CheckoutQuoteInput | null =
        productId && (marketsQuery.isSuccess || marketsQuery.isError)
            ? {
                productId,
                variantId: variantId ?? undefined,
                marketId: market?.id,
                shippingAddressId: address?.id,
                billingAddressId: address?.id,
            }
            : null
    const quoteQuery = useQuote(input)

    return {
        address,
        addresses,
        addressesLoading: addressesQuery.isLoading,
        addressesError: addressesQuery.isError,
        input,
        quote: quoteQuery.data,
        quoteLoading: quoteQuery.isLoading,
        quoteError: (quoteQuery.isError ? quoteQuery.error : null) as unknown,
        refetchQuote: quoteQuery.refetch,
    }
}
