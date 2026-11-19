import { useAuth } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Gift } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { describeApiError } from '@/lib/api-errors'
import { useRewards } from '../api/getRewards'
import { RewardSummary } from '../types/reward'
import { describeCounts, formatUnlockedDate } from '../utils/format'

/** My Rewards — every reward I can open now (`GET /api/v1/rewards`, no pagination). */
export default function RewardsScreen() {
    const { isLoaded, isSignedIn } = useAuth()
    const rewards = useRewards()
    const items = rewards.data ?? []

    if (isLoaded && !isSignedIn) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="My rewards" subtitle="Sign in to see your rewards." />
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
            <PageIntro
                title="My rewards"
                subtitle={items.length > 0 ? `${items.length} unlocked` : 'Exclusive content for complete collections.'}
            />

            {(rewards.isLoading || !isLoaded) && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {rewards.isError && !rewards.isLoading && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(rewards.error, "Couldn't load your rewards.")}
                    </Text>
                    <TouchableOpacity onPress={() => rewards.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!rewards.isLoading && !rewards.isError && items.length === 0 && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Gift size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        No rewards yet. Claim every drop of a collection to unlock its exclusive content.
                    </Text>
                </View>
            )}

            {items.map((reward) => (
                <RewardRow key={reward.id} reward={reward} />
            ))}
        </CheckoutShell>
    )
}

function RewardRow({ reward }: { reward: RewardSummary }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${reward.name}`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/rewards/[rewardId]', params: { rewardId: reward.id } } as never)}
        >
            <GroupedCard>
                <View className="flex-row items-center gap-3">
                    {reward.collection.heroImageUrl ? (
                        <Image
                            source={{ uri: reward.collection.heroImageUrl }}
                            style={{ width: 56, height: 56, borderRadius: 8 }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="h-14 w-14 items-center justify-center rounded-lg bg-[#eff6ff]">
                            <Gift size={22} color="#2563eb" />
                        </View>
                    )}
                    <View className="flex-1 gap-0.5">
                        <Text numberOfLines={1} className="font-syne-bold text-[13px] text-[#111827]">{reward.name}</Text>
                        <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                            {reward.collection.name} · {reward.collection.artist.name}
                        </Text>
                        <Text className="font-syne text-[11px] text-[#2563eb]">
                            {describeCounts(reward.itemCounts) || `${reward.itemTotal} items`}
                        </Text>
                    </View>
                </View>
                <Text className="font-syne text-[10px] text-[#9ca3af]">
                    Unlocked {formatUnlockedDate(reward.unlockedAt)}
                </Text>
            </GroupedCard>
        </TouchableOpacity>
    )
}
