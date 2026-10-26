import { Clock3 } from "lucide-react-native";
import React from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.3;

/**
 * Placeholder row for a Discover section with nothing to show — either a feature
 * the backend doesn't serve yet (Experiences, On Tour) or a live section that
 * came back empty.
 *
 * It exists so **every category chip has something to scroll to**: an omitted
 * section would leave its chip dead. Deliberately labelled as not-yet-available
 * rather than dressed up as real items.
 */
export default function ComingSoonRow({
  note = "Nothing here yet — check back soon.",
  cards = 3,
}: {
  note?: string;
  cards?: number;
}) {
  return (
    <View>
      <ScrollView
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {Array.from({ length: cards }).map((_, index) => (
          <View
            key={index}
            style={{ width: CARD_WIDTH, opacity: 1 - index * 0.25 }}
            className="mr-3 overflow-hidden rounded-2xl border border-zinc-800/70 bg-[#121218]"
          >
            <View className="items-center justify-center bg-[#0E0E12]" style={{ aspectRatio: 1 }}>
              <Clock3 size={20} color="#3F3F46" />
            </View>
            <View className="p-2.5">
              <View className="h-2 rounded-full bg-zinc-800" />
              <View className="mt-2 h-2 w-2/3 rounded-full bg-zinc-800/70" />
            </View>
          </View>
        ))}
      </ScrollView>

      <Text className="mt-3 text-[12px] text-zinc-500">{note}</Text>
    </View>
  );
}
