import { useLocalSearchParams } from "expo-router";
import React from "react";

import RefundScreen from "@/features/payments/screens/RefundScreen";

/** Request a refund / return an item. */
export default function OrderRefundRoute() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    return <RefundScreen orderId={orderId ? String(orderId) : undefined} />;
}
