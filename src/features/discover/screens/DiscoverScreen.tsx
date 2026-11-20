import { useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, Trophy } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useTabScrollReset } from "@/hooks/use-tab-scroll-reset";
import { describeApiError } from "@/lib/api-errors";
import { useDiscoverFeed } from "../api/getDiscoverFeed";
import DiscoverHero from "../components/DiscoverHero";
import DiscoverProductCard from "../components/DiscoverProductCard";
import {
    DiscoverCategory,
    DiscoverCreatorItem,
    DiscoverProductItem,
    DiscoverSection,
} from "../types/discover";
import { DISCOVER_PLACEHOLDER_IMAGE, formatDropCount } from "../utils/format";

/** Scroll offset past which the status bar sits over white content, not the hero. */
const HERO_SCROLL_LIMIT = 380;

/**
 * Category chips. Each is a server filter (`GET /discover?category=`); "All Items"
 * is no filter. The ids and the drop categories behind them are the backend's.
 */
const CHIPS: { id: DiscoverCategory | "all"; label: string }[] = [
    { id: "all", label: "All Items" },
    { id: "cards", label: "Cards" },
    { id: "figures", label: "Figures" },
    { id: "apparel", label: "Apparel" },
    { id: "posters", label: "Posters" },
    { id: "digital", label: "Digital" },
    { id: "other", label: "Other" },
];

export default function DiscoverScreen() {
    const { width } = useWindowDimensions();
    const { isSignedIn } = useAuth();
    const { unreadCount } = useNotifications();
    const isFocused = useIsFocused();

    const [category, setCategory] = useState<DiscoverCategory | "all">("all");
    const activeCategory = category === "all" ? undefined : category;

    const { data: feed, isLoading, isError, error, refetch, isRefetching, isPlaceholderData } =
        useDiscoverFeed(activeCategory);

    // A section the server leaves empty is hidden, not shown as a placeholder.
    const featured = feed?.featured ?? [];
    const trending = feed?.trending ?? [];
    const creators = feed?.creators ?? [];
    const newReleases = feed?.newReleases ?? [];
    const isFeedEmpty =
        !!feed && featured.length === 0 && trending.length === 0 && creators.length === 0 && newReleases.length === 0;

    const scrollRef = useRef<ScrollView>(null);

    // Status bar icons: white over the dark hero, dark once white content is under them.
    const [overHero, setOverHero] = useState(true);
    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = e.nativeEvent.contentOffset.y < HERO_SCROLL_LIMIT;
        setOverHero((prev) => (prev === next ? prev : next));
    };

    // Reopen the tab at the top, with the category chip back on "All Items".
    useTabScrollReset(scrollRef, () => setCategory("all"));

    const handleProductPress = (item: DiscoverProductItem) => {
        // Cards are lightweight — the detail screen fetches GET /products/:id.
        // Opens Discover's own copy of the detail route: pushing the
        // marketplace one would switch the active tab to Marketplace.
        router.push({ pathname: '/discover/[productId]', params: { productId: item.id } });
    };

    /**
     * "View all" → the paginated view of that section
     * (`GET /api/v1/discover/products?section=…`), keeping the chosen category.
     */
    const handleSeeAll = (section: DiscoverSection, title: string) => {
        router.push({
            pathname: '/(tabs)/discover/see-all',
            params: { section, title, ...(activeCategory ? { category: activeCategory } : {}) },
        });
    };

    // Figma P01: the search icon opens "Find collectors", whose Products tab is the drop search.
    const openSearch = () => router.push('/find-collectors' as never);

    // Figma sizes: carousel cards 170 wide / 150 tall artwork; grid is two square cards.
    const carouselCardWidth = 170;
    const gridCardWidth = (width - 40 - 12) / 2;

    return (
        <View className="flex-1 bg-white">
            {/* Rendered only while focused: tab screens stay mounted, and this one
                must not hold the status bar style while another tab is showing. */}
            {isFocused && <StatusBar style={overHero ? "light" : "dark"} />}

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={32}
                contentContainerStyle={{ paddingBottom: 122 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isPlaceholderData}
                        onRefresh={refetch}
                        tintColor="#2563eb"
                        progressViewOffset={60}
                    />
                }
            >
                <DiscoverHero
                    items={featured}
                    signedIn={!!isSignedIn}
                    hasUnread={unreadCount > 0}
                    onItemPress={handleProductPress}
                    onSearchPress={openSearch}
                    onBellPress={() => router.push("/notifications")}
                    onSignUpPress={() => router.push("/(auth)/register")}
                />

                <LinearGradient
                    // Figma "Background mesh": white fading to a pale blue.
                    colors={["#ffffff", "#ffffff", "#eef4ff"]}
                    locations={[0, 0.4, 1]}
                    style={{ paddingTop: 12 }}
                >
                    {/* Leaderboard banner: hidden for the MVP (mock content, no API). Uncomment to bring it back.
                    <LeaderboardBanner />
                    */}

                    {/* Category chips — each one asks the server for that category */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                        className="grow-0"
                    >
                        {CHIPS.map((chip) => {
                            const active = chip.id === category;
                            return (
                                <TouchableOpacity
                                    key={chip.id}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: active }}
                                    activeOpacity={0.8}
                                    onPress={() => setCategory(chip.id)}
                                    className={`h-8 justify-center rounded border px-[14px] ${active
                                        ? "border-black bg-black"
                                        : "border-[#d1d5db] bg-white"
                                        }`}
                                >
                                    <Text
                                        className={`text-[12.5px] ${active
                                            ? "font-syne-semibold text-white"
                                            : "font-syne-medium text-[#111827]"
                                            }`}
                                    >
                                        {chip.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {isLoading && (
                        <View className="mt-16 items-center">
                            <ActivityIndicator size="large" color="#2563eb" />
                        </View>
                    )}

                    {isError && !isLoading && (
                        <View className="mt-16 items-center px-8">
                            <Text className="text-center font-syne text-sm text-[#6b7280]">
                                {describeApiError(error, "Couldn't load the Discover feed. Check your connection.")}
                            </Text>
                            <TouchableOpacity
                                onPress={() => refetch()}
                                className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2"
                            >
                                <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {isFeedEmpty && (
                        <View className="mt-16 items-center px-8">
                            <Text className="text-center font-syne text-sm text-[#6b7280]">
                                No drops in this category yet.
                            </Text>
                        </View>
                    )}

                    {feed && !isFeedEmpty && (
                        <View className="gap-[27px] pt-[14px]">
                            {/* TRENDING — most minted first */}
                            {trending.length > 0 && (
                                <View className="gap-[14px]">
                                    <SectionHeading
                                        title="Trending now"
                                        onViewAll={() => handleSeeAll("trending", "Trending Now")}
                                    />
                                    <FlatList
                                        horizontal
                                        data={trending}
                                        keyExtractor={(item) => item.id}
                                        renderItem={({ item }) => (
                                            <DiscoverProductCard
                                                item={item}
                                                width={carouselCardWidth}
                                                imageHeight={150}
                                                onPress={() => handleProductPress(item)}
                                            />
                                        )}
                                        ItemSeparatorComponent={() => <View className="w-3" />}
                                        showsHorizontalScrollIndicator={false}
                                        // Room for the card shadow, which would otherwise be clipped.
                                        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 6 }}
                                        className="grow-0"
                                    />
                                </View>
                            )}

                            {/* MEET THE CREATORS — artists, most drops first */}
                            {creators.length > 0 && (
                                <View className="gap-[14px]">
                                    <SectionHeading
                                        title="Meet the creators"
                                        actionLabel="Explore"
                                        onViewAll={() => router.push("/(tabs)/discover/creators" as never)}
                                    />
                                    <View className="gap-[18px]">
                                        {/* Banner: the first creator's cover (Figma: 183 tall, full width) */}
                                        <Image
                                            source={
                                                creators[0]?.coverUrl
                                                    ? { uri: creators[0].coverUrl }
                                                    : require("@/assets/images/onboarding-hero.jpg")
                                            }
                                            resizeMode="cover"
                                            style={{
                                                width,
                                                height: 183,
                                                backgroundColor: "#eef2ff",
                                                shadowColor: "#1a4db2",
                                                shadowOffset: { width: 0, height: 3 },
                                                shadowOpacity: 0.14,
                                                shadowRadius: 10,
                                            }}
                                        />
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                                            className="grow-0"
                                        >
                                            {creators.map((creator, index) => (
                                                <CreatorBubble key={creator.id} creator={creator} index={index} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            )}

                            {/* LATEST DROPS — newest first, two-column grid */}
                            {newReleases.length > 0 && (
                                <View className="gap-[14px]">
                                    <SectionHeading
                                        title="Latest drops"
                                        onViewAll={() => handleSeeAll("new_releases", "Latest Releases")}
                                    />
                                    <View className="flex-row flex-wrap gap-3 px-5">
                                        {newReleases.map((item) => (
                                            <DiscoverProductCard
                                                key={item.id}
                                                item={item}
                                                width={gridCardWidth}
                                                imageHeight={gridCardWidth}
                                                variant="grid"
                                                onPress={() => handleProductPress(item)}
                                            />
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                </LinearGradient>
            </ScrollView>
        </View>
    );
}

/**
 * Leaderboard banner from the Figma. **Mock content for now**: the Discover API
 * does not serve a leaderboard, so the "#1–10" range is fixed text and the
 * banner does not navigate anywhere yet.
 */
const LEADERBOARD_MOCK = {
    title: "Leaderboard",
    subtitle: "See top collectors this week",
    range: "#1–10",
};

function LeaderboardBanner() {
    return (
        <LinearGradient
            // Figma: ~175° gradient, flat green until about half way, then a
            // slightly minty tint toward the bottom edge.
            colors={["#4bf489", "#4bf489", "#3bf69c", "#3bf69c"]}
            locations={[0, 0.533, 0.667, 1]}
            start={{ x: 0.45, y: 0 }}
            end={{ x: 0.55, y: 1 }}
            style={{
                height: 72,
                // Figma sets the card 6px from the left edge, 375 wide.
                marginLeft: 6,
                marginRight: 9,
                marginBottom: 27,
                borderRadius: 4,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                overflow: "hidden",
            }}
        >
            <View className="flex-1 flex-row items-center gap-3">
                <View className="size-11 items-center justify-center rounded bg-[rgba(89,135,102,0.09)]">
                    <Trophy size={22} color="#ffffff" />
                </View>
                <View className="flex-1 gap-[3px]">
                    <Text className="font-syne-bold text-[10px] text-[#040404]">{LEADERBOARD_MOCK.title}</Text>
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[rgba(67,42,42,0.67)]">
                        {LEADERBOARD_MOCK.subtitle}
                    </Text>
                </View>
            </View>
            <View className="h-7 flex-row items-center gap-[6px]">
                <View className="h-[23px] w-[53px] items-center justify-center rounded border border-[rgba(255,48,48,0.2)] bg-white/15">
                    <Text className="font-syne-semibold text-[10px] text-[#040404]">{LEADERBOARD_MOCK.range}</Text>
                </View>
                <View className="size-7 items-center justify-center rounded bg-[#4dea86]">
                    <ChevronRight size={12} color="#040404" />
                </View>
            </View>
        </LinearGradient>
    );
}

/** Tile colours the Figma cycles through: blue, amber, green. */
const CREATOR_TILE_COLORS = ["#3b82f6", "#f59e0b", "#22c55e"];

/** Creator from the Figma: a round portrait in a coloured ring, name and drop count. */
function CreatorBubble({ creator, index }: { creator: DiscoverCreatorItem; index: number }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={creator.name}
            activeOpacity={0.8}
            // The creator's id is the artist id the profile screen takes.
            onPress={() =>
                router.push({ pathname: "/artists/[artistId]", params: { artistId: creator.id } } as never)
            }
            className="w-[72px] items-center gap-[6px]"
        >
            <View
                style={{
                    width: 58,
                    height: 58,
                    borderRadius: 29,
                    borderWidth: 2.5,
                    borderColor: CREATOR_TILE_COLORS[index % CREATOR_TILE_COLORS.length],
                    backgroundColor: "#ffffff",
                    padding: 2,
                }}
            >
                <Image
                    source={{ uri: creator.avatarUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                    resizeMode="cover"
                    style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#eef2ff" }}
                />
            </View>
            <Text numberOfLines={1} className="text-center font-syne-bold text-[10.25px] text-[#111827]">
                {creator.name}
            </Text>
            <Text className="font-syne text-[9.5px] text-[#6b7280]">{formatDropCount(creator.dropCount)}</Text>
        </TouchableOpacity>
    );
}

function SectionHeading({
    title,
    onViewAll,
    actionLabel = "View all",
}: {
    title: string;
    onViewAll?: () => void;
    actionLabel?: string;
}) {
    return (
        <View className="flex-row items-center justify-between px-5">
            <Text className="font-orbitron text-[20px] text-black">{title}</Text>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${actionLabel} ${title}`}
                className="flex-row items-center gap-[3px]"
                activeOpacity={0.7}
                hitSlop={8}
                onPress={onViewAll}
            >
                <Text className="font-syne-semibold text-[10.25px] text-[#111827]">{actionLabel}</Text>
                <ChevronRight size={12} color="#3b82f6" />
            </TouchableOpacity>
        </View>
    );
}
