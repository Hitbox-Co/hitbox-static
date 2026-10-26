import {
  Calendar,
  DollarSign,
  Gem,
  Hash,
  Package,
  Star,
  Tag
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

import { PRODUCT_HERO_HEIGHT } from "./TourCard";

const PURPLE = "#a855f7";

interface InfoRowProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  valueElement?: React.ReactNode;
  valueStyle?: string;
}

function InfoRow({
  icon,
  title,
  value,
  valueElement,
  valueStyle = "text-white",
}: InfoRowProps) {
  return (
    <View className="mb-1.5 flex-row items-start justify-between">
      <View className="flex-row items-center pt-0.5">
        <View className="w-5 items-center justify-center">
          {icon}
        </View>
        <Text className="ml-2.5 text-[12px] text-zinc-400 font-medium">
          {title}
        </Text>
      </View>

      {valueElement ? (
        valueElement
      ) : (
        <Text className={`text-[12px] font-bold text-right ${valueStyle}`}>
          {value}
        </Text>
      )}
    </View>
  );
}

interface TourHeaderDetailsProps {
  title: string;
  subtitle: string;
  itemSubtitle: string;
  description: string;
  itemType: string;
  cardNo?: string;
  rarity: string;
  collection?: string;
  collectionSub?: string;
  ownedSince?: string;
  /** Label for the date row — e.g. "Released" for catalog items. */
  dateLabel?: string;
  /** Already-formatted price, e.g. "$149.99". */
  price?: string;
  /** Already-formatted points, e.g. "4,500 pts". */
  rewardPoints?: string;
}

export default function TourHeaderDetails({
  title,
  subtitle,
  itemSubtitle,
  description,
  itemType,
  cardNo,
  rarity,
  collection,
  collectionSub,
  ownedSince,
  dateLabel = "Owned Since",
  price,
  rewardPoints,
}: TourHeaderDetailsProps) {
  return (
    // Matches the image exactly, so `justify-between` spreads the two blocks
    // across the same height the hero row already has.
    <View className="ml-5 flex-1 justify-between pt-0 pb-1" style={{ height: PRODUCT_HERO_HEIGHT }}>
      {/* Top Details Block */}
      <View className="gap-y-1">
        {/* Verification Badge */}
        {/* <View className="mb-1 flex-row items-center">
          <ShieldCheck
            size={14}
            color={PURPLE}
          />
          <Text className="ml-1.5 text-[9px] font-black uppercase tracking-wider text-[#a855f7]">
            VERIFIED & AUTHENTIC
          </Text>
        </View> */}

        {/* Album / Band Name */}
        <Text className="text-[26px] font-black text-white leading-tight" numberOfLines={1}>
          {title}
        </Text>

        {/* Tour Subtitle */}
        <Text className="mt-0.5 text-[14px] font-black text-[#a855f7] tracking-wide" numberOfLines={1}>
          {subtitle}
        </Text>

        {/* Item Subtitle */}
        {/* <Text className="mt-0.5 text-[13px] font-semibold text-zinc-300" numberOfLines={1}>
          {itemSubtitle}
        </Text> */}

        {/* Description */}
        {/* <Text className="mt-2 text-[11px] leading-[17px] text-zinc-400 font-medium" numberOfLines={3}>
          {description}
        </Text> */}
      </View>

      {/* Bottom Specs Block */}
      <View className="border-t border-white/5 py-3 gap-y-1">
        <InfoRow
          icon={<Tag size={14} color={PURPLE} />}
          title="Item Type"
          value={itemType}
        />

        {cardNo && (
          <InfoRow
            icon={<Hash size={14} color={PURPLE} />}
            title="Card/Item Number"
            value={cardNo}
          />
        )}

        <InfoRow
          icon={<Star size={14} color={PURPLE} />}
          title="Rarity"
          value={rarity}
          valueStyle="text-[#a855f7]"
        />

        {price && (
          <InfoRow
            icon={<DollarSign size={14} color={PURPLE} />}
            title="Price"
            value={price}
          />
        )}

        {rewardPoints && (
          <InfoRow
            icon={<Gem size={14} color={PURPLE} />}
            title="Reward Points"
            value={rewardPoints}
            valueStyle="text-[#a855f7]"
          />
        )}

        {collection && (
          <InfoRow
            icon={<Package size={14} color={PURPLE} />}
            title="Collection"
            valueElement={
              <View className="items-end gap-0.5">
                <Text className="text-[12px] font-bold text-[#a855f7] text-right">
                  {collection}
                </Text>
                {collectionSub && (
                  <Text className="text-[11px] font-black text-[#a855f7] text-right">
                    {collectionSub}
                  </Text>
                )}
              </View>
            }
          />
        )}

        {ownedSince && (
          <InfoRow
            icon={<Calendar size={14} color={PURPLE} />}
            title={dateLabel}
            value={ownedSince}
          />
        )}
      </View>
    </View>
  );
}
