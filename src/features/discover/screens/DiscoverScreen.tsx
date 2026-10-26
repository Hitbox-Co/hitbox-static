import { router } from "expo-router";
import {
    ArrowRight,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    LayoutChangeEvent,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MainHeader from "@/components/mainHeader";
import MainSearchBar from "@/components/mainsearch";
import { useTabScrollReset } from "@/hooks/use-tab-scroll-reset";
import { useDiscoverFeed } from "../api/getDiscoverFeed";
import CategoriesSection, { DiscoverCategoryId } from "../components/CategoriesSection";
import ComingSoonRow from "../components/ComingSoonRow";
import HeroBanner from "../components/HeroBanner";
import ReleaseCard from "../components/ReleaseCard";
import SearchResultsSection from "../components/SearchResultsSection";
import TrendingCard from "../components/TrendingCard";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { DiscoverProductItem, DiscoverSection } from "../types/discover";

/** Breathing room left above a section title after a chip jump. */
const SCROLL_GAP = 12;

export default function DiscoverScreen() {

    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search.trim());
    const isSearching = debouncedSearch.length > 0;

    const { data: feed, isLoading, isError, error, refetch, isRefetching } = useDiscoverFeed();
    // console.log("feed:", feed)
    // console.log("isLoading:", isLoading)
    // console.log("isError:", error)

    const [activeCategory, setActiveCategory] = useState<DiscoverCategoryId>("trending");
    const scrollRef = useRef<ScrollView>(null);
    /**
     * Each section reports its y offset within the scroll content as it lays out;
     * a chip press then just scrolls there. Measuring on layout (rather than
     * hardcoding heights) keeps it correct as sections grow, empty out, or get
     * replaced by a placeholder.
     */
    const sectionY = useRef<Partial<Record<DiscoverCategoryId, number>>>({});

    // Reopen the tab at the top. The chip highlight resets with it, otherwise
    // the user lands on "Trending" with "Top Creators" still lit up.
    useTabScrollReset(scrollRef, () => setActiveCategory("trending"));

    const registerSection = (id: DiscoverCategoryId) => (event: LayoutChangeEvent) => {
        sectionY.current[id] = event.nativeEvent.layout.y;
    };

    const handleCategorySelect = (id: DiscoverCategoryId) => {
        setActiveCategory(id);
        const y = sectionY.current[id];
        // Undefined only while the feed is still loading and nothing has laid out.
        if (y == null) return;
        scrollRef.current?.scrollTo({ y: Math.max(0, y - SCROLL_GAP), animated: true });
    };

    const handleProductPress = (item: DiscoverProductItem) => {
        // Cards are lightweight — the detail screen fetches GET /products/:id.
        // Opens Discover's own copy of the detail route: pushing the
        // marketplace one would switch the active tab to Marketplace.
        router.push({ pathname: '/discover/[productId]', params: { productId: item.id } });
    };

    /**
     * "See All" → the paginated view of that section
     * (`GET /api/v1/discover/products?section=…`). `section` uses the API's
     * snake_case values, not the chip ids.
     */
    const handleSeeAll = (section: DiscoverSection, title: string) => {
        router.push({
            pathname: '/(tabs)/discover/see-all',
            params: { section, title },
        });
    };

    return (
        <SafeAreaView
            // No bottom edge: the tab bar already reserves the safe area below.
            edges={["top", "left", "right"]}
            className="flex-1 bg-black"
        >
            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 110,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        tintColor="#8B5CF6"
                    />
                }
            >
                <MainHeader
                    title="Discover"
                    subtitle="Explore collections, creators and exclusive experiences."
                    className='px-4 pt-1 pb-1'
                />

                {/* Search Bar — backed by GET /api/v1/discover/products?search= */}
                <MainSearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search artists, albums..."
                    onVoicePress={() => console.log("Voice")}
                    classname="my-1"
                />

                {isSearching ? (
                    <SearchResultsSection search={debouncedSearch} onItemPress={handleProductPress} />
                ) : (
                    <>
                        <View className="mt-2 mx-4 flex-row items-center justify-between">
                            <CategoriesSection
                                activeId={activeCategory}
                                onSelect={handleCategorySelect}
                            />
                        </View>

                        {/* HERO SECTION — featured (≤5) from the discover feed */}
                        <HeroBanner items={feed?.featured} onItemPress={handleProductPress} />

                        {isLoading && (
                            <View className="mt-16 items-center">
                                <ActivityIndicator size="large" color="#8B5CF6" />
                            </View>
                        )}

                        {isError && !isLoading && (
                            <View className="mt-16 items-center px-8">
                                <Text className="text-zinc-400 text-sm text-center">
                                    Couldn't load the Discover feed. Check your connection.
                                </Text>
                                <TouchableOpacity onPress={() => refetch()} className="mt-3 bg-primary px-4 py-2 rounded-xl">
                                    <Text className="text-white font-semibold text-sm">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {feed && (
                            <>
                                {/* TRENDING — unitsSold desc */}
                                <View onLayout={registerSection("trending")}>
                                    <SectionHeader
                                        title="Trending Now"
                                        onSeeAllPress={() => handleSeeAll('trending', 'Trending Now')}
                                    />
                                    <View className="mt-3 mx-4">
                                        {feed.trending.length > 0 ? (
                                            <FlatList
                                                horizontal
                                                data={feed.trending}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item, index }) => (
                                                    <TrendingCard
                                                        item={item}
                                                        index={index + 1}
                                                        onPress={() => handleProductPress(item)}
                                                    />
                                                )}
                                                showsHorizontalScrollIndicator={false}
                                            />
                                        ) : (
                                            <></>
                                        )}
                                    </View>
                                </View>

                                {/* TOP CREATORS — unitsSold desc */}
                                <View onLayout={registerSection("topCreators")}>
                                    <SectionHeader
                                        title="Top Creators"
                                        onSeeAllPress={() => handleSeeAll('top_creators', 'Top Creators')}
                                    />
                                    <View className="mt-3 mx-4">
                                        {feed.topCreators.length > 0 ? (
                                            <FlatList
                                                horizontal
                                                data={feed.topCreators}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <ReleaseCard
                                                        item={item}
                                                        showNewBadge={false}
                                                        onPress={() => handleProductPress(item)}
                                                    />
                                                )}
                                                ItemSeparatorComponent={() => <View className="w-4" />}
                                                showsHorizontalScrollIndicator={false}
                                            />
                                        ) : (
                                            <ComingSoonRow note="No creator picks yet — pull to refresh." />
                                        )}
                                    </View>
                                </View>

                                {/* NEW RELEASES — createdAt desc */}
                                <View onLayout={registerSection("newReleases")}>
                                    <SectionHeader
                                        title="Latest Releases"
                                        onSeeAllPress={() => handleSeeAll('new_releases', 'Latest Releases')}
                                    />
                                    <View className="mt-3 mx-4 mb-4">
                                        {feed.newReleases.length > 0 ? (
                                            <FlatList
                                                horizontal
                                                data={feed.newReleases}
                                                keyExtractor={(item) => item.id}
                                                renderItem={({ item }) => (
                                                    <ReleaseCard
                                                        item={item}
                                                        onPress={() => handleProductPress(item)}
                                                    />
                                                )}
                                                ItemSeparatorComponent={() => <View className="w-4" />}
                                                showsHorizontalScrollIndicator={false}
                                            />
                                        ) : (
                                            <ComingSoonRow note="No new releases yet — pull to refresh." />
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </>
                )}

            </ScrollView>

        </SafeAreaView>
    );
}

function SectionHeader({ title, onSeeAllPress }: { title: string; onSeeAllPress?: () => void }) {
    return (
        <View className="mt-6 flex-row items-center justify-between mx-4">
            <Text className="text-xl font-extrabold text-white tracking-tight">
                {title}
            </Text>

            <TouchableOpacity className="flex-row items-center" onPress={onSeeAllPress} activeOpacity={0.7}>
                <Text className="mr-1 font-bold text-sm text-[#A855F7]">
                    See All
                </Text>

                <ArrowRight
                    size={15}
                    color="#A855F7"
                    strokeWidth={2.5}
                />
            </TouchableOpacity>
        </View>
    );
}
