import { Image } from 'expo-image'
import { router, useIsFocused } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { UserRound, X } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native'

import { useUserCollection } from '@/features/collections/api/getUserCollection'
import { DISCOVER_PLACEHOLDER_IMAGE } from '@/features/discover/utils/format'
import { useOwnedProductInfo } from '../api/getOwnedCategories'
import { useUser } from '../api/getProfile'

/** "12 Nov 2026". */
const storyDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Purchase story — Figma P13 (a collector's newest item) and P15 (your own). A
 * dark, story-style full-screen card: who, when, the item, and where to go next.
 *
 * The item is the NEWEST on the collector's shelf (`GET /collections/user/:id` is
 * newest-first, and for a visitor only public items come back). The API records
 * when an item was CLAIMED, not when it was bought, so the line reads "Claimed
 * 12 Nov 2026". The brand line is the artist (collections have no names).
 */
export default function PurchaseStoryScreen({ userId }: { userId?: string }) {
    const isFocused = useIsFocused()
    const profile = useUser(userId)
    const shelf = useUserCollection(userId, { limit: 50 })

    const p = profile.data
    const isSelf = !!p?.viewer?.isSelf
    const newest = shelf.data?.data[0]
    const info = useOwnedProductInfo(newest ? [newest.product.id] : [])
    const artist = newest ? info[newest.product.id]?.artistName : null

    const name = p?.fullName || (p?.handle ? `@${p.handle}` : 'Collector')
    const first = p?.fullName?.split(' ')[0] || p?.handle || 'this collector'
    const loading = profile.isLoading || shelf.isLoading

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#0c1b31' }}>
            {isFocused && <StatusBar style="light" />}

            {/* Story progress */}
            <View className="mx-5 mt-2 h-[3px] overflow-hidden rounded-full bg-[#24344d]">
                <View className="h-full w-[55%] rounded-full bg-[#4ade80]" />
            </View>

            {/* Who + close */}
            <View className="mx-5 mt-4 flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center gap-3">
                    {p?.avatarUrl ? (
                        <Image source={{ uri: p.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 4, backgroundColor: '#1f2f4d' }} contentFit="cover" />
                    ) : (
                        <View className="h-10 w-10 items-center justify-center rounded bg-[#1f2f4d]">
                            <UserRound size={18} color="#94a3b8" />
                        </View>
                    )}
                    <View className="flex-1">
                        <Text numberOfLines={1} className="font-syne-bold text-[16px] text-white">
                            {isSelf ? 'You' : name} <Text className="text-white">✓</Text>
                        </Text>
                        <Text className="font-syne text-[10.5px] text-[#94a3b8]">
                            {newest ? `Newest purchase · ${storyDate(newest.acquiredAt)}` : 'Newest purchase'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    hitSlop={10}
                    onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/discover' as never))}
                    className="size-9 items-center justify-center"
                >
                    <X size={22} color="#ffffff" />
                </TouchableOpacity>
            </View>

            {loading && (
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#4ade80" />
                </View>
            )}

            {!loading && !newest && (
                <View className="mt-24 items-center gap-3 px-8">
                    <Text className="text-center font-syne-bold text-[18px] text-white">No purchases to show yet</Text>
                    <Text className="text-center font-syne text-[13px] leading-5 text-[#94a3b8]">
                        {isSelf
                            ? 'Claim an item with the Scan tab and your newest find appears here.'
                            : `${first.charAt(0).toUpperCase()}${first.slice(1)} hasn't shared any items.`}
                    </Text>
                    <TouchableOpacity onPress={() => router.back()} className="mt-2 rounded bg-black px-6 py-3">
                        <Text className="font-syne-bold text-[13px] text-white">Go back</Text>
                    </TouchableOpacity>
                </View>
            )}

            {newest && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 30, gap: 16 }}>
                    <Image
                        source={{ uri: newest.product.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                        style={{ width: '100%', aspectRatio: 0.82, borderRadius: 4, backgroundColor: '#1f2f4d' }}
                        contentFit="cover"
                    />

                    <View className="gap-1.5">
                        <Text className="font-syne-bold text-[10px] tracking-[0.6px] text-[#4ade80]">
                            {['NEWEST BUY', artist?.toUpperCase()].filter(Boolean).join(' / ')}
                        </Text>
                        <Text className="font-syne-bold text-[30px] leading-[34px] text-white">{newest.product.name}</Text>
                        <Text className="font-syne text-[11px] text-[#94a3b8]">
                            {`Claimed ${storyDate(newest.acquiredAt)} · Added to collection`}
                        </Text>
                        <Text className="mt-2 font-syne text-[13px] leading-[19px] text-[#cbd5e1]">
                            {isSelf
                                ? 'Your latest find. Part of your public collection.'
                                : `A new addition to ${first}'s collection.`}
                        </Text>
                    </View>

                    {isSelf ? (
                        <>
                            <StoryButton label="Back to my profile" onPress={() => router.replace('/(tabs)/profile' as never)} />
                            <StoryButton label="Open My Collections" onPress={() => router.replace('/(tabs)/collections' as never)} />
                        </>
                    ) : (
                        <>
                            <StoryButton
                                label="View collector profile"
                                onPress={() =>
                                    router.canGoBack()
                                        ? router.back()
                                        : router.replace({ pathname: '/collectors/[userId]', params: { userId: userId! } } as never)
                                }
                            />
                            <StoryButton label="Back to collectors" onPress={() => router.replace('/find-collectors' as never)} />
                        </>
                    )}

                    <Text className="font-syne-bold text-[9px] tracking-[0.8px] text-[#4ade80]">OWNED &amp; AUTHENTICATED</Text>
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

function StoryButton({ label, onPress }: { label: string; onPress: () => void }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onPress}
            className="h-[46px] justify-center rounded-[2px] bg-black px-3.5"
        >
            <Text className="font-syne-bold text-[13px] text-white">{label}</Text>
        </TouchableOpacity>
    )
}
