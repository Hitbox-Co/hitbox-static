import { useAuth } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { ArrowLeft, Globe, Lock, Package, UserRound } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { collectionErrorMessage } from '@/features/collections/api/collectionErrors'
import { useUserCollection } from '@/features/collections/api/getUserCollection'
import { CollectionItem } from '@/features/collections/types/collection'
import { DISCOVER_PLACEHOLDER_IMAGE } from '@/features/discover/utils/format'
import { followErrorMessage, useFollowUser } from '@/features/follows/api/follows'
import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { useOwnedProductInfo } from '../api/getOwnedCategories'
import { useUser } from '../api/getProfile'
import { Profile } from '../types/profile'

/**
 * A collector's page (`GET /users/:id`) — Figma P08 (public) and C14 / P10
 * (private). Name, photo and bio show for every profile; the items
 * (`GET /collections/user/:id`) only when it is PUBLIC. A PRIVATE profile is a
 * page of its own ("This profile is private") and the items call is skipped (it
 * would answer 403). Follow / Following comes from `viewer`.
 */
export default function CollectorProfileScreen({ userId, preview = false }: { userId?: string; preview?: boolean }) {
    const { data: profile, isLoading, isError, error, refetch } = useUser(userId)

    if (isLoading) {
        return (
            <Shell>
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </Shell>
        )
    }

    if (isError || !profile) {
        const notFound = (error instanceof ApiRequestError && error.status === 404) || !profile
        return (
            <Shell>
                <View className="mt-16 items-center gap-3 px-6">
                    <UserRound size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {notFound ? "This collector isn't available." : describeApiError(error, "Couldn't load this profile.")}
                    </Text>
                    <TouchableOpacity
                        onPress={() => (notFound ? router.back() : refetch())}
                        className="rounded-[30px] bg-[#111827] px-5 py-2"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">{notFound ? 'Go Back' : 'Retry'}</Text>
                    </TouchableOpacity>
                </View>
            </Shell>
        )
    }

    const asVisitor = preview || !profile.viewer?.isSelf

    return (
        <Shell>
            {preview && (
                <View className="rounded border border-[#bfdbfe] bg-[#eff6ff] p-3">
                    <Text className="font-syne-bold text-[12px] text-[#2563eb]">Visitor preview</Text>
                    <Text className="mt-0.5 font-syne text-[11px] leading-[16px] text-[#4b5563]">
                        This is how other collectors see your profile right now.
                    </Text>
                </View>
            )}
            {profile.isPrivate && asVisitor ? (
                <PrivateProfile profile={profile} preview={preview} />
            ) : (
                <PublicProfile profile={profile} preview={preview} />
            )}
        </Shell>
    )
}

const displayName = (p: Profile) => p.fullName || (p.handle ? `@${p.handle}` : 'Collector')

/** The page frame: back + HitBox + "PROFILE" on white, the light page below. */
function Shell({ children }: { children: React.ReactNode }) {
    return (
        <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={{ flex: 1, backgroundColor: '#f6f9fc' }}>
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
                <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">PROFILE</Text>
            </View>
            <View className="h-px bg-[#e5e7eb]" />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}>
                {children}
            </ScrollView>
        </SafeAreaView>
    )
}

/* ------------------------------------------------------------------ */
/* Public profile (Figma P08)                                          */
/* ------------------------------------------------------------------ */

function PublicProfile({ profile, preview }: { profile: Profile; preview: boolean }) {
    const { isSignedIn } = useAuth()
    const follow = useFollowUser()
    // Optimistic: follow/unfollow is idempotent, so the button flips at once.
    const [pending, setPending] = useState<{ on: boolean; followers: number } | null>(null)
    const on = pending?.on ?? profile.viewer?.isFollowing === true
    const followers = pending?.followers ?? profile.stats.followers
    const name = displayName(profile)
    const memberSince = new Date(profile.createdAt).getFullYear()

    const toggleFollow = () => {
        if (!isSignedIn) {
            Alert.alert('Sign in to follow', 'Sign in to follow collectors.', [
                { text: 'Not now', style: 'cancel' },
                { text: 'Sign in', onPress: () => router.push('/(auth)/register' as never) },
            ])
            return
        }
        const next = !on
        setPending({ on: next, followers: Math.max(0, followers + (next ? 1 : -1)) })
        follow.mutate(
            { userId: profile.id, follow: next },
            {
                // The server's own count wins once it answers.
                onSuccess: (result) => result && setPending({ on: result.following, followers: result.followerCount }),
                onError: (err) => {
                    setPending(null)
                    Alert.alert("Couldn't update", followErrorMessage(err))
                },
            },
        )
    }

    const openFollows = (tab: 'followers' | 'following') =>
        router.push({ pathname: '/follows/[userId]', params: { userId: profile.id, tab } } as never)

    // Their newest public item, if any — what the story card shows (the list is newest-first).
    const newestItem = useUserCollection(profile.id, { limit: 50 }).data?.data.find(
        (i) => !preview || i.visibility === 'PUBLIC',
    )

    const stats = [
        { value: profile.stats.claimedItems, label: 'Items\nowned', onPress: undefined as (() => void) | undefined },
        { value: profile.stats.artistCollections, label: 'Collections', onPress: undefined },
        { value: followers, label: 'Followers', onPress: () => openFollows('followers') },
    ]

    return (
        <>
            {/* Identity card */}
            <View className="rounded-lg bg-[#0b1b36] p-4">
                <View className="flex-row gap-4">
                    {profile.avatarUrl ? (
                        <Image source={{ uri: profile.avatarUrl }} style={{ width: 58, height: 58, borderRadius: 4, backgroundColor: '#1f2f4d' }} contentFit="cover" />
                    ) : (
                        <View className="h-[58px] w-[58px] items-center justify-center rounded bg-[#1f2f4d]">
                            <UserRound size={26} color="#94a3b8" />
                        </View>
                    )}
                    <View className="flex-1 gap-1">
                        <View className="flex-row items-center gap-1.5">
                            <Text numberOfLines={1} className="shrink font-syne-bold text-[22px] text-white">{name}</Text>
                            <Text className="text-[20px] text-white">✓</Text>
                        </View>
                        {!!profile.handle && (
                            <Text numberOfLines={1} className="font-syne text-[11px] text-[#94a3b8]">@{profile.handle}</Text>
                        )}
                    </View>
                </View>

                <View className="mt-3 flex-row items-center justify-between">
                    <Text className="font-syne text-[11px] text-[#94a3b8]">Member since {memberSince}</Text>
                    <View className="flex-row items-center gap-1.5">
                        <Globe size={13} color="#4ade80" />
                        <Text className="font-syne-bold text-[11px] text-[#4ade80]">Public</Text>
                    </View>
                </View>

                <View className="mt-4 h-px bg-[#1f2f4d]" />

                <View className="mt-4 flex-row justify-between">
                    {stats.map((s) => {
                        const body = (
                            <View className="gap-0.5">
                                <Text className="font-syne-bold text-[20px] text-white">{s.value}</Text>
                                <Text className="font-syne text-[10px] leading-[12px] text-[#94a3b8]">{s.label}</Text>
                            </View>
                        )
                        return s.onPress ? (
                            <TouchableOpacity key={s.label} accessibilityRole="button" accessibilityLabel={`${s.value} ${s.label}`} onPress={s.onPress}>
                                {body}
                            </TouchableOpacity>
                        ) : (
                            <View key={s.label}>{body}</View>
                        )
                    })}
                </View>
            </View>

            {!!profile.bio && <Text className="font-syne text-[13px] leading-[19px] text-[#6b7280]">{profile.bio}</Text>}

            {/* The one action: Follow (visitors) or Edit profile (yourself) */}
            {preview ? null : profile.viewer?.isSelf ? (
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => router.push('/edit-profile' as never)}
                    className="h-[46px] items-center justify-center rounded-[2px] border-[1.5px] border-[#111827] bg-white"
                >
                    <Text className="font-syne-bold text-[13px] text-[#111827]">Edit profile</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={on ? `Unfollow ${name}` : `Follow ${name}`}
                    onPress={toggleFollow}
                    disabled={follow.isPending}
                    className={`h-[46px] items-center justify-center rounded-[2px] ${on ? 'border-[1.5px] border-[#111827] bg-white' : 'bg-black'}`}
                >
                    <Text className={`font-syne-bold text-[13px] ${on ? 'text-[#111827]' : 'text-white'}`}>{on ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
            )}

            {!!newestItem && (
                <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/story/[userId]', params: { userId: profile.id } } as never)}
                    className="h-[46px] items-center justify-center rounded-[2px] border-[1.5px] border-[#111827] bg-white"
                >
                    <Text className="font-syne-bold text-[13px] text-[#111827]">View newest purchase →</Text>
                </TouchableOpacity>
            )}

            {/* Collection */}
            {/* Your own token returns your whole shelf; a visitor only gets items marked Public. */}
            <Showcase userId={profile.id} publicOnly={preview} />

            <View className="rounded bg-[#eef2f7] p-4">
                <Text className="font-syne-bold text-[12px] text-[#111827]">Owned products only · Official collection names</Text>
            </View>

            <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.back()}
                className="flex-row items-center gap-2 self-start py-1"
            >
                <ArrowLeft size={15} color="#111827" />
                <Text className="font-syne-bold text-[13px] text-[#111827]">{preview ? 'Back to privacy settings' : 'Back to collectors'}</Text>
            </TouchableOpacity>
        </>
    )
}

/**
 * The collector's public items, grouped by the collection each belongs to (one
 * cached drop-detail lookup per item — a shelf row doesn't carry it). Each group
 * is a row of "Verified collectible" cards. The API has no collection names, so a
 * group is titled by its artist; items outside any collection fall under "Other
 * collectibles".
 */
function Showcase({ userId, publicOnly = false }: { userId: string; publicOnly?: boolean }) {
    const { data, isLoading, isError, error } = useUserCollection(userId, { limit: 50 })
    const items = (data?.data ?? []).filter((item) => !publicOnly || item.visibility === 'PUBLIC')
    const infoById = useOwnedProductInfo(items.map((i) => i.product.id))

    const groups = new Map<string, { title: string; items: CollectionItem[] }>()
    for (const item of items) {
        const info = infoById[item.product.id]
        const key = info?.collectionId ?? 'other'
        const title = info?.collectionId ? (info.artistName ?? 'Collection') : 'Other collectibles'
        const g = groups.get(key) ?? { title, items: [] }
        g.items.push(item)
        groups.set(key, g)
    }

    return (
        <View className="gap-3">
            <Text className="font-syne-bold text-[24px] text-[#111827]">Collection</Text>
            {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
            {isError && <Text className="font-syne text-[12px] text-[#6b7280]">{collectionErrorMessage(error)}</Text>}
            {!isLoading && !isError && items.length === 0 && (
                <View className="items-center gap-2 py-6">
                    <Package size={28} color="#9ca3af" />
                    <Text className="font-syne text-[12px] text-[#6b7280]">Nothing shared yet.</Text>
                </View>
            )}
            {[...groups.entries()].map(([key, g]) => (
                <View key={key} className="gap-2.5">
                    <View className="flex-row items-center justify-between">
                        <Text numberOfLines={1} className="flex-1 font-syne-bold text-[16px] text-[#111827]">{g.title}</Text>
                        <View className="rounded bg-white px-3 py-1.5">
                            <Text className="font-syne text-[11px] text-[#6b7280]">
                                {g.items.length} {g.items.length === 1 ? 'item' : 'items'}
                            </Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} className="grow-0">
                        {g.items.map((item) => (
                            <ShowcaseCard key={item.id} item={item} />
                        ))}
                    </ScrollView>
                </View>
            ))}
        </View>
    )
}

function ShowcaseCard({ item }: { item: CollectionItem }) {
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.product.name}`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/discover/[productId]', params: { productId: item.product.id } } as never)}
            style={{ width: 152 }}
            className="overflow-hidden rounded bg-white"
        >
            <Image
                source={{ uri: item.product.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                style={{ width: '100%', aspectRatio: 1.05, backgroundColor: '#e5e7eb' }}
                contentFit="cover"
            />
            <View className="gap-0.5 p-2.5">
                <Text numberOfLines={1} className="font-syne-bold text-[12px] text-[#111827]">{item.product.name}</Text>
                <Text className="font-syne text-[10px] text-[#6b7280]">Verified collectible</Text>
            </View>
        </TouchableOpacity>
    )
}

/* ------------------------------------------------------------------ */
/* Private profile (Figma C14 / P10)                                   */
/* ------------------------------------------------------------------ */

/**
 * What a visitor sees on a PRIVATE profile: the photo, name and "@handle · Member
 * since", a card saying the collection is hidden, and a way back. No items, no
 * stats and no Follow button — the page is deliberately bare. (The follow
 * endpoints still accept a private profile; they are reachable from the
 * Followers / Following lists.)
 */
function PrivateProfile({ profile, preview }: { profile: Profile; preview: boolean }) {
    const name = displayName(profile)
    const first = profile.fullName?.split(' ')[0] || profile.handle || 'This collector'
    const memberSince = new Date(profile.createdAt).getFullYear()

    return (
        <View className="gap-5">
            <View className="items-center">
                {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: '#e5e7eb' }} contentFit="cover" />
                ) : (
                    <View className="h-[84px] w-[84px] items-center justify-center rounded-full bg-[#eff6ff]">
                        <UserRound size={34} color="#2563eb" />
                    </View>
                )}
            </View>

            <View className="gap-1.5">
                <View className="flex-row items-center gap-2">
                    <Text numberOfLines={1} className="shrink font-syne-bold text-[28px] text-[#111827]">{name}</Text>
                    <Text className="text-[24px] text-[#111827]">✓</Text>
                </View>
                <Text className="font-syne text-[13px] text-[#6b7280]">
                    {[profile.handle ? `@${profile.handle}` : null, `Member since ${memberSince}`].filter(Boolean).join(' · ')}
                </Text>
            </View>

            <View className="gap-3 rounded-[3px] border border-[#eef2f7] bg-white p-5">
                <View className="items-center">
                    <View className="h-[62px] w-[62px] items-center justify-center rounded bg-[#f1f5f9]">
                        <Lock size={22} color="#111827" />
                    </View>
                </View>
                <Text className="mt-2 font-syne-bold text-[22px] text-[#111827]">This profile is private</Text>
                <Text className="pb-4 font-syne text-[13px] leading-[19px] text-[#6b7280]">
                    {`${first}'s collections and products are hidden. Only ${first} can manage their collection.`}
                </Text>
            </View>

            <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => router.back()}
                className="h-[45px] justify-center rounded-[2px] bg-black px-3.5"
            >
                <Text className="font-syne-bold text-[13px] text-white">{preview ? 'Back to privacy settings' : 'Back to collectors'}</Text>
            </TouchableOpacity>

            <Text className="font-syne text-[12px] leading-[18px] text-[#6b7280]">
                No collection previews or purchase stories are visible on a private profile.
            </Text>
        </View>
    )
}
