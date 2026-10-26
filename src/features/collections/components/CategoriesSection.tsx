import React, { useCallback } from "react";
import { FlatList, View } from "react-native";

import CategoryChips from "./CategoryChips";

interface Category {
  id: string;
  title: string;
}

/** Chip the screen falls back to — "All". */
export const DEFAULT_COLLECTION_CATEGORY = "all";

const CATEGORIES: Category[] = [
  { id: "all", title: "All" },
  { id: "cards", title: "Cards" },
  { id: "figures", title: "Figures" },
  { id: "apparel", title: "Apparel" },
  { id: "tickets", title: "Tickets" },
  { id: "accessories", title: "Accessories" },
  { id: "other", title: "Other" },
];

/**
 * Controlled on purpose. The selection used to live in here, which meant the
 * screen had no way to clear it — returning to the tab still showed whichever
 * chip was last pressed. The owner holds it now so it can be reset on focus.
 */
export default function CategoriesSection({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryChips
        title={item.title}
        active={selectedId === item.id}
        onPress={() => onSelect(item.id)}
      />
    ),
    [selectedId, onSelect]
  );

  return (
    <FlatList
      horizontal
      data={CATEGORIES}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      // `data` is a module constant, so it never changes identity. Without this
      // the cells have nothing telling them the highlight moved, and a reset of
      // `selectedId` can leave the old chip looking selected.
      extraData={selectedId}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: 4,
        paddingRight: 16,
      }}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      initialNumToRender={7}
      maxToRenderPerBatch={7}
      windowSize={7}
    />
  );
}