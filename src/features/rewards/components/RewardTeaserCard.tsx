import { router } from 'expo-router'
import { Gift, Lock } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useRewardTeaser } from '../api/getRewards'
import { describeCounts } from '../utils/format'

/**
 * The locked-reward block on a drop (or collection) page. Hidden when signed out
 * or when the collection has no live reward (404). Shows progress and the drops
 * still to collect, or "Open reward" once unlocked.
 */
export default function RewardTeaserCard({ collectionId }: { collectionId: string | null | undefined }) {
    const { data } = useRewardTeaser(collectionId)
    if (!data) return null

    const { reward, progress, unlocked } = data
    const counts = describeCounts(reward.itemCounts)
    const remaining = Math.max(0, progress.required - progress.collected)
    const pct = progress.required > 0 ? Math.min(1, progress.collected / progress.required) : 0

    return (
        <View className="gap-3 rounded-[10px] border border-[#bfdbfe] bg-[#eff6ff] p-4">
            <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                    {unlocked ? <Gift size={18} color="#2563eb" /> : <Lock size={18} color="#2563eb" />}
                </View>
                <View className="flex-1">
                    <Text numberOfLines={1} className="font-syne-bold text-[13px] text-[#111827]">{reward.name}</Text>
                    {!!counts && <Text className="font-syne text-[11px] text-[#6b7280]">{counts}</Text>}
                </View>
            </View>

            {!!reward.description && (
                <Text className="font-syne text-[12px] leading-[18px] text-[#374151]">{reward.description}</Text>
            )}

            {unlocked ? (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Open reward"
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/rewards/[rewardId]', params: { rewardId: reward.id } } as never)}
                    className="h-11 items-center justify-center rounded-[30px] bg-[#2563eb]"
                >
                    <Text className="font-syne-bold text-[13px] text-white">Open reward</Text>
                </TouchableOpacity>
            ) : (
                <>
                    <View className="gap-1">
                        <View className="h-1.5 overflow-hidden rounded-full bg-white">
                            <View className="h-full rounded-full bg-[#2563eb]" style={{ width: `${pct * 100}%` }} />
                        </View>
                        <Text className="font-syne text-[11px] text-[#6b7280]">
                            {progress.required === 0
                                ? 'Not available yet'
                                : `${progress.collected} of ${progress.required} drops claimed — collect ${remaining} more to unlock`}
                        </Text>
                    </View>
                    {progress.missing.map((drop) => (
                        <TouchableOpacity
                            key={drop.dropId}
                            accessibilityRole="button"
                            accessibilityLabel={`View ${drop.name}`}
                            activeOpacity={0.8}
                            onPress={() => router.push({ pathname: '/discover/[productId]', params: { productId: drop.dropId } } as never)}
                            className="rounded bg-white px-3 py-2"
                        >
                            <Text numberOfLines={1} className="font-syne-semibold text-[12px] text-[#2563eb]">
                                {drop.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </View>
    )
}
