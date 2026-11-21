import { useUser } from '@clerk/clerk-expo'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Check, Star } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'

import { formatRewardPoints } from '@/features/products/utils/format'
import { MOCK_ORDER_NUMBER } from '../data/mockCheckout'
import {
    AmountRow,
    CheckoutShell,
    Divider,
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
import { checkoutActions, selectedAddressOf, useCheckoutState } from '../store/checkoutStore'
import { MOCK_SAVED_CARD } from '../data/mockCheckout'
import { formatUsd } from '../utils/money'

/**
 * 07 · Order confirmed (Figma). Order number, date and "paid with" are mock
 * until there is an order API; the item, amounts and points are from the real
 * product. The cart is emptied when the buyer leaves this screen.
 */
export default function OrderConfirmedScreen() {
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const checkout = useCheckoutState()
    const address = selectedAddressOf(checkout)
    const { user } = useUser()

    // Empty the cart once the buyer has left — clearing it now would blank this screen.
    const leaving = useRef(() => checkoutActions.clearCart())
    useEffect(() => () => leaving.current(), [])

    if (!item || !totals) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Order confirmed" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const firstName = user?.firstName ?? address.fullName.split(' ')[0]
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const earned = item.rewardPoints != null ? formatRewardPoints(item.rewardPoints * item.quantity) : null

    return (
        <CheckoutShell
            showBag={false}
            footer={
                <>
                    <PrimaryAction
                        label="View order details"
                        // My orders is the real list (`GET /orders`). The order shown here is still the
                        // static checkout's, with no server id, so the list is the closest place to open;
                        // once checkout creates real orders this should go to `/orders/<orderId>`.
                        onPress={() => router.push('/orders' as never)}
                    />
                    <SecondaryLink label="Continue discovering" onPress={() => router.replace('/(tabs)/discover' as never)} />
                </>
            }
        >
            <PageIntro title="Order confirmed" />

            <View className="flex-row items-center gap-3 rounded border border-[#a3e635] bg-[#4bf389] p-3">
                <View className="size-[34px] items-center justify-center rounded bg-[rgba(0,0,0,0.08)]">
                    <Check size={20} color="#fff" strokeWidth={3} />
                </View>
                <View className="flex-1 gap-[3px]">
                    <Text className="font-syne-bold text-xs leading-[17px] text-[#052e16]">
                        {`Thanks, ${firstName}. Your drop is ordered.`}
                    </Text>
                    <Text className="font-syne text-[10px] text-[rgba(5,46,22,0.6)]">{`Order ${MOCK_ORDER_NUMBER} · ${date}`}</Text>
                </View>
            </View>

            <LinearGradient
                colors={['#0b1235', '#070b22']}
                style={{ borderRadius: 4, padding: 16, gap: 12, borderWidth: 1, borderColor: '#1e2a5a' }}
            >
                <OrderItemRow item={item} dark />
                <Divider dark />
                <View className="gap-[10px]">
                    <AmountRow dark label={`Subtotal · ${item.quantity} item${item.quantity === 1 ? '' : 's'}`} value={formatUsd(totals.subtotal)} />
                    <AmountRow dark label="Standard delivery" value={formatUsd(totals.delivery)} />
                    <AmountRow dark label="Tax" value={formatUsd(totals.tax)} />
                </View>
                <Divider dark />
                <TotalRow dark label="Total paid · USD" value={formatUsd(totals.total)} />
                <Text className="font-syne text-[10px] text-[#9ca3af]">{`Paid with card ending in ${MOCK_SAVED_CARD.last4}`}</Text>
            </LinearGradient>

            {earned && (
                <View className="flex-row items-center gap-3 rounded border border-[#ffd470] bg-[#fffaed] p-[14px]">
                    <Star size={20} color="#f5b301" />
                    <View className="gap-[3px]">
                        <Text className="font-syne-bold text-base text-[#f59e0b]">{`${earned} earned`}</Text>
                        <Text className="font-syne text-[10px] text-[#6b7280]">For VIP experiences on HitBox.</Text>
                    </View>
                </View>
            )}

            <View className="gap-[10px]">
                <SectionHeading title="Delivery details" />
                <View className="flex-row">
                    <AddressLines address={address} />
                </View>
                <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    Standard delivery · Follow updates in order details.
                </Text>
                <Text className="pt-2 font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    {"Once your item arrives, tap its NFC tag to claim it on HitBox. Purchasing doesn't verify or claim the item."}
                </Text>
            </View>
        </CheckoutShell>
    )
}
