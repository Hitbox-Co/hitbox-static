import { useLocalSearchParams } from "expo-router";
import React from "react";

import AllProductsScreen from "@/features/discover/screens/AllProductsScreen";
import { DiscoverSection } from "@/features/discover/types/discover";

const SECTIONS: DiscoverSection[] = ["trending", "new_releases", "top_creators"];

/** Only pass a `section` the endpoint accepts; anything else lists everything. */
function normalizeSection(value?: string): DiscoverSection | undefined {
    return SECTIONS.find((section) => section === value);
}

export default function DiscoverSeeAllRoute() {
    const { section, title } = useLocalSearchParams<{ section?: string; title?: string }>();

    return (
        <AllProductsScreen
            section={normalizeSection(section)}
            title={title ? String(title) : undefined}
        />
    );
}
