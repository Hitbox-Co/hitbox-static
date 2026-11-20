import { useAuth } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Lock, Package, UserRound } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, SectionHeading } from '@/features/checkout/components/CheckoutParts'
import { collectionErrorMessage } from '@/features/collections/api/collectionErrors'
import { useUserCollection } from '@/features/collections/api/getUserCollection'
import { CollectionItem } from '@/features/collections/types/collection'
import { DISCOVER_PLACEHOLDER_IMAGE, rarityLabel } from '@/features/discover/utils/format'
import { followErrorMessage, useFollowUser } from '@/features/follows/api/follows'
import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { useUser } from '../api/getProfile'
import { Profile } from '../types/profile'

/**
 * A collector's page (`GET /users/:id`). Name, avatar, bio and stats show for
 * every profile; the items (`GET /collections/user/:id`) only when it is PUBLIC —
 * a PRIVATE profile shows "This profile is private" and the items call is
 * skipped (it would answer 403). Follow / Following comes from `viewer`.
 */
export default function CollectorProfileScreen({ userId, preview = false }: { userId?: string; preview?: boolean }) {
    const { data: profile, isLoading, isError, error, refetch } = useUser(userId)

    if (isLoading) {
        return (
            <CheckoutShell showBag={false}>
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (isError || !profile) {
        const notFound = (error instanceof ApiRequestError && error.status === 404) || !profile
        return (
            <CheckoutShell showBag={false}>
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
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell showBag={false}>
            {preview && (
                <View className="rounded border border-[#bfdbfe] bg-[#eff6ff] p-3">
                    <Text className="font-syne-bold text-[12px] text-[#2563eb]">Visitor preview</Text>
                    <Text className="mt-0.5 font-syne text-[11px] leading-[16px] text-[#4b5563]">
                        This is how other collectors see your profile right now.
                    </Text>
                </View>
            )}
            {profile.isPrivate && (preview || !profile.viewer?.isSelf) ? (
                // A private profile is a page of its own (Figma C14 / P10): who they are, and that the rest is hidden.
                <PrivateProfile profile={profile} preview={preview} />
            ) : (
                <>
                    <ProfileHeader profile={profile} preview={preview} />
                    {/* Your own token returns your whole shelf; a visitor only gets items marked Public. */}
                    <Showcase userId={profile.id} publicOnly={preview} />
                </>
            )}
        </CheckoutShell>
    )
}

const displayName = (p: Profile) => p.fullName || (p.handle ? `@${p.handle}` : 'Collector')

function ProfileHeader({ profile, preview = false }: { profile: Profile; preview?: boolean }) {
    const { isSignedIn } = useAuth()
    const follow = useFollowUser()
    // Optimistic: follow/unfollow is idempotent, so the button flips at once.
    const [pending, setPending] = useState<{ on: boolean; followers: number } | null>(null)
    const on = pending?.on ?? profile.viewer?.isFollowing === true
    const followers = pending?.followers ?? profile.stats.followers
    const name = displayName(profile)
    const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

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

    return (
        <View className="gap-4">
            <View className="flex-row items-center gap-4">
                {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#e5e7eb' }} contentFit="cover" />
                ) : (
                    <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-[#eff6ff]">
                        <UserRound size={30} color="#2563eb" />
                    </View>
                )}
                <View className="flex-1 gap-0.5">
                    <Text numberOfLines={1} className="font-orbitron text-[18px] text-[#111827]">{name}</Text>
                    {!!profile.handle && profile.fullName && (
                        <Text numberOfLines={1} className="font-syne text-[12px] text-[#6b7280]">@{profile.handle}</Text>
                    )}
                    <Text className="font-syne text-[11px] text-[#9ca3af]">{`Member since ${memberSince}`}</Text>
                </View>
            </View>

            {!!profile.bio && <Text className="font-syne text-[13px] leading-[20px] text-[#374151]">{profile.bio}</Text>}

            <View className="flex-row justify-between rounded border border-[#dbeafe] bg-white px-4 py-3">
                <Stat value={profile.stats.claimedItems} label="Items" />
                <Stat value={profile.stats.artistCollections} label="Collections" />
                <Stat value={followers} label="Followers" onPress={() => openFollows('followers')} />
                <Stat value={profile.stats.following} label="Following" onPress={() => openFollows('following')} />
            </View>

            {preview ? null : profile.viewer?.isSelf ? (
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => router.push('/edit-profile' as never)}
                    className="h-11 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    <Text className="font-syne-bold text-[13px] text-[#2563eb]">Edit profile</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={on ? `Unfollow ${name}` : `Follow ${name}`}
                    onPress={toggleFollow}
                    disabled={follow.isPending}
                    className={`h-11 items-center justify-center rounded-[30px] ${on ? 'border border-[#bfdbfe] bg-[#eff6ff]' : 'bg-[#111827]'}`}
                >
                    <Text className={`font-syne-bold text-[13px] ${on ? 'text-[#2563eb]' : 'text-white'}`}>{on ? 'Following' : 'Follow'}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
    const body = (
        <View className="items-center">
            <Text className="font-syne-bold text-[16px] text-[#111827]">{value}</Text>
            <Text className="font-syne text-[10px] text-[#6b7280]">{label}</Text>
        </View>
    )
    return onPress ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${value} ${label}`} onPress={onPress}>
            {body}
        </TouchableOpacity>
    ) : (
        body
    )
}

/**
 * What a visitor sees on a PRIVATE profile (Figma C14 "Collection hidden" / P10):
 * the photo, name and "@handle · Member since", a card saying the collection is
 * hidden, and a way back. No items, no stats and no Follow button — the page is
 * deliberately bare. (The follow endpoints still accept a private profile; they are
 * reachable from the Followers / Following lists.)
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

function Showcase({ userId, publicOnly = false }: { userId: string; publicOnly?: boolean }) {
    const { data, isLoading, isError, error } = useUserCollection(userId, { limit: 50 })
    const items = (data?.data ?? []).filter((item) => !publicOnly || item.visibility === 'PUBLIC')

    return (
        <View className="gap-3">
            <SectionHeading title="Collection" />
            {isLoading && <ActivityIndicator size="small" color="#2563eb" />}
            {isError && (
                <Text className="font-syne text-[12px] text-[#6b7280]">{collectionErrorMessage(error)}</Text>
            )}
            {!isLoading && !isError && items.length === 0 && (
                <View className="items-center gap-2 py-6">
                    <Package size={28} color="#9ca3af" />
                    <Text className="font-syne text-[12px] text-[#6b7280]">Nothing shared yet.</Text>
                </View>
            )}
            <View className="flex-row flex-wrap justify-between gap-y-3">
                {items.map((item) => (
                    <ShowcaseCard key={item.id} item={item} />
                ))}
            </View>
        </View>
    )
}

function ShowcaseCard({ item }: { item: CollectionItem }) {
    const rarity = rarityLabel(item.product.rarity)
    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.product.name}`}
            activeOpacity={0.85}
            onPress={() => router.push({ pathname: '/discover/[productId]', params: { productId: item.product.id } } as never)}
            style={{ width: '48%' }}
            className="overflow-hidden rounded-[10px] border border-[#dbeafe] bg-white"
        >
            <Image
                source={{ uri: item.product.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                style={{ width: '100%', aspectRatio: 1, backgroundColor: '#eef2ff' }}
                contentFit="cover"
            />
            <View className="gap-0.5 p-2.5">
                <Text numberOfLines={1} className="font-syne-bold text-[12px] text-[#111827]">{item.product.name}</Text>
                <Text className="font-syne text-[10px] text-[#6b7280]">
                    {[`#${item.sku.serialNumber}`, rarity].filter(Boolean).join(' · ')}
                </Text>
            </View>
        </TouchableOpacity>
    )
}
