import { router } from 'expo-router'
import { ExternalLink, Package } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro, SectionHeading } from '@/features/checkout/components/CheckoutParts'
import { ApiRequestError } from '@/lib/api'
import { orderErrorMessage } from '../api/cancelOrder'
import { useOrderTracking } from '../api/getOrders'
import { deliveredText, formatOrderDateTime, orderBadge, statusWord } from '../utils/format'

/**
 * Track parcel (`GET /api/v1/orders/:orderId/tracking`).
 *
 * HitBox has no fixed logistics partner and no live parcel-scan feed, so this is
 * honest about it: the carrier's name and tracking number (long-press to copy),
 * a **Track parcel** button only when the carrier gave a link, and the status
 * timeline HitBox itself recorded.
 */
export default function TrackingScreen({ orderId }: { orderId?: string }) {
    const { data, isLoading, isError, error, refetch, isRefetching } = useOrderTracking(orderId)

    if (isLoading) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Track parcel" />
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (isError || !data) {
        const notFound = error instanceof ApiRequestError && error.status === 404
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Track parcel" />
                <View className="mt-16 items-center gap-3 px-6">
                    <Package size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">{orderErrorMessage(error)}</Text>
                    <TouchableOpacity
                        onPress={() => (notFound ? router.back() : refetch())}
                        className="rounded-[30px] bg-[#111827] px-5 py-2"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">{notFound ? 'Go Back' : 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    const { shipment } = data
    const badge = orderBadge(data.status)

    const openTracking = async () => {
        if (!shipment?.trackingUrl) return
        try {
            await Linking.openURL(shipment.trackingUrl)
        } catch {
            Alert.alert("Couldn't open the link", 'Try again in a moment.')
        }
    }

    return (
        <CheckoutShell showBag={false}>
            <PageIntro title="Track parcel" />

            <View className="flex-row items-center gap-2">
                <View className="rounded border px-[10px] py-[5px]" style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
                    <Text className="font-syne-bold text-[10px]" style={{ color: badge.text }}>
                        {statusWord(data.status).toUpperCase()}
                    </Text>
                </View>
                {data.deliveredAt && (
                    <Text className="font-syne text-[11px] text-[#6b7280]">
                        {deliveredText(shipment?.deliveredVia ?? null)}
                    </Text>
                )}
            </View>

            {shipment ? (
                <GroupedCard>
                    <SectionHeading title="Carrier" />
                    <Text className="font-syne-bold text-[15px] text-[#111827]">{shipment.carrierName}</Text>
                    <View className="gap-1">
                        <Text className="font-syne text-[10px] tracking-[0.5px] text-[#6b7280]">TRACKING NUMBER</Text>
                        {/* Long-press to select and copy (no clipboard library in the app). */}
                        <Text selectable className="font-syne-bold text-[16px] text-[#111827]">{shipment.trackingNumber}</Text>
                    </View>
                    {shipment.trackingUrl && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Track parcel on the carrier's site"
                            activeOpacity={0.85}
                            onPress={openTracking}
                            className="mt-1 h-[46px] flex-row items-center justify-center gap-2 rounded bg-black"
                        >
                            <Text className="font-syne-bold text-[13px] text-white">Track parcel</Text>
                            <ExternalLink size={15} color="#fff" />
                        </TouchableOpacity>
                    )}
                </GroupedCard>
            ) : (
                <View className="items-center gap-3 px-6 py-6">
                    <Package size={32} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        Not shipped yet. Tracking details appear here once your order is on its way.
                    </Text>
                </View>
            )}

            <GroupedCard>
                <SectionHeading title="Timeline" />
                {data.timeline.map((entry) => (
                    <View key={entry.status + entry.at} className="flex-row items-center justify-between">
                        <Text className="font-syne-semibold text-xs text-[#111827]">{statusWord(entry.status)}</Text>
                        <Text className="font-syne text-[11px] text-[#6b7280]">{formatOrderDateTime(entry.at)}</Text>
                    </View>
                ))}
            </GroupedCard>

            <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                disabled={isRefetching}
                onPress={() => refetch()}
                className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
            >
                {isRefetching ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                    <Text className="font-syne-bold text-[13px] text-[#2563eb]">Refresh</Text>
                )}
            </TouchableOpacity>
        </CheckoutShell>
    )
}
