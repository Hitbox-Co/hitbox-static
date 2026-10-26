import { Gem } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { DiscoverProductItem } from "../types/discover";
import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from "../utils/format";

/**
 * Two-column grid card for the "See All" screen — the vertical counterpart to
 * `ReleaseCard`, which is sized for the horizontal feed rows.
 */
export default function ProductGridCard({
  item,
  onPress,
}: {
  item: DiscoverProductItem;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-[#17171C]"
    >
      <View className="relative overflow-hidden bg-[#0E0E12]" style={{ aspectRatio: 1 }}>
        <Image
          source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
          className="h-full w-full"
          resizeMode="cover"
        />
      </View>

      <View className="p-3">
        <Text numberOfLines={2} className="text-[13px] font-bold text-white">
          {item.name}
        </Text>

        <View className="mt-2 flex-row items-center">
          <Gem size={12} color="#A855F7" fill="#A855F7" />
          <Text className="ml-1 text-[11px] font-semibold text-violet-400">
            {formatRewardPoints(item.rewardPoints)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
