import { useLocalSearchParams } from "expo-router";
import React from "react";

import RewardDetailScreen from "@/features/rewards/screens/RewardDetailScreen";

/** One unlocked reward and its files. */
export default function RewardDetailRoute() {
    const { rewardId } = useLocalSearchParams<{ rewardId?: string }>();
    return <RewardDetailScreen rewardId={rewardId ? String(rewardId) : undefined} />;
}
