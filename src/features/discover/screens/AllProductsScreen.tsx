import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiscoverProductsInfinite } from "../api/getDiscoverProductsInfinite";
import ProductGridCard from "../components/ProductGridCard";
import { DiscoverProductItem, DiscoverSection } from "../types/discover";

interface AllProductsScreenProps {
    /** Omitted → all ACTIVE products, newest first (the endpoint's default). */
    section?: DiscoverSection;
    title?: string;
}

/**
 * "See All" for a Discover section — `GET /api/v1/discover/products?section=…`,
 * paginated 20 at a time.
 *
 * Cards stay lightweight here too: tapping one opens Discover's own
 * `discover/[productId]`, which fetches the full `GET /products/:id`.
 */
export default function AllProductsScreen({ section, title }: AllProductsScreenProps) {
    const {
        data,
        isLoading,
        isError,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useDiscoverProductsInfinite({ section, limit: 20 });

    const items = data?.pages.flatMap((page) => page.data) ?? [];
    const total = data?.pages[0]?.meta.total ?? 0;

    // Stays inside the Discover tab — see the route's own comment for why the
    // detail screen is mounted in both stacks.
    const openProduct = (item: DiscoverProductItem) =>
        router.push({ pathname: '/discover/[productId]', params: { productId: item.id } });

    return (
        <SafeAreaView
            // No bottom edge: this route lives under (tabs), and the tab bar
            // already reserves the safe area below.
            edges={["top", "left", "right"]}
            className="flex-1 bg-black"
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
                    <Text className="text-xl font-black text-white" numberOfLines={1}>
                        {title ?? "All Products"}
                    </Text>
                    {total > 0 && (
                        <Text className="text-xs text-zinc-500">
                            {total} item{total === 1 ? "" : "s"}
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
                    <Text className="text-center text-sm text-zinc-400">
                        Couldn&apos;t load these products. Check your connection.
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
                        <ProductGridCard item={item} onPress={() => openProduct(item)} />
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
                    // Paginate as the user reaches the end; the button below is the
                    // fallback when the list is short enough not to trigger it.
                    onEndReachedThreshold={0.4}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
                    }}
                    ListEmptyComponent={
                        <View className="mt-24 items-center px-8">
                            <Text className="text-center text-sm text-zinc-400">
                                Nothing here yet. Pull to refresh.
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        hasNextPage ? (
                            <TouchableOpacity
                                onPress={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                activeOpacity={0.8}
                                className="mx-4 items-center justify-center rounded-full border border-zinc-800 py-3"
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
    );
}
