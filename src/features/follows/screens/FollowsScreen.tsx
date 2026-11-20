import { useAuth } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { Lock, UserRound, Users } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { describeApiError } from '@/lib/api-errors'
import { followErrorMessage, useFollowersInfinite, useFollowingInfinite, useFollowUser } from '../api/follows'
import { FollowArtistView, FollowUserView } from '../types/follow'

type Tab = 'followers' | 'following' | 'artists'

const TABS: { id: Tab; label: string }[] = [
    { id: 'followers', label: 'Followers' },
    { id: 'following', label: 'Following' },
    { id: 'artists', label: 'Artists' },
]

/**
 * Followers / Following for one collector (`GET /follows/users/:id/followers`
 * and `/following?type=users|artists`). Public lists; signed in, each collector
 * row carries your own Follow button. Private collectors still appear — a
 * private profile hides only what its owner holds.
 */
export default function FollowsScreen({ userId, initialTab = 'followers' }: { userId?: string; initialTab?: Tab }) {
    const [tab, setTab] = useState<Tab>(initialTab)

    const followers = useFollowersInfinite(tab === 'followers' ? userId : undefined)
    const following = useFollowingInfinite(tab === 'following' ? userId : undefined, 'users')
    const artists = useFollowingInfinite(tab === 'artists' ? userId : undefined, 'artists')
    const list = tab === 'followers' ? followers : tab === 'following' ? following : artists

    const rows: (FollowUserView | FollowArtistView)[] = (list.data?.pages ?? []).flatMap(
        (p) => p.data as (FollowUserView | FollowArtistView)[],
    )
    const total = list.data?.pages[0]?.meta.total

    return (
        <CheckoutShell showBag={false}>
            <PageIntro title="Connections" subtitle={total != null ? `${total} ${TABS.find((t) => t.id === tab)!.label.toLowerCase()}` : undefined} />

            <View className="flex-row gap-2">
                {TABS.map((t) => {
                    const active = t.id === tab
                    return (
                        <TouchableOpacity
                            key={t.id}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            onPress={() => setTab(t.id)}
                            className={`h-8 justify-center rounded border px-[14px] ${active ? 'border-[rgba(59,130,245,0.25)] bg-[#eff6ff]' : 'border-[#e5e7eb] bg-[#f3f4f6]'}`}
                        >
                            <Text className={`text-[12.5px] ${active ? 'font-syne-semibold text-[#2563eb]' : 'font-syne-medium text-[#6b7280]'}`}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {list.isLoading && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {list.isError && !list.isLoading && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(list.error, "Couldn't load this list.")}
                    </Text>
                    <TouchableOpacity onPress={() => list.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!list.isLoading && !list.isError && rows.length === 0 && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Users size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {tab === 'followers' ? 'No followers yet.' : tab === 'following' ? 'Not following any collectors yet.' : 'Not following any artists yet.'}
                    </Text>
                </View>
            )}

            {tab === 'artists'
                ? (rows as FollowArtistView[]).map((a) => <ArtistRow key={a.id} artist={a} />)
                : (rows as FollowUserView[]).map((u) => <CollectorRow key={u.id} user={u} />)}

            {list.hasNextPage && (
                <TouchableOpacity
                    onPress={() => list.fetchNextPage()}
                    disabled={list.isFetchingNextPage}
                    className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    {list.isFetchingNextPage ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                    )}
                </TouchableOpacity>
            )}
        </CheckoutShell>
    )
}

function Avatar({ uri }: { uri: string | null }) {
    return uri ? (
        <Image source={{ uri }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#e5e7eb' }} contentFit="cover" />
    ) : (
        <View className="h-11 w-11 items-center justify-center rounded-full bg-[#eff6ff]">
            <UserRound size={20} color="#2563eb" />
        </View>
    )
}

function CollectorRow({ user }: { user: FollowUserView }) {
    const { isSignedIn } = useAuth()
    const follow = useFollowUser()
    // Optimistic: follow/unfollow is idempotent, so the button flips at once.
    const [pending, setPending] = useState<boolean | null>(null)
    const on = pending ?? user.isFollowedByYou === true
    const name = user.fullName || (user.handle ? `@${user.handle}` : 'Collector')

    const toggle = () => {
        const next = !on
        setPending(next)
        follow.mutate(
            { userId: user.id, follow: next },
            {
                onSettled: () => setPending(null),
                onError: (err) => Alert.alert("Couldn't update", followErrorMessage(err)),
            },
        )
    }

    return (
        <GroupedCard>
            <View className="flex-row items-center gap-3">
                <Avatar uri={user.avatarUrl} />
                <View className="flex-1 gap-0.5">
                    <Text numberOfLines={1} className="font-syne-bold text-[13px] text-[#111827]">{name}</Text>
                    <View className="flex-row items-center gap-1.5">
                        {!!user.handle && user.fullName && (
                            <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">@{user.handle}</Text>
                        )}
                        {user.isPrivate && (
                            <View className="flex-row items-center gap-1 rounded bg-[#f3f4f6] px-1.5 py-0.5">
                                <Lock size={9} color="#6b7280" />
                                <Text className="font-syne-semibold text-[9px] text-[#6b7280]">PRIVATE</Text>
                            </View>
                        )}
                    </View>
                </View>
                {/* null = guest, or this row is you: no button. */}
                {isSignedIn && user.isFollowedByYou !== null && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={on ? `Unfollow ${name}` : `Follow ${name}`}
                        onPress={toggle}
                        disabled={follow.isPending}
                        className={`h-8 justify-center rounded-[30px] px-4 ${on ? 'border border-[#bfdbfe] bg-[#eff6ff]' : 'bg-[#111827]'}`}
                    >
                        <Text className={`font-syne-bold text-[12px] ${on ? 'text-[#2563eb]' : 'text-white'}`}>{on ? 'Following' : 'Follow'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </GroupedCard>
    )
}

function ArtistRow({ artist }: { artist: FollowArtistView }) {
    return (
        <GroupedCard>
            <View className="flex-row items-center gap-3">
                <Avatar uri={artist.avatarUrl} />
                <View className="flex-1">
                    <Text numberOfLines={1} className="font-syne-bold text-[13px] text-[#111827]">{artist.name}</Text>
                    <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">Artist</Text>
                </View>
            </View>
        </GroupedCard>
    )
}
