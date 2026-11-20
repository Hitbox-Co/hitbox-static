import { useLocalSearchParams } from "expo-router";
import React from "react";

import CollectibleScreen from "@/features/collections/screens/CollectibleScreen";

/** One collectible in its collection: owned (verified) or not owned yet. Full screen. */
export default function CollectibleRoute() {
    const { productId, collectionId } = useLocalSearchParams<{ productId?: string; collectionId?: string }>();
    return (
        <CollectibleScreen
            productId={productId ? String(productId) : undefined}
            collectionId={collectionId ? String(collectionId) : undefined}
        />
    );
}
