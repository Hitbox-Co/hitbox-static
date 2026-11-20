import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Check, MoreHorizontal, Share2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export interface CollectibleItem {
  id: string;
  title: string;
  subtitle: string;
  image: { uri: string } | string;
  rarity: string;
  isNew: boolean;
  owned: boolean;
}

export interface CollectionDetail {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  featured: boolean;
  owned: number;
  total: number;
  progress: number;
  category: string;
}

const rarityStyles = (rarity: string) => {
  switch (rarity) {
    case "Epic":
      return {
        bg: "rgba(236, 72, 153, 0.15)",
        text: "#EC4899",
      };
    case "Rare":
      return {
        bg: "rgba(139, 92, 246, 0.15)",
        text: "#8B5CF6",
      };
    case "Uncommon":
      return {
        bg: "rgba(59, 130, 246, 0.15)",
        text: "#3B82F6",
      };
    default:
      return {
        bg: "rgba(156, 163, 175, 0.15)",
        text: "#9CA3AF",
      };
  }
};

interface GlobalCollectionSectionProps {
  collection: CollectionDetail | null;
  items: CollectibleItem[];
  loading: boolean;
  onBack?: () => void;
  /** When provided, the footer becomes a server-side "Load More" button. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onRetry?: () => void;
  error?: boolean;
}

export default function GlobalCollectionSection({
  collection,
  items,
  loading,
  onBack,
  onLoadMore,
  hasMore,
  loadingMore,
  onRetry,
  error,
}: GlobalCollectionSectionProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "owned" | "missing">("all");
  const [showAll, setShowAll] = useState(false);

  const handleBack = onBack || (() => router.back());

  // When the parent paginates on the server, don't also slice client-side.
  const serverPaginated = typeof onLoadMore === "function";

  const filteredItems = items.filter((item) => {
    if (activeFilter === "owned") return item.owned;
    if (activeFilter === "missing") return !item.owned;
    return true;
  });

  // 3 items per row — collapsed view shows 2 complete rows
  const COLLAPSED_COUNT = 6;
  const displayedItems = serverPaginated
    ? filteredItems
    : showAll
      ? filteredItems
      : filteredItems.slice(0, COLLAPSED_COUNT);

  const chunkedItems: CollectibleItem[][] = [];
  for (let i = 0; i < displayedItems.length; i += 3) {
    chunkedItems.push(displayedItems.slice(i, i + 3));
  }

  // Skeleton Load View (No animations to prevent NativeWind render issues)
  if (loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#070B14" }}>
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="h-10 w-10 bg-zinc-800 rounded-full" />
          <View className="h-6 w-32 bg-zinc-800 rounded" />
          <View className="h-10 w-10 bg-zinc-800 rounded-full" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cover Skeleton */}
          <View className="mx-4 mt-4 h-56 bg-zinc-900 rounded-3xl overflow-hidden justify-end p-5">
            <View className="h-4 w-24 bg-zinc-800 rounded mb-2" />
            <View className="h-8 w-48 bg-zinc-800 rounded mb-2" />
            <View className="h-4 w-36 bg-zinc-800 rounded" />
          </View>

          {/* Stats Bar Skeleton */}
          <View className="mx-4 mt-6 p-5 border rounded-3xl" style={{ backgroundColor: "#0B1018", borderColor: "rgba(35, 44, 63, 0.4)" }}>
            <View className="flex-row justify-between items-center mb-3">
              <View className="h-4 w-32 bg-zinc-800 rounded" />
              <View className="h-4 w-12 bg-zinc-800 rounded" />
            </View>
            <View className="h-3 bg-zinc-800 rounded-full w-full" />
          </View>

          {/* Grid Skeleton — 3 per row */}
          <View className="flex-row flex-wrap justify-between px-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View
                key={i}
                className="w-[31.5%] rounded-2xl border p-2 mb-3"
                style={{ backgroundColor: "#0B1018", borderColor: "rgba(35, 44, 63, 0.5)" }}
              >
                <View className="h-28 bg-zinc-800/60 rounded-xl" />
                <View className="mt-2 gap-y-1">
                  <View className="h-3 bg-zinc-800 rounded w-4/5" />
                  <View className="h-2 bg-zinc-800/60 rounded w-3/5" />
                  <View className="h-4 bg-zinc-800/40 rounded-full w-12 mt-1" />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error && !loading) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: "#070B14" }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={handleBack}
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{ backgroundColor: "rgba(24, 24, 27, 0.6)", borderColor: "#27272a" }}
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-zinc-400 text-sm text-center">
            Couldn&apos;t load this collection. Check your connection.
          </Text>
          {onRetry && (
            <TouchableOpacity onPress={onRetry} className="mt-3 bg-violet-600 px-4 py-2 rounded-xl">
              <Text className="text-white font-semibold text-sm">Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!collection) return null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#070B14" }}>
      {/* Top Navbar */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b" style={{ borderBottomColor: "rgba(30, 41, 59, 0.2)" }}>
        <TouchableOpacity
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center rounded-full border"
          style={{ backgroundColor: "rgba(24, 24, 27, 0.6)", borderColor: "#27272a" }}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#FFF" />
        </TouchableOpacity>

        <Text className="text-white text-base font-bold" numberOfLines={1}>
          Collection Details
        </Text>

        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{ backgroundColor: "rgba(24, 24, 27, 0.6)", borderColor: "#27272a" }}
            activeOpacity={0.8}
          >
            <Share2 size={18} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full border"
            style={{ backgroundColor: "rgba(24, 24, 27, 0.6)", borderColor: "#27272a" }}
            activeOpacity={0.8}
          >
            <MoreHorizontal size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Collection Hero Header */}
        <View className="mx-4 mt-4 overflow-hidden rounded-3xl border" style={{ borderColor: "#232C3F", backgroundColor: "#090D16" }}>
          <View style={{ height: 220 }}>
            <Image
              source={{ uri: collection.image }}
              resizeMode="cover"
              className="w-full h-full"
            />
            <LinearGradient
              colors={["transparent", "rgba(7, 11, 20, 0.95)"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 120,
              }}
            />

            {/* Category Tag overlay */}
            <View className="absolute top-4 left-4">
              <LinearGradient
                colors={["#A855F7", "#7C3AED"]}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}
              >
                <Text className="text-white text-xs font-extrabold tracking-widest uppercase">
                  {collection.category}
                </Text>
              </LinearGradient>
            </View>

            {/* Content overlay */}
            <View className="absolute bottom-4 left-4 right-4">
              <Text className="text-white text-3xl font-extrabold tracking-tight">
                {collection.title}
              </Text>
              <Text className="text-zinc-300 text-sm mt-1 font-medium">
                {collection.subtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress & Stats Card */}
        <View
          className="mx-4 mt-5 p-5 border rounded-3xl"
          style={{
            backgroundColor: "#0B1018",
            borderColor: "#232C3F",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
        >
          <View className="flex-row justify-between items-end mb-3">
            <View>
              <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                Collection Progress
              </Text>
              <Text className="text-white text-xl font-black mt-1">
                {collection.owned} / {collection.total} Owned
              </Text>
            </View>

            <Text className="text-violet-400 text-2xl font-black">
              {collection.progress}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-3.5 rounded-full overflow-hidden" style={{ backgroundColor: "#1A2234" }}>
            <LinearGradient
              colors={["#A855F7", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${collection.progress}%`,
                height: "100%",
                borderRadius: 10,
              }}
            />
          </View>
        </View>

        {/* Filter Chips Section */}
        <View className="flex-row gap-x-2.5 px-4 mt-6">
          <TouchableOpacity
            onPress={() => setActiveFilter("all")}
            className={`px-4 py-2.5 rounded-full border ${activeFilter === "all"
              ? "bg-violet-600 border-violet-500"
              : "bg-zinc-900/50 border-zinc-800"
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-xs font-bold">
              All ({items.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter("owned")}
            className={`px-4 py-2.5 rounded-full border ${activeFilter === "owned"
              ? "bg-violet-600 border-violet-500"
              : "bg-zinc-900/50 border-zinc-800"
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-xs font-bold">
              Owned ({items.filter((i) => i.owned).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveFilter("missing")}
            className={`px-4 py-2.5 rounded-full border ${activeFilter === "missing"
              ? "bg-violet-600 border-violet-500"
              : "bg-zinc-900/50 border-zinc-800"
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white text-xs font-bold">
              Missing ({items.filter((i) => !i.owned).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collectibles Grid */}
        {filteredItems.length === 0 ? (
          <View className="mx-4 mt-10 items-center justify-center p-8 bg-zinc-900/10 border border-dashed border-zinc-800 rounded-3xl">
            <Text className="text-zinc-500 text-sm">No collectibles found in this category.</Text>
          </View>
        ) : (
          <>
            <View className="mt-5">
              {chunkedItems.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row justify-between mb-3 px-4">
                  {row.map((item) => {
                    const styles = rarityStyles(item.rarity);
                    return (
                      <View
                        key={item.id}
                        className="w-[31.5%] rounded-2xl border p-2"
                        style={{
                          backgroundColor: "#0B1018",
                          borderColor: "#232C3F",
                          shadowColor: "#000",
                          shadowOpacity: 0.25,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 5,
                        }}
                      >
                        {/* Image container */}
                        <View className="overflow-hidden rounded-xl relative">
                          <Image
                            source={typeof item.image === "string" ? { uri: item.image } : item.image}
                            resizeMode="cover"
                            style={{ width: "100%", height: 110 }}
                          />
                          <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.65)"]}
                            style={{
                              position: "absolute",
                              left: 0,
                              right: 0,
                              bottom: 0,
                              height: 30,
                            }}
                          />

                          {/* New Label */}
                          {item.isNew && (
                            <LinearGradient
                              colors={["#A855F7", "#7C3AED"]}
                              style={{
                                position: "absolute",
                                top: 4,
                                left: 4,
                                paddingHorizontal: 5,
                                paddingVertical: 1.5,
                                borderRadius: 4,
                              }}
                            >
                              <Text className="text-white text-[6px] font-extrabold">NEW</Text>
                            </LinearGradient>
                          )}

                          {/* Owned Check Icon */}
                          {item.owned ? (
                            <View className="absolute w-4 h-4 rounded-full bg-green-500 items-center justify-center top-1 right-1">
                              <Check size={8} color="white" strokeWidth={3.5} />
                            </View>
                          ) : (
                            <View className="absolute w-4 h-4 rounded-full bg-black/40 items-center justify-center border border-white/20 top-1 right-1">
                              <Text className="text-white/60 text-[7px] font-bold">?</Text>
                            </View>
                          )}
                        </View>

                        {/* Title & Info */}
                        <View className="mt-2">
                          <Text
                            className="font-bold text-white text-sm leading-4"
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                          <Text
                            className="text-zinc-500 text-xs mt-0.5"
                            numberOfLines={1}
                          >
                            {item.subtitle}
                          </Text>

                          {/* Rarity tag */}
                          <View
                            className="mt-1.5 px-2 py-0.5 rounded-full self-start"
                            style={{ backgroundColor: styles.bg }}
                          >
                            <Text
                              className="font-bold text-[10px]"
                              style={{ color: styles.text }}
                            >
                              {item.rarity}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  {row.length < 3 &&
                    Array.from({ length: 3 - row.length }).map((_, idx) => (
                      <View key={`pad-${idx}`} className="w-[31.5%] p-2" />
                    ))}
                </View>
              ))}
            </View>

            {serverPaginated
              ? hasMore && (
                <TouchableOpacity
                  onPress={onLoadMore}
                  disabled={loadingMore}
                  className="mx-4 mt-2 py-3 border rounded-full items-center justify-center"
                  style={{ backgroundColor: "#0B1018", borderColor: "#232C3F" }}
                  activeOpacity={0.8}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#2563eb" />
                  ) : (
                    <Text className="text-violet-400 text-xs font-bold">Load More</Text>
                  )}
                </TouchableOpacity>
              )
              : filteredItems.length > COLLAPSED_COUNT && (
                <TouchableOpacity
                  onPress={() => setShowAll(!showAll)}
                  className="mx-4 mt-2 py-3 border rounded-full items-center justify-center"
                  style={{ backgroundColor: "#0B1018", borderColor: "#232C3F" }}
                  activeOpacity={0.8}
                >
                  <Text className="text-violet-400 text-xs font-bold">
                    {showAll ? "Show Less" : "See All"}
                  </Text>
                </TouchableOpacity>
              )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
