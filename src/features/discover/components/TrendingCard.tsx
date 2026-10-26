import { Heart } from "lucide-react-native";
import React, { useState } from "react";
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
const CARD_WIDTH = width * 0.38;

interface TrendingCardProps {
  item: DiscoverProductItem;
  index: number;
  onPress?: () => void;
}

const TrendingCard: React.FC<TrendingCardProps> = ({
  item,
  index,
  onPress,
}) => {
  const [liked, setLiked] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        width: CARD_WIDTH,
        backgroundColor: "#13101C",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
      className="mr-3 overflow-hidden"
    >
      {/* Artwork Image */}
      <View
        className="relative overflow-hidden bg-[#0E0E12]"
        style={{ aspectRatio: 1 }}
      >
        <Image
          source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
          className="h-full w-full"
          resizeMode="cover"
        />


        {/* Heart Wishlist Button Top Right */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Heart
            size={14}
            color={liked ? "#EF4444" : "#FFFFFF"}
            fill={liked ? "#EF4444" : "transparent"}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View className="p-3">
        <Text
          numberOfLines={2}
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: "#FFFFFF",
            lineHeight: 17,
          }}
        >
          {item.name}
        </Text>

        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: "#A855F7",
            marginTop: 6,
          }}
        >
          {formatRewardPoints(item.rewardPoints)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TrendingCard;

