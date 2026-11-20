import { BadgeCheck, Globe, Lock, UserRound } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMyCollection } from '@/features/collections/api/getMyCollection';
import { DISCOVER_PLACEHOLDER_IMAGE } from '@/features/discover/utils/format';
import { useFollowCounts } from '@/features/follows/api/follows';
import { useRewards } from '@/features/rewards/api/getRewards';
import { useMe } from '../api/getProfile';

/**
 * My profile — Figma P02. A light page: the HitBox header, Edit profile /
 * Account & settings, the navy identity card (photo, name, handle, member
 * since, items / collections / rewards), the Public-or-Private row that opens
 * the visibility switch, and the Collection preview.
 *
 * Every number is real: items and collections come with `GET /users/me`
 * (`stats`), rewards are the count of `GET /rewards`, and the preview is
 * `GET /collections/me`. Two things in the Figma have no source and are left
 * out: HIT POINTS (the profile API no longer returns points) and the collection
 * being grouped by artist (a shelf row does not say which artist it belongs to),
 * so the preview is the newest items in rows of three.
 */
export default function ProfileScreen() {
    const { user } = useUser();
    const { data: me } = useMe();
    const rewards = useRewards();
    const shelf = useMyCollection({ limit: 9 });
    // Followers / Following come with `stats`; list totals only back them up.
    const fallback = useFollowCounts(me?.id, !me?.stats);

    const name = me?.fullName || user?.fullName || (me?.handle ? `@${me.handle}` : null) || 'HitBox Collector';
    const handle = me?.handle ?? user?.username ?? null;
    const avatarUrl = user?.imageUrl ?? me?.avatarUrl ?? null;
    const joined = me?.createdAt ?? (user?.createdAt ? new Date(user.createdAt).toISOString() : null);
    const memberSince = joined ? new Date(joined).getFullYear() : null;

    const isPublic = me?.profileVisibility === 'PUBLIC';
    const items = shelf.data?.data ?? [];
    const totalItems = shelf.data?.meta.total ?? me?.stats?.claimedItems ?? 0;

    const stats = [
        { value: me?.stats?.claimedItems ?? shelf.data?.meta.total, label: 'Items\nowned' },
        { value: me?.stats?.artistCollections, label: 'Collections' },
        { value: rewards.data?.length, label: 'Rewards\nearned' },
    ];
    const followers = me?.stats?.followers ?? fallback.followers;
    const following = me?.stats?.following ?? fallback.following;

    const openFollows = (tab: 'followers' | 'following') =>
        me && router.push({ pathname: '/follows/[userId]', params: { userId: me.id, tab } } as never);

    return (
        <SafeAreaView
            // No bottom edge: the tab bar already reserves the safe area below.
            edges={['top', 'left', 'right']}
            style={{ flex: 1, backgroundColor: '#f6f9fc' }}
        >
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Header */}
                <View className="h-11 flex-row items-center justify-between px-5">
                    <View className="flex-row items-center gap-[7px]">
                        <RNImage
                            source={require('@/assets/images/HitBoxLogo-dark.png')}
                            resizeMode="contain"
                            style={{ width: 26, height: 26 }}
                        />
                        <Text className="font-orbitron text-[14px] text-[#111827]">HitBox</Text>
                    </View>
                    <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">MY PROFILE</Text>
                </View>

                {/* Primary actions */}
                <View className="mt-3 flex-row gap-[9px] px-5">
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.8}
                        onPress={() => router.push('/edit-profile' as never)}
                        className="h-10 flex-1 justify-center rounded-[3px] border-[1.5px] border-[#111827] bg-white px-3"
                    >
                        <Text className="font-syne-bold text-[12px] text-[#111827]">Edit profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.8}
                        onPress={() => router.push('/settings' as never)}
                        className="h-10 flex-1 justify-center rounded-[3px] border-[1.5px] border-[#111827] bg-white px-3"
                    >
                        <Text className="font-syne-bold text-[12px] text-[#111827]">Account &amp; settings</Text>
                    </TouchableOpacity>
                </View>

                {/* Identity card */}
                <View className="mx-5 mt-4 rounded-lg bg-[#0b1b36] p-4">
                    <View className="flex-row gap-4">
                        {avatarUrl ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                style={{ width: 58, height: 58, borderRadius: 4, backgroundColor: '#1f2f4d' }}
                                contentFit="cover"
                            />
                        ) : (
                            <View className="h-[58px] w-[58px] items-center justify-center rounded bg-[#1f2f4d]">
                                <UserRound size={26} color="#94a3b8" />
                            </View>
                        )}
                        <View className="flex-1 gap-1">
                            <View className="flex-row items-center gap-1.5">
                                <Text numberOfLines={1} className="shrink font-syne-extrabold text-[20px] text-white">
                                    {name}
                                </Text>
                                <BadgeCheck size={18} color="#0b1b36" fill="#ffffff" />
                            </View>
                            {!!handle && (
                                <Text numberOfLines={1} className="font-syne text-[11px] text-[#94a3b8]">
                                    @{handle}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Text className="mt-3 font-syne text-[10px] text-[#94a3b8]">
                        {memberSince ? `Member since ${memberSince}` : ' '}
                    </Text>

                    {/* Followers · Following */}
                    {me && (
                        <View className="mt-1 flex-row items-center gap-4">
                            <TouchableOpacity accessibilityRole="button" onPress={() => openFollows('followers')}>
                                <Text className="font-syne text-[11px] text-[#94a3b8]">
                                    <Text className="font-syne-bold text-white">{followers ?? '–'}</Text> Followers
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" onPress={() => openFollows('following')}>
                                <Text className="font-syne text-[11px] text-[#94a3b8]">
                                    <Text className="font-syne-bold text-white">{following ?? '–'}</Text> Following
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Items · Collections · Rewards */}
                    <View className="mt-4 flex-row items-end justify-between">
                        {stats.map((s) => (
                            <View key={s.label} className="flex-row items-end gap-1.5">
                                <Text className="font-syne-extrabold text-[22px] leading-[26px] text-white">{s.value ?? '–'}</Text>
                                <Text className="mb-0.5 font-syne text-[9px] leading-[11px] text-[#94a3b8]">{s.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Public / Private profile */}
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Manage profile visibility"
                    activeOpacity={0.8}
                    onPress={() => router.push('/edit-profile' as never)}
                    className="mx-5 mt-3 h-11 flex-row items-center justify-between rounded-lg border border-[#374151] bg-white px-3.5"
                >
                    <View className="flex-row items-center gap-2.5">
                        {isPublic ? <Globe size={17} color="#111827" /> : <Lock size={17} color="#111827" />}
                        <Text className="font-syne-bold text-[12px] text-[#111827]">{isPublic ? 'Public profile' : 'Private profile'}</Text>
                    </View>
                    <Text className="font-syne-bold text-[11px] text-[#111827]">Manage →</Text>
                </TouchableOpacity>

                {/* Collection */}
                <View className="mt-6 px-5">
                    <View className="flex-row items-center justify-between">
                        <Text className="font-orbitron text-[22px] text-[#1e2a44]">Collection</Text>
                        <TouchableOpacity accessibilityRole="button" onPress={() => router.push('/(tabs)/collections' as never)}>
                            <Text className="font-syne-bold text-[11px] text-[#111827]">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {items.length > 0 ? (
                        <View className="mt-3">
                            <View className="flex-row items-center justify-between">
                                <Text className="font-orbitron text-[14px] text-[#1e2a44]">Recently added</Text>
                                <Text className="font-syne-bold text-[10px] text-[#111827]">
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                                </Text>
                            </View>
                            <View className="mt-2 flex-row flex-wrap gap-x-2 gap-y-3">
                                {items.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Open ${item.product.name}`}
                                        activeOpacity={0.85}
                                        onPress={() =>
                                            router.push({ pathname: '/discover/[productId]', params: { productId: item.product.id } } as never)
                                        }
                                        style={{ width: '31.6%' }}
                                    >
                                        <Image
                                            source={{ uri: item.product.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                                            style={{ width: '100%', aspectRatio: 1.85, borderRadius: 4, backgroundColor: '#e5e7eb' }}
                                            contentFit="cover"
                                        />
                                        <Text numberOfLines={1} className="mt-1 font-syne-bold text-[9.5px] text-[#374151]">
                                            {item.product.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        !shelf.isLoading && (
                            <Text className="mt-4 font-syne text-[12px] leading-[18px] text-[#6b7280]">
                                Nothing here yet. Claim an item with the Scan tab and it will appear in your collection.
                            </Text>
                        )
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
