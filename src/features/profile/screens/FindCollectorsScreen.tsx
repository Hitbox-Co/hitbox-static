import { useAuth } from '@clerk/clerk-expo'
import PriceText from '@/features/market/components/PriceText'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ArrowLeft, ChevronRight, Globe, Lock, Search, SearchX, UserRound, X } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Image as RNImage, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useDiscoverProducts } from '@/features/discover/api/getDiscoverProducts'
import { useDebouncedValue } from '@/features/discover/hooks/useDebouncedValue'
import { DISCOVER_PLACEHOLDER_IMAGE } from '@/features/discover/utils/format'
import { useFollowersInfinite, useFollowingInfinite } from '@/features/follows/api/follows'
import { FollowUserView } from '@/features/follows/types/follow'
import { ApiRequestError } from '@/lib/api'
import { useMe, useUserByHandle } from '../api/getProfile'

type Tab = 'collectors' | 'products'

/** A username is 3–50 chars of letters, digits, "_" and "."; anything else is not worth a lookup request. */
const HANDLE_RE = /^[A-Za-z0-9_.]{3,50}$/

/**
 * Find collectors — Figma C11 / P06 / P07. Two tabs:
 *
 *  - **Collectors**: an exact username comes up with the collector's real stats
 *    (`GET /users/handle/:handle`), and any text is also matched (name or
 *    username, partial) against your network — who you follow and who follows
 *    you. There is no endpoint that lists or searches all people.
 *  - **Products**: the drop search (`GET /discover/products?search=`).
 *
 * A collector opens their page at `/collectors/:id` (public or private).
 */
export default function FindCollectorsScreen() {
    const [tab, setTab] = useState<Tab>('collectors')
    const [query, setQuery] = useState('')
    const debounced = useDebouncedValue(query.trim())

    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#f6f9fc' }}>
            {/* Header */}
            <View className="h-12 flex-row items-center justify-between bg-white px-5">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/discover' as never))}
                        className="size-8 items-center justify-center rounded bg-[#eff6ff]"
                    >
                        <ArrowLeft size={17} color="#111827" />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-[7px]">
                        <RNImage source={require('@/assets/images/HitBoxLogo-dark.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                        <Text className="font-orbitron text-[14px] text-[#111827]">HitBox</Text>
                    </View>
                </View>
                <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">FIND COLLECTORS</Text>
            </View>
            <View className="h-px bg-[#e5e7eb]" />

            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
                <Text className="font-syne text-[13px] text-[#6b7280]">Meet the people behind the collections.</Text>

                {/* Search */}
                <View className="h-12 flex-row items-center gap-3 rounded bg-white px-4">
                    <Search size={19} color="#6b7280" />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder={tab === 'collectors' ? 'Search name or username' : 'Search drops'}
                        placeholderTextColor="#6b7280"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        accessibilityLabel="Search"
                        className="flex-1 font-syne text-[14px] text-[#111827]"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={8}>
                            <X size={17} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Collectors | Products */}
                <View className="flex-row gap-2.5">
                    {(['collectors', 'products'] as Tab[]).map((t) => {
                        const active = t === tab
                        return (
                            <TouchableOpacity
                                key={t}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                activeOpacity={0.85}
                                onPress={() => setTab(t)}
                                className={`h-9 justify-center rounded px-4 ${active ? 'bg-black' : 'bg-white'}`}
                            >
                                <Text className={`font-syne-semibold text-[12px] ${active ? 'text-white' : 'text-[#111827]'}`}>
                                    {t === 'collectors' ? 'Collectors' : 'Products'}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {tab === 'collectors' ? <CollectorsTab term={debounced} /> : <ProductsTab term={debounced} />}
            </ScrollView>
        </SafeAreaView>
    )
}

/* ------------------------------------------------------------------ */
/* Collectors                                                          */
/* ------------------------------------------------------------------ */

function CollectorsTab({ term }: { term: string }) {
    const q = term.replace(/^@/, '').trim()
    const searching = q.length > 0
    const network = useNetwork(searching)
    // Exact username lookup runs alongside; partial text is matched against your network.
    const exact = useUserByHandle(HANDLE_RE.test(q) ? q : undefined)

    const rows: CollectorRowData[] = []
    const seen = new Set<string>()
    if (searching) {
        const lower = q.toLowerCase()
        if (exact.data && exact.data.id !== network.meId) {
            const p = exact.data
            const items = p.stats.claimedItems
            const collections = p.stats.artistCollections
            seen.add(p.id)
            rows.push({
                id: p.id,
                name: p.fullName || (p.handle ? `@${p.handle}` : 'Collector'),
                handle: p.handle,
                avatarUrl: p.avatarUrl,
                isPrivate: p.isPrivate,
                detail: `${items} ${items === 1 ? 'item' : 'items'} · ${collections} ${collections === 1 ? 'collection' : 'collections'}`,
            })
        }
        for (const p of network.people) {
            if (seen.has(p.id)) continue
            if (!`${p.fullName ?? ''} ${p.handle ?? ''}`.toLowerCase().includes(lower)) continue
            seen.add(p.id)
            rows.push(toRow(p))
        }
    } else {
        for (const p of network.people) rows.push(toRow(p))
    }

    const loading = searching ? exact.isLoading || network.loading : network.loading

    return (
        <View className="gap-4">
            <View className="gap-3">
                <Text className="font-syne-bold text-[20px] text-[#111827]">
                    {searching ? (loading && rows.length === 0 ? 'Searching…' : `${rows.length} ${rows.length === 1 ? 'collector' : 'collectors'} found`) : 'Collectors to discover'}
                </Text>
                {loading && <ActivityIndicator size="small" color="#2563eb" />}
                {!loading && rows.length === 0 && (
                    <View className="items-center gap-2 py-6">
                        {searching && <SearchX size={30} color="#9ca3af" />}
                        <Text className="text-center font-syne text-[13px] leading-5 text-[#6b7280]">
                            {searching
                                ? `No collector matches "${q}". Try their exact username.`
                                : network.signedIn
                                  ? 'Type a name or username above to find a collector. People you follow, and your followers, will appear here.'
                                  : 'Type a username above to find a collector.'}
                        </Text>
                    </View>
                )}
                {rows.map((r) => (
                    <CollectorRow key={r.id} {...r} />
                ))}
            </View>

            <View className="mt-2 gap-1.5 rounded bg-[#eef2f7] p-4">
                <Globe size={17} color="#111827" />
                <Text className="font-syne-bold text-[14px] text-[#111827]">Collections worth discovering</Text>
                <Text className="font-syne text-[12px] leading-[18px] text-[#6b7280]">
                    Public profiles show only what a collector owns. Their missing items stay private.
                </Text>
            </View>
        </View>
    )
}

type CollectorRowData = {
    id: string
    name: string
    handle: string | null
    avatarUrl: string | null
    isPrivate: boolean
    detail?: string
}

const toRow = (p: FollowUserView): CollectorRowData => ({
    id: p.id,
    name: p.fullName || (p.handle ? `@${p.handle}` : 'Collector'),
    handle: p.handle,
    avatarUrl: p.avatarUrl,
    isPrivate: p.isPrivate,
})

/**
 * Everyone in your own network (who you follow + your followers), deduped. While
 * a search is typed every page is pulled in, so partial name / username matches
 * cover the whole network, not just the first page.
 */
function useNetwork(loadAll: boolean) {
    const { isSignedIn } = useAuth()
    const { data: me } = useMe()
    const following = useFollowingInfinite(me?.id, 'users', 50)
    const followers = useFollowersInfinite(me?.id, 50)

    const { hasNextPage: moreFollowing, isFetchingNextPage: fetchingFollowing, fetchNextPage: nextFollowing } = following
    const { hasNextPage: moreFollowers, isFetchingNextPage: fetchingFollowers, fetchNextPage: nextFollowers } = followers
    useEffect(() => {
        if (!loadAll) return
        if (moreFollowing && !fetchingFollowing) void nextFollowing()
        if (moreFollowers && !fetchingFollowers) void nextFollowers()
    }, [loadAll, moreFollowing, fetchingFollowing, nextFollowing, moreFollowers, fetchingFollowers, nextFollowers])

    const seen = new Set<string>()
    const people: FollowUserView[] = []
    for (const list of [following.data, followers.data]) {
        for (const page of list?.pages ?? []) {
            for (const person of page.data as FollowUserView[]) {
                // `isFollowedByYou` is null on your own row; never list yourself.
                if (person.id === me?.id || seen.has(person.id)) continue
                seen.add(person.id)
                people.push(person)
            }
        }
    }

    const loading = !!isSignedIn && (following.isLoading || followers.isLoading || (loadAll && (!!moreFollowing || !!moreFollowers)))
    return { people, loading, meId: me?.id, signedIn: !!isSignedIn }
}

function CollectorRow({ id, name, handle, avatarUrl, isPrivate, detail }: CollectorRowData) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${name}'s profile`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/collectors/[userId]', params: { userId: id } } as never)}
            className="flex-row items-center gap-4 rounded bg-white p-4"
        >
            {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#e5e7eb' }} contentFit="cover" />
            ) : (
                <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-[#eff6ff]">
                    <UserRound size={22} color="#2563eb" />
                </View>
            )}
            <View className="flex-1 gap-0.5">
                <Text numberOfLines={1} className="font-syne-bold text-[16px] text-[#111827]">{name}</Text>
                {!!handle && <Text numberOfLines={1} className="font-syne text-[12px] text-[#6b7280]">@{handle}</Text>}
                {!!detail && <Text className="font-syne text-[12px] text-[#111827]">{detail}</Text>}
                {isPrivate && (
                    <View className="mt-0.5 flex-row items-center gap-1 self-start rounded bg-[#f3f4f6] px-1.5 py-0.5">
                        <Lock size={9} color="#6b7280" />
                        <Text className="font-syne-semibold text-[9px] text-[#6b7280]">PRIVATE</Text>
                    </View>
                )}
            </View>
            <ChevronRight size={18} color="#4b5563" />
        </TouchableOpacity>
    )
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

function ProductsTab({ term }: { term: string }) {
    const searching = term.length > 0
    const { data, isLoading, isError, refetch } = useDiscoverProducts({
        search: searching ? term : undefined,
        // Nothing typed → the most minted drops, so the tab is never empty.
        section: searching ? undefined : 'trending',
        limit: 20,
    })
    const items = data?.data ?? []

    return (
        <View className="gap-3">
            <Text className="font-syne-bold text-[20px] text-[#111827]">{searching ? 'Results' : 'Popular drops'}</Text>
            {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
            {isError && (
                <View className="items-center gap-3 py-6">
                    <Text className="font-syne text-[13px] text-[#6b7280]">Couldn&apos;t load drops.</Text>
                    <TouchableOpacity onPress={() => refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
            {!isLoading && !isError && items.length === 0 && (
                <Text className="font-syne text-[13px] leading-5 text-[#6b7280]">
                    {searching ? `No drops match "${term}".` : 'No drops yet.'}
                </Text>
            )}
            {items.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/discover/[productId]', params: { productId: item.id } } as never)}
                    className="flex-row items-center gap-4 rounded bg-white p-3"
                >
                    <Image
                        source={{ uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                        style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: '#eef2ff' }}
                        contentFit="cover"
                    />
                    <View className="flex-1 gap-0.5">
                        <Text numberOfLines={2} className="font-syne-bold text-[14px] text-[#111827]">{item.name}</Text>
                        {!!item.artist?.name && <Text numberOfLines={1} className="font-syne text-[12px] text-[#6b7280]">{item.artist.name}</Text>}
                        {!!item.price && <PriceText price={item.price} className="font-syne-bold text-[13px] text-[#111827]" />}
                    </View>
                    <ChevronRight size={18} color="#4b5563" />
                </TouchableOpacity>
            ))}
        </View>
    )
}
