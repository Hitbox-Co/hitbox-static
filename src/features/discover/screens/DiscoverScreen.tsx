import { useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, Search, Trophy, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    LayoutChangeEvent,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useTabScrollReset } from "@/hooks/use-tab-scroll-reset";
import { useDiscoverFeed } from "../api/getDiscoverFeed";
import DiscoverHero from "../components/DiscoverHero";
import DiscoverProductCard from "../components/DiscoverProductCard";
import SearchResultsSection from "../components/SearchResultsSection";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DiscoverProductItem, DiscoverSection } from "../types/discover";

/** Breathing room left above a section title after a chip jump. */
const SCROLL_GAP = 12;
/** Scroll offset past which the status bar sits over white content, not the hero. */
const HERO_SCROLL_LIMIT = 380;

/** Chip ids double as section ids: a chip scrolls to the section registered under it. */
type ChipId = "all" | "trending" | "topCreators" | "newReleases";

const CHIPS: { id: ChipId; label: string }[] = [
    { id: "all", label: "All Items" },
    { id: "trending", label: "Trending" },
    { id: "newReleases", label: "Latest Releases" },
    { id: "topCreators", label: "Top Creators" },
];

export default function DiscoverScreen() {
    const { width } = useWindowDimensions();
    const { isSignedIn } = useAuth();
    const { unreadCount } = useNotifications();
    const isFocused = useIsFocused();

    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search.trim());
    const isSearching = debouncedSearch.length > 0;

    const { data: feed, isLoading, isError, refetch, isRefetching } = useDiscoverFeed();

    const [activeChip, setActiveChip] = useState<ChipId>("all");
    const scrollRef = useRef<ScrollView>(null);
    /**
     * Each section reports its y offset within the scroll content as it lays out;
     * a chip press then just scrolls there. Measuring on layout (rather than
     * hardcoding heights) keeps it correct as sections grow, empty out, or get
     * replaced by a placeholder.
     */
    const sectionY = useRef<Partial<Record<ChipId, number>>>({});

    // Status bar icons: white over the dark hero, dark once white content is under them.
    const [overHero, setOverHero] = useState(true);
    const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = e.nativeEvent.contentOffset.y < HERO_SCROLL_LIMIT;
        setOverHero((prev) => (prev === next ? prev : next));
    };

    // Reopen the tab at the top, with the chip highlight and search reset too.
    useTabScrollReset(scrollRef, () => {
        setActiveChip("all");
        setSearchOpen(false);
        setSearch("");
    });

    const registerSection = (id: ChipId) => (event: LayoutChangeEvent) => {
        sectionY.current[id] = event.nativeEvent.layout.y;
    };

    const scrollToSection = (id: ChipId) => {
        const y = sectionY.current[id];
        // Undefined only while the feed is still loading and nothing has laid out.
        if (y == null) return;
        scrollRef.current?.scrollTo({ y: Math.max(0, y - SCROLL_GAP), animated: true });
    };

    const handleChipSelect = (id: ChipId) => {
        setActiveChip(id);
        scrollToSection(id);
    };

    const handleProductPress = (item: DiscoverProductItem) => {
        // Cards are lightweight — the detail screen fetches GET /products/:id.
        // Opens Discover's own copy of the detail route: pushing the
        // marketplace one would switch the active tab to Marketplace.
        router.push({ pathname: '/discover/[productId]', params: { productId: item.id } });
    };

    /**
     * "View all" → the paginated view of that section
     * (`GET /api/v1/discover/products?section=…`). `section` uses the API's
     * snake_case values, not the chip ids.
     */
    const handleSeeAll = (section: DiscoverSection, title: string) => {
        router.push({
            pathname: '/(tabs)/discover/see-all',
            params: { section, title },
        });
    };

    const openSearch = () => {
        setSearchOpen(true);
        // Bring the field into view — it sits just under the hero.
        scrollToSection("all");
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearch("");
    };

    // Figma sizes: carousel cards 170 wide / 150 tall artwork; grid is two square cards.
    const carouselCardWidth = 170;
    const gridCardWidth = (width - 40 - 12) / 2;

    return (
        <View className="flex-1 bg-white">
            {/* Rendered only while focused: tab screens stay mounted, and this one
                must not hold the status bar style while another tab is showing. */}
            {isFocused && <StatusBar style={overHero && !isSearching ? "light" : "dark"} />}

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={32}
                contentContainerStyle={{ paddingBottom: 122 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#2563eb"
                        progressViewOffset={60}
                    />
                }
            >
                <DiscoverHero
                    items={feed?.featured}
                    signedIn={!!isSignedIn}
                    hasUnread={unreadCount > 0}
                    onItemPress={handleProductPress}
                    onExplore={() => scrollToSection("trending")}
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
                    <View onLayout={registerSection("all")}>
                        {searchOpen && (
                            <View className="mx-5 mb-4 h-11 flex-row items-center gap-2 rounded border border-[#dbeafe] bg-[#f3f6ff] px-3">
                                <Search size={16} color="#6b7280" />
                                <TextInput
                                    autoFocus
                                    value={search}
                                    onChangeText={setSearch}
                                    placeholder="Search drops and collectibles"
                                    placeholderTextColor="#9ca3af"
                                    returnKeyType="search"
                                    className="h-full flex-1 font-syne text-[13px] text-[#111827]"
                                />
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityLabel="Close search"
                                    hitSlop={10}
                                    onPress={closeSearch}
                                >
                                    <X size={16} color="#6b7280" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {isSearching ? (
                        <SearchResultsSection search={debouncedSearch} onItemPress={handleProductPress} />
                    ) : (
                        <>
                            <LeaderboardBanner />

                            {/* Category chips — jump to a section of the feed */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
                                className="grow-0"
                            >
                                {CHIPS.map((chip) => {
                                    const active = chip.id === activeChip;
                                    return (
                                        <TouchableOpacity
                                            key={chip.id}
                                            accessibilityRole="button"
                                            accessibilityState={{ selected: active }}
                                            activeOpacity={0.8}
                                            onPress={() => handleChipSelect(chip.id)}
                                            className={`h-8 justify-center rounded border px-[14px] ${active
                                                ? "border-[rgba(59,130,245,0.25)] bg-[rgba(59,130,245,0.08)]"
                                                : "border-[#e5e7eb] bg-[#f3f4f6]"
                                                }`}
                                        >
                                            <Text
                                                className={`text-[12.5px] ${active
                                                    ? "font-syne-semibold text-[#3b82f6]"
                                                    : "font-syne-medium text-[#6b7280]"
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
                                        Couldn't load the Discover feed. Check your connection.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => refetch()}
                                        className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2"
                                    >
                                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {feed && (
                                <View className="gap-[27px] pt-[14px]">
                                    {/* TRENDING — unitsSold desc */}
                                    <View onLayout={registerSection("trending")} className="gap-[14px]">
                                        <SectionHeading
                                            title="Trending now"
                                            onViewAll={() => handleSeeAll("trending", "Trending Now")}
                                        />
                                        {feed.trending.length > 0 ? (
                                            <FlatList
                                                horizontal
                                                data={feed.trending}
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
                                        ) : (
                                            <EmptyNote text="No trending drops yet — pull to refresh." />
                                        )}
                                    </View>

                                    {/* TOP CREATORS — unitsSold desc */}
                                    <View onLayout={registerSection("topCreators")} className="gap-[14px]">
                                        <SectionHeading
                                            title="Top creators"
                                            onViewAll={() => handleSeeAll("top_creators", "Top Creators")}
                                        />
                                        {feed.topCreators.length > 0 ? (
                                            <FlatList
                                                horizontal
                                                data={feed.topCreators}
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
                                                contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 6 }}
                                                className="grow-0"
                                            />
                                        ) : (
                                            <EmptyNote text="No creator picks yet — pull to refresh." />
                                        )}
                                    </View>

                                    {/* NEW RELEASES — createdAt desc, two-column grid */}
                                    <View onLayout={registerSection("newReleases")} className="gap-[14px]">
                                        <SectionHeading
                                            title="Latest drops"
                                            onViewAll={() => handleSeeAll("new_releases", "Latest Releases")}
                                        />
                                        {feed.newReleases.length > 0 ? (
                                            <View className="flex-row flex-wrap gap-3 px-5">
                                                {feed.newReleases.map((item) => (
                                                    <DiscoverProductCard
                                                        key={item.id}
                                                        item={item}
                                                        width={gridCardWidth}
                                                        imageHeight={gridCardWidth}
                                                        onPress={() => handleProductPress(item)}
                                                    />
                                                ))}
                                            </View>
                                        ) : (
                                            <EmptyNote text="No new releases yet — pull to refresh." />
                                        )}
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </LinearGradient>
            </ScrollView>
        </View>
    );
}

/**
 * Leaderboard banner from the Figma. There is no leaderboard endpoint yet, so
 * it is a labelled placeholder: not tappable, and the Figma's "#1–10" rank pill
 * reads "Soon" rather than showing a made-up rank.
 */
function LeaderboardBanner() {
    return (
        <LinearGradient
            colors={["#4bf489", "#3bf69c"]}
            start={{ x: 0.45, y: 0 }}
            end={{ x: 0.55, y: 1 }}
            style={{
                height: 72,
                marginHorizontal: 20,
                marginBottom: 27,
                borderRadius: 4,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <View className="flex-1 flex-row items-center gap-3">
                <View className="size-11 items-center justify-center rounded bg-[rgba(89,135,102,0.09)]">
                    <Trophy size={22} color="#0b3d22" />
                </View>
                <View className="flex-1 gap-[3px]">
                    <Text className="font-syne-bold text-[10px] text-[#040404]">Leaderboard</Text>
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[rgba(67,42,42,0.67)]">
                        Top collectors this week
                    </Text>
                </View>
            </View>
            <View className="h-[23px] justify-center rounded border border-[rgba(255,48,48,0.2)] bg-white/15 px-[10px]">
                <Text className="font-syne-semibold text-[10px] text-[#040404]">Soon</Text>
            </View>
        </LinearGradient>
    );
}

function SectionHeading({ title, onViewAll }: { title: string; onViewAll?: () => void }) {
    return (
        <View className="flex-row items-center justify-between px-5">
            <Text className="font-orbitron text-[20px] text-black">{title}</Text>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`View all ${title}`}
                className="flex-row items-center gap-[3px]"
                activeOpacity={0.7}
                hitSlop={8}
                onPress={onViewAll}
            >
                <Text className="font-syne-semibold text-[10.25px] text-[#3b82f6]">View all</Text>
                <ChevronRight size={12} color="#3b82f6" />
            </TouchableOpacity>
        </View>
    );
}

function EmptyNote({ text }: { text: string }) {
    return (
        <View className="mx-5 rounded border border-dashed border-[#dbeafe] bg-white/60 px-4 py-6">
            <Text className="text-center font-syne text-xs text-[#6b7280]">{text}</Text>
        </View>
    );
}
