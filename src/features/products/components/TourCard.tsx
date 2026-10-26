import { Check } from "lucide-react-native";
import React from "react";
import { Image, Text, View } from "react-native";

/**
 * Height of the detail screen's hero row. Owned here because the image defines
 * it, and imported by `TourHeaderDetails` so the two columns can't drift apart —
 * they previously disagreed (320 vs 288), leaving dead space beside the image.
 */
export const PRODUCT_HERO_HEIGHT = 272;

interface TourCardProps {
  image: any;
  /** "NEW" / "HOT" from `formatMarketplaceBadge`; nothing renders when null. */
  badge?: string | null;
}

export default function TourCard({ image, badge }: TourCardProps) {
  // Ensure we fall back to a default URI if image is not formatted as source object
  const imageSource = typeof image === "string" ? { uri: image } : image;

  return (
    <View className="w-[155px] relative">
      <View className="overflow-hidden rounded-[22px] border-[2px] border-primary relative">
        <Image
          source={imageSource}
          resizeMode="cover"
          className="w-full"
          style={{ height: PRODUCT_HERO_HEIGHT }}
        />

        {/* Curation badge — same top-left placement and styling the discover and
            marketplace cards use, so the product looks consistent either side of
            the tap. */}
        {badge && (
          <View className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2.5 py-1 z-20">
            <Text className="text-[9px] font-black tracking-wide text-white">{badge}</Text>
          </View>
        )}

        {/* Verified Green Check Badge positioned inside the image bottom right */}
        <View 
          className="absolute bottom-2.5 right-2.5 h-7 w-7 items-center justify-center rounded-full bg-emerald-500 border-2 border-background shadow-lg shadow-black/50 z-20"
        >
          <Check
            size={13}
            color="white"
            strokeWidth={4.5}
          />
        </View>
      </View>
    </View>
  );
}
