import { useAuth } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Package } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { formatMoney } from '@/features/checkout/utils/money'
import { describeApiError } from '@/lib/api-errors'
import ForbiddenNote from '@/features/auth/components/ForbiddenNote'
import { useOrdersInfinite } from '../api/getOrders'
import { BuyerOrderListItem, OrderTab } from '../types/order'
import { formatOrderDate, orderBadge } from '../utils/format'

const TABS: { id: OrderTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
]

const EMPTY_TEXT: Record<OrderTab, string> = {
    all: 'No orders yet. Your purchases show up here.',
    active: 'No orders in progress.',
    completed: 'No delivered orders yet.',
    cancelled: 'No cancelled or refunded orders.',
}

/**
 * My orders (`GET /api/v1/orders`): the buyer's own orders, newest first, with the
 * four tabs and a badge count on each. The counts come with every response (all
 * four, whichever tab is open), so switching tabs never makes the badges jump.
 */
export default function OrdersScreen() {
    const { isLoaded, isSignedIn } = useAuth()
    const [tab, setTab] = useState<OrderTab>('all')

    const orders = useOrdersInfinite({ tab })
    const items = orders.data?.pages.flatMap((page) => page.items) ?? []
    const counts = orders.data?.pages[0]?.counts

    if (isLoaded && !isSignedIn) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="My orders" subtitle="Sign in to see your orders." />
                <View className="mt-10 items-center">
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => router.push('/(auth)/register' as never)}
                        className="rounded-[30px] bg-[#111827] px-6 py-3"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">Sign in</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell showBag={false}>
            <PageIntro title="My orders" subtitle="Track, cancel or get a receipt for what you bought." />

            <View className="flex-row flex-wrap gap-2">
                {TABS.map((t) => {
                    const active = t.id === tab
                    const count = counts?.[t.id]
                    return (
                        <TouchableOpacity
                            key={t.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            activeOpacity={0.8}
                            onPress={() => setTab(t.id)}
                            className={`h-8 flex-row items-center gap-[6px] rounded border px-[12px] ${active
                                ? 'border-[rgba(59,130,245,0.25)] bg-[#eff6ff]'
                                : 'border-[#e5e7eb] bg-[#f3f4f6]'
                                }`}
                        >
                            <Text className={`text-[12.5px] ${active ? 'font-syne-semibold text-[#2563eb]' : 'font-syne-medium text-[#6b7280]'}`}>
                                {t.label}
                            </Text>
                            {count !== undefined && (
                                <View className={`min-w-[18px] items-center rounded-full px-[5px] py-[1px] ${active ? 'bg-[#2563eb]' : 'bg-[#d1d5db]'}`}>
                                    <Text className={`font-syne-bold text-[9px] ${active ? 'text-white' : 'text-[#374151]'}`}>{count}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>

            {(orders.isLoading || !isLoaded) && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {orders.isError && !orders.isLoading && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(orders.error, "Couldn't load your orders.")}
                    </Text>
                    <ForbiddenNote error={orders.error} />
                    <TouchableOpacity onPress={() => orders.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!orders.isLoading && !orders.isError && items.length === 0 && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Package size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">{EMPTY_TEXT[tab]}</Text>
                </View>
            )}

            {items.map((order) => (
                <OrderRow key={order.id} order={order} />
            ))}

            {orders.hasNextPage && (
                <TouchableOpacity
                    onPress={() => orders.fetchNextPage()}
                    disabled={orders.isFetchingNextPage}
                    activeOpacity={0.8}
                    className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    {orders.isFetchingNextPage ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                    )}
                </TouchableOpacity>
            )}
        </CheckoutShell>
    )
}

function OrderRow({ order }: { order: BuyerOrderListItem }) {
    const badge = orderBadge(order.status)
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Order ${order.reference ?? order.product.name}`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/orders/[orderId]', params: { orderId: order.id } } as never)}
        >
            <GroupedCard>
                <View className="flex-row items-center gap-3">
                    <View style={{ width: 76, height: 76, borderRadius: 4, overflow: 'hidden', backgroundColor: '#eef2ff' }}>
                        {order.product.imageUrl ? (
                            <Image source={{ uri: order.product.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                        ) : null}
                    </View>
                    <View className="flex-1 gap-[5px]">
                        <View className="flex-row items-center justify-between gap-2">
                            <Text numberOfLines={1} className="flex-1 font-syne-bold text-[14px] text-[#111827]">
                                {order.product.name}
                            </Text>
                        </View>
                        {(order.product.artistName || order.variantLabel) && (
                            <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                                {[order.product.artistName, order.variantLabel].filter(Boolean).join(' · ')}
                            </Text>
                        )}
                        <View className="flex-row items-center gap-2">
                            <View className="rounded border px-[8px] py-[3px]" style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
                                <Text className="font-syne-bold text-[8px]" style={{ color: badge.text }}>
                                    {order.statusLabel.toUpperCase()}
                                </Text>
                            </View>
                            {order.refundInProgress && (
                                <View className="rounded bg-[#fffaed] px-[8px] py-[3px]">
                                    <Text className="font-syne-bold text-[8px] text-[#d97706]">REFUND IN PROGRESS</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
                <View className="flex-row items-center justify-between">
                    <Text className="font-syne text-[11px] text-[#6b7280]">
                        {`${order.reference ? `#${order.reference} · ` : ''}${formatOrderDate(order.placedAt)}`}
                    </Text>
                    <Text className="font-syne-bold text-[15px] text-[#111827]">{formatMoney(order.amount, order.currency)}</Text>
                </View>
                {order.tracking && (
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[#2563eb]">
                        {`${order.tracking.carrierName} · ${order.tracking.trackingNumber}`}
                    </Text>
                )}
            </GroupedCard>
        </TouchableOpacity>
    )
}
