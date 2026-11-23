import { router, useLocalSearchParams } from 'expo-router'
import { CircleAlert } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'

import {
    CheckoutShell,
    Divider,
    GroupedCard,
    NothingToCheckout,
    OrderItemRow,
    PageIntro,
    PrimaryAction,
    SecondaryLink,
    SectionHeading,
    TotalRow,
} from '../components/CheckoutParts'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { formatUsd } from '../utils/money'

/**
 * 06 · Payment unsuccessful — the recovery state. Stripe reported the payment
 * failed (`message` is its reason). A declined card cancels the order, so "Try
 * again" starts a fresh checkout; if the order is still held the server simply
 * returns it, so retrying never double-charges.
 */
export default function PaymentFailedScreen() {
    const { message } = useLocalSearchParams<{ orderId?: string; message?: string }>()
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()

    if (!item || !totals) {
        return (
            <CheckoutShell>
                <PageIntro title="Payment unsuccessful" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <PrimaryAction
                        label={`Try again · ${formatUsd(totals.total)}`}
                        onPress={() => router.replace('/checkout/review' as never)}
                    />
                    <SecondaryLink label="View my orders" onPress={() => router.replace('/orders' as never)} />
                </>
            }
        >
            <PageIntro title="Payment unsuccessful" />

            <View className="gap-2 rounded border border-[#fecaca] bg-[#fef2f2] p-[14px]">
                <View className="flex-row items-center gap-2">
                    <CircleAlert size={18} color="#dc2626" />
                    <Text className="font-syne-bold text-[13px] text-[#dc2626]">{"Payment wasn't completed"}</Text>
                </View>
                <Text className="font-syne text-xs leading-[18px] text-[#6b7280]">
                    {message || 'Your order is not confirmed yet. Try again, or use a different card.'}
                </Text>
            </View>

            <GroupedCard className="gap-[14px]">
                <SectionHeading title="Your checkout" />
                <OrderItemRow item={item} />
                <Divider />
                <TotalRow label="Amount to pay · USD" value={formatUsd(totals.total)} />
            </GroupedCard>

            <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                If the problem continues, contact your card issuer or use another payment method.
            </Text>
        </CheckoutShell>
    )
}
