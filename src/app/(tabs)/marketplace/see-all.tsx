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
// There is no price sort: price lives in a per-market table.
const SORTS: MarketplaceSort[] = ["newest", "popular"];

/** Only forward values the endpoint accepts; anything else falls back to defaults. */
function normalize<T extends string>(allowed: T[], value?: string): T | undefined {
    return allowed.find((option) => option === value);
}

export default function MarketplaceSeeAllRoute() {
    const { category, sort, featured, title } = useLocalSearchParams<{
        category?: string;
        sort?: string;
        featured?: string;
        title?: string;
    }>();

    return (
        <AllListingsScreen
            category={normalize(CATEGORIES, category)}
            sort={normalize(SORTS, sort)}
            // `featured` takes only the literal strings "true" / "false".
            featured={featured === "true" ? true : undefined}
            title={title ? String(title) : undefined}
        />
    );
}
