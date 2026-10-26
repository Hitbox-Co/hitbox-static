import { useLocalSearchParams } from "expo-router";
import React from "react";

import AllListingsScreen from "@/features/marketplace/screens/AllListingsScreen";
import { MarketplaceCategory, MarketplaceSort } from "@/features/marketplace/types/marketplace";

const CATEGORIES: MarketplaceCategory[] = [
    "cards",
    "figures",
    "apparel",
    "posters",
    "digital",
    "other",
];
const SORTS: MarketplaceSort[] = ["newest", "price_asc", "price_desc", "popular"];

/** Only forward values the endpoint accepts; anything else falls back to defaults. */
function normalize<T extends string>(allowed: T[], value?: string): T | undefined {
    return allowed.find((option) => option === value);
}

export default function MarketplaceSeeAllRoute() {
    const { category, sort, title } = useLocalSearchParams<{
        category?: string;
        sort?: string;
        title?: string;
    }>();

    return (
        <AllListingsScreen
            category={normalize(CATEGORIES, category)}
            sort={normalize(SORTS, sort)}
            title={title ? String(title) : undefined}
        />
    );
}
