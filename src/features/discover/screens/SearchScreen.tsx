import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Search, SearchX, Star, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMarketplaceListings } from "@/features/marketplace/api/getMarketplaceListings";
import { MarketplaceCategory } from "@/features/marketplace/types/marketplace";
import { formatPrice } from "@/features/products/utils/format";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
    addRecentSearch,
    clearRecentSearches,
    RecentSearchItem,
    useRecentSearches,
} from "../utils/recentSearches";
import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from "../utils/format";

/** Figma "Product type" chips. Each id is a real marketplace category filter. */
const PRODUCT_TYPES: { id: MarketplaceCategory | "all"; label: string }[] = [
    { id: "all", label: "All Items" },
    { id: "cards", label: "Cards" },
    { id: "figures", label: "Figures" },
    { id: "apparel", label: "Apparel" },
    { id: "posters", label: "Posters" },
    { id: "digital", label: "Digital" },
    { id: "other", label: "Other" },
];

/**
 * Search — the light "Y2K" layout from the UX-DESIGN Figma file
 * (HitBox · Search · Discover).
 *
 * Results come from `GET /marketplace/listings` rather than the Discover
 * products endpoint, because that is the one that filters by product type as
 * well as by name. With nothing typed it shows what the user opened from here
 * recently, or the most popular drops if there is no history yet.
 */
export default function SearchScreen() {
    const isFocused = useIsFocused();
    const [query, setQuery] = useState("");
    const debounced = useDebouncedValue(query.trim());
    const [type, setType] = useState<MarketplaceCategory | "all">("all");
    const recents = useRecentSearches();

    const searching = debounced.length > 0;
    const showRecents = !searching && type === "all" && recents.length > 0;

    const { data, isLoading, isError, refetch } = useMarketplaceListings(
        {
            search: searching ? debounced : undefined,
            category: type === "all" ? undefined : type,
            // Nothing typed → "popular" gives the browse list a sensible order.
            sort: searching ? undefined : "popular",
            limit: 20,
        },
        { enabled: !showRecents },
    );

    const items: RecentSearchItem[] = showRecents
        ? recents
        : (data?.data ?? []).map((i) => ({
            id: i.id,
            name: i.name,
            imageUrl: i.imageUrl,
            rewardPoints: i.rewardPoints,
            priceInDollars: i.priceInDollars,
        }));

    const heading = searching ? "Results" : showRecents ? "Recent searches" : "Popular drops";

    const openItem = (item: RecentSearchItem) => {
        addRecentSearch(item);
        // Discover's own copy of the detail route keeps the Discover tab selected.
        router.push({ pathname: "/discover/[productId]", params: { productId: item.id } });
    };

    return (
        <SafeAreaView edges={["top", "left", "right"]} className="flex-1 bg-white">
            {isFocused && <StatusBar style="dark" />}

            {/* Navigation: back · brand · (spacer keeps the brand centred) */}
            <View className="h-14 flex-row items-center justify-between border-b border-[#dbeafe] px-5">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Back"
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

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                // Room under the last card for the floating tab bar.
                contentContainerStyle={{ paddingBottom: 128 }}
            >
                {/* Search and filters */}
                <View className="gap-5 px-5 pb-6 pt-5">
                    <View className="gap-[14px]">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-orbitron text-[22px] text-[#111827]">Search</Text>
                            <Text className="font-orbitron text-[10px] text-[#3b82f6]">{"//"}</Text>
                        </View>
                        <View className="h-12 flex-row items-center gap-[10px] rounded border border-[#bfdbfe] bg-[#eff6ff] px-[14px]">
                            <Search size={18} color="#2563eb" />
                            <TextInput
                                autoFocus
                                value={query}
                                onChangeText={setQuery}
                                placeholder="Search drops, creators, and more"
                                placeholderTextColor="#6b7280"
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={false}
                                className="h-full flex-1 font-syne text-[13px] text-[#111827]"
                            />
                            {query.length > 0 && (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel="Clear search"
                                    hitSlop={10}
                                    onPress={() => setQuery("")}
                                >
                                    <X size={16} color="#6b7280" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View className="gap-[10px]">
                        <Text className="font-syne-semibold text-[11px] text-[#6b7280]">Product type</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ gap: 8 }}
                            className="grow-0"
                        >
                            {PRODUCT_TYPES.map((t) => {
                                const active = t.id === type;
                                return (
                                    <TouchableOpacity
                                        key={t.id}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected: active }}
                                        activeOpacity={0.8}
                                        onPress={() => setType(t.id)}
                                        className={`h-8 justify-center rounded border px-[14px] ${active
                                            ? "border-[rgba(59,130,246,0.25)] bg-[#eff6ff]"
                                            : "border-[#e5e7eb] bg-[#f3f4f6]"
                                            }`}
                                    >
                                        <Text
                                            className={`text-[12.5px] ${active
                                                ? "font-syne-semibold text-[#2563eb]"
                                                : "font-syne-medium text-[#6b7280]"
                                                }`}
                                        >
                                            {t.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>

                {/* Results / recent searches */}
                <View className="gap-3 px-5">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-orbitron text-[20px] text-[#111827]">{heading}</Text>
                        {showRecents ? (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Clear recent searches"
                                hitSlop={8}
                                onPress={clearRecentSearches}
                            >
                                <Text className="font-syne-semibold text-[10.25px] text-[#3b82f6]">Clear</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text className="font-orbitron text-[9px] text-[#3b82f6]">{"//"}</Text>
                        )}
                    </View>

                    {!showRecents && isLoading && (
                        <View className="mt-10 items-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    )}

                    {!showRecents && isError && !isLoading && (
                        <View className="mt-10 items-center px-8">
                            <Text className="text-center font-syne text-sm text-[#6b7280]">
                                Search failed. Check your connection.
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2"
                            >
                                <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!showRecents && !isLoading && !isError && items.length === 0 && (
                        <View className="mt-10 items-center px-8">
                            <SearchX size={32} color="#9ca3af" />
                            <Text className="mt-3 text-center font-syne text-sm text-[#6b7280]">
                                {searching ? `No drops match “${debounced}”.` : "Nothing here yet."}
                            </Text>
                        </View>
                    )}

                    {(showRecents || (!isLoading && !isError)) &&
                        items.map((item) => <ResultCard key={item.id} item={item} onPress={() => openItem(item)} />)}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function ResultCard({ item, onPress }: { item: RecentSearchItem; onPress: () => void }) {
    const points = formatRewardPoints(item.rewardPoints);
    const price = formatPrice(item.priceInDollars);
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={item.name}
            activeOpacity={0.85}
            onPress={onPress}
            className="min-h-[96px] flex-row items-center gap-3 rounded border border-[#dbeafe] bg-white p-3"
        >
            <Image
                source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                resizeMode="cover"
                style={{ width: 72, height: 72, borderRadius: 4, backgroundColor: "#f3f4f6" }}
            />
            <View className="flex-1 gap-[6px]">
                <Text numberOfLines={2} className="font-syne-bold text-[13px] leading-[17px] text-[#111827]">
                    {item.name}
                </Text>
                <View className="flex-row items-center gap-3">
                    {price && <Text className="font-syne-bold text-[12px] text-[#111827]">{price}</Text>}
                    {points && (
                        <View className="flex-row items-center gap-1">
                            <Star size={10} color="#f5b301" fill="#f5b301" />
                            <Text className="font-syne-semibold text-[11px] text-[#2563eb]">{points}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
