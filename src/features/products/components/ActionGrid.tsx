import { ArrowLeftRight, Gift, PlayCircle, Share2, ShoppingCart } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const PURPLE = "#a855f7";

const ACTIONS = [
  {
    id: "experience",
    icon: PlayCircle,
    title: "View Experience",
    description: "Unlock exclusive content",
  },
  {
    id: "rewards",
    icon: Gift,
    title: "View Rewards",
    description: "See eligible rewards",
  },
  {
    id: "marketplace",
    icon: ShoppingCart,
    title: "List on Marketplace",
    description: "Sell or trade this item",
  },
  {
    id: "share",
    icon: Share2,
    title: "Share Item",
    description: "Show off your collection",
  },
  {
    id: "transfer",
    icon: ArrowLeftRight,
    title: "Transfer",
    description: "Send to another collector",
  },
];

interface ActionGridProps {
  /** Opens the OS share sheet for this product. The other tiles are still UI-only. */
  onShare?: () => void;
}

export default function ActionGrid({ onShare }: ActionGridProps) {
  return (
    // No top margin: the parent owns the gap to the section above, so adding one
    // here doubled it.
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
        className="flex-row"
      >
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          const isShare = action.id === "share";
          return (
            <TouchableOpacity
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              className="mr-3 w-[102px] bg-[#110e16]/30 border border-white/5 rounded-[20px] p-3 items-center justify-between h-[120px]"
              onPress={
                isShare && onShare
                  ? onShare
                  : () => console.log(`${action.title} pressed`)
              }
            >
              {/* Icon Container */}
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#a855f7]/10">
                <Icon size={18} color={PURPLE} />
              </View>

              {/* Text Info */}
              <View className="items-center gap-0.5">
                <Text 
                  className="text-[9px] font-black text-white text-center" 
                  numberOfLines={2}
                >
                  {action.title}
                </Text>
                <Text 
                  className="text-[8px] text-zinc-500 text-center leading-[11px]" 
                  numberOfLines={2}
                >
                  {action.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
