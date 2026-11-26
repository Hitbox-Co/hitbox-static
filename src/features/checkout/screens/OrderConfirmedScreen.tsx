import { useLocalSearchParams, router } from 'expo-router'
import { Check, Clock } from 'lucide-react-native'
import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, Image, Text, View } from 'react-native'

import { useOrder } from '@/features/orders/api/getOrders'
import { formatOrderDate } from '@/features/orders/utils/format'
import { CheckoutShell, Divider, PageIntro, PrimaryAction, SecondaryLink, TotalRow } from '../components/CheckoutParts'
import { checkoutActions } from '../store/checkoutStore'
import { formatMoney } from '../utils/money'

/**
 * 07 · Order confirmed. The app never decides an order is paid: after Stripe's
 * sheet reports success this screen shows "Confirming payment…" and polls
 * `GET /orders/:orderId` until the server's webhook moves it on. The in-progress
 * checkout is cleared when the buyer leaves.
 */
export default function OrderConfirmedScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>()
    const { data: order, isError, refetch } = useOrder(orderId, { poll: true })

    const leaving = useRef(() => checkoutActions.clearCart())
    useEffect(() => () => leaving.current(), [])

    const goOrders = () => router.replace((orderId ? `/orders/${orderId}` : '/orders') as never)

    if (!order) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Order" />
                <View className="mt-24 items-center gap-3">
                    {isError ? (
                        <>
                            <Text className="font-syne text-xs text-[#6b7280]">Could not load your order.</Text>
                            <SecondaryLink label="Try again" onPress={() => refetch()} />
                        </>
                    ) : (
                        <ActivityIndicator size="large" color="#2563eb" />
                    )}
                </View>
            </CheckoutShell>
        )
    }

    if (order.status === 'PENDING_PAYMENT') {
        return (
            <CheckoutShell showBag={false} footer={<SecondaryLink label="View my orders" onPress={goOrders} />}>
                <PageIntro title="Confirming payment…" subtitle="This usually takes a few seconds." />
                <View className="items-center gap-3 rounded border border-[#e5e7eb] bg-white p-6">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Clock size={16} color="#6b7280" />
                    <Text className="text-center font-syne text-[11px] leading-[16px] text-[#6b7280]">
                        {"Stripe has your payment. We're waiting for it to be confirmed. You can safely leave this screen — your order will update on its own."}
                    </Text>
                </View>
            </CheckoutShell>
        )
    }

    if (order.status === 'CANCELLED') {
        return (
            <CheckoutShell
                showBag={false}
                footer={<PrimaryAction label="Back to discover" onPress={() => router.replace('/(tabs)/discover' as never)} />}
            >
                <PageIntro title="Payment unsuccessful" />
                <View className="gap-2 rounded border border-[#fecaca] bg-[#fef2f2] p-[14px]">
                    <Text className="font-syne-bold text-[13px] text-[#dc2626]">This order was cancelled</Text>
                    <Text className="font-syne text-xs leading-[18px] text-[#6b7280]">
                        {order.payment.failureReason ?? 'The payment was not completed, so the item was released.'}
                    </Text>
                </View>
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell
            showBag={false}
            footer={
                <>
                    <PrimaryAction label="View order details" onPress={goOrders} />
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
                    <Text className="font-syne-bold text-xs leading-[17px] text-[#052e16]">Thanks. Your drop is ordered.</Text>
                    <Text className="font-syne text-[10px] text-[rgba(5,46,22,0.6)]">
                        {[order.reference ? `Order ${order.reference}` : null, formatOrderDate(order.placedAt)].filter(Boolean).join(' · ')}
                    </Text>
                </View>
            </View>

            <View className="gap-3 rounded border border-[#e5e7eb] bg-white p-4">
                <View className="flex-row items-center gap-3">
                    <View style={{ width: 76, height: 76, borderRadius: 4, overflow: 'hidden', backgroundColor: '#eef2ff' }}>
                        {order.product.imageUrl ? (
                            <Image source={{ uri: order.product.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                        ) : null}
                    </View>
                    <View className="flex-1 gap-1">
                        <Text numberOfLines={2} className="font-syne-bold text-base text-[#111827]">{order.product.name}</Text>
                        {order.product.artistName && (
                            <Text className="font-syne text-[11px] text-[#2563eb]">{order.product.artistName}</Text>
                        )}
                        {order.variantLabel && <Text className="font-syne text-[11px] text-[#6b7280]">{order.variantLabel}</Text>}
                    </View>
                </View>
                <Divider />
                <TotalRow label="Total paid" value={formatMoney(order.amount, order.currency)} />
            </View>

            <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                {"Your invoice is issued a moment after payment. Once your item arrives, tap its NFC tag to claim it on HitBox. Purchasing doesn't verify or claim the item."}
            </Text>
        </CheckoutShell>
    )
}
