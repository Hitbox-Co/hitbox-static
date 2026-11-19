import React from "react";
import { View } from "react-native";

import { CollectionCardData } from "../utils/mapCollectionItem";
import CollectionCard from "./CollectionCard";

interface CollectionGridProps {
  data: CollectionCardData[];
}

export default function CollectionGrid({ data }: CollectionGridProps) {
  // Chunk the data array into rows of exactly 3 items
  const chunkedData: CollectionCardData[][] = [];
  for (let i = 0; i < data.length; i += 3) {
    chunkedData.push(data.slice(i, i + 3));
  }

  return (
    <View className="gap-y-3">
      {chunkedData.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row gap-x-3">
          {row.map((item) => (
            <CollectionCard key={item.id} item={item} />
          ))}
        </View>
      ))}
    </View>
  );
}
