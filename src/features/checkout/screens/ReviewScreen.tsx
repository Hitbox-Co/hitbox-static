import { router } from 'expo-router'
import React, { useState } from 'react'
import { Text, View } from 'react-native'

import { formatRewardPoints } from '@/features/products/utils/format'
import { MOCK_PAYMENT_OUTCOME } from '../data/mockCheckout'
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

/** 05 · Review & Pay (Figma). Pay is a mock: it goes to the confirmed or failed screen. */
export default function ReviewScreen() {
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const checkout = useCheckoutState()
    const address = selectedAddressOf(checkout)
    const [paying, setPaying] = useState(false)

    if (!item || !totals) {
        return (
            <CheckoutShell>
                <PageIntro title="Review & Pay" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const payment = paymentSummary(checkout.paymentMethod)
    const points = item.rewardPoints != null ? formatRewardPoints(item.rewardPoints * item.quantity) : null

    const onPay = () => {
        setPaying(true)
        // MOCK: no payments API yet. Replace with the real charge, then branch on its result.
        router.replace((MOCK_PAYMENT_OUTCOME === 'success' ? '/checkout/confirmed' : '/checkout/failed') as never)
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <Text className="w-full pb-1 text-center font-syne text-[10px] text-[#6b7280]">
                        {"By paying, you agree to HitBox's Terms of service."}
                    </Text>
                    <PrimaryAction label={`Pay ${formatUsd(totals.total)} USD`} onPress={onPay} disabled={paying} />
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
                    <Text className="font-syne text-[11px] text-[#6b7280]">{`Standard delivery · ${formatUsd(totals.delivery)}`}</Text>
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
                <AmountRow label="Standard delivery" value={formatUsd(totals.delivery)} />
                <AmountRow label="Tax" value={formatUsd(totals.tax)} />
                <Divider />
                <TotalRow label="Total · USD" value={formatUsd(totals.total)} />
            </View>

            {points && <RewardsBox title={`${points} pending with this purchase`} caption="Awarded after successful payment." />}
        </CheckoutShell>
    )
}
