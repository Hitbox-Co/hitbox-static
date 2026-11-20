import { Image } from "expo-image";
import { router } from "expo-router";
import { ArrowLeft, ScanLine } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useMe } from "@/features/profile/api/getProfile";
import { categoryChipLabel, useOwnedProductInfo } from "@/features/profile/api/getOwnedCategories";
import { useProduct } from "@/features/products/api/getProduct";
import { useRewardTeaser } from "@/features/rewards/api/getRewards";
import { useAllMyItems, useCollectionTotal } from "../api/getCollectionProducts";
import { COLLECTION_PLACEHOLDER_IMAGE } from "../utils/mapCollectionItem";

/** "31 Oct 2026". */
const claimDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/**
 * One collectible, in the context of its collection — Figma C09 (owned) and C10
 * (not owned yet). The same page in two states:
 *
 *  - OWNED: "✓ OWNED & VERIFIED", the edition ("Edition 042 / 100"), when it was
 *    claimed with NFC and by whom, then View collection / View my profile.
 *  - NOT OWNED YET: "NOT OWNED YET", how far the collection is ("4 / 8 owned ·
 *    one of 4 missing") and Find in marketplace / Back to missing products.
 *
 * Owned or not is decided by your shelf. The collection's own name exists only
 * when it has a reward; otherwise the artist stands in ("Ayan collection").
 */
export default function CollectibleScreen({ productId, collectionId: hint }: { productId?: string; collectionId?: string }) {
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const { data: me } = useMe();
  const { items: mine } = useAllMyItems();

  // The collection comes from the link when we arrived from a collection page,
  // otherwise from the drop itself.
  const collectionId = hint ?? product?.collectionId ?? undefined;
  const total = useCollectionTotal(collectionId);
  const teaser = useRewardTeaser(collectionId).data;
  const infoById = useOwnedProductInfo(mine.map((i) => i.product.id));

  // Copies of this drop on my shelf (newest first, as the API returns them).
  const copies = mine.filter((i) => i.product.id === productId);
  const owned = copies[0];

  // How many drops of this collection I own (two copies count once).
  const ownedInCollection = new Set(
    mine.filter((i) => collectionId && infoById[i.product.id]?.collectionId === collectionId).map((i) => i.product.id),
  ).size;
  const count = Math.max(total ?? ownedInCollection, ownedInCollection);
  const missing = Math.max(0, count - ownedInCollection);

  const artist = product?.artistName ?? teaser?.collection.artist.name ?? null;
  const collectionName = teaser?.collection.name ?? (artist ? `${artist} collection` : "this collection");
  const kind = product?.category ? categoryChipLabel(product.category) : null;
  const overline = [artist, kind].filter(Boolean).join(" / ").toUpperCase();

  const image = product?.images?.[0]?.url ?? COLLECTION_PLACEHOLDER_IMAGE;
  const ownerName = me?.fullName || (me?.handle ? `@${me.handle}` : "you");

  const edition =
    owned && product?.totalSupply
      ? `Edition ${String(owned.sku.serialNumber).padStart(3, "0")} / ${String(product.totalSupply).padStart(3, "0")}`
      : owned
        ? `Edition #${owned.sku.serialNumber}`
        : null;

  const goCollection = () =>
    collectionId && router.push({ pathname: "/collection/[collectionId]", params: { collectionId } } as never);

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
        <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">COLLECTIBLE</Text>
      </View>
      <View className="h-px bg-[#e5e7eb]" />

      {isLoading && (
        <View className="mt-24 items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {(isError || (!isLoading && !product)) && (
        <View className="mt-16 items-center gap-3 px-6">
          <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">Couldn&apos;t load this collectible.</Text>
          <TouchableOpacity onPress={() => refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
            <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {product && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
          {/* Picture + state chip */}
          <View className="overflow-hidden rounded-lg bg-[#e5e7eb]">
            <Image source={{ uri: image }} style={{ width: "100%", aspectRatio: 1.03 }} contentFit="cover" />
            {owned ? (
              <View className="absolute left-3 top-3 rounded bg-[#0b1b36] px-2.5 py-1.5">
                <Text className="font-syne-bold text-[9px] tracking-[0.5px] text-[#4ade80]">✓ OWNED &amp; VERIFIED</Text>
              </View>
            ) : (
              <View className="absolute left-3 top-3 rounded border border-[#e5e7eb] bg-white px-2.5 py-1.5">
                <Text className="font-syne-bold text-[9px] tracking-[0.5px] text-[#111827]">NOT OWNED YET</Text>
              </View>
            )}
          </View>

          {/* Name */}
          <View className="gap-1">
            {!!overline && <Text className="font-syne text-[10px] tracking-[0.4px] text-[#6b7280]">{overline}</Text>}
            <Text className="font-syne-bold text-[28px] leading-[32px] text-[#111827]">{product.name}</Text>
            <Text className="font-syne text-[12px] text-[#6b7280]">
              {owned ? edition : collectionId ? `Part of the official ${collectionName}` : product.rarity ? product.rarity.replace(/_/g, " ") : " "}
            </Text>
          </View>

          {/* What it means for you */}
          {owned ? (
            <View className="gap-2 rounded-lg border border-[#e5e7eb] bg-white p-4">
              <View className="flex-row items-center gap-2.5">
                <ScanLine size={18} color="#111827" />
                <Text className="font-syne-bold text-[14px] text-[#111827]">Claimed with NFC</Text>
              </View>
              <Text className="font-syne text-[11px] text-[#6b7280]">
                {`${claimDate(owned.acquiredAt)} · Owned by ${ownerName}`}
              </Text>
              <Text className="font-syne text-[11px] text-[#6b7280]">Authenticity linked to your collection.</Text>
            </View>
          ) : (
            <View className="gap-2 rounded-lg border border-[#e5e7eb] bg-white p-4">
              <View className="flex-row items-center gap-2.5">
                <ScanLine size={18} color="#111827" />
                <Text className="font-syne-bold text-[14px] text-[#111827]">
                  {collectionId ? `One step closer to a full ${teaser?.collection.name ?? "set"}` : "Not in your collection yet"}
                </Text>
              </View>
              {collectionId ? (
                <Text className="font-syne text-[11px] text-[#6b7280]">
                  {`${ownedInCollection} / ${count} owned · This is one of ${missing} missing ${missing === 1 ? "product" : "products"}.`}
                </Text>
              ) : null}
              <Text className="font-syne text-[11px] text-[#6b7280]">Discover availability in the marketplace.</Text>
            </View>
          )}

          {/* Actions */}
          {owned ? (
            <>
              {!!collectionId && (
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.85}
                  onPress={goCollection}
                  className="h-[46px] justify-center rounded-[2px] bg-black px-3.5"
                >
                  <Text numberOfLines={1} className="font-syne-bold text-[13px] text-white">{`View ${teaser?.collection.name ?? "collection"}${teaser ? " collection" : ""}`}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/profile" as never)}
                className="h-[46px] justify-center rounded-[2px] border-[1.5px] border-[#111827] bg-white px-3.5"
              >
                <Text className="font-syne-bold text-[13px] text-[#111827]">View my profile</Text>
              </TouchableOpacity>
              <Text className="font-syne text-[11px] leading-[17px] text-[#6b7280]">Your owned products appear on your public Profile.</Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: "/marketplace/[tourId]", params: { tourId: product.id } } as never)}
                className="h-[46px] justify-center rounded-[2px] bg-black px-3.5"
              >
                <Text className="font-syne-bold text-[13px] text-white">Find in marketplace</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => (router.canGoBack() ? router.back() : goCollection())}
                className="h-[46px] justify-center rounded-[2px] border-[1.5px] border-[#111827] bg-white px-3.5"
              >
                <Text className="font-syne-bold text-[13px] text-[#111827]">Back to missing products</Text>
              </TouchableOpacity>
              <Text className="font-syne text-[11px] leading-[17px] text-[#6b7280]">Not shown on your Profile until you own it.</Text>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
