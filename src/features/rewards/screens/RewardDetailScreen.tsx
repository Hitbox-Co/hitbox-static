import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ExternalLink, Film, Lock, Music } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro, SectionHeading } from '@/features/checkout/components/CheckoutParts'
import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { lockedCollectionId, useReward } from '../api/getRewards'
import { RewardItem } from '../types/reward'
import { describeCounts, formatBytes } from '../utils/format'

/**
 * An opened reward (`GET /api/v1/rewards/:rewardId`): images and GIFs render
 * inline; video and audio open in the system player through their signed link
 * (no media-player library is bundled). Links last 1 hour and are re-fetched on
 * every open — this screen never stores them.
 */
export default function RewardDetailScreen({ rewardId }: { rewardId?: string }) {
    const { data, isLoading, isError, error, refetch } = useReward(rewardId)

    if (isLoading) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Reward" />
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (isError || !data) {
        const collectionId = lockedCollectionId(error)
        const notFound = error instanceof ApiRequestError && error.status === 404
        const goBack = !!collectionId || notFound
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Reward" />
                <View className="mt-16 items-center gap-3 px-6">
                    <Lock size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(error, "Couldn't open this reward.")}
                    </Text>
                    <TouchableOpacity
                        onPress={() => (goBack ? router.back() : refetch())}
                        className="rounded-[30px] bg-[#111827] px-5 py-2"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">{goBack ? 'Go Back' : 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    const items = [...data.items].sort((a, b) => a.position - b.position)

    return (
        <CheckoutShell showBag={false}>
            <PageIntro title={data.name} subtitle={`${data.collection.name} · ${data.collection.artist.name}`} />
            {!!data.description && (
                <Text className="font-syne text-[13px] leading-[20px] text-[#374151]">{data.description}</Text>
            )}
            <Text className="font-syne text-[11px] text-[#6b7280]">
                {describeCounts(data.itemCounts) || `${data.itemTotal} items`}
            </Text>

            <SectionHeading title="Exclusive content" />
            {items.map((item) => (
                <RewardItemCard key={item.id} item={item} />
            ))}
        </CheckoutShell>
    )
}

function RewardItemCard({ item }: { item: RewardItem }) {
    const size = formatBytes(item.sizeBytes)
    const isImage = item.kind === 'IMAGE' || item.kind === 'GIF'

    const open = async () => {
        if (!item.url) return
        try {
            await Linking.openURL(item.url)
        } catch {
            Alert.alert("Couldn't open the file", 'Try again in a moment.')
        }
    }

    return (
        <GroupedCard>
            {isImage && item.url ? (
                <Image
                    accessibilityLabel={item.title}
                    source={{ uri: item.url }}
                    style={{ width: '100%', aspectRatio: 1, borderRadius: 8, backgroundColor: '#f3f4f6' }}
                    contentFit="contain"
                />
            ) : null}
            <View className="flex-row items-center gap-3">
                <View className="flex-1 gap-0.5">
                    <Text numberOfLines={2} className="font-syne-bold text-[13px] text-[#111827]">{item.title}</Text>
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                        {[item.kind ?? 'FILE', size].filter(Boolean).join(' · ')}
                    </Text>
                </View>
                {!item.url ? (
                    <Text className="font-syne-semibold text-[11px] text-[#9ca3af]">Unavailable</Text>
                ) : !isImage ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${item.kind === 'AUDIO' ? 'Play' : 'Watch'} ${item.title}`}
                        activeOpacity={0.85}
                        onPress={open}
                        className="h-10 flex-row items-center gap-2 rounded-[30px] bg-black px-4"
                    >
                        {item.kind === 'AUDIO' ? <Music size={14} color="#fff" /> : <Film size={14} color="#fff" />}
                        <Text className="font-syne-bold text-[12px] text-white">
                            {item.kind === 'AUDIO' ? 'Play' : 'Watch'}
                        </Text>
                        <ExternalLink size={12} color="#fff" />
                    </TouchableOpacity>
                ) : null}
            </View>
        </GroupedCard>
    )
}
