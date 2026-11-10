import { SearchX, Star } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native'

import { useDiscoverProducts } from '../api/getDiscoverProducts'
import { DiscoverProductItem } from '../types/discover'
import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from '../utils/format'

interface SearchResultsSectionProps {
    /** Debounced search term (1–100 chars, per the API). */
    search: string
    onItemPress?: (item: DiscoverProductItem) => void
}

export default function SearchResultsSection({ search, onItemPress }: SearchResultsSectionProps) {
    const { data, isLoading, isError, refetch } = useDiscoverProducts(
        { search, limit: 20 },
        { enabled: search.length > 0 },
    )

    if (isLoading) {
        return (
            <View className="mt-12 items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        )
    }

    if (isError) {
        return (
            <View className="mt-12 items-center px-8">
                <Text className="text-center font-syne text-sm text-[#6b7280]">Search failed. Check your connection.</Text>
                <TouchableOpacity onPress={() => refetch()} className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2">
                    <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const results = data?.data ?? []

    if (results.length === 0) {
        return (
            <View className="mt-12 items-center px-8">
                <SearchX size={32} color="#9ca3af" />
                <Text className="mt-3 text-center font-syne text-sm text-[#6b7280]">
                    No products match “{search}”.
                </Text>
            </View>
        )
    }

    return (
        <View className="mx-5 mt-4">
            <Text className="mb-3 font-syne-semibold text-[10px] uppercase tracking-wider text-[#6b7280]">
                {data?.meta.total} result{data?.meta.total === 1 ? '' : 's'}
            </Text>

            {results.map((item) => {
                const points = formatRewardPoints(item.rewardPoints)
                return (
                    <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.85}
                        onPress={() => onItemPress?.(item)}
                        className="mb-3 flex-row items-center rounded border border-[#dbeafe] bg-white p-3"
                    >
                        <Image
                            source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                            className="h-14 w-14 rounded bg-[#eef2ff]"
                            resizeMode="cover"
                        />
                        <View className="ml-3 flex-1">
                            <Text numberOfLines={2} className="font-syne-bold text-[13px] text-[#111827]">
                                {item.name}
                            </Text>
                            {points && (
                                <View className="mt-1 flex-row items-center gap-[3px]">
                                    <Star size={10} color="#f5b301" fill="#f5b301" />
                                    <Text className="font-syne-semibold text-[9.5px] text-[#2563eb]">{points}</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}
