import { router, useLocalSearchParams } from 'expo-router'
import { Check } from 'lucide-react-native'
import React from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

import { formatRewardPoints } from '@/features/products/utils/format'
import {
    CheckoutShell,
    Divider,
    AmountRow,
    GroupedCard,
    NothingToCheckout,
    OrderItemRow,
    PageIntro,
    PrimaryAction,
    RewardsBox,
    SecondaryLink,
    SectionHeading,
    TotalRow,
} from '../components/CheckoutParts'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { checkoutActions } from '../store/checkoutStore'
import { formatUsd } from '../utils/money'

/**
 * 01 · Your cart (Figma). The drop comes from the real product; delivery, tax
 * and everything after this screen is mock until a cart/order API exists.
 */
export default function CartScreen() {
    // Set by Add to Cart, so the "added" note only shows right after adding.
    const { added } = useLocalSearchParams<{ added?: string }>()
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()

    if (!item || !totals) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Your cart" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const points = item.rewardPoints != null ? formatRewardPoints(item.rewardPoints * item.quantity) : null

    return (
        <CheckoutShell
            showBag={false}
            footer={
                <>
                    <View className="w-full">
                        <TotalRow label="Subtotal · USD" value={formatUsd(totals.subtotal)} />
                    </View>
                    <PrimaryAction label="Checkout" onPress={() => router.push('/checkout/delivery' as never)} />
                    <SecondaryLink label="Continue shopping" onPress={() => router.replace('/(tabs)/discover' as never)} />
                </>
            }
        >
            <PageIntro title="Your cart" subtitle="One more piece of your universe." />

            {added === '1' && (
                <View className="flex-row items-center gap-2 rounded bg-[#eff6ff] p-3">
                    <Check size={16} color="#2563eb" />
                    <Text className="flex-1 font-syne-semibold text-xs leading-[17px] text-[#2563eb]">
                        {`${item.name} added to your cart`}
                    </Text>
                </View>
            )}

            <View className="gap-[14px]">
                <SectionHeading title="Your drop" />
                <GroupedCard>
                    <OrderItemRow item={item} size={112} />
                    <Divider />
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Text className="font-syne text-[11px] text-[#6b7280]">Quantity</Text>
                            <View className="h-7 w-8 items-center justify-center rounded border border-[#dbeafe] bg-[#eff6ff]">
                                <Text className="font-syne-bold text-xs text-[#111827]">{item.quantity}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => Alert.alert('Save for later', 'Saved items are coming soon.')}
                        >
                            <Text className="font-syne-bold text-xs text-[#2563eb]">Save for later</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => {
                                checkoutActions.clearCart()
                                router.replace('/cart' as never)
                            }}
                        >
                            <Text className="font-syne text-[11px] text-[#6b7280] underline">Remove</Text>
                        </TouchableOpacity>
                    </View>
                </GroupedCard>
            </View>

            <GroupedCard>
                <SectionHeading title="Order summary" />
                <AmountRow label={`Subtotal · ${item.quantity} item${item.quantity === 1 ? '' : 's'}`} value={formatUsd(totals.subtotal)} />
                <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    Delivery and tax are calculated at checkout.
                </Text>
            </GroupedCard>

            {points && <RewardsBox title={`${points} pending with this purchase`} caption="Awarded after successful payment." />}
        </CheckoutShell>
    )
}
