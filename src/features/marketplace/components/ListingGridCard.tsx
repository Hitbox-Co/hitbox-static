import { Gem } from 'lucide-react-native'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { MarketplaceListingItem } from '../types/marketplace'
import { formatPrice, formatRewardPoints, MARKETPLACE_PLACEHOLDER_IMAGE } from '../utils/format'

/**
 * Two-column grid card for the "See All" screen — the vertical counterpart to
 * the horizontally-scrolling cards in `ListingsSection`.
 */
export default function ListingGridCard({
    item,
    onPress,
}: {
    item: MarketplaceListingItem
    onPress?: () => void
}) {
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            className="flex-1 overflow-hidden rounded-2xl border border-border bg-card p-2.5"
        >
            <View className="relative w-full aspect-square overflow-hidden rounded-xl bg-muted">
                <Image
                    source={{ uri: item.imageUrl ?? MARKETPLACE_PLACEHOLDER_IMAGE }}
                    className="h-full w-full"
                    resizeMode="cover"
                />
                {item.badge && (
                    <View className="absolute left-2 top-2 rounded-lg bg-primary-80 px-1.5 py-0.5">
                        <Text className="text-[9px] font-black tracking-wide text-white">{item.badge}</Text>
                    </View>
                )}
            </View>

            <View className="mt-2.5 px-0.5">
                <Text numberOfLines={1} className="text-xs font-bold text-foreground">{item.name}</Text>
                {item.artistName && (
                    <Text numberOfLines={1} className="mt-0.5 text-[11px] text-muted-foreground">
                        {item.artistName}
                    </Text>
                )}

                <Text className="mt-2 text-xs font-extrabold text-foreground">
                    {formatPrice(item.priceInDollars)}
                </Text>

                <View className="mt-1.5 flex-row items-center border-t border-border pt-1.5">
                    <Gem size={11} color="#A855F7" fill="#A855F7" />
                    <Text className="ml-1 text-[10px] font-semibold text-violet-400">
                        {formatRewardPoints(item.rewardPoints)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}
