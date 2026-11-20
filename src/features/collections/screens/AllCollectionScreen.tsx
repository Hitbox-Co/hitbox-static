import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MainHeader from "../../../components/mainHeader";
import { useMyCollectionInfinite } from "../api/getMyCollectionInfinite";
import CollectionGrid from "../components/CollectionGrid";
import { toCollectionCard } from "../utils/mapCollectionItem";

export default function AllCollectionsScreen() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyCollectionInfinite({ limit: 18 });

  const cards = (data?.pages.flatMap((page) => page.data) ?? []).map(toCollectionCard);
  const total = data?.pages[0]?.meta.total ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-[#070B14]">
      <MainHeader title="All Collections" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 24,
        }}
      >
        <View className="px-4 mt-4">
          <Text className="text-white text-2xl font-bold">
            Collections
          </Text>

          <Text className="text-zinc-400 mt-1">
            {total > 0
              ? `Browsing ${total} collectible${total === 1 ? "" : "s"} in your library`
              : "Browse your collectibles"}
          </Text>
        </View>

        {/* Loading */}
        {isLoading && (
          <View className="mt-16 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <View className="mt-16 items-center px-8">
            <Text className="text-zinc-400 text-sm text-center">
              Couldn&apos;t load your collections. Check your connection.
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-3 bg-violet-600 px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-semibold text-sm">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!isLoading && !isError && cards.length === 0 && (
          <View className="mt-16 items-center px-8">
            <Text className="text-zinc-400 text-sm text-center">
              No collectibles yet. Claim one to start your library.
            </Text>
          </View>
        )}

        {/* Grid + pagination */}
        {!isLoading && !isError && cards.length > 0 && (
          <>
            <View className="mx-4 mt-6">
              <CollectionGrid data={cards} />
            </View>

            {hasNextPage && (
              <TouchableOpacity
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mx-4 mt-4 py-3 border rounded-full items-center justify-center"
                style={{ backgroundColor: "#0B1018", borderColor: "#232C3F" }}
                activeOpacity={0.8}
              >
                {isFetchingNextPage ? (
                  <ActivityIndicator size="small" color="#2563eb" />
                ) : (
                  <Text className="text-violet-400 text-xs font-bold">Load More</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
