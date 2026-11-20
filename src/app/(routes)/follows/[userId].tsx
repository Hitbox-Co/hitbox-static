import { useLocalSearchParams } from "expo-router";
import React from "react";

import FollowsScreen from "@/features/follows/screens/FollowsScreen";

/** Followers / Following for one collector. `?tab=followers|following|artists`. */
export default function FollowsRoute() {
    const { userId, tab } = useLocalSearchParams<{ userId?: string; tab?: string }>();
    const initialTab = tab === "following" || tab === "artists" ? tab : "followers";
    return <FollowsScreen userId={userId ? String(userId) : undefined} initialTab={initialTab} />;
}
