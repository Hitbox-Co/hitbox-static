import { router } from 'expo-router'
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
import { AddressLines } from '../components/AddressLines'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { selectedAddressOf, useCheckoutState } from '../store/checkoutStore'
import { formatUsd } from '../utils/money'
import { paymentSummary } from '../utils/paymentSummary'

/**
 * 06 · Payment unsuccessful — the recovery state (Figma). Nothing was charged
 * and the cart is kept, so the buyer can try again or pick another method.
 */
export default function PaymentFailedScreen() {
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const checkout = useCheckoutState()
    const address = selectedAddressOf(checkout)

    if (!item || !totals) {
        return (
            <CheckoutShell>
                <PageIntro title="Payment unsuccessful" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const payment = paymentSummary(checkout.paymentMethod)

    return (
        <CheckoutShell
            footer={
                <>
                    <PrimaryAction
                        label={`Try again · ${formatUsd(totals.total)}`}
                        onPress={() => router.replace('/checkout/review' as never)}
                    />
                    <SecondaryLink label="Change payment method" onPress={() => router.replace('/checkout/payment' as never)} />
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
                    Your order is not confirmed yet. Try again, or choose a different payment method to continue.
                </Text>
            </View>

            <GroupedCard className="gap-[14px]">
                <SectionHeading title="Your checkout" />
                <OrderItemRow item={item} />
                <Divider />
                <TotalRow label="Amount to pay · USD" value={formatUsd(totals.total)} />
                <Text className="font-syne text-[10px] text-[#6b7280]">
                    {`Includes ${formatUsd(totals.delivery)} delivery and ${formatUsd(totals.tax)} tax.`}
                </Text>
            </GroupedCard>

            <GroupedCard className="gap-[14px]">
                <SectionHeading title="Payment attempted" />
                <View className="flex-row items-center gap-[10px]">
                    <payment.Icon size={18} color="#2563eb" />
                    <Text className="font-syne text-xs text-[#111827]">
                        {[payment.title, payment.sub].filter(Boolean).join(' · ')}
                    </Text>
                </View>
                <Divider />
                <SectionHeading title="Deliver to" />
                <View className="flex-row">
                    <AddressLines address={address} />
                </View>
            </GroupedCard>

            <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                If the problem continues, contact your card issuer or use another payment method.
            </Text>
        </CheckoutShell>
    )
}
