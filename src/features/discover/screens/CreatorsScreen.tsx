import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { describeApiError } from "@/lib/api-errors";
import { useDiscoverCreatorsInfinite } from "../api/getDiscoverCreators";
import { DiscoverCreatorItem } from "../types/discover";
import { DISCOVER_PLACEHOLDER_IMAGE, formatDropCount } from "../utils/format";

/**
 * "Explore" — every creator with at least one public drop, most drops first
 * (`GET /api/v1/discover/creators`, paginated 20 at a time). Tapping one opens
 * their profile.
 */
export default function CreatorsScreen() {
    const isFocused = useIsFocused();
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
    } = useDiscoverCreatorsInfinite({ limit: 20 });

    const creators = data?.pages.flatMap((page) => page.data) ?? [];
    const total = data?.pages[0]?.meta.total ?? 0;

    return (
        <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
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
                        {describeApiError(error, "Couldn't load the creators. Check your connection.")}
                    </Text>
                    <TouchableOpacity onPress={() => refetch()} className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isLoading && !isError && (
                <FlatList
                    data={creators}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <CreatorRow creator={item} />}
                    ItemSeparatorComponent={() => <View className="h-3" />}
                    ListHeaderComponent={
                        <View className="gap-1 pb-4">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-orbitron text-[22px] text-[#111827]">Creators</Text>
                                <Text className="font-orbitron text-[10px] text-[#3b82f6]">{"//"}</Text>
                            </View>
                            {total > 0 && (
                                <Text className="font-syne text-[11px] text-[#6b7280]">
                                    {total} creator{total === 1 ? "" : "s"}
                                </Text>
                            )}
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="mt-24 items-center px-8">
                            <Text className="text-center font-syne text-sm text-[#6b7280]">No creators yet. Pull to refresh.</Text>
                        </View>
                    }
                    ListFooterComponent={
                        hasNextPage ? (
                            <TouchableOpacity
                                onPress={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                activeOpacity={0.8}
                                className="mt-4 h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                            >
                                {isFetchingNextPage ? (
                                    <ActivityIndicator size="small" color="#2563eb" />
                                ) : (
                                    <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                                )}
                            </TouchableOpacity>
                        ) : null
                    }
                    onEndReachedThreshold={0.4}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
                    }}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={refetch} tintColor="#2563eb" />
                    }
                    showsVerticalScrollIndicator={false}
                    // Room under the last row for the floating tab bar.
                    contentContainerStyle={{ padding: 20, paddingBottom: 128 }}
                />
            )}
        </SafeAreaView>
    );
}

function CreatorRow({ creator }: { creator: DiscoverCreatorItem }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={creator.name}
            activeOpacity={0.85}
            // The creator's id is the artist id the profile screen takes.
            onPress={() =>
                router.push({ pathname: "/artists/[artistId]", params: { artistId: creator.id } } as never)
            }
            className="flex-row items-center gap-3 rounded border border-[#dbeafe] bg-white p-3"
        >
            <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={{ width: 56, height: 56, borderRadius: 28, padding: 2 }}
            >
                <Image
                    source={{ uri: creator.avatarUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                    resizeMode="cover"
                    style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#eef2ff" }}
                />
            </LinearGradient>
            <View className="flex-1 gap-1">
                <Text numberOfLines={1} className="font-syne-bold text-[14px] text-[#111827]">{creator.name}</Text>
                <Text className="font-syne text-[11px] text-[#6b7280]">{formatDropCount(creator.dropCount)}</Text>
            </View>
            <ChevronRight size={16} color="#3b82f6" />
        </TouchableOpacity>
    );
}
