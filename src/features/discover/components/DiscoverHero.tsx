import { LinearGradient } from 'expo-linear-gradient'
import { ArrowUpRight, Bell, Heart, Search, Star } from 'lucide-react-native'
import { MotiView } from 'moti'
import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DiscoverProductItem } from '../types/discover'
import { formatRewardPoints } from '../utils/format'

/** Figma: the carousel is 499 tall including the 44px status bar. */
const HERO_BODY_HEIGHT = 455
const LIME = '#d1f63b'

interface DiscoverHeroProps {
    /** Featured products from GET /api/v1/discover (≤5). May be empty while loading. */
    items?: DiscoverProductItem[]
    onItemPress?: (item: DiscoverProductItem) => void
    /** Fallback CTA when there is no featured product to open. */
    onExplore?: () => void
    onSearchPress?: () => void
    onBellPress?: () => void
    onSignUpPress?: () => void
    signedIn: boolean
    hasUnread?: boolean
}

/**
 * Top of Discover — the dark full-bleed banner from the Figma, behind a
 * transparent header (logo, search, notifications, Sign Up).
 *
 * The artwork is fixed brand imagery; the *featured products* from the feed
 * rotate through the caption beneath it (name, reward points, "View Drop").
 * The feed carries no price, rarity or creator, so the Figma's price and rarity
 * chip are not shown.
 */
export default function DiscoverHero({
    items,
    onItemPress,
    onExplore,
    onSearchPress,
    onBellPress,
    onSignUpPress,
    signedIn,
    hasUnread,
}: DiscoverHeroProps) {
    const insets = useSafeAreaInsets()
    const { width } = useWindowDimensions()
    const height = HERO_BODY_HEIGHT + insets.top

    const featured = items ?? []
    const [index, setIndex] = useState(0)
    const [liked, setLiked] = useState(false)
    const active = featured.length > 0 ? featured[Math.min(index, featured.length - 1)] : undefined

    // Auto-advance, restarting whenever the user picks a dot.
    useEffect(() => {
        if (featured.length < 2) return
        const timer = setTimeout(() => setIndex((i) => (i + 1) % featured.length), 5000)
        return () => clearTimeout(timer)
    }, [index, featured.length])

    const points = active ? formatRewardPoints(active.rewardPoints) : null

    return (
        <View style={{ height, backgroundColor: '#0a0a1a', overflow: 'hidden' }}>
            {/* Artwork — Figma places it 98% wide, nudged right and down. */}
            <Image
                source={require('@/assets/images/discover-hero.jpg')}
                resizeMode="cover"
                style={{
                    position: 'absolute',
                    left: width * 0.0788,
                    top: height * 0.0803,
                    width: width * 0.9831,
                    height: width * 0.9831,
                }}
            />
            {/* Scrim: keeps the header and caption readable over the artwork. */}
            <LinearGradient
                colors={['rgba(10,10,26,0.55)', 'rgba(10,10,26,0)', 'rgba(10,10,26,0.55)', 'rgba(10,10,26,0.95)']}
                locations={[0, 0.22, 0.6, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Transparent header */}
            <View style={{ paddingTop: insets.top }}>
                <View className="h-11 flex-row items-center justify-between px-5">
                    <View className="flex-row items-center gap-[7px]">
                        <Image
                            source={require('@/assets/images/HitBoxLogo.png')}
                            resizeMode="cover"
                            style={{ width: 26, height: 26, borderRadius: 6 }}
                        />
                        <Text className="font-orbitron text-[14px] text-white">HitBox</Text>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Search"
                            activeOpacity={0.7}
                            onPress={onSearchPress}
                            className="size-[34px] items-center justify-center rounded-lg bg-white/[0.13]"
                        >
                            <Search size={17} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Notifications"
                            activeOpacity={0.7}
                            onPress={onBellPress}
                            className="size-[34px] items-center justify-center rounded-lg bg-white/[0.13]"
                        >
                            <Bell size={17} color="#fff" />
                            {hasUnread && (
                                <View className="absolute right-2 top-2 size-[7px] rounded-full bg-[#3b82f6]" />
                            )}
                        </TouchableOpacity>
                        {/* Guests only — a signed-in user has already done this. */}
                        {!signedIn && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Sign up"
                                activeOpacity={0.8}
                                onPress={onSignUpPress}
                                className="h-[34px] items-center justify-center rounded-lg border border-white/25 bg-white/[0.13] px-[13px]"
                            >
                                <Text className="font-syne-medium text-[11.75px] text-white">Sign Up</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Save/like — Figma puts it at the right edge, just under the header. */}
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={liked ? 'Remove from saved' : 'Save featured drop'}
                activeOpacity={0.7}
                hitSlop={10}
                onPress={() => setLiked((v) => !v)}
                style={{ position: 'absolute', right: 25, top: insets.top + 62 }}
            >
                <Heart
                    size={19}
                    color={liked ? '#f43f5e' : '#fda4af'}
                    fill={liked ? '#f43f5e' : '#fda4af'}
                />
            </TouchableOpacity>

            {/* Featured caption */}
            <View className="absolute bottom-5 left-5 right-5 gap-2">
                <View className="self-start rounded border border-[rgba(229,255,80,0.4)] bg-[rgba(188,255,71,0.15)] px-[10px] py-[5px]">
                    <Text className="font-syne-bold text-[7.5px] text-[#d1f63b]">FEATURED DROP</Text>
                </View>

                <MotiView
                    key={active?.id ?? 'static'}
                    from={{ opacity: 0, translateY: 6 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 300 }}
                    className="gap-4"
                >
                    <View className="gap-[5px]">
                        <Text
                            className="font-orbitron-black text-[21px] leading-[22px] text-white"
                            style={{
                                textShadowColor: 'rgba(64,107,204,0.17)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 1,
                            }}
                        >
                            Beyond the ordinary.
                        </Text>
                        <Text numberOfLines={1} className="font-syne-medium text-[13px] text-white">
                            {active ? active.name : 'Physical collectibles, verified on HitBox'}
                        </Text>
                    </View>

                    <View className="h-[42px] flex-row items-center gap-[10px]">
                        <View className="flex-1 gap-[3px]">
                            {points ? (
                                <View className="flex-row items-center gap-[3px]">
                                    <Star size={10} color={LIME} fill={LIME} />
                                    <Text className="font-syne-semibold text-[11px] text-[#d1f63b]">{points}</Text>
                                </View>
                            ) : null}
                        </View>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel={active ? `View ${active.name}` : 'Explore drops'}
                            activeOpacity={0.85}
                            onPress={() => (active ? onItemPress?.(active) : onExplore?.())}
                            className="h-[42px] w-[153px] flex-row items-center justify-center gap-2 rounded-[30px] border border-[#2563eb] bg-[#2563eb]"
                        >
                            <Text className="font-syne-bold text-[13px] text-white">
                                {active ? 'View Drop' : 'Explore'}
                            </Text>
                            <ArrowUpRight size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </MotiView>

                {featured.length > 1 && (
                    <View className="h-[10px] flex-row items-start justify-center gap-[5px] pt-1">
                        {featured.map((item, i) => (
                            <TouchableOpacity
                                key={item.id}
                                accessibilityRole="button"
                                accessibilityLabel={`Featured ${i + 1}`}
                                hitSlop={8}
                                onPress={() => setIndex(i)}
                                className={
                                    i === index
                                        ? 'h-[6px] w-5 rounded bg-[#3b82f6]'
                                        : 'size-[6px] rounded bg-[rgba(59,130,245,0.25)]'
                                }
                            />
                        ))}
                    </View>
                )}
            </View>
        </View>
    )
}
