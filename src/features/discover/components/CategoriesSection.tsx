import {
  Crown,
  LucideIcon,
  Star,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import { FlatList } from "react-native";

import CategoryCard from "./CategoryCard";

/**
 * Chip ids double as **section ids** on the Discover screen: pressing a chip
 * scrolls to the section registered under the same id, so these must stay in
 * sync with the `<Section id=…>` wrappers in `DiscoverScreen`.
 */
export type DiscoverCategoryId =
  | "trending"
  | "newReleases"
  | "topCreators"
  | "experiences"
  | "onTour";

interface Category {
  id: DiscoverCategoryId;
  title: string;
  icon: LucideIcon;
}

const categories: Category[] = [
  {
    id: "trending",
    title: "Trending",
    icon: TrendingUp,
  },
  {
    id: "newReleases",
    title: "Latest Releases",
    icon: Star,
  },
  {
    id: "topCreators",
    title: "Top Creators",
    icon: Crown,
  },
];

interface CategoriesSectionProps {
  activeId: DiscoverCategoryId;
  onSelect: (id: DiscoverCategoryId) => void;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  activeId,
  onSelect,
}) => {
  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CategoryCard
          title={item.title}
          Icon={item.icon}
          active={activeId === item.id}
          onPress={() => onSelect(item.id)}
        />
      )}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: 4,
        paddingHorizontal: 0,
      }}
    />
  );
};

export default CategoriesSection;

