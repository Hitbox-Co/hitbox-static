import { router } from 'expo-router'
import { Check, Download, FileText, MapPin, Package } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, Divider, GroupedCard, PageIntro, SectionHeading } from '@/features/checkout/components/CheckoutParts'
import { formatMoney } from '@/features/checkout/utils/money'
import { invoiceErrorMessage, isStorageUnavailable, useDownloadInvoice } from '@/features/invoices/api/downloadInvoice'
import { paymentErrorMessage } from '@/features/payments/api/errors'
import { useResumeCheckout } from '@/features/payments/api/checkout'
import { usePaymentSheet } from '@/features/payments/hooks/usePaymentSheet'
import { ApiRequestError } from '@/lib/api'
import { orderErrorMessage, useCancelOrder } from '../api/cancelOrder'
import { useOrder } from '../api/getOrders'
import { BuyerAddress, BuyerOrderDetail, BuyerOrderRefund } from '../types/order'
import {
    deliveredText,
    formatOrderDate,
    formatOrderDateTime,
    minutesLeft,
    ORDER_STATUS_BADGES,
    ORDER_STEPS,
    REFUND_BADGES,
    REFUND_BLOCKED_TEXT,
    STATUS_WORDS,
    orderBadge,
    refundBadge,
    refundBlockedText,
    statusWord,
} from '../utils/format'

/**
 * Order detail (`GET /api/v1/orders/:orderId`): status steps, payment, the numbered
 * unit, addresses, refund state and the buttons — all driven by the server's
 * `actions`, never by guessing from the status.
 *
 * Polls while the order is PENDING_PAYMENT: the app never decides an order is
 * paid, it waits for the server (Stripe's webhook) to move it on.
 *
 * Complete payment resumes the Stripe payment (`/checkout/:id/resume`); refunds open
 * the refund screen (`/refunds`).
 */
export default function OrderDetailScreen({ orderId }: { orderId?: string }) {
    const { data: order, isLoading, isError, error, refetch } = useOrder(orderId, { poll: true })
    const cancel = useCancelOrder()
    const download = useDownloadInvoice()
    const resume = useResumeCheckout()
    const presentSheet = usePaymentSheet()
    const [paying, setPaying] = React.useState(false)

    /** Complete payment: same order and charge, fresh client secret, then wait for the webhook. */
    const onResumePayment = async () => {
        if (!orderId || paying) return
        setPaying(true)
        try {
            const checkout = await resume.mutateAsync(orderId)
            const result = await presentSheet(checkout)
            if (result.status === 'success') {
                router.replace({ pathname: '/checkout/confirmed', params: { orderId } } as never)
            } else if (result.status === 'failed') {
                Alert.alert('Payment unsuccessful', result.message)
                refetch()
            }
        } catch (err) {
            Alert.alert("Couldn't resume payment", paymentErrorMessage(err))
            refetch()
        } finally {
            setPaying(false)
        }
    }

    if (isLoading) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Order" />
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (isError || !order) {
        // 404 = no such order, or not yours (the same answer on purpose): nothing to retry.
        const notFound = error instanceof ApiRequestError && error.status === 404
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Order" />
                <View className="mt-16 items-center gap-3 px-6">
                    <Package size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">{orderErrorMessage(error)}</Text>
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

    const badge = orderBadge(order.status)
    const money = (amount: string) => formatMoney(amount, order.currency)
    const { actions } = order
    const payMinutes = order.payment.status === 'AWAITING_PAYMENT' ? minutesLeft(order.payment.payBy) : null

    const onCancel = () =>
        Alert.alert('Cancel this order?', 'It has not been paid, so nothing is charged and the piece goes back on sale.', [
            { text: 'Keep order', style: 'cancel' },
            {
                text: 'Cancel order',
                style: 'destructive',
                onPress: () =>
                    cancel.mutate({ orderId: order.id }, { onError: (err) => Alert.alert("Couldn't cancel", orderErrorMessage(err)) }),
            },
        ])

    const onDownload = () => {
        if (!order.invoice) return
        download.mutate(order.invoice.id, {
            onError: (err) =>
                Alert.alert(isStorageUnavailable(err) ? 'Not available' : "Couldn't open the invoice", invoiceErrorMessage(err)),
        })
    }

    return (
        <CheckoutShell showBag={false}>
            <PageIntro title="Order" subtitle={order.reference ? `#${order.reference}` : undefined} />

            {/* The drop */}
            <GroupedCard>
                <View className="flex-row items-center gap-3">
                    <View style={{ width: 88, height: 88, borderRadius: 4, overflow: 'hidden', backgroundColor: '#eef2ff' }}>
                        {order.product.imageUrl ? (
                            <Image source={{ uri: order.product.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                        ) : null}
                    </View>
                    <View className="flex-1 gap-[5px]">
                        <Text numberOfLines={2} className="font-syne-bold text-[16px] leading-[20px] text-[#111827]">{order.product.name}</Text>
                        {(order.product.artistName || order.variantLabel) && (
                            <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                                {[order.product.artistName, order.variantLabel].filter(Boolean).join(' · ')}
                            </Text>
                        )}
                        <View className="self-start rounded border px-[8px] py-[3px]" style={{ backgroundColor: badge.bg, borderColor: badge.border }}>
                            <Text className="font-syne-bold text-[8px]" style={{ color: badge.text }}>{order.statusLabel.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
                <Divider />
                <Row label="Placed" value={formatOrderDateTime(order.placedAt)} />
                {/* The order's own amount is what was paid (the invoice can differ: it adds tax on top). */}
                <Row label={order.payment.status === 'PAID' || order.status === 'DELIVERED' ? 'Paid' : 'Amount'} value={money(order.amount)} bold />
            </GroupedCard>

            {/* Awaiting payment: the hold, and a declined attempt if there was one */}
            {order.status === 'PENDING_PAYMENT' && (
                <Notice tone="amber">
                    {payMinutes !== null
                        ? `Your piece is held for about ${payMinutes} more minute${payMinutes === 1 ? '' : 's'}. Complete payment to keep it.`
                        : 'Waiting for payment to be confirmed. If you already paid, this updates by itself in a moment.'}
                </Notice>
            )}
            {order.payment.failureReason && order.payment.status !== 'PAID' && (
                <Notice tone="red">{`Last attempt: ${order.payment.failureReason}`}</Notice>
            )}

            <StatusSteps order={order} />

            {/* The numbered piece */}
            <GroupedCard>
                <SectionHeading title="Your piece" />
                {order.unit ? (
                    <>
                        <Row label="Serial" value={`#${order.unit.serialNumber}`} bold />
                        <Row label="Code" value={order.unit.skuCode} />
                        <Row
                            label="Claimed"
                            value={order.unit.claimed ? `Yes · ${formatOrderDate(order.unit.claimedAt)}` : 'Not yet — tap its tag to claim'}
                        />
                    </>
                ) : (
                    <Text className="font-syne text-xs leading-[18px] text-[#6b7280]">
                        A numbered piece is assigned when your order is packed.
                    </Text>
                )}
            </GroupedCard>

            {/* Shipment */}
            {order.tracking && (
                <GroupedCard>
                    <SectionHeading title="Shipment" />
                    <Row label="Carrier" value={order.tracking.carrierName} />
                    <Row label="Tracking" value={order.tracking.trackingNumber} selectable />
                    {order.tracking.deliveredAt && <Row label="Delivered" value={deliveredText(order.tracking.deliveredVia)} />}
                </GroupedCard>
            )}

            {(order.shippingAddress || order.billingAddress) && (
                <View className="gap-5">
                    {order.shippingAddress && <AddressCard title="Ships to" address={order.shippingAddress} />}
                    {order.billingAddress && <AddressCard title="Billing address" address={order.billingAddress} />}
                </View>
            )}

            {order.refunds.length > 0 && (
                <View className="gap-3">
                    <SectionHeading title={order.refunds.length === 1 ? 'Refund' : 'Refunds'} />
                    {order.refunds.map((refund) => (
                        <RefundCard key={refund.id} refund={refund} />
                    ))}
                </View>
            )}

            {/* Buttons — rendered from the server's `actions` */}
            <View className="gap-3">
                {actions.canResumePayment && (
                    <ActionButton
                        label="Complete payment"
                        primary
                        disabled={paying}
                        onPress={onResumePayment}
                    />
                )}
                {actions.canTrack && (
                    <ActionButton
                        label="Track parcel"
                        icon={<MapPin size={16} color="#2563eb" />}
                        onPress={() => router.push({ pathname: '/orders/[orderId]/tracking', params: { orderId: order.id } } as never)}
                    />
                )}
                {actions.canDownloadInvoice && order.invoice ? (
                    <ActionButton
                        label={download.isPending ? 'Opening…' : 'Download invoice'}
                        icon={download.isPending ? <ActivityIndicator size="small" color="#2563eb" /> : <Download size={16} color="#2563eb" />}
                        disabled={download.isPending}
                        onPress={onDownload}
                    />
                ) : (
                    // Not an error: the invoice is issued a moment after Stripe confirms payment.
                    order.payment.status === 'PAID' && (
                        <View className="flex-row items-center gap-2">
                            <FileText size={14} color="#6b7280" />
                            <Text className="flex-1 font-syne text-[11px] text-[#6b7280]">Your invoice will be ready in a moment.</Text>
                        </View>
                    )
                )}
                {actions.canRequestRefund && (
                    <ActionButton
                        label={order.status === 'SHIPPED' || order.status === 'DELIVERED' ? 'Request a refund' : 'Cancel & refund'}
                        onPress={() => router.push({ pathname: '/orders/[orderId]/refund', params: { orderId: order.id } } as never)}
                    />
                )}
                {!actions.canRequestRefund && actions.refundBlockedReason && order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED' && (
                    <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                        {refundBlockedText(actions.refundBlockedReason)}
                    </Text>
                )}
                {actions.returnWindowEndsAt && (
                    <Text className="font-syne text-[11px] text-[#6b7280]">{`Return by ${formatOrderDate(actions.returnWindowEndsAt)}`}</Text>
                )}
                {actions.canCancel && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.7}
                        disabled={cancel.isPending}
                        onPress={onCancel}
                        className="h-9 items-center justify-center"
                    >
                        {cancel.isPending ? (
                            <ActivityIndicator size="small" color="#e11d48" />
                        ) : (
                            <Text className="font-syne-bold text-xs text-[#e11d48]">Cancel order</Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </CheckoutShell>
    )
}

/** The five happy-path steps, or the timeline as it happened for a cancelled / refunded order. */
function StatusSteps({ order }: { order: BuyerOrderDetail }) {
    const reachedAt = new Map(order.timeline.map((entry) => [entry.status, entry.at]))
    const ended = order.status === 'CANCELLED' || order.status === 'REFUNDED'

    return (
        <GroupedCard>
            <SectionHeading title="Order status" />
            {ended ? (
                <View className="gap-3">
                    {order.timeline.map((entry) => (
                        <StepRow key={entry.status + entry.at} label={statusWord(entry.status)} at={entry.at} reached />
                    ))}
                </View>
            ) : (
                <View className="gap-3">
                    {ORDER_STEPS.map((step) => (
                        <StepRow
                            key={step.status}
                            label={step.label}
                            at={reachedAt.get(step.status)}
                            reached={reachedAt.has(step.status)}
                        />
                    ))}
                </View>
            )}
        </GroupedCard>
    )
}

function StepRow({ label, at, reached }: { label: string; at?: string; reached: boolean }) {
    return (
        <View className="flex-row items-center gap-3">
            <View
                className={`size-[18px] items-center justify-center rounded-full border ${reached ? 'border-[#2563eb] bg-[#2563eb]' : 'border-[#bfdbfe] bg-white'}`}
            >
                {reached && <Check size={11} color="#fff" strokeWidth={3} />}
            </View>
            <Text className={`flex-1 text-xs ${reached ? 'font-syne-bold text-[#111827]' : 'font-syne text-[#9ca3af]'}`}>{label}</Text>
            {at && <Text className="font-syne text-[10px] text-[#6b7280]">{formatOrderDateTime(at)}</Text>}
        </View>
    )
}

function AddressCard({ title, address }: { title: string; address: BuyerAddress }) {
    const cityLine = [address.city, address.state, address.postalCode].filter(Boolean).join(', ')
    return (
        <GroupedCard>
            <SectionHeading title={title} />
            <Text className="font-syne-bold text-[13px] text-[#111827]">{address.recipientName}</Text>
            <Text className="font-syne text-xs leading-[18px] text-[#374151]">
                {[address.line1, address.line2, cityLine, address.countryCode].filter(Boolean).join('\n')}
            </Text>
            {address.phone && <Text className="font-syne text-[11px] text-[#6b7280]">{address.phone}</Text>}
        </GroupedCard>
    )
}

function RefundCard({ refund }: { refund: BuyerOrderRefund }) {
    const badge = refundBadge(refund.status)
    return (
        <GroupedCard>
            <View className="flex-row items-center justify-between gap-2">
                <View className="rounded px-[8px] py-[3px]" style={{ backgroundColor: badge.bg }}>
                    <Text className="font-syne-bold text-[9px]" style={{ color: badge.text }}>{refund.statusLabel.toUpperCase()}</Text>
                </View>
                {refund.amount && (
                    <Text className="font-syne-bold text-[14px] text-[#111827]">{formatMoney(refund.amount, refund.currency)}</Text>
                )}
            </View>
            <Text className="font-syne text-xs leading-[18px] text-[#374151]">{refund.reason}</Text>
            <Text className="font-syne text-[10px] text-[#6b7280]">{`Requested ${formatOrderDate(refund.requestedAt)}`}</Text>
            {refund.status === 'AWAITING_RETURN' && (
                <Text className="font-syne-semibold text-[11px] text-[#d97706]">Send the item back so we can approve the refund.</Text>
            )}
            {refund.returnReceivedAt && (
                <Text className="font-syne text-[11px] text-[#6b7280]">{`Return received ${formatOrderDate(refund.returnReceivedAt)}`}</Text>
            )}
            {refund.status === 'REJECTED' && refund.rejectionReason && (
                <Text className="font-syne text-[11px] leading-[16px] text-[#dc2626]">{refund.rejectionReason}</Text>
            )}
            {refund.processedAt && (
                <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    {`Sent ${formatOrderDate(refund.processedAt)}. Banks take 5–10 business days after this.`}
                </Text>
            )}
            {refund.failed && (
                <Text className="font-syne-semibold text-[11px] leading-[16px] text-[#dc2626]">
                    The refund didn’t go through. Support will contact you.
                </Text>
            )}
        </GroupedCard>
    )
}

function Row({ label, value, bold, selectable }: { label: string; value: string; bold?: boolean; selectable?: boolean }) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="font-syne text-xs text-[#6b7280]">{label}</Text>
            <Text
                selectable={selectable}
                numberOfLines={selectable ? undefined : 1}
                className={`ml-4 shrink text-right text-xs text-[#111827] ${bold ? 'font-syne-bold' : 'font-syne-medium'}`}
            >
                {value}
            </Text>
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

function ActionButton({
    label,
    onPress,
    icon,
    primary,
    disabled,
}: {
    label: string
    onPress: () => void
    icon?: React.ReactNode
    primary?: boolean
    disabled?: boolean
}) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            activeOpacity={0.85}
            disabled={disabled}
            onPress={onPress}
            className={`h-[46px] flex-row items-center justify-center gap-2 rounded border ${primary ? 'border-black bg-black' : 'border-[#bfdbfe] bg-[#eff6ff]'}`}
            style={{ opacity: disabled ? 0.6 : 1 }}
        >
            {icon}
            <Text className={`font-syne-bold text-[13px] ${primary ? 'text-white' : 'text-[#2563eb]'}`}>{label}</Text>
        </TouchableOpacity>
    )
}
