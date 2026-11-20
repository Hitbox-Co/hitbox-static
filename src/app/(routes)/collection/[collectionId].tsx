import { useLocalSearchParams } from "expo-router";
import React from "react";

import CollectionDetailScreen from "@/features/collections/screens/CollectionDetailScreen";

/** One artist collection: what you own and what is missing. Full screen. */
export default function CollectionDetailRoute() {
    const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();
    return <CollectionDetailScreen collectionId={collectionId ? String(collectionId) : undefined} />;
}
