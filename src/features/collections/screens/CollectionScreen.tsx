import { Clock, Music } from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MainHeader from "@/components/mainHeader";
import { useTabScrollReset } from "@/hooks/use-tab-scroll-reset";
import { useCollectionStats } from "../api/getCollectionStats";
import { useMyCollection } from "../api/getMyCollection";
import CategoriesSection, { DEFAULT_COLLECTION_CATEGORY } from "../components/CategoriesSection";
import CollectionGrid from "../components/CollectionGrid";
import CollectionProgress from "../components/CollectionProgress";
import FilterHeader from "../components/FilterHeader";
import { toCollectionCard } from "../utils/mapCollectionItem";

const FILTER_OPTIONS = [
  { label: "Artist", value: "Artist", icon: Music },
  // Brand removed — there is no brand on a collection item to sort by.
  // { label: "Genre", value: "Genre", icon: Compass },
  { label: "Latest", value: "Latest", icon: Clock },
];

export default function CollectionScreen() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("Latest");
  const [activeCategory, setActiveCategory] = useState(DEFAULT_COLLECTION_CATEGORY);

  const stats = useCollectionStats();
  const {
    data: collection,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMyCollection();

  // The API returns the shelf newest-first; map into the shared card shape.
  const cards = useMemo(
    () => (collection?.data ?? []).map(toCollectionCard),
    [collection]
  );

  const progress = stats.data?.collectionProgress.percentage ?? 0;

  const scrollRef = useRef<ScrollView>(null);
  // Reopen the tab on the shelf itself, not wherever the user left it: scrolled
  // back to the top, category chip back on "All", and the filter menu closed —
  // a selected chip or an open dropdown carried across a tab switch both read
  // as the screen having been left mid-interaction.
  useTabScrollReset(scrollRef, () => {
    setIsFilterOpen(false);
    setActiveCategory(DEFAULT_COLLECTION_CATEGORY);
  });

  return (
    <SafeAreaView
      // No bottom edge: the tab bar already reserves the safe area below.
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
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
            onRefresh={() => {
              refetch();
              stats.refetch();
            }}
            tintColor="#8B5CF6"
          />
        }
      >
        {/* Header */}
        <MainHeader
          title="My Collections"
          subtitle="Welcome to your HitBox collection."
          className='px-4 py-2'
        />

        {/* Collection Progress — real stats from GET /collections/me/stats */}
        <View className="mx-4 mt-4">
          <CollectionProgress
            progress={progress}
            itemsOwned={stats.data?.totalClaimedItems ?? 0}
            totalCollections={stats.data?.totalArtistCollections ?? 0}
          />
        </View>

        {/* Categories */}
        <View className="mx-4 mt-6">
          <CategoriesSection
            selectedId={activeCategory}
            onSelect={setActiveCategory}
          />
        </View>

        {/* My Collections */}
        <View className="mx-4 mt-6 gap-4 z-50">
          <FilterHeader onFilterPress={() => setIsFilterOpen(!isFilterOpen)} />

          {isFilterOpen && (
            <View
              className="absolute right-0 top-10 w-44 bg-[#090D16] border border-[#1E293B] rounded-2xl p-1.5 shadow-2xl z-50"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.5,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 10 },
                elevation: 10,
              }}
            >
              {FILTER_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedFilter === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSelectedFilter(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`flex-row items-center px-3.5 py-3 rounded-xl ${isSelected ? "bg-violet-600/15" : "active:bg-zinc-800/20"
                      }`}
                  >
                    <IconComponent
                      size={15}
                      color={isSelected ? "#A78BFA" : "#94A3B8"}
                    />
                    <Text
                      className={`ml-3 font-semibold text-xs ${isSelected ? "text-violet-300" : "text-zinc-400"
                        }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Loading */}
          {isLoading && (
            <View className="mt-16 items-center">
              <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <View className="mt-16 items-center px-8">
              <Text className="text-zinc-400 text-sm text-center">
                Couldn&apos;t load your collection. Check your connection.
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="mt-3 bg-primary px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-semibold text-sm">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty */}
          {!isLoading && !isError && cards.length === 0 && (
            <View className="mt-16 items-center px-8">
              <Text className="text-zinc-400 text-sm text-center">
                Your collection is empty. Claim a collectible to get started.
              </Text>
            </View>
          )}

          {/* Grid */}
          {!isLoading && !isError && cards.length > 0 && (
            <CollectionGrid data={cards} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
