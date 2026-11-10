import { LinearGradient } from 'expo-linear-gradient'
import { Heart, Star } from 'lucide-react-native'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { DiscoverProductItem } from '../types/discover'
import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from '../utils/format'

interface DiscoverProductCardProps {
    item: DiscoverProductItem
    /** Card width. The artwork is `imageHeight` tall (150 in the carousel, square in the grid). */
    width: number
    imageHeight: number
    onPress?: () => void
}

/**
 * Light product card from the Figma (Trending collectible / Latest collectible).
 * The feed only carries a name, an image and optional reward points, so the
 * Figma's rarity tag, creator line and price are not rendered.
 */
export default function DiscoverProductCard({
    item,
    width,
    imageHeight,
    onPress,
}: DiscoverProductCardProps) {
    const [liked, setLiked] = useState(false)
    const points = formatRewardPoints(item.rewardPoints)

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={item.name}
            activeOpacity={0.88}
            onPress={onPress}
            style={{
                width,
                backgroundColor: '#fff',
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#dbeafe',
                overflow: 'hidden',
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 3,
            }}
        >
            <View style={{ height: imageHeight, backgroundColor: '#eef2ff' }}>
                <Image
                    source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                    resizeMode="cover"
                    style={{ width: '100%', height: '100%' }}
                />
                {/* Soft blue shade toward the bottom of the artwork */}
                <LinearGradient
                    colors={['rgba(0,64,170,0)', 'rgba(30,58,138,0.13)', 'rgba(238,242,255,0.6)']}
                    locations={[0, 0.6, 1]}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={liked ? 'Remove from saved' : 'Save'}
                    activeOpacity={0.7}
                    hitSlop={6}
                    onPress={(e) => {
                        e.stopPropagation()
                        setLiked((v) => !v)
                    }}
                    className="absolute right-[10px] top-[10px] size-[26px] items-center justify-center rounded bg-white/80"
                >
                    <Heart
                        size={13}
                        color={liked ? '#ef4444' : '#374151'}
                        fill={liked ? '#ef4444' : 'transparent'}
                    />
                </TouchableOpacity>
            </View>

            <View className="gap-[7px] p-3">
                <Text numberOfLines={2} className="font-syne-bold text-[13px] leading-[17px] text-[#111827]">
                    {item.name}
                </Text>
                {points && (
                    <View className="flex-row items-center gap-[3px]">
                        <Star size={10} color="#f5b301" fill="#f5b301" />
                        <Text className="font-syne-semibold text-[9.5px] text-[#2563eb]">{points}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}
