import { router, useIsFocused } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Heart,
  SearchX,
  Share2,
  ShoppingBag,
  Star,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProduct } from "@/features/products/api/getProduct";
import {
  formatCategory,
  formatDate,
  formatPrice,
  formatRarity,
  formatRewardPoints,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "@/features/products/utils/format";
import { shareProduct } from "@/features/products/utils/share";
import { ApiRequestError } from "@/lib/api";
import { ProductRarity } from "../types/product";

interface TourScreenProps {
  tourId?: string | string[];
}

/** Rarity chip colours. RARE is the green from the Figma drop-detail frame. */
const RARITY_STYLES: Record<ProductRarity, { bg: string; border: string; text: string }> = {
  COMMON: { bg: "#f3f4f6", border: "#d1d5db", text: "#6b7280" },
  UNCOMMON: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.38)", text: "#22c55e" },
  RARE: { bg: "#b6ffd6", border: "rgba(24,116,69,0.4)", text: "#0fab48" },
  EPIC: { bg: "#ede9fe", border: "rgba(124,58,237,0.35)", text: "#7c3aed" },
  LEGENDARY: { bg: "#fff4d6", border: "rgba(217,119,6,0.4)", text: "#d97706" },
  EXCLUSIVE: { bg: "#ffe4e6", border: "rgba(225,29,72,0.35)", text: "#e11d48" },
};

/**
 * Drop detail — the light "Y2K" layout from the UX-DESIGN Figma file
 * (HitBox · Drop detail), filled from `GET /products/:id`.
 *
 * Shared by the Discover and Marketplace stacks (see the route comments).
 * The Figma's cart, Add to Cart and Buy Now have no backend behind them — this
 * app claims and verifies items by NFC tap — so the actions here are the real
 * ones: claim / verify, and share.
 */
export default function TourScreen({ tourId }: TourScreenProps) {
  const productId = Array.isArray(tourId) ? tourId[0] : tourId;
  // Cards are lightweight — this screen owns the full-detail fetch
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const [imageIndex, setImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  const isNotFound =
    error instanceof ApiRequestError && error.error.code === "PRODUCTS_NOT_FOUND";

  /** Opens the OS share sheet. */
  const handleShare = () => {
    if (!product) return;
    void shareProduct(product);
  };

  const artworkSize = width - 40;
  const innerSize = artworkSize - 2; // inside the 1px border
  const images = product?.images.length
    ? product.images.map((img) => img.url)
    : [PRODUCT_PLACEHOLDER_IMAGE];

  const onArtworkScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setImageIndex(Math.round(e.nativeEvent.contentOffset.x / innerSize));
  };

  const price = product ? formatPrice(product.priceInDollars) : undefined;
  const points = product ? formatRewardPoints(product.rewardPoints) : null;
  const rarityLabel = product ? formatRarity(product.rarity) : null;
  const rarityStyle = product?.rarity ? RARITY_STYLES[product.rarity] : null;
  const artist = product?.collection?.artist;
  const released = product ? formatDate(product.releaseDate ?? product.createdAt) : null;

  return (
    // flex-1 is required all the way down — without it the containers have
    // zero height and the screen renders blank
    <SafeAreaView
      // No bottom edge: this route lives under (tabs), and the tab bar already
      // reserves the safe area below.
      edges={["top", "left", "right"]}
      className="flex-1 bg-white"
    >
      {isFocused && <StatusBar style="dark" />}

      {/* Navigation: back · brand · (spacer keeps the brand centred) */}
      <View className="h-14 flex-row items-center justify-between border-b border-[#dbeafe] px-5">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          className="size-9 items-center justify-center rounded bg-[#eff6ff]"
        >
          <ArrowLeft size={18} color="#111827" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-[7px]">
          <Image
            source={require("@/assets/images/HitBoxLogo-dark.png")}
            resizeMode="contain"
            style={{ width: 22, height: 22 }}
          />
          <Text className="font-orbitron text-[15px] text-black">HitBox</Text>
        </View>
        <View className="size-9" />
      </View>

      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {isError && !isLoading && (
        <View className="flex-1 items-center justify-center px-8">
          <SearchX size={36} color="#9ca3af" />
          <Text className="mt-4 text-center font-syne text-sm text-[#6b7280]">
            {isNotFound
              ? "This product doesn't exist or is no longer available."
              : "Couldn't load this product. Check your connection."}
          </Text>
          <TouchableOpacity
            onPress={() => (isNotFound ? router.back() : refetch())}
            className="mt-4 rounded-[30px] bg-[#111827] px-5 py-2"
          >
            <Text className="font-syne-bold text-[13px] text-white">
              {isNotFound ? "Go Back" : "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {product && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          // Room under the last row for the floating tab bar.
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 128, paddingHorizontal: 20 }}
        >
          <View className="gap-6">
            <View className="gap-[18px]">
              {/* Page context */}
              <View className="flex-row items-center justify-between">
                <Text className="font-syne text-[11px] text-[#6b7280]">
                  {`Discover / ${formatCategory(product.category)}`}
                </Text>
                <Text className="font-orbitron text-[8px] tracking-[0.7px] text-[#2563eb]">DROP DETAIL</Text>
              </View>

              {/* Artwork — swipe through the product's images */}
              <View
                style={{
                  width: artworkSize,
                  height: artworkSize,
                  borderWidth: 1,
                  borderColor: "#dbeafe",
                  borderRadius: 4,
                  overflow: "hidden",
                  backgroundColor: "#eef2ff",
                }}
              >
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={onArtworkScroll}
                >
                  {images.map((uri, i) => (
                    <Image
                      key={`${uri}-${i}`}
                      source={{ uri }}
                      resizeMode="cover"
                      style={{ width: innerSize, height: innerSize }}
                    />
                  ))}
                </ScrollView>

                <View className="absolute right-[11px] top-[11px] flex-row items-center gap-3">
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={saved ? "Remove from saved" : "Save"}
                    hitSlop={8}
                    onPress={() => setSaved((v) => !v)}
                  >
                    <Heart
                      size={16}
                      color={saved ? "#ef4444" : "#111827"}
                      fill={saved ? "#ef4444" : "transparent"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Share this item"
                    hitSlop={8}
                    onPress={handleShare}
                    className="size-8 items-center justify-center rounded"
                  >
                    <Share2 size={16} color="#111827" />
                  </TouchableOpacity>
                </View>

                {/* Corner registration mark */}
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    left: 11,
                    bottom: 11,
                    width: 12,
                    height: 12,
                    borderLeftWidth: 1,
                    borderBottomWidth: 1,
                    borderColor: "rgba(255,255,255,0.8)",
                  }}
                />

                {images.length > 1 && (
                  <View
                    pointerEvents="none"
                    className="absolute bottom-3 right-[22px] flex-row items-center gap-[5px]"
                  >
                    {images.map((_, i) => (
                      <View
                        key={i}
                        className={
                          i === imageIndex
                            ? "h-[6px] w-5 rounded bg-[#111827]"
                            : "size-[6px] rounded bg-[#6b7280]"
                        }
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Identity */}
              <View className="gap-2">
                <Text className="font-syne-bold text-[28px] leading-[32px] text-[#111827]">
                  {product.name}
                </Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-[5px]">
                    <Text className="font-syne-medium text-[13px] text-[#2563eb]">
                      {product.collection?.name ?? artist?.name ?? formatCategory(product.category)}
                    </Text>
                    <ChevronRight size={12} color="#2563eb" />
                  </View>
                  {/* Units sold of total supply (the Figma's "042 / 100" slot) */}
                  {product.inventoryUnit > 0 && (
                    <Text
                      accessibilityLabel={`${product.unitsSold} of ${product.inventoryUnit} sold`}
                      className="font-syne text-xs text-[#6b7280]"
                    >
                      <Text className="text-[#ffb703]">{String(product.unitsSold).padStart(3, "0")}</Text>
                      {` / ${product.inventoryUnit}`}
                    </Text>
                  )}
                </View>
              </View>

              {/* Price, rarity and reward points */}
              <View className="flex-row items-center justify-between gap-2">
                <Text className="font-syne-bold text-[28px] text-[#111827]">{price ?? "—"}</Text>
                <View className="flex-row items-center gap-2">
                  {rarityLabel && rarityStyle && (
                    <View
                      className="h-7 justify-center rounded border px-[10px]"
                      style={{ backgroundColor: rarityStyle.bg, borderColor: rarityStyle.border }}
                    >
                      <Text
                        className="font-syne-bold text-[10px]"
                        style={{ color: rarityStyle.text }}
                      >
                        {rarityLabel.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  {points && (
                    <View className="flex-row items-center gap-[5px] rounded bg-[#fffaed] px-[10px] py-[7px]">
                      <Star size={13} color="#f5b301" fill="#f5b301" />
                      <Text className="font-syne-semibold text-xs text-[#2563eb]">{points}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Purchase actions (Figma). MOCK: there is no cart or checkout
                backend yet, so both buttons only say so. */}
            <View className="gap-3">
              <View className="flex-row gap-[10px]">
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Add to cart"
                  activeOpacity={0.85}
                  onPress={() => Alert.alert("Cart coming soon", "Adding to a cart isn't available yet.")}
                  className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                  <Text className="font-syne-bold text-[13px] text-[#2563eb]">Add to Cart</Text>
                  <ShoppingBag size={16} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Buy now"
                  activeOpacity={0.85}
                  onPress={() => Alert.alert("Checkout coming soon", "Buying isn't available yet.")}
                  className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-[30px] border border-[#2563eb] bg-[#2563eb]"
                >
                  <Text className="font-syne-bold text-[13px] text-white">Buy Now</Text>
                  <ArrowUpRight size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* The real way to own an item: tap its NFC tag. Only tagged items. */}
              {product.tagId && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={
                    product.claimedStatus === "UNCLAIMED" ? "Scan to claim" : "Verify authenticity"
                  }
                  activeOpacity={0.7}
                  onPress={() =>
                    product.claimedStatus === "UNCLAIMED"
                      ? router.push("/scan")
                      : router.push({ pathname: "/scan", params: { mode: "verify" } })
                  }
                  className="flex-row items-center justify-center gap-[5px] py-1"
                >
                  <Text className="font-syne-semibold text-xs text-[#2563eb]">
                    {product.claimedStatus === "UNCLAIMED" ? "Have the item? Scan to claim" : "Verify this item"}
                  </Text>
                  <ArrowUpRight size={13} color="#2563eb" />
                </TouchableOpacity>
              )}
            </View>

            {/* Drop information */}
            <View className="gap-6">
              <View className="h-px w-full bg-[#e5e7eb]" />

              <View className="gap-3">
                <SectionHeading title="About this drop" />
                <Text className="font-syne text-[13px] leading-[20px] text-[#374151]">
                  {product.description ?? "No description available for this item yet."}
                </Text>
              </View>

              <View className="gap-2">
                <SectionHeading title="The details" />
                <View>
                  {artist && <DetailRow label="Creator" value={artist.name} />}
                  <DetailRow label="Item Type" value={formatCategory(product.category)} />
                  <DetailRow label="Item Code" value={product.productCode} />
                  {product.collection && <DetailRow label="Collection" value={product.collection.name} />}
                  {released && <DetailRow label="Released" value={released} />}
                </View>
              </View>

              {points && (
                <View className="flex-row items-center gap-3 rounded border border-[#dbeafe] bg-[#eff6ff] p-[14px]">
                  <View className="size-8 items-center justify-center rounded bg-white">
                    <Star size={18} color="#f5b301" />
                  </View>
                  <View className="flex-1 gap-1">
                    <Text className="font-syne-bold text-xs text-[#2563eb]">
                      {`Collect this drop. Earn ${points}.`}
                    </Text>
                    <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                      Redeem points for VIP experiences on HitBox.
                    </Text>
                  </View>
                </View>
              )}

              {/* Always shown, as in the Figma. A drop with no artist on record falls
                  back to its collection (or the brand) and has no profile to open. */}
              <View className="h-[42px] flex-row items-center justify-between">
                <View className="gap-1">
                  <Text className="font-syne text-[10px] text-[#6b7280]">THE CREATOR</Text>
                  <Text className="font-syne-bold text-base text-[#111827]">
                    {artist?.name ?? product.collection?.name ?? "HitBox"}
                  </Text>
                </View>
                {artist && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`View ${artist.name}'s profile`}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: "/artists/[artistId]",
                        params: { artistId: artist.id },
                      })
                    }
                    className="flex-row items-center gap-[5px]"
                  >
                    <Text className="font-syne-semibold text-[11px] text-[#2563eb]">View profile</Text>
                    <ArrowUpRight size={14} color="#2563eb" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="flex-1 font-orbitron text-base text-[#111827]">{title}</Text>
      <Text className="font-orbitron text-[9px] text-[#3b82f6]">{"//"}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="h-[37px] flex-row items-center justify-between border-b border-[#dbeafe]">
      <Text className="font-syne text-xs text-[#6b7280]">{label}</Text>
      <Text numberOfLines={1} className="ml-4 shrink font-syne-medium text-xs text-[#111827]">
        {value}
      </Text>
    </View>
  );
}
