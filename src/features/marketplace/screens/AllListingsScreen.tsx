import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import React from 'react'
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMarketplaceListingsInfinite } from '../api/getMarketplaceListingsInfinite'
import ListingGridCard from '../components/ListingGridCard'
import { MarketplaceCategory, MarketplaceListingItem, MarketplaceSort } from '../types/marketplace'

interface AllListingsScreenProps {
    /** Omitted → "All Items". */
    category?: MarketplaceCategory
    /** Omitted → the endpoint default, `newest`. */
    sort?: MarketplaceSort
    title?: string
}

/**
 * "See All" for a Marketplace section — `GET /api/v1/marketplace/listings`
 * with the section's `sort` (Featured is most-sold first, i.e. `popular`),
 * paginated 20 at a time.
 *
 * Cards carry no detail data: tapping one opens `marketplace/[tourId]`, which
 * fetches the full `GET /products/:id`.
 */
export default function AllListingsScreen({ category, sort, title }: AllListingsScreenProps) {
    const {
        data,
        isLoading,
        isError,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMarketplaceListingsInfinite({ category, sort, limit: 20 })

    const items = data?.pages.flatMap((page) => page.data) ?? []
    const total = data?.pages[0]?.meta.total ?? 0

    const openProduct = (item: MarketplaceListingItem) => router.push(`/marketplace/${item.id}`)

    return (
        <SafeAreaView
            // No bottom edge: this route lives under (tabs), and the tab bar
            // already reserves the safe area below.
            edges={['top', 'left', 'right']}
            className="flex-1 bg-background"
        >
            {/* Header */}
            <View className="flex-row items-center px-4 pb-3 pt-2">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    hitSlop={12}
                    className="-ml-1 p-1 active:opacity-60"
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="ml-1 flex-1">
                    <Text className="text-xl font-black text-foreground" numberOfLines={1}>
                        {title ?? 'All Listings'}
                    </Text>
                    {total > 0 && (
                        <Text className="text-xs text-muted-foreground">
                            {total} listing{total === 1 ? '' : 's'}
                        </Text>
                    )}
                </View>
            </View>

            {isLoading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            )}

            {isError && !isLoading && (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-center text-sm text-muted-foreground">
                        Couldn&apos;t load these listings. Check your connection.
                    </Text>
                    <TouchableOpacity
                        onPress={() => refetch()}
                        className="mt-3 rounded-xl bg-primary px-4 py-2"
                    >
                        <Text className="text-sm font-semibold text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isLoading && !isError && (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <ListingGridCard item={item} onPress={() => openProduct(item)} />
                    )}
                    columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
                    contentContainerStyle={{ gap: 12, paddingBottom: 32, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching && !isFetchingNextPage}
                            onRefresh={refetch}
                            tintColor="#8B5CF6"
                        />
                    }
                    onEndReachedThreshold={0.4}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) void fetchNextPage()
                    }}
                    ListEmptyComponent={
                        <View className="mt-24 items-center px-8">
                            <Text className="text-center text-sm text-muted-foreground">
                                No listings here yet. Pull to refresh.
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        hasNextPage ? (
                            <TouchableOpacity
                                onPress={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                activeOpacity={0.8}
                                className="mx-4 items-center justify-center rounded-full border border-border py-3"
                            >
                                {isFetchingNextPage ? (
                                    <ActivityIndicator size="small" color="#A78BFA" />
                                ) : (
                                    <Text className="text-xs font-bold text-violet-400">Load More</Text>
                                )}
                            </TouchableOpacity>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    )
}
