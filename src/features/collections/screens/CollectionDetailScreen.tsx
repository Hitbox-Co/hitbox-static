import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRewardTeaser } from "@/features/rewards/api/getRewards";
import { COLLECTION_PLACEHOLDER_IMAGE } from "../utils/mapCollectionItem";
import { useAllMyItems, useCollectionProducts } from "../api/getCollectionProducts";

type Tab = "all" | "owned" | "missing";

/**
 * One artist collection — Figma C07 "Orbit · Owned products". The navy hero, an
 * "owned / total" progress card, All / Owned / Missing tabs and a two-column grid.
 *
 * Real data: every drop in the collection is `GET /products?collectionId=`; what
 * you own is your shelf. "Owned" is counted in drops (two copies of one drop
 * count once). The API has no endpoint for a collection's own name or blurb, so
 * the title comes from the collection's reward when it has one (its name, cover
 * and artist), and otherwise from the artist. A collection with a reward also
 * shows what completing it unlocks.
 */
export default function CollectionDetailScreen({ collectionId }: { collectionId?: string }) {
  const [tab, setTab] = useState<Tab>("all");

  const { products, total, isLoading, isError, refetch } = useCollectionProducts(collectionId);
  const { items: mine } = useAllMyItems();
  const teaser = useRewardTeaser(collectionId).data;

  const ownedIds = new Set(mine.map((i) => i.product.id));
  const ownedProducts = products.filter((p) => ownedIds.has(p.id));
  const missingProducts = products.filter((p) => !ownedIds.has(p.id));

  const count = products.length;
  const owned = ownedProducts.length;
  const missing = missingProducts.length;
  const pct = count > 0 ? Math.round((owned / count) * 100) : 0;

  const artist = teaser?.collection.artist.name ?? products.find((p) => p.artistName)?.artistName ?? null;
  const title = teaser?.collection.name ?? (artist ? `${artist} collection` : "Collection");
  const heroImage =
    teaser?.collection.heroImageUrl ?? ownedProducts[0]?.imageUrl ?? products[0]?.imageUrl ?? COLLECTION_PLACEHOLDER_IMAGE;

  const shown = tab === "owned" ? ownedProducts : tab === "missing" ? missingProducts : products;

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#f6f9fc" }}>
      {/* Header */}
      <View className="h-12 flex-row items-center justify-between bg-white px-5">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/collections" as never))}
            className="size-8 items-center justify-center rounded bg-[#eff6ff]"
          >
            <ArrowLeft size={17} color="#111827" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-[7px]">
            <RNImage source={require("@/assets/images/HitBoxLogo-dark.png")} resizeMode="contain" style={{ width: 24, height: 24 }} />
            <Text className="font-orbitron text-[14px] text-[#111827]">HitBox</Text>
          </View>
        </View>
        <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">COLLECTION DETAILS</Text>
      </View>
      <View className="h-px bg-[#e5e7eb]" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
        {/* Hero */}
        <View className="h-[150px] flex-row overflow-hidden rounded-lg bg-[#0b1b36]">
          <View className="flex-1 justify-center gap-1 p-4">
            {!!artist && (
              <Text numberOfLines={1} className="font-syne-bold text-[10px] tracking-[0.8px] text-[#4ade80]">
                {artist.toUpperCase()}
              </Text>
            )}
            <Text numberOfLines={2} className="font-syne-bold text-[26px] leading-[30px] text-white">{title}</Text>
            <Text className="font-syne text-[11px] text-[#94a3b8]">
              {count} {count === 1 ? "drop" : "drops"}
            </Text>
          </View>
          <Image source={{ uri: heroImage }} style={{ width: "44%", height: "100%", backgroundColor: "#1f2f4d" }} contentFit="cover" />
        </View>

        {isLoading && <ActivityIndicator size="small" color="#2563eb" />}

        {isError && (
          <View className="items-center gap-3 py-4">
            <Text className="font-syne text-[13px] text-[#6b7280]">Couldn&apos;t load this collection.</Text>
            <TouchableOpacity onPress={() => refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
              <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !isError && (
          <>
            {/* Progress */}
            <View className="gap-2 rounded-lg bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="font-syne-bold text-[20px] text-[#111827]">{owned} / {count} owned</Text>
                <Text className="font-syne-bold text-[13px] text-[#111827]">{pct}%</Text>
              </View>
              <View className="h-[6px] overflow-hidden rounded-full bg-[#e5e7eb]">
                <View className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
              </View>
              <Text className="font-syne text-[11px] text-[#6b7280]">
                {missing === 0 && count > 0 ? "You own every drop in this collection." : `${missing} more to complete the set.`}
              </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row gap-1 rounded bg-white p-1">
              {(
                [
                  { id: "all", label: `All ${count}` },
                  { id: "owned", label: `Owned ${owned}` },
                  { id: "missing", label: `Missing ${missing}` },
                ] as { id: Tab; label: string }[]
              ).map((t) => {
                const active = t.id === tab;
                return (
                  <TouchableOpacity
                    key={t.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    activeOpacity={0.85}
                    onPress={() => setTab(t.id)}
                    className={`h-8 flex-1 items-center justify-center rounded ${active ? "bg-black" : ""}`}
                  >
                    <Text className={`font-syne-semibold text-[11.5px] ${active ? "text-white" : "text-[#6b7280]"}`}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Grid */}
            {shown.length === 0 ? (
              <Text className="py-6 text-center font-syne text-[13px] text-[#6b7280]">
                {tab === "owned" ? "You don't own any drop in this collection yet." : "Nothing missing — the set is complete."}
              </Text>
            ) : (
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {shown.map((p) => {
                  const isOwned = ownedIds.has(p.id);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${p.name}, ${isOwned ? "owned" : "not owned yet"}`}
                      activeOpacity={0.85}
                      onPress={() => router.push({ pathname: "/collectible/[productId]", params: { productId: p.id, collectionId } } as never)}
                      style={{ width: "48.5%" }}
                      className="overflow-hidden rounded-lg bg-white"
                    >
                      <View>
                        <Image
                          source={{ uri: p.imageUrl ?? COLLECTION_PLACEHOLDER_IMAGE }}
                          style={{ width: "100%", aspectRatio: 1.15, backgroundColor: "#e5e7eb" }}
                          contentFit="cover"
                        />
                        {/* Not owned yet: the picture is veiled, not removed */}
                        {!isOwned && <View className="absolute inset-0 bg-[#eef2f7]/60" />}
                      </View>
                      <View className="gap-0.5 p-2.5">
                        <Text numberOfLines={1} className="font-syne-bold text-[12px] text-[#111827]">{p.name}</Text>
                        <View className="flex-row items-center gap-1">
                          {isOwned && <Check size={11} color="#111827" />}
                          <Text className={`font-syne-semibold text-[10px] ${isOwned ? "text-[#111827]" : "text-[#6b7280]"}`}>
                            {isOwned ? "Owned" : "Not owned yet"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* The reward this collection unlocks, when it has one */}
            {teaser && (
              <View className="gap-1 rounded bg-[#eef2f7] p-4">
                <Text className="font-syne-bold text-[14px] text-[#111827]">
                  {teaser.unlocked ? "Reward unlocked" : "Complete the set to unlock"}
                </Text>
                <Text className="font-syne text-[12px] leading-[18px] text-[#6b7280]">
                  {teaser.unlocked
                    ? `${teaser.reward.name} is yours to open.`
                    : `${teaser.reward.name} — ${teaser.progress.collected} of ${teaser.progress.required} drops claimed.`}
                </Text>
                {teaser.unlocked && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => router.push({ pathname: "/rewards/[rewardId]", params: { rewardId: teaser.reward.id } } as never)}
                    className="mt-2 h-10 items-center justify-center rounded-[30px] bg-[#111827]"
                  >
                    <Text className="font-syne-bold text-[12px] text-white">Open reward</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {tab === "missing" ? (
              <View className="gap-1 rounded bg-[#eef2f7] p-4">
                <Text className="font-syne-bold text-[16px] text-[#111827]">
                  {missing > 0 ? "Your next great find is waiting" : "Set complete"}
                </Text>
                <Text className="font-syne text-[12px] leading-[18px] text-[#6b7280]">
                  {missing > 0
                    ? `Explore the ${missing} ${missing === 1 ? "product" : "products"} you're missing and get closer to completing ${title}.`
                    : `You own every drop in ${title}.`}
                </Text>
              </View>
            ) : (
              <View className="gap-1 rounded bg-[#eef2f7] p-4">
                <Text className="font-syne-bold text-[14px] text-[#111827]">Your authenticated finds</Text>
                <Text className="font-syne text-[12px] leading-[18px] text-[#6b7280]">
                  {`These ${owned} ${owned === 1 ? "product is" : "products are"} part of your public collection when your profile is public and the item is set to public.`}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
