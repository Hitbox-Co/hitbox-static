import { LinearGradient } from 'expo-linear-gradient'
import { Star } from 'lucide-react-native'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { DiscoverProductItem } from '../types/discover'
import {
    DISCOVER_PLACEHOLDER_IMAGE,
    formatDiscoverPrice,
    formatEdition,
    formatRewardPoints,
    rarityLabel,
} from '../utils/format'
import WishlistHeart from './WishlistHeart'

interface DiscoverProductCardProps {
    item: DiscoverProductItem
    /** Card width. The artwork is `imageHeight` tall (150 in the carousel, square in the grid). */
    width: number
    imageHeight: number
    /** `carousel`: artist under the name. `grid`: "Artist · Edition of 200". */
    variant?: 'carousel' | 'grid'
    onPress?: () => void
}

/**
 * Light product card from the Figma (Trending collectible / Latest collectible),
 * filled from a Discover drop card: rarity tag, name, artist, price, reward
 * points and the wishlist heart. Anything the drop doesn't have (no rarity, no
 * price, no points) is simply left off.
 */
export default function DiscoverProductCard({
    item,
    width,
    imageHeight,
    variant = 'carousel',
    onPress,
}: DiscoverProductCardProps) {
    const points = formatRewardPoints(item.rewardPoints)
    const price = formatDiscoverPrice(item.price)
    const rarity = rarityLabel(item.rarity)
    const edition = formatEdition(item.totalSupply)
    const artistLine =
        variant === 'grid'
            ? [item.artist?.name, edition].filter(Boolean).join(' · ')
            : (item.artist?.name ?? '').toUpperCase()

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
                {rarity && (
                    <View className="absolute bottom-[10px] left-[10px] rounded border border-[rgba(59,130,246,0.4)] bg-white px-[8px] py-[3px]">
                        <Text className="font-syne-bold text-[8px] text-[#3b82f6]">{rarity}</Text>
                    </View>
                )}
                <WishlistHeart productId={item.id} isWishlisted={item.isWishlisted} />
            </View>

            <View className="gap-[7px] p-3">
                <Text numberOfLines={2} className="font-syne-bold text-[13px] leading-[17px] text-[#111827]">
                    {item.name}
                </Text>
                {artistLine !== '' && (
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                        {artistLine}
                    </Text>
                )}
                {(price || points) && (
                    <View className="flex-row items-center justify-between">
                        {price ? (
                            <Text className="font-syne-bold text-[15px] text-[#111827]">{price}</Text>
                        ) : (
                            <View />
                        )}
                        {points && (
                            <View className="flex-row items-center gap-[3px]">
                                <Star size={10} color="#f5b301" fill="#f5b301" />
                                <Text className="font-syne-semibold text-[9.5px] text-[#2563eb]">{points}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}
