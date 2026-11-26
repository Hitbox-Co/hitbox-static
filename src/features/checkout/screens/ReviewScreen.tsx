import { useUser } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'

import { formatRewardPoints } from '@/features/products/utils/format'
import NoPriceMarketSheet from '@/features/market/components/NoPriceMarketSheet'
import { getMarketState } from '@/features/market/store/marketStore'
import ChangeRegionButton from '@/features/market/components/ChangeRegionButton'
import { apiErrorCode } from '@/lib/api-errors'
import { marketIdsFromNoPrice } from '@/features/market/utils/format'
import { ApiRequestError } from '@/lib/api'
import { paymentErrorMessage } from '@/features/payments/api/errors'
import { useCheckout, useRefreshAfterPayment } from '@/features/payments/api/checkout'
import { usePaymentSheet } from '@/features/payments/hooks/usePaymentSheet'
import {
    CheckoutProgress,
    CheckoutShell,
    Divider,
    GroupedCard,
    NothingToCheckout,
    OrderItemRow,
    PageIntro,
    PrimaryAction,
    RewardsBox,
    SectionHeading,
} from '../components/CheckoutParts'
import { AddressLines } from '../components/AddressLines'
import { QuoteSummary } from '../components/QuoteSummary'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { useCheckoutPlan } from '../hooks/useCheckoutQuote'
import { useCheckoutState } from '../store/checkoutStore'
import { formatMoney } from '../utils/money'
import { paymentSummary } from '../utils/paymentSummary'

/**
 * 05 · Review & Pay (Figma). "Pay" places the order (`POST /checkout`, which holds
 * one piece for 15 min), shows Stripe's payment sheet, then hands over to the
 * confirmation screen, which waits for the server to mark the order PAID.
 */
export default function ReviewScreen() {
    const { item, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const checkoutState = useCheckoutState()
    const { address, quote, quoteLoading, quoteError, refetchQuote } = useCheckoutPlan()
    const [paying, setPaying] = useState(false)
    const checkoutMutation = useCheckout()
    const presentSheet = usePaymentSheet()
    const refreshAfterPayment = useRefreshAfterPayment()
    const { user } = useUser()
    // ORDERS_NO_PRICE: the drop is sold in several markets and none fit — the sheet offers `details.marketIds`.
    const [noPriceError, setNoPriceError] = useState<unknown>(null)
    // ORDERS_NO_PRICE with no market list: not sold in this region — say so and offer Change region.
    const [regionBlocked, setRegionBlocked] = useState(false)
    const [retryMarketId, setRetryMarketId] = useState<string | null>(null)
    const payRef = useRef<() => void>(() => {})

    useEffect(() => setRegionBlocked(false), [quote?.marketId])

    // After the buyer picks a market, retry once the quote has moved to it.
    useEffect(() => {
        if (retryMarketId && quote?.marketId === retryMarketId && !paying) {
            setRetryMarketId(null)
            payRef.current()
        }
    }, [retryMarketId, quote?.marketId, paying])

    if (!item) {
        return (
            <CheckoutShell>
                <PageIntro title="Review & Pay" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const payment = paymentSummary()
    const points = item.rewardPoints != null ? formatRewardPoints(item.rewardPoints * item.quantity) : null

    const ready = !!quote && !!address && quote.availability === 'IN_STOCK'

    const onPay = async () => {
        if (paying || !quote || !address) return
        setPaying(true)
        try {
            // Safe to repeat: an unpaid order with a live hold for this drop is returned as-is.
            const checkout = await checkoutMutation.mutateAsync({
                productId: item.productId,
                variantId: checkoutState.variantId ?? undefined,
                marketId: quote.marketId,
                shippingAddressId: address.id,
                billingAddressId: address.id,
                termsAccepted: true,
            })
            const result = await presentSheet(checkout, {
                name: user?.fullName ?? undefined,
                email: user?.primaryEmailAddress?.emailAddress,
            })
            if (result.status === 'success') {
                refreshAfterPayment()
                router.replace({ pathname: '/checkout/confirmed', params: { orderId: checkout.orderId } } as never)
            } else if (result.status === 'failed') {
                router.replace({
                    pathname: '/checkout/failed',
                    params: { orderId: checkout.orderId, message: result.message },
                } as never)
            } else {
                // Closed the sheet: the order stays unpaid and the piece is held for ~15 minutes.
                Alert.alert('Payment not completed', 'Your item is held for a few minutes. You can finish from My orders.', [
                    { text: 'Stay here' },
                    { text: 'My orders', onPress: () => router.replace('/orders' as never) },
                ])
            }
        } catch (err) {
            if (marketIdsFromNoPrice(err)) {
                setNoPriceError(err)
                return
            }
            if (apiErrorCode(err) === 'ORDERS_NO_PRICE') {
                setRegionBlocked(true)
                return
            }
            // A 5xx here is a backend fault (the quote above worked): log what it said so it can be found in the server logs.
            if (err instanceof ApiRequestError) console.warn('[checkout] failed', err.status, err.error.code, err.error.message, err.error.details)
            const detail = err instanceof ApiRequestError && err.status >= 500 ? `

(${err.status} ${err.error.code})` : ''
            Alert.alert("Couldn't start payment", paymentErrorMessage(err) + detail)
        } finally {
            setPaying(false)
        }
    }

    payRef.current = onPay

    return (
        <CheckoutShell
            footer={
                <>
                    <Text className="w-full pb-1 text-center font-syne text-[10px] text-[#6b7280]">
                        {"By paying, you agree to HitBox's Terms of service."}
                    </Text>
                    <PrimaryAction label={paying ? "Starting payment…" : quote ? `Pay ${formatMoney(quote.totalAmount, quote.currency)}` : "Pay"} onPress={onPay} disabled={paying || !ready || regionBlocked} />
                </>
            }
        >
            <CheckoutProgress stage={3} />
            <PageIntro title="Review & Pay" />

            <View className="gap-[10px]">
                <SectionHeading title="Your drop" action="Edit" onAction={() => router.push('/cart' as never)} />
                <OrderItemRow item={item} price={quote ? formatMoney(quote.unitPrice, quote.currency) : undefined} />
            </View>

            <GroupedCard className="gap-4">
                <View className="gap-[10px]">
                    <SectionHeading title="Delivery" action="Edit" onAction={() => router.push('/checkout/delivery' as never)} />
                    <View className="flex-row">
                        {address ? <AddressLines address={address} /> : <Text className="font-syne text-xs text-[#dc2626]">Add a delivery address to continue.</Text>}
                    </View>
                    <Text className="font-syne text-[11px] text-[#6b7280]">Standard delivery · Billed to this address.</Text>
                </View>
                <Divider />
                <View className="gap-[10px]">
                    <SectionHeading title="Payment" action="Change" onAction={() => router.push('/checkout/payment' as never)} />
                    <View className="flex-row items-center gap-3">
                        <payment.Icon size={18} color="#2563eb" />
                        <View className="gap-[2px]">
                            <Text className="font-syne-bold text-xs text-[#111827]">{payment.title}</Text>
                            {payment.sub && <Text className="font-syne text-[11px] text-[#6b7280]">{payment.sub}</Text>}
                        </View>
                    </View>
                </View>
            </GroupedCard>

            {quoteLoading && <ActivityIndicator color="#2563eb" />}
            {quoteError ? (
                <View className="gap-2">
                    <Text className="font-syne text-xs text-[#dc2626]">{paymentErrorMessage(quoteError)}</Text>
                    <TouchableOpacity onPress={() => refetchQuote()}>
                        <Text className="font-syne-bold text-xs text-[#2563eb]">Try again</Text>
                    </TouchableOpacity>
                </View>
            ) : quote ? (
                <QuoteSummary quote={quote} />
            ) : null}

            {regionBlocked && (
                <View className="items-start gap-3 rounded border border-[#fcd34d] bg-[#fffaed] p-3">
                    <Text className="font-syne-semibold text-xs text-[#d97706]">Not available in your region</Text>
                    <ChangeRegionButton />
                </View>
            )}
            <NoPriceMarketSheet error={noPriceError} onChosen={() => { setRetryMarketId(getMarketState().marketId); setNoPriceError(null) }} />

            {points && <RewardsBox title={`${points} pending with this purchase`} caption="Awarded after successful payment." />}
        </CheckoutShell>
    )
}
