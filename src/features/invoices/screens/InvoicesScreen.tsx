import { useAuth } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { FileText } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { describeApiError } from '@/lib/api-errors'
import { formatMoney } from '@/features/checkout/utils/money'
import { CheckoutShell, GroupedCard, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { useInvoicesInfinite } from '../api/getInvoices'
import { Invoice, InvoiceStatus } from '../types/invoice'
import { formatInvoiceDate, STATUS_BADGES, summariseLines } from '../utils/format'

/** The status chips. "Superseded" is the buyer's word for CORRECTED. */
const FILTERS: { id: InvoiceStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'ISSUED', label: 'Issued' },
    { id: 'VOID', label: 'Void' },
    { id: 'CORRECTED', label: 'Superseded' },
]

/**
 * My invoices — the buyer's tax invoices (receipts), newest first
 * (`GET /api/v1/invoices`, 20 at a time). Tapping one opens its detail, where the
 * PDF can be downloaded.
 */
export default function InvoicesScreen() {
    const { isLoaded, isSignedIn } = useAuth()
    const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all')

    const invoices = useInvoicesInfinite({ status: filter === 'all' ? undefined : filter })
    const items = invoices.data?.pages.flatMap((page) => page.data) ?? []
    const total = invoices.data?.pages[0]?.meta.total ?? 0

    if (isLoaded && !isSignedIn) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="My invoices" subtitle="Sign in to see your receipts." />
                <View className="mt-10 items-center">
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => router.push('/(auth)/register' as never)}
                        className="rounded-[30px] bg-[#111827] px-6 py-3"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">Sign in</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell showBag={false}>
            <PageIntro
                title="My invoices"
                subtitle={total > 0 ? `${total} receipt${total === 1 ? '' : 's'}` : 'Your tax invoices and receipts.'}
            />

            <View className="flex-row flex-wrap gap-2">
                {FILTERS.map((f) => {
                    const active = f.id === filter
                    return (
                        <TouchableOpacity
                            key={f.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            activeOpacity={0.8}
                            onPress={() => setFilter(f.id)}
                            className={`h-8 justify-center rounded border px-[14px] ${active
                                ? 'border-[rgba(59,130,245,0.25)] bg-[#eff6ff]'
                                : 'border-[#e5e7eb] bg-[#f3f4f6]'
                                }`}
                        >
                            <Text className={`text-[12.5px] ${active ? 'font-syne-semibold text-[#2563eb]' : 'font-syne-medium text-[#6b7280]'}`}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {(invoices.isLoading || !isLoaded) && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {invoices.isError && !invoices.isLoading && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(invoices.error, "Couldn't load your invoices.")}
                    </Text>
                    <TouchableOpacity onPress={() => invoices.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!invoices.isLoading && !invoices.isError && items.length === 0 && (
                <View className="mt-12 items-center gap-3 px-6">
                    <FileText size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {filter === 'all'
                            ? 'No invoices yet. One appears here once an order is paid.'
                            : 'No invoices with this status.'}
                    </Text>
                </View>
            )}

            {items.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
            ))}

            {invoices.hasNextPage && (
                <TouchableOpacity
                    onPress={() => invoices.fetchNextPage()}
                    disabled={invoices.isFetchingNextPage}
                    activeOpacity={0.8}
                    className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    {invoices.isFetchingNextPage ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                    )}
                </TouchableOpacity>
            )}
        </CheckoutShell>
    )
}

function InvoiceRow({ invoice }: { invoice: Invoice }) {
    const badge = STATUS_BADGES[invoice.status]
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Invoice ${invoice.invoiceNumber}`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/invoices/[invoiceId]', params: { invoiceId: invoice.id } } as never)}
        >
            <GroupedCard>
                <View className="flex-row items-center justify-between gap-2">
                    <Text numberOfLines={1} className="flex-1 font-syne-bold text-[13px] text-[#111827]">
                        {invoice.invoiceNumber}
                    </Text>
                    <View className="rounded border px-[8px] py-[3px]" style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
                        <Text className="font-syne-bold text-[8px]" style={{ color: badge.text }}>{badge.label}</Text>
                    </View>
                </View>
                <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                    {summariseLines(invoice.lineItems)}
                </Text>
                <View className="flex-row items-center justify-between">
                    <Text className="font-syne text-[11px] text-[#6b7280]">{formatInvoiceDate(invoice.invoiceDate)}</Text>
                    <Text className="font-syne-bold text-[15px] text-[#111827]">
                        {formatMoney(invoice.totalAmount, invoice.currency)}
                    </Text>
                </View>
            </GroupedCard>
        </TouchableOpacity>
    )
}
