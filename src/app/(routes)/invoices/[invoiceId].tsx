import { useLocalSearchParams } from "expo-router";
import React from "react";

import InvoiceDetailScreen from "@/features/invoices/screens/InvoiceDetailScreen";

/** One invoice, with the PDF download. */
export default function InvoiceDetailRoute() {
    const { invoiceId } = useLocalSearchParams<{ invoiceId?: string }>();
    return <InvoiceDetailScreen invoiceId={invoiceId ? String(invoiceId) : undefined} />;
}
