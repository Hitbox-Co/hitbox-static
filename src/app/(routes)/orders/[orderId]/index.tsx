import { useLocalSearchParams } from "expo-router";
import React from "react";

import OrderDetailScreen from "@/features/orders/screens/OrderDetailScreen";

/** One order: status steps, payment, refunds and the buttons the server allows. */
export default function OrderDetailRoute() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    return <OrderDetailScreen orderId={orderId ? String(orderId) : undefined} />;
}
