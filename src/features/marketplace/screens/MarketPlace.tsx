import { router } from 'expo-router';
import {
    CreditCard,
    Frame,
    LayoutGrid,
    MonitorSmartphone,
    Package,
    Shirt,
    ToyBrick,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MainHeader from '@/components/mainHeader';
import MainSearchBar from '@/components/mainsearch';
import { useTabScrollReset } from '@/hooks/use-tab-scroll-reset';
import { useMarketplaceFeed } from '../api/getMarketplaceFeed';
import CategorySection, { CategoryTabId } from '../components/CategorySection';
import ListingsResultsSection from '../components/ListingsResultsSection';
import ListingsSection from '../components/ListingsSection';
import PromoBannerSection from '../components/PromoBannerSection';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { MarketplaceSort } from '../types/marketplace';

// Screen tabs → API `category` values (see api/routes.ts); 'all' omits the param
const CATEGORIES: { id: CategoryTabId; icon: any; label: string }[] = [
    { id: 'all', icon: LayoutGrid, label: 'All Items' },
    { id: 'cards', icon: CreditCard, label: 'Cards' },
    { id: 'figures', icon: ToyBrick, label: 'Figures' },
    { id: 'apparel', icon: Shirt, label: 'Apparel' },
    { id: 'posters', icon: Frame, label: 'Posters' },
    { id: 'digital', icon: MonitorSmartphone, label: 'Digital' },
    { id: 'other', icon: Package, label: 'Other' },
];

const MarketPlaceScreen = () => {
    const [activeCategory, setActiveCategory] = useState<CategoryTabId>('all');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search.trim());

    // The feed sections only make sense on the untouched "All Items" view;
    // a tab or search term switches to the paginated listings endpoint.
    const isBrowsing = activeCategory !== 'all' || debouncedSearch.length > 0;

    const { data: feed, isLoading, isError, refetch, isRefetching } = useMarketplaceFeed();

    const scrollRef = useRef<ScrollView>(null);
    // Reopen the tab on the main feed: top of the page, "All Items" selected and
    // the search box cleared. Both have to go — `isBrowsing` above swaps the
    // featured/new sections for the paginated results whenever a category or a
    // search term is set, so leaving either behind means the tab reopens
    // mid-search rather than on the listings page.
    useTabScrollReset(scrollRef, () => {
        setActiveCategory('all');
        setSearch('');
    });

    /**
     * "See All" → the paginated view of that section
     * (`GET /api/v1/marketplace/listings`). The category tab is forwarded so the
     * two stay consistent if these sections ever render under a filtered tab —
     * today they only show on "All Items", where no category is sent.
     */
    const handleSeeAll = (sort: MarketplaceSort, title: string) => {
        router.push({
            pathname: '/(tabs)/marketplace/see-all',
            params: {
                sort,
                title,
                ...(activeCategory === 'all' ? {} : { category: activeCategory }),
            },
        });
    };

    return (
        <SafeAreaView
            // No bottom edge: the tab bar already reserves the safe area below.
            edges={['top', 'left', 'right']}
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
                {/* --- HEADER --- */}
                <MainHeader
                    title='Marketplace'
                    subtitle={" Buy, sell and trade with collectors worldwide."}
                    className='px-4 py-2'
                />

                {/* --- SEARCH BAR — GET /marketplace/listings?search= --- */}
                <MainSearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search listings..."
                />

                {/* --- PROMO BANNER --- */}
                <PromoBannerSection />

                {/* --- CATEGORY TABS --- */}
                <CategorySection
                    CATEGORIES={CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />

                {isBrowsing ? (
                    <ListingsResultsSection
                        category={activeCategory === 'all' ? undefined : activeCategory}
                        search={debouncedSearch}
                    />
                ) : (
                    <>
                        {isLoading && (
                            <View className="mt-16 items-center">
                                <ActivityIndicator size="large" color="#8B5CF6" />
                            </View>
                        )}

                        {isError && !isLoading && (
                            <View className="mt-16 items-center px-8">
                                <Text className="text-muted-foreground text-sm text-center">
                                    Couldn't load the marketplace. Check your connection.
                                </Text>
                                <TouchableOpacity onPress={() => refetch()} className="mt-3 bg-primary px-4 py-2 rounded-xl">
                                    <Text className="text-white font-semibold text-sm">Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {feed && (
                            <>
                                {/* --- FEATURED — curated, most-sold first --- */}
                                <ListingsSection
                                    title="Featured Listings"
                                    items={feed.featured}
                                    // `popular` is the listings endpoint's most-sold-first sort,
                                    // which is how the feed builds `featured`.
                                    onSeeAllPress={() => handleSeeAll('popular', 'Featured Listings')}
                                />

                                {/* --- NEW LISTINGS — newest active products --- */}
                                <ListingsSection
                                    title="New Listings"
                                    items={feed.newListings}
                                    onSeeAllPress={() => handleSeeAll('newest', 'New Listings')}
                                />
                            </>
                        )}
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
};

export default MarketPlaceScreen;
