import { Gem, SearchX } from 'lucide-react-native'
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
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        )
    }

    if (isError) {
        return (
            <View className="mt-12 items-center px-8">
                <Text className="text-zinc-400 text-sm text-center">Search failed. Check your connection.</Text>
                <TouchableOpacity onPress={() => refetch()} className="mt-3 bg-primary px-4 py-2 rounded-xl">
                    <Text className="text-white font-semibold text-sm">Retry</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const results = data?.data ?? []

    if (results.length === 0) {
        return (
            <View className="mt-12 items-center px-8">
                <SearchX size={32} color="#52525b" />
                <Text className="mt-3 text-zinc-400 text-sm text-center">
                    No products match “{search}”.
                </Text>
            </View>
        )
    }

    return (
        <View className="mt-4 mx-4">
            <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3">
                {data?.meta.total} result{data?.meta.total === 1 ? '' : 's'}
            </Text>

            {results.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    onPress={() => onItemPress?.(item)}
                    className="flex-row items-center mb-3 rounded-2xl border border-zinc-800 bg-[#111111] p-3"
                >
                    <Image
                        source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                        className="h-14 w-14 rounded-xl bg-[#0E0E12]"
                        resizeMode="cover"
                    />
                    <View className="flex-1 ml-3">
                        <Text numberOfLines={2} className="text-white text-sm font-bold">
                            {item.name}
                        </Text>
                        {item.rewardPoints != null && (
                            <View className="mt-1 flex-row items-center">
                                <Gem size={11} color="#A855F7" fill="#A855F7" />
                                <Text className="ml-1 text-[11px] font-semibold text-violet-400">
                                    {formatRewardPoints(item.rewardPoints)}
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    )
}
