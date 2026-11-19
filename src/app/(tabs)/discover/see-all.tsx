import { useLocalSearchParams } from "expo-router";
import React from "react";

import AllProductsScreen from "@/features/discover/screens/AllProductsScreen";
import { DiscoverCategory, DiscoverSection } from "@/features/discover/types/discover";

const SECTIONS: DiscoverSection[] = ["featured", "trending", "new_releases"];
const CATEGORIES: DiscoverCategory[] = ["cards", "figures", "apparel", "posters", "digital", "other"];

/** Only pass a `section` the endpoint accepts; anything else lists everything. */
function normalizeSection(value?: string): DiscoverSection | undefined {
    return SECTIONS.find((section) => section === value);
}

/** Same for the category chip carried over from the Discover screen. */
function normalizeCategory(value?: string): DiscoverCategory | undefined {
    return CATEGORIES.find((category) => category === value);
}

export default function DiscoverSeeAllRoute() {
    const { section, title, category } = useLocalSearchParams<{ section?: string; title?: string; category?: string }>();

    return (
        <AllProductsScreen
            section={normalizeSection(section)}
            category={normalizeCategory(category)}
            title={title ? String(title) : undefined}
        />
    );
}
