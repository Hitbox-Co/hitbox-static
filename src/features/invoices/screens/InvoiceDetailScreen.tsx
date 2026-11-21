import { router } from 'expo-router'
import { Download, FileText } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, Divider, GroupedCard, PageIntro, SectionHeading } from '@/features/checkout/components/CheckoutParts'
import { formatMoney } from '@/features/checkout/utils/money'
import { ApiRequestError } from '@/lib/api'
import { invoiceErrorMessage, isStorageUnavailable, useDownloadInvoice } from '../api/downloadInvoice'
import { useInvoice } from '../api/getInvoices'
import { Invoice } from '../types/invoice'
import { formatInvoiceDate, formatTax, formatTaxRate, invoiceBadge } from '../utils/format'

/**
 * One invoice (`GET /api/v1/invoices/:invoiceId`) with the PDF download
 * (`…/download`, a 5-minute link opened in the system viewer).
 */
export default function InvoiceDetailScreen({ invoiceId }: { invoiceId?: string }) {
    const { data: invoice, isLoading, isError, error, refetch } = useInvoice(invoiceId)
    const download = useDownloadInvoice()
    // Set when the server says it has no document storage: the button goes away.
    const [downloadHidden, setDownloadHidden] = useState(false)

    const onDownload = () => {
        if (!invoice) return
        download.mutate(invoice.id, {
            onError: (err) => {
                if (isStorageUnavailable(err)) setDownloadHidden(true)
                Alert.alert("Couldn't open the invoice", invoiceErrorMessage(err))
            },
        })
    }

    if (isLoading) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Invoice" />
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (isError || !invoice) {
        // 404 = no such invoice, or not yours (the two look the same on purpose): nothing to retry.
        const notFound = error instanceof ApiRequestError && error.status === 404
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Invoice" />
                <View className="mt-16 items-center gap-3 px-6">
                    <FileText size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">{invoiceErrorMessage(error)}</Text>
                    <TouchableOpacity
                        onPress={() => (notFound ? router.back() : refetch())}
                        className="rounded-[30px] bg-[#111827] px-5 py-2"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">{notFound ? 'Go Back' : 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    const badge = invoiceBadge(invoice.status)
    const money = (amount: string) => formatMoney(amount, invoice.currency)

    return (
        <CheckoutShell
            showBag={false}
            footer={
                // The PDF can be fetched for any status (a void or superseded invoice is kept
                // for the record). The button goes away only if the server has no storage.
                !downloadHidden ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Download invoice PDF"
                        activeOpacity={0.85}
                        disabled={download.isPending}
                        onPress={onDownload}
                        className="h-[46px] w-full flex-row items-center justify-center gap-3 rounded bg-black"
                        style={{ opacity: download.isPending ? 0.6 : 1 }}
                    >
                        {download.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Download size={16} color="#fff" />
                        )}
                        <Text className="font-syne-bold text-sm text-white">
                            {download.isPending
                                ? invoice.documentAvailable ? 'Opening…' : 'Preparing your PDF…'
                                : 'Download invoice'}
                        </Text>
                    </TouchableOpacity>
                ) : undefined
            }
        >
            <PageIntro title="Invoice" subtitle={invoice.invoiceNumber} />

            <View className="flex-row items-center gap-2">
                <View className="rounded border px-[10px] py-[5px]" style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
                    <Text className="font-syne-bold text-[10px]" style={{ color: badge.text }}>{badge.label}</Text>
                </View>
                <Text className="font-syne text-[11px] text-[#6b7280]">{formatInvoiceDate(invoice.invoiceDate)}</Text>
            </View>

            {invoice.status === 'VOID' && (
                <Notice tone="red">This invoice was cancelled by HitBox. Its number is kept and never reused.</Notice>
            )}
            {invoice.status === 'CORRECTED' && (
                <Notice tone="amber">A newer invoice replaced this one for the same order. Use the newer one.</Notice>
            )}

            <GroupedCard>
                <SectionHeading title="Invoice details" />
                <Row label="Invoice date" value={formatInvoiceDate(invoice.invoiceDate)} />
                <Row label="Fiscal year" value={invoice.fiscalYear} />
                <Row label="Country" value={[invoice.countryCode, invoice.stateCode].filter(Boolean).join(' · ')} />
                <Row label="Tax" value={formatTax(invoice.taxType, invoice.taxRate)} />
                {invoice.hsnCode && <Row label="HSN code" value={invoice.hsnCode} />}
            </GroupedCard>

            <GroupedCard>
                <SectionHeading title="Items" />
                {invoice.lineItems.map((line, i) => (
                    <View key={line.position} className="gap-[6px]">
                        {i > 0 && <Divider />}
                        <Text className="font-syne-bold text-[13px] leading-[18px] text-[#111827]">{line.description}</Text>
                        <View className="flex-row items-center justify-between">
                            <Text className="font-syne text-[11px] text-[#6b7280]">
                                {`${line.quantity} × ${money(line.unitPrice)}`}
                            </Text>
                            <Text className="font-syne-medium text-xs text-[#111827]">{money(line.lineSubtotal)}</Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="font-syne text-[11px] text-[#6b7280]">
                                {`Tax ${formatTaxRate(line.taxRate)}`}
                            </Text>
                            <Text className="font-syne text-[11px] text-[#6b7280]">{money(line.taxAmount)}</Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="font-syne-semibold text-[11px] text-[#111827]">Line total</Text>
                            <Text className="font-syne-bold text-xs text-[#111827]">{money(line.lineTotal)}</Text>
                        </View>
                    </View>
                ))}
            </GroupedCard>

            <GroupedCard>
                <Row label="Subtotal" value={money(invoice.subtotal)} />
                <Row label={formatTax(invoice.taxType, invoice.taxRate)} value={money(invoice.taxAmount)} />
                <Divider />
                <View className="flex-row items-center justify-between">
                    <Text className="font-syne-bold text-sm text-[#111827]">{`Invoice total · ${invoice.currency}`}</Text>
                    <Text className="font-syne-bold text-[21px] text-[#111827]">{money(invoice.totalAmount)}</Text>
                </View>
            </GroupedCard>

            <Parties invoice={invoice} />

            {invoice.notes && (
                <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">{invoice.notes}</Text>
            )}
        </CheckoutShell>
    )
}

/** Supplier and customer blocks. Tax ids are shown only when the invoice has them. */
function Parties({ invoice }: { invoice: Invoice }) {
    const { supplier, customer } = invoice
    return (
        <View className="gap-5">
            <GroupedCard>
                <SectionHeading title="Sold by" />
                <Text className="font-syne-bold text-[13px] text-[#111827]">{supplier.name}</Text>
                <Text className="font-syne text-xs leading-[18px] text-[#374151]">{supplier.address}</Text>
                {supplier.gstin && <Text className="font-syne text-[11px] text-[#6b7280]">{`GSTIN ${supplier.gstin}`}</Text>}
                {supplier.pan && <Text className="font-syne text-[11px] text-[#6b7280]">{`PAN ${supplier.pan}`}</Text>}
                {supplier.ein && <Text className="font-syne text-[11px] text-[#6b7280]">{`EIN ${supplier.ein}`}</Text>}
            </GroupedCard>
            <GroupedCard>
                <SectionHeading title="Billed to" />
                <Text className="font-syne-bold text-[13px] text-[#111827]">{customer.name}</Text>
                <Text className="font-syne text-[11px] text-[#6b7280]">{customer.email}</Text>
                {customer.address && (
                    <Text className="font-syne text-xs leading-[18px] text-[#374151]">{customer.address}</Text>
                )}
                {customer.gstin && <Text className="font-syne text-[11px] text-[#6b7280]">{`GSTIN ${customer.gstin}`}</Text>}
            </GroupedCard>
        </View>
    )
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="font-syne text-xs text-[#6b7280]">{label}</Text>
            <Text numberOfLines={1} className="ml-4 shrink font-syne-medium text-xs text-[#111827]">{value}</Text>
        </View>
    )
}

function Notice({ tone, children }: { tone: 'red' | 'amber'; children: React.ReactNode }) {
    const style = tone === 'red'
        ? { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' }
        : { bg: '#fffaed', border: '#fcd34d', text: '#d97706' }
    return (
        <View className="rounded border px-3 py-[10px]" style={{ backgroundColor: style.bg, borderColor: style.border }}>
            <Text className="font-syne-semibold text-[11px] leading-[16px]" style={{ color: style.text }}>{children}</Text>
        </View>
    )
}
