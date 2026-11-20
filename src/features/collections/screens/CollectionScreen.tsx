import { Image } from "expo-image";
import { router } from "expo-router";
import { ChevronRight, Lock, Package, SlidersHorizontal } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image as RNImage,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { categoryChipLabel, useOwnedCategories, useOwnedProductInfo } from "@/features/profile/api/getOwnedCategories";
import { useRewards, useRewardTeaser } from "@/features/rewards/api/getRewards";
import { describeApiError } from "@/lib/api-errors";
import { useTabScrollReset } from "@/hooks/use-tab-scroll-reset";
import { collectionErrorMessage } from "../api/collectionErrors";
import { useAllMyItems, useCollectionTotal } from "../api/getCollectionProducts";
import { useCollectionStats } from "../api/getCollectionStats";
import { useMyCollectionInfinite } from "../api/getMyCollectionInfinite";
import { useUpdateCollectionVisibility } from "../api/updateCollectionVisibility";
import { CollectionItem, CollectionVisibility } from "../types/collection";
import { COLLECTION_PLACEHOLDER_IMAGE, rarityLabel } from "../utils/mapCollectionItem";

type Sort = "latest" | "oldest" | "name";
type Show = "all" | CollectionVisibility;

const SORTS: { id: Sort; label: string }[] = [
  { id: "latest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "name", label: "Name A–Z" },
];
const SHOWS: { id: Show; label: string }[] = [
  { id: "all", label: "All" },
  { id: "PUBLIC", label: "Public" },
  { id: "PRIVATE", label: "Private" },
];

/** The kinds of product HitBox sells, in the order the chips show them. */
const DEFAULT_CATEGORIES = ["FIGURE", "APPAREL", "TRADING_CARD", "ACCESSORY", "POSTER", "DIGITAL_ASSET"];

const PAGE_SIZE = 30;

/**
 * My Collection — Figma C06 "My Collections · Figures". A light page: the
 * private-workspace subtitle, the navy "ONLY YOU" progress card, category chips
 * (All, Figures, Apparel, Cards…), a count line with Filter, and the list.
 *
 * Real data: the card is `GET /collections/me/stats` (progress, items, collections)
 * plus the count of unlocked rewards; the list is `GET /collections/me`, 30 at a
 * time. The Figma lists artist COLLECTIONS with "4 / 8 owned"; the API only gives
 * overall progress, not a per-collection breakdown, so each row is one item you
 * own — with its Public/Private switch, which is the per-item privacy control.
 * Category chips filter by each drop's category (looked up once, cached).
 */
export default function CollectionScreen() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("latest");
  const [show, setShow] = useState<Show>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const stats = useCollectionStats();
  const rewards = useRewards();
  const shelf = useMyCollectionInfinite({ visibility: show === "all" ? undefined : show, limit: PAGE_SIZE });

  const loaded = shelf.data?.pages.flatMap((p) => p.data) ?? [];
  const total = shelf.data?.pages[0]?.meta.total ?? 0;

  // Category chips: the standard kinds are always offered; any other kind you own follows them.
  const categoryOf = useOwnedCategories(loaded.map((i) => i.product.id));
  const extras = [...new Set(Object.values(categoryOf).filter((c): c is string => !!c))]
    .filter((c) => !DEFAULT_CATEGORIES.includes(c))
    .sort();
  const categories = [...DEFAULT_CATEGORIES, ...extras];
  const activeCategory = category !== "all" && !categories.includes(category) ? "all" : category;

  const filtered = activeCategory === "all" ? loaded : loaded.filter((i) => categoryOf[i.product.id] === activeCategory);
  const visible =
    sort === "oldest"
      ? [...filtered].reverse()
      : sort === "name"
        ? [...filtered].sort((a, b) => a.product.name.localeCompare(b.product.name))
        : filtered;

  // Collections: the owned drops, grouped by the collection each belongs to (one
  // cached detail lookup per drop — the shelf rows don't carry it).
  const everything = useAllMyItems();
  const infoById = useOwnedProductInfo(everything.items.map((i) => i.product.id));
  const groups = new Map<string, { ownedDrops: Set<string>; image: string | null; artist: string | null }>();
  for (const item of everything.items) {
    const info = infoById[item.product.id];
    if (!info?.collectionId) continue;
    const g = groups.get(info.collectionId) ?? { ownedDrops: new Set<string>(), image: null, artist: null };
    g.ownedDrops.add(item.product.id);
    g.image = g.image ?? item.product.imageUrl;
    g.artist = g.artist ?? info.artistName;
    groups.set(info.collectionId, g);
  }

  const progress = stats.data?.collectionProgress;
  const itemsOwned = stats.data?.totalClaimedItems ?? 0;
  const collections = stats.data?.totalArtistCollections ?? 0;

  const countLine =
    activeCategory === "all"
      ? `${collections} ${collections === 1 ? "collection" : "collections"} · ${itemsOwned} ${itemsOwned === 1 ? "item" : "items"} owned`
      : `${collections} ${collections === 1 ? "collection" : "collections"} · ${filtered.length} ${categoryChipLabel(activeCategory).toLowerCase()} owned`;

  const scrollRef = useRef<ScrollView>(null);
  // Reopen the tab on the shelf itself: scrolled to the top, chip back on "All", menu closed.
  useTabScrollReset(scrollRef, () => {
    setFilterOpen(false);
    setCategory("all");
  });

  return (
    <SafeAreaView
      // No bottom edge: the tab bar already reserves the safe area below.
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: "#f6f9fc" }}
    >
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={shelf.isRefetching && !shelf.isFetchingNextPage}
            onRefresh={() => {
              shelf.refetch();
              stats.refetch();
            }}
            tintColor="#2563eb"
          />
        }
      >
        {/* Header */}
        <View className="h-11 flex-row items-center justify-between px-5">
          <View className="flex-row items-center gap-[7px]">
            <RNImage
              source={require("@/assets/images/HitBoxLogo-dark.png")}
              resizeMode="contain"
              style={{ width: 26, height: 26 }}
            />
            <Text className="font-orbitron text-[14px] text-[#111827]">HitBox</Text>
          </View>
          <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">MY COLLECTIONS</Text>
        </View>

        <Text className="mt-1 px-5 font-syne text-[13px] text-[#6b7280]">Your private workspace. Every item. Every set.</Text>

        {/* ONLY YOU — overall progress */}
        <View className="mx-5 mt-4 rounded-lg bg-[#0b1b36] p-5">
          <View className="flex-row items-center gap-1.5">
            <Lock size={13} color="#4ade80" />
            <Text className="font-syne-bold text-[10px] tracking-[0.8px] text-[#4ade80]">ONLY YOU</Text>
          </View>
          <Text className="mt-2 font-syne-bold text-[28px] text-white">{progress?.percentage ?? 0}% collected</Text>
          <Text className="mt-0.5 font-syne text-[12px] text-[#94a3b8]">
            {progress && progress.total > 0
              ? `${progress.owned} of ${progress.total} products owned`
              : "Claim a collectible to start a collection."}
          </Text>
          <View className="mt-3 h-[6px] overflow-hidden rounded-full bg-[#334155]">
            <View
              className="h-full rounded-full bg-[#4ade80]"
              style={{ width: `${Math.min(100, Math.max(0, progress?.percentage ?? 0))}%` }}
            />
          </View>
          <View className="mt-5 flex-row items-baseline justify-between">
            {[
              { value: itemsOwned, label: "Items owned" },
              { value: collections, label: "Collections" },
              { value: rewards.data?.length ?? 0, label: "Rewards" },
            ].map((s) => (
              <View key={s.label} className="flex-row items-baseline gap-1.5">
                <Text className="font-syne-bold text-[18px] text-white">{s.value}</Text>
                <Text numberOfLines={1} className="font-syne text-[10.5px] text-[#94a3b8]">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          className="mt-4 grow-0"
        >
          {["all", ...categories].map((c) => {
            const active = c === activeCategory;
            return (
              <TouchableOpacity
                key={c}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                activeOpacity={0.8}
                onPress={() => setCategory(c)}
                className={`h-8 justify-center rounded px-[14px] ${active ? "bg-black" : "bg-white"}`}
              >
                <Text className={`text-[12.5px] ${active ? "font-syne-semibold text-white" : "font-syne-medium text-[#374151]"}`}>
                  {c === "all" ? "All" : categoryChipLabel(c)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Count + Filter */}
        <View className="z-10 mt-4 flex-row items-center justify-between px-5">
          <Text className="flex-1 font-syne text-[12px] text-[#6b7280]">{countLine}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Filter and sort"
            activeOpacity={0.8}
            onPress={() => setFilterOpen((o) => !o)}
            className="h-9 flex-row items-center gap-2 rounded bg-white px-3.5"
          >
            <SlidersHorizontal size={15} color="#111827" />
            <Text className="font-syne-semibold text-[12px] text-[#111827]">Filter</Text>
          </TouchableOpacity>
        </View>

        {filterOpen && (
          <View className="mx-5 mt-2 gap-3 rounded border border-[#e5e7eb] bg-white p-3">
            <OptionRow title="Sort" options={SORTS} value={sort} onChange={(v) => setSort(v as Sort)} />
            <OptionRow title="Show" options={SHOWS} value={show} onChange={(v) => setShow(v as Show)} />
          </View>
        )}

        {/* Collections — each opens its own page (Figma C06 → C07) */}
        {groups.size > 0 && (
          <View className="mt-4 gap-3 px-5">
            <Text className="font-syne-bold text-[16px] text-[#111827]">Collections</Text>
            {[...groups.entries()].map(([id, g]) => (
              <CollectionRow key={id} collectionId={id} owned={g.ownedDrops.size} image={g.image} artist={g.artist} />
            ))}
          </View>
        )}

        {/* List */}
        <View className="mt-3 gap-3 px-5">
          {groups.size > 0 && <Text className="mt-2 font-syne-bold text-[16px] text-[#111827]">Items</Text>}
          {shelf.isLoading && (
            <View className="mt-12 items-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )}

          {shelf.isError && !shelf.isLoading && (
            <View className="mt-10 items-center gap-3 px-6">
              <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                {describeApiError(shelf.error, "Couldn't load your collection. Check your connection.")}
              </Text>
              <TouchableOpacity onPress={() => shelf.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!shelf.isLoading && !shelf.isError && visible.length === 0 && (
            <View className="mt-10 items-center gap-3 px-6">
              <Package size={36} color="#9ca3af" />
              <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                {loaded.length > 0
                  ? `No ${categoryChipLabel(activeCategory).toLowerCase()} in your collection${shelf.hasNextPage ? " yet. Try Load More." : "."}`
                  : show !== "all"
                    ? `No ${show === "PUBLIC" ? "public" : "private"} items.`
                    : "Your collection is empty. Claim a collectible to get started."}
              </Text>
            </View>
          )}

          {visible.map((item) => (
            <ShelfRow key={item.id} item={item} />
          ))}

          {shelf.hasNextPage && (
            <TouchableOpacity
              onPress={() => shelf.fetchNextPage()}
              disabled={shelf.isFetchingNextPage}
              activeOpacity={0.8}
              className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
            >
              {shelf.isFetchingNextPage ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
              )}
            </TouchableOpacity>
          )}

          {visible.length > 0 && (
            <Text className="font-syne text-[11px] text-[#6b7280]">
              {shelf.hasNextPage ? `Showing ${loaded.length} of ${total} items` : `Showing all ${total} ${total === 1 ? "item" : "items"}`}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionRow({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View className="gap-1.5">
      <Text className="font-syne-bold text-[11px] text-[#6b7280]">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const active = o.id === value;
          return (
            <TouchableOpacity
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              activeOpacity={0.8}
              onPress={() => onChange(o.id)}
              className={`h-7 justify-center rounded border px-3 ${active ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#e5e7eb] bg-white"}`}
            >
              <Text className={`text-[11.5px] ${active ? "font-syne-semibold text-[#2563eb]" : "font-syne-medium text-[#6b7280]"}`}>
                {o.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

/** One item you own: picture, name, serial and rarity, and its Public/Private switch. */
function ShelfRow({ item }: { item: CollectionItem }) {
  const update = useUpdateCollectionVisibility();
  const isPublic = item.visibility === "PUBLIC";
  const rarity = rarityLabel(item.product.rarity);

  const toggle = () =>
    update.mutate(
      { skuId: item.sku.id, visibility: isPublic ? "PRIVATE" : "PUBLIC" },
      { onError: (err) => Alert.alert("Couldn't update visibility", collectionErrorMessage(err)) },
    );

  return (
    <View className="flex-row items-center gap-3 rounded-lg bg-white p-2.5">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.product.name}`}
        activeOpacity={0.85}
        onPress={() => router.push({ pathname: "/discover/[productId]", params: { productId: item.product.id } } as never)}
        className="flex-1 flex-row items-center gap-3"
      >
        <Image
          source={{ uri: item.product.imageUrl ?? COLLECTION_PLACEHOLDER_IMAGE }}
          style={{ width: 76, height: 76, borderRadius: 4, backgroundColor: "#e5e7eb" }}
          contentFit="cover"
        />
        <View className="flex-1 gap-0.5">
          <Text numberOfLines={2} className="font-syne-bold text-[16px] leading-[20px] text-[#111827]">
            {item.product.name}
          </Text>
          <Text className="font-syne text-[12px] text-[#6b7280]">
            {[`#${item.sku.serialNumber}`, rarity].filter(Boolean).join(" · ")}
          </Text>
        </View>
        <ChevronRight size={18} color="#4b5563" />
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityRole="switch"
        accessibilityState={{ checked: isPublic }}
        accessibilityLabel={isPublic ? "Public. Tap to make private" : "Private. Tap to make public"}
        activeOpacity={0.8}
        disabled={update.isPending}
        onPress={toggle}
        className={`h-7 justify-center rounded border px-2.5 ${isPublic ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#e5e7eb] bg-[#f3f4f6]"}`}
        style={{ opacity: update.isPending ? 0.5 : 1 }}
      >
        <Text className={`font-syne-bold text-[10px] ${isPublic ? "text-[#2563eb]" : "text-[#6b7280]"}`}>
          {isPublic ? "PUBLIC" : "PRIVATE"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/** One collection you hold items from: its name, "4 / 8 owned", a progress bar, and what is missing. */
function CollectionRow({
  collectionId,
  owned,
  image,
  artist,
}: {
  collectionId: string;
  owned: number;
  image: string | null;
  artist: string | null;
}) {
  const total = useCollectionTotal(collectionId);
  // The collection's own name exists only when it has a reward; otherwise the artist stands in.
  const teaser = useRewardTeaser(collectionId).data;
  const title = teaser?.collection.name ?? (artist ? `${artist} collection` : "Collection");
  const cover = teaser?.collection.heroImageUrl ?? image;

  const count = Math.max(total ?? owned, owned);
  const pct = count > 0 ? Math.round((owned / count) * 100) : 0;
  const missing = Math.max(0, count - owned);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: "/collection/[collectionId]", params: { collectionId } } as never)}
      className="flex-row items-center gap-3 rounded-lg bg-white p-2.5"
    >
      <Image
        source={{ uri: cover ?? COLLECTION_PLACEHOLDER_IMAGE }}
        style={{ width: 76, height: 76, borderRadius: 4, backgroundColor: "#e5e7eb" }}
        contentFit="cover"
      />
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text numberOfLines={1} className="flex-1 font-syne-bold text-[16px] text-[#111827]">{title}</Text>
          <ChevronRight size={18} color="#4b5563" />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="font-syne text-[12px] text-[#6b7280]">{owned} / {count} owned</Text>
          <Text className="font-syne-bold text-[12px] text-[#111827]">{pct}%</Text>
        </View>
        <View className="h-[5px] overflow-hidden rounded-full bg-[#e5e7eb]">
          <View className="h-full rounded-full bg-black" style={{ width: `${pct}%` }} />
        </View>
        <Text className="font-syne text-[10.5px] text-[#6b7280]">{missing === 0 ? "Complete" : `${missing} missing`}</Text>
      </View>
    </TouchableOpacity>
  );
}
