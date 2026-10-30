import { router } from 'expo-router'
import { ChevronLeft, ChevronRight, Gem, SearchX } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image, Pressable, Text, TouchableOpacity, View } from 'react-native'

import { useMarketplaceListings } from '../api/getMarketplaceListings'
import { MarketplaceCategory } from '../types/marketplace'
import { formatPrice, formatRewardPoints, MARKETPLACE_PLACEHOLDER_IMAGE } from '../utils/format'

interface ListingsResultsSectionProps {
    /** undefined = "All Items". */
    category?: MarketplaceCategory
    /** Debounced search term ('' = no search). */
    search: string
}

/**
 * Paginated results for a category tab and/or search term, backed by
 * GET /api/v1/marketplace/listings.
 */
export default function ListingsResultsSection({ category, search }: ListingsResultsSectionProps) {
    const [page, setPage] = useState(1)

    // Changing tab or search restarts from the first page
    useEffect(() => {
        setPage(1)
    }, [category, search])

    const { data, isLoading, isError, refetch, isFetching } = useMarketplaceListings({
        category,
        search: search || undefined,
        page,
        limit: 20,
    })

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
                <Text className="text-muted-foreground text-sm text-center">
                    Couldn't load listings. Check your connection.
                </Text>
                <TouchableOpacity onPress={() => refetch()} className="mt-3 bg-primary px-4 py-2 rounded-xl">
                    <Text className="text-white font-semibold text-sm">Retry</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const listings = data?.data ?? []
    const meta = data?.meta

    if (listings.length === 0) {
        return (
            <View className="mt-12 items-center px-8">
                <SearchX size={32} color="#52525b" />
                <Text className="mt-3 text-muted-foreground text-sm text-center">
                    {search ? `No listings match “${search}”.` : 'No listings in this category yet.'}
                </Text>
            </View>
        )
    }

    return (
        <View className="mx-4">
            <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
                {meta?.total} listing{meta?.total === 1 ? '' : 's'}
            </Text>

            {listings.map((item) => (
                <Pressable
                    key={item.id}
                    onPress={() => router.push(`/marketplace/${item.id}`)}
                    className="flex-row items-center mb-3 rounded-2xl border border-border bg-card p-3"
                >
                    <View className="relative">
                        <Image
                            source={{ uri: item.imageUrl ?? MARKETPLACE_PLACEHOLDER_IMAGE }}
                            className="h-16 w-16 rounded-xl bg-muted"
                            resizeMode="cover"
                        />
                        {item.badge && (
                            <View className="absolute -top-1 -left-1 bg-primary-80 px-1.5 py-0.5 rounded-lg">
                                <Text className="text-white text-[8px] font-black tracking-wide">{item.badge}</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 ml-3">
                        <Text numberOfLines={1} className="text-foreground text-sm font-bold">
                            {item.name}
                        </Text>
                        {item.artistName && (
                            <Text numberOfLines={1} className="text-muted-foreground text-xs mt-0.5">
                                {item.artistName}
                            </Text>
                        )}
                        <View className="mt-1.5 flex-row items-center justify-between">
                            <Text className="text-foreground text-xs font-extrabold">
                                {formatPrice(item.priceInDollars)}
                            </Text>
                            {item.rewardPoints != null && (
                                <View className="flex-row items-center">
                                    <Gem size={11} color="#A855F7" fill="#A855F7" />
                                    <Text className="ml-1 text-[10px] font-semibold text-violet-400">
                                        {formatRewardPoints(item.rewardPoints)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Pressable>
            ))}

            {/* Pagination footer */}
            {meta && meta.totalPages > 1 && (
                <View className="flex-row items-center justify-center gap-6 mt-2 mb-4">
                    <TouchableOpacity
                        disabled={page <= 1 || isFetching}
                        onPress={() => setPage((p) => p - 1)}
                        className={`h-9 w-9 items-center justify-center rounded-full border border-border ${page <= 1 ? 'opacity-30' : ''}`}
                    >
                        <ChevronLeft size={18} color="#fff" />
                    </TouchableOpacity>

                    <Text className="text-muted-foreground text-xs font-semibold">
                        Page {meta.page} of {meta.totalPages}
                    </Text>

                    <TouchableOpacity
                        disabled={page >= meta.totalPages || isFetching}
                        onPress={() => setPage((p) => p + 1)}
                        className={`h-9 w-9 items-center justify-center rounded-full border border-border ${page >= meta.totalPages ? 'opacity-30' : ''}`}
                    >
                        <ChevronRight size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}
