import { router } from 'expo-router'
import React from 'react'
import { useWindowDimensions, View } from 'react-native'

import DiscoverProductCard from '@/features/discover/components/DiscoverProductCard'
import { MarketplaceListingItem } from '../types/marketplace'

/**
 * Two-column grid of listing cards (Figma "Latest drops" style). A listing is the
 * same card as a Discover drop, so it reuses that card: rarity tag, name,
 * "Artist · Edition of N", price, points and the wishlist heart.
 *
 * A card opens the product inside the Marketplace stack, so the Marketplace tab
 * stays selected (the detail route is mounted in both stacks on purpose).
 */
export default function ListingGrid({ items }: { items: MarketplaceListingItem[] }) {
    const { width } = useWindowDimensions()
    const cardWidth = (width - 40 - 12) / 2

    return (
        <View className="flex-row flex-wrap gap-3 px-5">
            {items.map((item) => (
                <DiscoverProductCard
                    key={item.id}
                    item={item}
                    width={cardWidth}
                    imageHeight={cardWidth}
                    variant="grid"
                    onPress={() => router.push({ pathname: '/marketplace/[tourId]', params: { tourId: item.id } })}
                />
            ))}
        </View>
    )
}
