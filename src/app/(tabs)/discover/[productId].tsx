import { useLocalSearchParams } from "expo-router";
import React from "react";

import TourScreen from "@/features/products/screens/TourScreen";

/**
 * Product detail, inside the Discover stack.
 *
 * The same screen is also mounted at `(tabs)/marketplace/[tourId]`. The route is
 * duplicated on purpose: pushing the marketplace one from a Discover card would
 * navigate into another tab's stack, which switches the active tab — tapping a
 * Top Creators card used to drop the user in Marketplace. A card opens the copy
 * belonging to its own tab so the tab it was opened from stays selected.
 */
export default function DiscoverProductRoute() {
    const { productId } = useLocalSearchParams<{ productId: string }>();
    return <TourScreen tourId={productId} />;
}
