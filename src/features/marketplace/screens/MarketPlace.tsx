import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Search, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabScrollReset } from '@/hooks/use-tab-scroll-reset';
import { describeApiError } from '@/lib/api-errors';
import { useMarketplaceFeed } from '../api/getMarketplaceFeed';
import { useMarketplaceListingsInfinite } from '../api/getMarketplaceListingsInfinite';
import ListingGrid from '../components/ListingGrid';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { MarketplaceCategory } from '../types/marketplace';

/** Category chips. Each is a server filter (`?category=`); "All Items" sends none. */
const CHIPS: { id: MarketplaceCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'cards', label: 'Cards' },
    { id: 'figures', label: 'Figures' },
    { id: 'apparel', label: 'Apparel' },
    { id: 'posters', label: 'Posters' },
    { id: 'digital', label: 'Digital' },
    { id: 'other', label: 'Other' },
];

/**
 * Marketplace tab, top to bottom (backend `marketplace-api.md`): title, search,
 * category chips, **Featured Listings** and
 * New Listings. The chips filter both lists on the server; typing in the search
 * bar switches to the paginated `GET /marketplace/listings?search=`.
 */
const MarketPlaceScreen = () => {
    const isFocused = useIsFocused();
    const [category, setCategory] = useState<MarketplaceCategory | 'all'>('all');
    const activeCategory = category === 'all' ? undefined : category;
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search.trim());
    const isSearching = debouncedSearch.length > 0;

    const { data: feed, isLoading, isError, error, refetch, isRefetching, isPlaceholderData } =
        useMarketplaceFeed(activeCategory);

    const results = useMarketplaceListingsInfinite(
        { search: debouncedSearch, category: activeCategory, limit: 20 },
        { enabled: isSearching },
    );
    const found = results.data?.pages.flatMap((page) => page.data) ?? [];
    const foundTotal = results.data?.pages[0]?.meta.total ?? 0;

    // A list the server leaves empty is hidden, not shown as a placeholder.
    const featured = feed?.featured ?? [];
    const newListings = feed?.newListings ?? [];
    const isFeedEmpty = !!feed && featured.length === 0 && newListings.length === 0;

    const scrollRef = useRef<ScrollView>(null);
    // Reopen the tab on the main feed: top of the page, "All Items" selected and
    // the search box cleared — a leftover chip or search term would reopen it mid-search.
    useTabScrollReset(scrollRef, () => {
        setCategory('all');
        setSearch('');
    });

    /**
     * "See All" → the paginated grid (`GET /marketplace/listings`). Featured
     * Listings asks for `featured=true&sort=popular`; New Listings for `newest`.
     * The chosen category rides along.
     */
    const handleSeeAll = (kind: 'featured' | 'new', title: string) => {
        router.push({
            pathname: '/(tabs)/marketplace/see-all',
            params: {
                title,
                ...(kind === 'featured' ? { featured: 'true', sort: 'popular' } : { sort: 'newest' }),
                ...(activeCategory ? { category: activeCategory } : {}),
            },
        });
    };

    return (
        <SafeAreaView
            // No bottom edge: the tab bar already reserves the safe area below.
            edges={['top', 'left', 'right']}
            className="flex-1 bg-white"
        >
            {isFocused && <StatusBar style="dark" />}

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 122 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching && !isPlaceholderData}
                        onRefresh={refetch}
                        tintColor="#2563eb"
                    />
                }
            >
                <View className="gap-5 pt-4">
                    {/* Title + subtitle (static text) */}
                    <View className="gap-2 px-5">
                        <View className="flex-row gap-1">
                            <View className="h-[3px] w-6 bg-[#2563eb]" />
                            <View className="h-[3px] w-[6px] bg-[#2563eb]" />
                        </View>
                        <Text className="font-orbitron text-[24px] leading-[29px] tracking-[-0.5px] text-[#111827]">Marketplace</Text>
                        <Text className="font-syne text-[13px] leading-[19px] text-[#6b7280]">
                            Buy, sell and trade with collectors worldwide.
                        </Text>
                    </View>

                    {/* Search — GET /marketplace/listings?search= */}
                    <View className="mx-5 h-12 flex-row items-center gap-[10px] rounded border border-[#bfdbfe] bg-[#eff6ff] px-[14px]">
                        <Search size={18} color="#2563eb" />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search listings…"
                            placeholderTextColor="#6b7280"
                            returnKeyType="search"
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="h-full flex-1 font-syne text-[13px] text-[#111827]"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Clear search"
                                hitSlop={10}
                                onPress={() => setSearch('')}
                            >
                                <X size={16} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Category chips */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
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
                                        ? 'border-[rgba(59,130,245,0.25)] bg-[rgba(59,130,245,0.08)]'
                                        : 'border-[#e5e7eb] bg-[#f3f4f6]'
                                        }`}
                                >
                                    <Text
                                        className={`text-[12.5px] ${active ? 'font-syne-semibold text-[#3b82f6]' : 'font-syne-medium text-[#6b7280]'}`}
                                    >
                                        {chip.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {isSearching ? (
                        /* ---- Search results ---- */
                        <View className="gap-[14px]">
                            <View className="flex-row items-center justify-between px-5">
                                <Text className="font-orbitron text-[20px] text-black">Results</Text>
                                {foundTotal > 0 && (
                                    <Text className="font-syne text-[11px] text-[#6b7280]">
                                        {foundTotal} listing{foundTotal === 1 ? '' : 's'}
                                    </Text>
                                )}
                            </View>

                            {results.isLoading && (
                                <View className="mt-8 items-center">
                                    <ActivityIndicator size="large" color="#2563eb" />
                                </View>
                            )}

                            {results.isError && !results.isLoading && (
                                <View className="mt-8 items-center px-8">
                                    <Text className="text-center font-syne text-sm text-[#6b7280]">
                                        {describeApiError(results.error, 'Search failed. Check your connection.')}
                                    </Text>
                                    <TouchableOpacity onPress={() => results.refetch()} className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2">
                                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {!results.isLoading && !results.isError && found.length === 0 && (
                                <Text className="mt-8 px-8 text-center font-syne text-sm text-[#6b7280]">
                                    {`No listings match “${debouncedSearch}”.`}
                                </Text>
                            )}

                            {found.length > 0 && <ListingGrid items={found} />}

                            {results.hasNextPage && (
                                <TouchableOpacity
                                    onPress={() => results.fetchNextPage()}
                                    disabled={results.isFetchingNextPage}
                                    activeOpacity={0.8}
                                    className="mx-5 h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                                >
                                    {results.isFetchingNextPage ? (
                                        <ActivityIndicator size="small" color="#2563eb" />
                                    ) : (
                                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        /* ---- The feed ---- */
                        <>
                            {isLoading && (
                                <View className="mt-10 items-center">
                                    <ActivityIndicator size="large" color="#2563eb" />
                                </View>
                            )}

                            {isError && !isLoading && (
                                <View className="mt-10 items-center px-8">
                                    <Text className="text-center font-syne text-sm text-[#6b7280]">
                                        {describeApiError(error, "Couldn't load the marketplace. Check your connection.")}
                                    </Text>
                                    <TouchableOpacity onPress={() => refetch()} className="mt-3 rounded-[30px] bg-[#111827] px-5 py-2">
                                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {isFeedEmpty && (
                                <Text className="mt-8 px-8 text-center font-syne text-sm text-[#6b7280]">
                                    No listings in this category yet.
                                </Text>
                            )}

                            {featured.length > 0 && (
                                <Section title="Featured Listings" onSeeAll={() => handleSeeAll('featured', 'Featured Listings')}>
                                    <ListingGrid items={featured} />
                                </Section>
                            )}

                            {newListings.length > 0 && (
                                <Section title="New Listings" onSeeAll={() => handleSeeAll('new', 'New Listings')}>
                                    <ListingGrid items={newListings} />
                                </Section>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

function Section({ title, onSeeAll, children }: { title: string; onSeeAll: () => void; children: React.ReactNode }) {
    return (
        <View className="gap-[14px]">
            <View className="flex-row items-center justify-between px-5">
                <Text className="font-orbitron text-[20px] text-black">{title}</Text>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`See all ${title}`}
                    className="flex-row items-center gap-[3px]"
                    hitSlop={8}
                    onPress={onSeeAll}
                >
                    <Text className="font-syne-semibold text-[10.25px] text-[#3b82f6]">See All</Text>
                    <ChevronRight size={12} color="#3b82f6" />
                </TouchableOpacity>
            </View>
            {children}
        </View>
    );
}

export default MarketPlaceScreen;
