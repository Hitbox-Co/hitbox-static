import { router, useIsFocused } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft, ArrowUpRight, ShoppingBag, Star } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RARITY_STYLES } from '@/features/products/utils/rarity'
import { ProductRarity } from '@/features/products/types/product'
import { CheckoutItem } from '../types/checkout'
import { formatItemPrice } from '../utils/money'

/* ------------------------------------------------------------------ */
/* Page frame                                                          */
/* ------------------------------------------------------------------ */

/** Back when there is a screen to go back to; otherwise out to Discover. */
export function goBackOrDiscover() {
    if (router.canGoBack()) router.back()
    else router.replace('/(tabs)/discover' as never)
}

/**
 * The frame every checkout page shares (Figma: "Brand navigation" + body +
 * "Checkout actions"): back, brand, bag on top; a scrolling body; and a footer
 * with the totals and the main action pinned underneath.
 */
export function CheckoutShell({
    children,
    footer,
    showBag = true,
}: {
    children: React.ReactNode
    footer?: React.ReactNode
    /** The bag opens the cart; the cart itself hides it. */
    showBag?: boolean
}) {
    const isFocused = useIsFocused()
    return (
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white">
            {isFocused && <StatusBar style="dark" />}

            <View className="h-14 flex-row items-center justify-between border-b border-[#dbeafe] px-5">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    onPress={goBackOrDiscover}
                    className="size-9 items-center justify-center rounded bg-[#eff6ff]"
                >
                    <ArrowLeft size={18} color="#111827" />
                </TouchableOpacity>
                <View className="flex-row items-center gap-[7px]">
                    <Image
                        source={require('@/assets/images/HitBoxLogo-dark.png')}
                        resizeMode="contain"
                        style={{ width: 22, height: 22 }}
                    />
                    <Text className="font-orbitron text-[15px] text-black">HitBox</Text>
                </View>
                {showBag ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Open cart"
                        onPress={() => router.push('/cart' as never)}
                        className="size-9 items-center justify-center"
                    >
                        <ShoppingBag size={21} color="#111827" />
                    </TouchableOpacity>
                ) : (
                    <View className="size-9" />
                )}
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, gap: 20 }}
            >
                {children}
            </ScrollView>

            {footer && <View className="items-center gap-[10px] px-5 pb-2 pt-3">{footer}</View>}
        </SafeAreaView>
    )
}

/* ------------------------------------------------------------------ */
/* Headings                                                            */
/* ------------------------------------------------------------------ */

const STAGES = ['Delivery', 'Payment', 'Review']

/** Three-stage progress: lines up to and including `stage` are blue. */
export function CheckoutProgress({ stage }: { stage: 1 | 2 | 3 }) {
    return (
        <View className="flex-row gap-2">
            {STAGES.map((label, i) => {
                const reached = i < stage
                const current = i === stage - 1
                return (
                    <View key={label} className="flex-1 gap-[7px]">
                        <View className={`h-[2px] w-full ${reached ? 'bg-[#2563eb]' : 'bg-[#dbeafe]'}`} />
                        <Text
                            className={`text-[10px] ${reached ? 'text-[#2563eb]' : 'text-[#6b7280]'} ${current ? 'font-syne-bold' : 'font-syne-medium'}`}
                        >
                            {label}
                        </Text>
                    </View>
                )
            })}
        </View>
    )
}

/** Blue two-part accent bar, Orbitron title and optional subtitle. */
export function PageIntro({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <View className="gap-2">
            <View className="flex-row gap-1">
                <View className="h-[3px] w-6 bg-[#2563eb]" />
                <View className="h-[3px] w-[6px] bg-[#2563eb]" />
            </View>
            <Text className="font-orbitron text-[24px] leading-[29px] tracking-[-0.5px] text-[#111827]">{title}</Text>
            {subtitle && <Text className="font-syne text-[13px] leading-[19px] text-[#6b7280]">{subtitle}</Text>}
        </View>
    )
}

export function SectionHeading({
    title,
    action,
    onAction,
}: {
    title: string
    action?: string
    onAction?: () => void
}) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="font-orbitron text-[13px] text-[#111827]">{title}</Text>
            {action && (
                <TouchableOpacity accessibilityRole="button" hitSlop={8} onPress={onAction}>
                    <Text className="font-syne-bold text-xs text-[#2563eb]">{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

/* ------------------------------------------------------------------ */
/* Cards and rows                                                      */
/* ------------------------------------------------------------------ */

/** White card with the pale-blue hairline. `selected` is the blue-filled variant. */
export function GroupedCard({
    children,
    selected,
    className = '',
}: {
    children: React.ReactNode
    selected?: boolean
    className?: string
}) {
    return (
        <View
            className={`gap-3 rounded border p-[14px] ${selected ? 'border-[#2563eb] bg-[#eff6ff]' : 'border-[#dbeafe] bg-white'} ${className}`}
        >
            {children}
        </View>
    )
}

export function RarityChip({ rarity }: { rarity: string | null }) {
    if (!rarity) return null
    const style = RARITY_STYLES[rarity as ProductRarity] ?? RARITY_STYLES.COMMON
    return (
        <View className="rounded px-[6px] py-[3px]" style={{ backgroundColor: style.bg }}>
            <Text className="font-syne-bold text-[8px]" style={{ color: style.text }}>
                {rarity.replace(/_/g, ' ')}
            </Text>
        </View>
    )
}

/** The drop being bought: artwork, name, creator, quantity, price and rarity. */
export function OrderItemRow({
    item,
    size = 76,
    dark = false,
}: {
    item: CheckoutItem
    /** Artwork edge: 76 in the flow, 112 in the cart. */
    size?: number
    /** Light-on-navy text for the confirmation card. */
    dark?: boolean
}) {
    return (
        <View className="flex-row items-center gap-3">
            <View style={{ width: size, height: size, borderRadius: 4, overflow: 'hidden', backgroundColor: '#eef2ff' }}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                ) : null}
            </View>
            <View className="flex-1 gap-[5px]">
                <Text
                    numberOfLines={2}
                    className={`font-syne-bold ${size > 80 ? 'text-[19px]' : 'text-base'} ${dark ? 'text-white' : 'text-[#111827]'}`}
                >
                    {item.name}
                </Text>
                {item.creator && <Text className="font-syne text-[11px] text-[#2563eb]">{item.creator}</Text>}
                <Text className={`font-syne text-[11px] ${dark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>
                    {`Qty ${item.quantity}`}
                </Text>
                <View className="flex-row items-center justify-between">
                    <Text className={`font-syne-bold text-[17px] ${dark ? 'text-white' : 'text-[#111827]'}`}>
                        {formatItemPrice(item.unitPriceUsd)}
                    </Text>
                    <RarityChip rarity={item.rarity} />
                </View>
            </View>
        </View>
    )
}

export function AmountRow({
    label,
    value,
    dark = false,
}: {
    label: string
    value: string
    dark?: boolean
}) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className={`font-syne text-xs ${dark ? 'text-[#9ca3af]' : 'text-[#6b7280]'}`}>{label}</Text>
            <Text className={`font-syne-medium text-xs ${dark ? 'text-white' : 'text-[#111827]'}`}>{value}</Text>
        </View>
    )
}

/** "Total · USD   $207.80" — the large closing figure. */
export function TotalRow({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
    return (
        <View className="flex-row items-center justify-between">
            <Text className={`font-syne-bold text-sm ${dark ? 'text-white' : 'text-[#111827]'}`}>{label}</Text>
            <Text className={`font-syne-bold text-[21px] ${dark ? 'text-white' : 'text-[#111827]'}`}>{value}</Text>
        </View>
    )
}

export function Divider({ dark = false }: { dark?: boolean }) {
    return <View className={`h-px w-full ${dark ? 'bg-[rgba(255,255,255,0.18)]' : 'bg-[#dbeafe]'}`} />
}

/** "925 pts pending with this purchase" — the amber reward strip. */
export function RewardsBox({ title, caption, bordered }: { title: string; caption: string; bordered?: boolean }) {
    return (
        <View
            className={`flex-row items-center gap-[10px] rounded bg-[#fffaed] p-3 ${bordered ? 'border border-[#ffd470]' : ''}`}
        >
            <Star size={18} color="#f5b301" />
            <View className="flex-1 gap-[3px]">
                <Text className="font-syne-bold text-xs leading-[17px] text-[#2563eb]">{title}</Text>
                <Text className="font-syne text-[10px] leading-[14px] text-[#6b7280]">{caption}</Text>
            </View>
        </View>
    )
}

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

/** Full-width black action with the arrow-up-right, per the Figma. */
export function PrimaryAction({
    label,
    onPress,
    disabled,
}: {
    label: string
    onPress: () => void
    disabled?: boolean
}) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={label}
            activeOpacity={0.85}
            disabled={disabled}
            onPress={onPress}
            className="h-[46px] w-full flex-row items-center justify-center gap-3 rounded bg-black"
            style={{ opacity: disabled ? 0.45 : 1 }}
        >
            <Text className="font-syne-bold text-sm text-white">{label}</Text>
            <ArrowUpRight size={16} color="#fff" />
        </TouchableOpacity>
    )
}

export function SecondaryLink({
    label,
    onPress,
    danger,
}: {
    label: string
    onPress: () => void
    danger?: boolean
}) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={onPress}
            className="h-9 w-full items-center justify-center"
        >
            <Text className={`font-syne-bold text-xs ${danger ? 'text-[#e11d48]' : 'text-[#2563eb]'}`}>{label}</Text>
        </TouchableOpacity>
    )
}

/* ------------------------------------------------------------------ */
/* Empty / loading                                                     */
/* ------------------------------------------------------------------ */

/** What a step shows when there is no drop in the cart to check out. */
export function NothingToCheckout({
    loading,
    error,
    notForSale,
    onRetry,
}: {
    loading?: boolean
    error?: boolean
    notForSale?: boolean
    onRetry?: () => void
}) {
    if (loading) {
        return (
            <View className="mt-24 items-center">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        )
    }
    return (
        <View className="mt-16 items-center gap-3 px-6">
            <ShoppingBag size={36} color="#9ca3af" />
            <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                {error
                    ? "Couldn't load your cart. Check your connection."
                    : notForSale
                        ? "This drop doesn't have a price yet, so it can't be bought."
                        : 'Your cart is empty.'}
            </Text>
            {error ? (
                <TouchableOpacity onPress={onRetry} className="rounded-[30px] bg-[#111827] px-5 py-2">
                    <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)/discover' as never)}
                    className="rounded-[30px] bg-[#111827] px-5 py-2"
                >
                    <Text className="font-syne-bold text-[13px] text-white">Browse drops</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}
