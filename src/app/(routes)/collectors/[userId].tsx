import { useLocalSearchParams } from "expo-router";
import React from "react";

import CollectorProfileScreen from "@/features/profile/screens/CollectorProfileScreen";

/** A collector's profile page (public or private). */
export default function CollectorProfileRoute() {
    const { userId } = useLocalSearchParams<{ userId?: string }>();
    return <CollectorProfileScreen userId={userId ? String(userId) : undefined} />;
}
