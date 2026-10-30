import { router } from 'expo-router'
import { ChevronRight, Gem, Heart } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native'

import { MarketplaceListingItem } from '../types/marketplace'
import { formatPrice, formatRewardPoints, MARKETPLACE_PLACEHOLDER_IMAGE } from '../utils/format'

interface ListingsSectionProps {
    title: string
    items: MarketplaceListingItem[]
    onSeeAllPress?: () => void
}

export default function ListingsSection({ title, items, onSeeAllPress }: ListingsSectionProps) {
    const { width } = Dimensions.get('window');
    const CARD_WIDTH = width * 0.43;

    if (items.length === 0) return null

    return (
        <View className="mb-6">
            <View className="px-4 flex-row justify-between items-center mb-3">
                <Text className="text-foreground text-base font-bold tracking-tight">{title}</Text>
                <Pressable className="flex-row items-center" onPress={onSeeAllPress}>
                    <Text className="text-primary text-xs font-semibold mr-0.5">See All</Text>
                    <ChevronRight color="#6d28d9" size={14} />
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="pl-4"
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {items.map((item, index) => (
                    <MotiView
                        key={item.id}
                        from={{ opacity: 0, translateX: 20 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ type: 'timing', delay: index * 100 }}
                        style={{ width: CARD_WIDTH }}
                        className="mr-3 bg-card border border-primary rounded-2xl overflow-hidden p-2.5"
                    >
                        {/* Card is lightweight — the detail screen fetches GET /products/:id */}
                        <Pressable
                            onPress={() => router.push(`/marketplace/${item.id}`)}
                        >
                            <View className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
                                <Image
                                    source={{ uri: item.imageUrl ?? MARKETPLACE_PLACEHOLDER_IMAGE }}
                                    className="w-full h-full"
                                />
                                {item.badge && (
                                    <View className="absolute top-2 left-2 bg-primary-80 px-1.5 py-0.5 rounded-lg">
                                        <Text className="text-white text-[9px] font-black tracking-wide">{item.badge}</Text>
                                    </View>
                                )}
                                <Pressable className="absolute top-2 right-2 w-7 h-7 bg-black/40 rounded-full justify-center items-center">
                                    <Heart color="white" size={13} />
                                </Pressable>
                            </View>

                            <View className="mt-2.5 px-0.5">
                                <Text className="text-foreground text-xs font-bold" numberOfLines={1}>{item.name}</Text>
                                {item.artistName && (
                                    <Text className="text-muted-foreground text-[11px] mt-0.5" numberOfLines={1}>{item.artistName}</Text>
                                )}

                                <View className="flex-row items-center mt-2.5">
                                    <Text className="text-foreground text-xs font-extrabold">{formatPrice(item.priceInDollars)}</Text>
                                </View>

                                {item.rewardPoints != null && (
                                    <View className="flex-row items-center mt-1.5 pt-1.5 border-t border-border">
                                        <Gem size={11} color="#A855F7" fill="#A855F7" />
                                        <Text className="ml-1 text-[10px] font-semibold text-violet-400">
                                            {formatRewardPoints(item.rewardPoints)}
                                        </Text>
                                    </View>
                                )}
                            </View>

                        </Pressable>
                    </MotiView>
                ))}
            </ScrollView>
        </View>
    )
}
