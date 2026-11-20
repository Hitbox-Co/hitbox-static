import { useLocalSearchParams } from "expo-router";
import React from "react";

import PurchaseStoryScreen from "@/features/profile/screens/PurchaseStoryScreen";

/** A collector's newest item as a story card (yours too). Full screen. */
export default function PurchaseStoryRoute() {
    const { userId } = useLocalSearchParams<{ userId?: string }>();
    return <PurchaseStoryScreen userId={userId ? String(userId) : undefined} />;
}
