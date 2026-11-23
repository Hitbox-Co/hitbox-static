import { useUser } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Text, View } from 'react-native'

import { formatRewardPoints } from '@/features/products/utils/format'
import { paymentErrorMessage } from '@/features/payments/api/errors'
import { useCheckout, useRefreshAfterPayment } from '@/features/payments/api/checkout'
import { usePaymentSheet } from '@/features/payments/hooks/usePaymentSheet'
import {
    AmountRow,
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
    TotalRow,
} from '../components/CheckoutParts'
import { AddressLines } from '../components/AddressLines'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { selectedAddressOf, useCheckoutState } from '../store/checkoutStore'
import { formatUsd } from '../utils/money'
import { paymentSummary } from '../utils/paymentSummary'

/**
 * 05 · Review & Pay (Figma). "Pay" places the order (`POST /checkout`, which holds
 * one piece for 15 min), shows Stripe's payment sheet, then hands over to the
 * confirmation screen, which waits for the server to mark the order PAID.
 */
export default function ReviewScreen() {
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const checkoutState = useCheckoutState()
    const address = selectedAddressOf(checkoutState)
    const [paying, setPaying] = useState(false)
    const checkoutMutation = useCheckout()
    const presentSheet = usePaymentSheet()
    const refreshAfterPayment = useRefreshAfterPayment()
    const { user } = useUser()

    if (!item || !totals) {
        return (
            <CheckoutShell>
                <PageIntro title="Review & Pay" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const payment = paymentSummary()
    const points = item.rewardPoints != null ? formatRewardPoints(item.rewardPoints * item.quantity) : null

    const onPay = async () => {
        if (paying) return
        setPaying(true)
        try {
            // Safe to repeat: an unpaid order with a live hold for this drop is returned as-is.
            const checkout = await checkoutMutation.mutateAsync({
                productId: item.productId,
                variantId: checkoutState.variantId ?? undefined,
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
            Alert.alert("Couldn't start payment", paymentErrorMessage(err))
        } finally {
            setPaying(false)
        }
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <Text className="w-full pb-1 text-center font-syne text-[10px] text-[#6b7280]">
                        {"By paying, you agree to HitBox's Terms of service."}
                    </Text>
                    <PrimaryAction label={paying ? "Starting payment…" : `Pay ${formatUsd(totals.total)} USD`} onPress={onPay} disabled={paying} />
                </>
            }
        >
            <CheckoutProgress stage={3} />
            <PageIntro title="Review & Pay" />

            <View className="gap-[10px]">
                <SectionHeading title="Your drop" action="Edit" onAction={() => router.push('/cart' as never)} />
                <OrderItemRow item={item} />
            </View>

            <GroupedCard className="gap-4">
                <View className="gap-[10px]">
                    <SectionHeading title="Delivery" action="Edit" onAction={() => router.push('/checkout/delivery' as never)} />
                    <View className="flex-row">
                        <AddressLines address={address} />
                    </View>
                    <Text className="font-syne text-[11px] text-[#6b7280]">Standard delivery · Any tax is shown on your invoice.</Text>
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

            <View className="gap-[10px]">
                <AmountRow label={`Subtotal · ${item.quantity} item${item.quantity === 1 ? '' : 's'}`} value={formatUsd(totals.subtotal)} />
                <Divider />
                <TotalRow label="Total · USD" value={formatUsd(totals.total)} />
            </View>

            {points && <RewardsBox title={`${points} pending with this purchase`} caption="Awarded after successful payment." />}
        </CheckoutShell>
    )
}
