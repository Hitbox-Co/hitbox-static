import React from "react";
import {
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { DiscoverProductItem } from "../types/discover";
import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from "../utils/format";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.34;

interface ReleaseCardProps {
  item: DiscoverProductItem;
  /** Shows the "NEW" ribbon — on for the New Releases section. */
  showNewBadge?: boolean;
  onPress?: () => void;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({
  item,
  showNewBadge = true,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        width: CARD_WIDTH,
        backgroundColor: "#13101C",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
      className="mr-3 overflow-hidden"
    >
      {/* Square Artwork */}
      <View
        className="relative overflow-hidden bg-[#0E0E12]"
        style={{ aspectRatio: 1 }}
      >
        <Image
          source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {showNewBadge && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: "#7C3AED",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text className="text-[9px] font-extrabold text-white">
              NEW
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-2.5">
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: "#FFFFFF",
            lineHeight: 16,
          }}
        >
          {item.name}
        </Text>

        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            color: "#A855F7",
            marginTop: 4,
          }}
        >
          {formatRewardPoints(item.rewardPoints)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ReleaseCard;

