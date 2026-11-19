import { useLocalSearchParams } from "expo-router";
import React from "react";

import TrackingScreen from "@/features/orders/screens/TrackingScreen";

/** Track parcel: carrier, tracking number and the status timeline. */
export default function OrderTrackingRoute() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    return <TrackingScreen orderId={orderId ? String(orderId) : undefined} />;
}
