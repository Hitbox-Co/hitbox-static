import { router } from "expo-router";
import { ArrowLeft, MoreHorizontal, SearchX, Share2 } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  type AlertButton,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProduct } from "@/features/products/api/getProduct";
import AboutSection from "@/features/products/components/AboutSection";
import ActionGrid from "@/features/products/components/ActionGrid";
import TabSection from "@/features/products/components/TabSection";
import TourCard from "@/features/products/components/TourCard";
import TourHeaderDetails from "@/features/products/components/TourHeaderDetails";
import {
  formatCategory,
  formatDate,
  formatMarketplaceBadge,
  formatPrice,
  formatRarity,
  formatRewardPoints,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "@/features/products/utils/format";
import { shareProduct } from "@/features/products/utils/share";
import { ApiRequestError } from "@/lib/api";


interface TourScreenProps {
  tourId?: string | string[];
}

export default function TourScreen({ tourId }: TourScreenProps) {

  const productId = Array.isArray(tourId) ? tourId[0] : tourId;
  // Cards are lightweight — this screen owns the full-detail fetch
  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);

  const isNotFound =
    error instanceof ApiRequestError && error.error.code === 'PRODUCTS_NOT_FOUND';

  // unitsSold as a share of total inventory, for the supply ring
  const soldPercentage = product && product.inventoryUnit > 0
    ? Math.min(100, Math.round((product.unitsSold / product.inventoryUnit) * 100))
    : 0;

  /** Opens the OS share sheet — used by the nav icon and the Share Item tile. */
  const handleShare = () => {
    if (!product) return;
    void shareProduct(product);
  };

  /**
   * Overflow menu. Built from actions that actually exist rather than a menu of
   * placeholders: verifying goes to the public authenticity check for this
   * product's own tag, and help goes to the support screen.
   */
  const handleMore = () => {
    if (!product) return;

    const actions: AlertButton[] = [];

    // Only products that carry an NFC tag can be verified.
    if (product.tagId) {
      actions.push({
        text: "Verify authenticity",
        onPress: () =>
          router.push({
            pathname: "/verify/[tagId]",
            params: { tagId: product.tagId as string },
          }),
      });
    }

    actions.push({ text: "Share item", onPress: handleShare });
    actions.push({ text: "Get help with this item", onPress: () => router.push("/support") });
    actions.push({ text: "Cancel", style: "cancel" });

    Alert.alert(product.name, undefined, actions, { cancelable: true });
  };

  return (
    // flex-1 is required all the way down — without it the containers have
    // zero height and the screen renders blank
    <SafeAreaView
      // No bottom edge: this route lives under (tabs), and the tab bar already
      // reserves the safe area below.
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >

      <View className="flex-1 bg-background">

        {/* Top Absolute Custom Navigation Header */}
        <View
          className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-6 pt-2 pb-3"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/5 active:bg-black/60"
          >
            <ArrowLeft size={18} color="white" />
          </TouchableOpacity>

          <View className="flex-row gap-2">
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Share this item"
              // Nothing to share until the product has loaded.
              disabled={!product}
              onPress={handleShare}
              className={`h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/5 active:bg-black/60 ${product ? '' : 'opacity-40'}`}
            >
              <Share2 size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="More actions for this item"
              // Nothing to act on until the product has loaded.
              disabled={!product}
              onPress={handleMore}
              className={`h-10 w-10 items-center justify-center rounded-full bg-black/40 border border-white/5 active:bg-black/60 ${product ? '' : 'opacity-40'}`}
            >
              <MoreHorizontal size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}

        {isError && !isLoading && (
          <View className="flex-1 items-center justify-center px-8">
            <SearchX size={36} color="#52525b" />
            <Text className="mt-4 text-zinc-400 text-sm text-center">
              {isNotFound
                ? "This product doesn't exist or is no longer available."
                : "Couldn't load this product. Check your connection."}
            </Text>
            {isNotFound ? (
              <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-4 py-2 rounded-xl">
                <Text className="text-white font-semibold text-sm">Go Back</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => refetch()} className="mt-4 bg-primary px-4 py-2 rounded-xl">
                <Text className="text-white font-semibold text-sm">Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {product && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 64, // keeps content clear of the absolute nav header
              // The tab bar already reserves its own space below; this is just
              // breathing room under the last tile.
              paddingBottom: 40,
            }}
            className="flex-1"
          >
            {/* Main Header Split Section */}
            <View className="flex-row px-5 pt-2 pb-4 items-stretch justify-between bg-[#08060b]">
              <TourCard
                image={product.images[0]?.url ?? PRODUCT_PLACEHOLDER_IMAGE}
                badge={formatMarketplaceBadge(product.marketplaceStatus)}
              />
              <TourHeaderDetails
                title={product.collection?.artist.name ?? product.name}
                subtitle={product.collection ? product.name : formatCategory(product.category)}
                itemSubtitle={formatCategory(product.category)}
                description={product.description ?? ''}
                itemType={formatCategory(product.category)}
                cardNo={`#${String(product.productCode).slice(-4)}`}
                rarity={formatRarity(product.rarity)}
                collection={product.collection?.name}
                collectionSub={product.collection?.artist.name}
                ownedSince={formatDate(product.releaseDate ?? product.createdAt) ?? undefined}
                dateLabel="Released"
                price={formatPrice(product.priceInDollars)}
                rewardPoints={formatRewardPoints(product.rewardPoints)}
              />
            </View>

            {/* Tab Section containing details content */}
            <TabSection
              tourId={tourId}
              renderActiveContent={() => (
                // Single source of the gap between About and the action tiles —
                // ActionGrid used to add its own mt-6 on top of this.
                <View className="gap-y-5">
                  {/* About and stats section */}
                  <AboutSection
                    aboutText={product.description ?? 'No description available for this item yet.'}
                    rarity={formatRarity(product.rarity)}
                    supply={product.inventoryUnit}
                    ownedPercentage={soldPercentage}
                  />

                  {/* Action grid (Experience, Rewards, List, etc) */}
                  <ActionGrid onShare={handleShare} />
                </View>
              )}
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
