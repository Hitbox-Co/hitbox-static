import { useUser } from '@clerk/clerk-expo'
import { BadgeCheck, Package, UserRound } from 'lucide-react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { useMyCollectionInfinite } from '@/features/collections/api/getMyCollectionInfinite'
import { CollectionItem, CollectionVisibility } from '@/features/collections/types/collection'
import { DISCOVER_PLACEHOLDER_IMAGE } from '@/features/discover/utils/format'
import { describeApiError } from '@/lib/api-errors'
import { categoryChipLabel, useOwnedCategories } from '../api/getOwnedCategories'
import { useMe } from '../api/getProfile'

type Filter = 'all' | CollectionVisibility

/** The chips. Each is a server filter (`GET /collections/me?visibility=`). */
const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'PUBLIC', label: 'Public' },
    { id: 'PRIVATE', label: 'Private' },
]

const PAGE_SIZE = 30

/** The kinds of product HitBox sells, in the order the chips show them. */
const DEFAULT_CATEGORIES = ['FIGURE', 'APPAREL', 'TRADING_CARD', 'ACCESSORY', 'POSTER', 'DIGITAL_ASSET']

/**
 * Everything I own — Figma P03, opened by "View All" on the profile's
 * Collection section. A summary line, my name card, and a three-column grid of
 * the items (`GET /collections/me`, 30 at a time, private ones included).
 *
 * The Figma's chips are artist collections (Milo Toys, Orbit); a shelf row does
 * not say which collection it belongs to, so they cannot filter here. The chips
 * are All / Public / Private instead — the one filter the shelf endpoint has.
 */
export default function MyProductsScreen() {
    const { user } = useUser()
    const { data: me } = useMe()
    const [filter, setFilter] = useState<Filter>('all')

    const shelf = useMyCollectionInfinite({
        visibility: filter === 'all' ? undefined : filter,
        limit: PAGE_SIZE,
    })
    const items = shelf.data?.pages.flatMap((p) => p.data) ?? []
    const total = shelf.data?.pages[0]?.meta.total ?? 0

    // Category chips (Figures, Apparel…): built from what is actually owned. The
    // category of each drop is looked up once and cached (see useOwnedCategories).
    const [category, setCategory] = useState<string>('all')
    const categoryOf = useOwnedCategories(items.map((i) => i.product.id))
    // The standard kinds are always offered (like Discover's chips), so the row is
    // there even before you own anything; any other kind you own is added after them.
    const extras = [...new Set(Object.values(categoryOf).filter((c): c is string => !!c))]
        .filter((c) => !DEFAULT_CATEGORIES.includes(c))
        .sort()
    const categories = [...DEFAULT_CATEGORIES, ...extras]
    // A chip that no longer applies (e.g. after switching Public/Private) falls back to All.
    const activeCategory = category !== 'all' && !categories.includes(category) ? 'all' : category
    const visible = activeCategory === 'all' ? items : items.filter((i) => categoryOf[i.product.id] === activeCategory)

    const name = me?.fullName || user?.fullName || (me?.handle ? `@${me.handle}` : null) || 'HitBox Collector'
    const handle = me?.handle ?? user?.username ?? null
    const avatarUrl = user?.imageUrl ?? me?.avatarUrl ?? null
    const collections = me?.stats?.artistCollections ?? 0

    const ownedTotal = me?.stats?.claimedItems ?? total
    const summary = `${ownedTotal} owned ${ownedTotal === 1 ? 'product' : 'products'} · ${collections} official ${collections === 1 ? 'collection' : 'collections'}`

    return (
        <CheckoutShell showBag={false}>
            <PageIntro title="My products" subtitle={summary} />

            {/* Who this is */}
            <View className="flex-row items-center gap-3 rounded border border-[#dbeafe] bg-white p-3">
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={{ width: 44, height: 44, borderRadius: 4, backgroundColor: '#e5e7eb' }} contentFit="cover" />
                ) : (
                    <View className="h-11 w-11 items-center justify-center rounded bg-[#eff6ff]">
                        <UserRound size={20} color="#2563eb" />
                    </View>
                )}
                <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center gap-1.5">
                        <Text numberOfLines={1} className="shrink font-syne-bold text-[15px] text-[#111827]">{name}</Text>
                        <BadgeCheck size={15} color="#ffffff" fill="#111827" />
                    </View>
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">
                        {[handle ? `@${handle}` : null, `${collections} ${collections === 1 ? 'collection' : 'collections'}`].filter(Boolean).join(' · ')}
                    </Text>
                </View>
            </View>

            {/* Category chips: All + what you own (Figures, Apparel…) */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="grow-0">
                {['all', ...categories].map((c) => {
                    const active = c === activeCategory
                    return (
                        <TouchableOpacity
                            key={c}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            activeOpacity={0.8}
                            onPress={() => setCategory(c)}
                            className={`h-8 justify-center rounded border px-[14px] ${active ? 'border-black bg-black' : 'border-[#d1d5db] bg-white'}`}
                        >
                            <Text className={`text-[12.5px] ${active ? 'font-syne-semibold text-white' : 'font-syne-medium text-[#111827]'}`}>
                                {c === 'all' ? 'All' : categoryChipLabel(c)}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>

            {/* Visibility: a smaller second row */}
            <View className="flex-row items-center gap-2">
                <Text className="font-syne text-[11px] text-[#6b7280]">Show</Text>
                {FILTERS.map((f) => {
                    const active = f.id === filter
                    return (
                        <TouchableOpacity
                            key={f.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            activeOpacity={0.8}
                            onPress={() => setFilter(f.id)}
                            className={`h-7 justify-center rounded border px-3 ${active ? 'border-[#2563eb] bg-[#eff6ff]' : 'border-[#e5e7eb] bg-white'}`}
                        >
                            <Text className={`text-[11.5px] ${active ? 'font-syne-semibold text-[#2563eb]' : 'font-syne-medium text-[#6b7280]'}`}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {shelf.isLoading && (
                <View className="mt-10 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {shelf.isError && !shelf.isLoading && (
                <View className="mt-8 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(shelf.error, "Couldn't load your products.")}
                    </Text>
                    <TouchableOpacity onPress={() => shelf.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!shelf.isLoading && !shelf.isError && visible.length === 0 && (
                <View className="mt-8 items-center gap-3 px-6">
                    <Package size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {items.length > 0
                            ? `No ${categoryChipLabel(activeCategory).toLowerCase()} in your collection${shelf.hasNextPage ? ' yet. Try Load More.' : '.'}`
                            : activeCategory !== 'all'
                                ? `No ${categoryChipLabel(activeCategory).toLowerCase()} in your collection.`
                            : filter === 'all'
                                ? 'Nothing here yet. Claim an item with the Scan tab and it will appear here.'
                                : `No ${filter === 'PUBLIC' ? 'public' : 'private'} products.`}
                    </Text>
                </View>
            )}

            {/* Three across, like the Figma */}
            {visible.length > 0 && (
                <View className="flex-row flex-wrap gap-x-2 gap-y-3">
                    {visible.map((item) => (
                        <ProductTile key={item.id} item={item} />
                    ))}
                </View>
            )}

            {shelf.hasNextPage && (
                <TouchableOpacity
                    onPress={() => shelf.fetchNextPage()}
                    disabled={shelf.isFetchingNextPage}
                    activeOpacity={0.8}
                    className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    {shelf.isFetchingNextPage ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                    )}
                </TouchableOpacity>
            )}

            {items.length > 0 && (
                <Text className="font-syne text-[11px] text-[#6b7280]">
                    {activeCategory !== 'all'
                        ? `Showing ${visible.length} ${categoryChipLabel(activeCategory).toLowerCase()}${shelf.hasNextPage ? ` (of ${items.length} loaded)` : ''}`
                        : shelf.hasNextPage
                            ? `Showing ${items.length} of ${total} owned products`
                            : `Showing all ${total} owned ${total === 1 ? 'product' : 'products'}`}
                </Text>
            )}
        </CheckoutShell>
    )
}

function ProductTile({ item }: { item: CollectionItem }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.product.name}`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/discover/[productId]', params: { productId: item.product.id } } as never)}
            style={{ width: '31.6%' }}
        >
            <Image
                source={{ uri: item.product.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                style={{ width: '100%', aspectRatio: 0.95, borderRadius: 4, backgroundColor: '#e5e7eb' }}
                contentFit="cover"
            />
            <Text numberOfLines={2} className="mt-1.5 font-syne-bold text-[10px] leading-[13px] text-[#111827]">
                {item.product.name}
            </Text>
        </TouchableOpacity>
    )
}
