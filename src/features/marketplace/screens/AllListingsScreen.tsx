import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import DiscoverProductCard from "@/features/discover/components/DiscoverProductCard";
import { describeApiError } from "@/lib/api-errors";
import { useMarketplaceListingsInfinite } from "../api/getMarketplaceListingsInfinite";
import { MarketplaceCategory, MarketplaceSort } from "../types/marketplace";

interface AllListingsScreenProps {
    category?: MarketplaceCategory;
    sort?: MarketplaceSort;
    /** `true` = only drops that qualify as featured (no top-up) — Featured Listings "See All". */
    featured?: boolean;
    title?: string;
}

/**
 * "See All" for a Marketplace section — `GET /api/v1/marketplace/listings`,
 * paginated 20 at a time (e.g. `?featured=true&sort=popular`). Styled like the
 * other light screens: brand header, Orbitron title, two-column cards.
 */
export default function AllListingsScreen({ category, sort, featured, title }: AllListingsScreenProps) {
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();
    const cardWidth = (width - 40 - 12) / 2;

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMarketplaceListingsInfinite({ category, sort, featured, limit: 20 });

    const items = data?.pages.flatMap((page) => page.data) ?? [];
    const total = data?.pages[0]?.meta.total ?? 0;

    return (
        <SafeAreaView
            // No bottom edge: this route lives under (tabs), and the tab bar
            // already reserves the safe area below.
            edges={["top", "left", "right"]}
            className="flex-1 bg-white"
        >
            {isFocused && <StatusBar style="dark" />}

            {/* Navigation: back · brand · (spacer keeps the brand centred) */}
            <View className="h-14 flex-row items-center justify-between border-b border-[#dbeafe] px-5">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    onPress={() => router.back()}
                    className="size-9 items-center justify-center rounded bg-[#eff6ff]"
                >
                    <ArrowLeft size={18} color="#111827" />
                </TouchableOpacity>
                <View className="flex-row items-center gap-[7px]">
                    <Image
                        source={require("@/assets/images/HitBoxLogo-dark.png")}
                        resizeMode="contain"
                        style={{ width: 22, height: 22 }}
                    />
                    <Text className="font-orbitron text-[15px] text-black">HitBox</Text>
                </View>
                <View className="size-9" />
            </View>

            {isLoading && (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {isError && !isLoading && (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-center font-syne text-sm text-[#6b7280]">
                        {describeApiError(error, "Couldn't load these listings. Check your connection.")}
                    </Text>
                    <TouchableOpacity onPress={() => refetch()} className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isLoading && !isError && (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <DiscoverProductCard
                            item={item}
                            width={cardWidth}
                            imageHeight={cardWidth}
                            variant="grid"
                            onPress={() => router.push({ pathname: "/marketplace/[tourId]", params: { tourId: item.id } })}
                        />
                    )}
                    ListHeaderComponent={
                        <View className="gap-1 pb-1">
                            <View className="flex-row items-center justify-between">
                                <Text numberOfLines={1} className="flex-1 font-orbitron text-[22px] text-[#111827]">
                                    {title ?? "All Listings"}
                                </Text>
                                <Text className="font-orbitron text-[10px] text-[#3b82f6]">{"//"}</Text>
                            </View>
                            {total > 0 && (
                                <Text className="font-syne text-[11px] text-[#6b7280]">
                                    {total} listing{total === 1 ? "" : "s"}
                                </Text>
                            )}
                        </View>
                    }
                    columnWrapperStyle={{ gap: 12 }}
                    contentContainerStyle={{
                        gap: 12,
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        // Room under the last row for the floating tab bar.
                        paddingBottom: 128,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching && !isFetchingNextPage}
                            onRefresh={refetch}
                            tintColor="#2563eb"
                        />
                    }
                    onEndReachedThreshold={0.4}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
                    }}
                    ListEmptyComponent={
                        <View className="mt-24 items-center px-8">
                            <Text className="text-center font-syne text-sm text-[#6b7280]">
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
                                className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                            >
                                {isFetchingNextPage ? (
                                    <ActivityIndicator size="small" color="#2563eb" />
                                ) : (
                                    <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                                )}
                            </TouchableOpacity>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}
