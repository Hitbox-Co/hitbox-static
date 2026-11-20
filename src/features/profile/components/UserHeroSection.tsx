import { useUser } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Calendar, CheckCircle2, Pencil } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { useFollowCounts } from '@/features/follows/api/follows'
import { useMe } from '../api/getProfile'


export default function UserHeroSection() {
    const { user } = useUser()
    // Backend profile (canonical handle and name). Clerk fills the gaps
    // while the query loads or if the webhook hasn't synced yet. Username and
    // names live in unsafeMetadata for email sign-ups (Clerk instance has those
    // attributes disabled), so that's the last Clerk-side fallback.
    const { data: me } = useMe()
    // Followers / Following come with GET /users/me (`stats`); the list totals
    // are only fetched when an older server leaves `stats` out.
    const fallbackCounts = useFollowCounts(me?.id, !me?.stats)
    const counts = {
        followers: me?.stats?.followers ?? fallbackCounts.followers,
        following: me?.stats?.following ?? fallbackCounts.following,
    }
    const openFollows = (tab: 'followers' | 'following') =>
        me && router.push({ pathname: '/follows/[userId]', params: { userId: me.id, tab } } as never)
    const meta = (user?.unsafeMetadata ?? {}) as {
        username?: string
        firstName?: string
        lastName?: string
    }

    const displayName = me?.fullName
        || user?.fullName
        || [meta.firstName, meta.lastName].filter(Boolean).join(' ')
        || me?.handle
        || user?.username
        || meta.username
        || me?.email
        || user?.primaryEmailAddress?.emailAddress
        || 'HitBox Collector'
    const username = me?.handle ?? user?.username ?? meta.username ?? null
    // Clerk first: setProfileImage() updates user.imageUrl instantly, so a new
    // upload shows here immediately (the backend row catches up via PATCH/webhook).
    const avatarUrl = user?.imageUrl ?? me?.avatarUrl
    const initials = displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    const joinedAt = me?.createdAt ?? user?.createdAt
    const memberSince = joinedAt
        ? new Date(joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null

    return (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 450 }}
            className="grid grid-cols-3 items-center gap-2 px-4 py-3 bg-background w-full"
        >
            {/* AVATAR & USER INFO (the HIT points box is gone: the profile API no longer returns points) */}
            <View className="col-span-3 flex-row items-center gap-4">
                <MotiView
                    from={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="p-[3px] rounded-full border-2 border-primary shadow-lg shadow-primary/30"
                >
                    {/* Tap the avatar to edit the profile */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => router.push('/edit-profile')}
                        className="relative"
                    >
                        <Avatar className="w-20 h-20 border border-black/40" alt={'Profile'}>
                            {avatarUrl ? (
                                <AvatarImage
                                    source={{ uri: avatarUrl }}
                                    className='w-full h-full'
                                />
                            ) : null}
                            <AvatarFallback>
                                <Text className="text-white font-bold text-lg">{initials}</Text>
                            </AvatarFallback>
                        </Avatar>

                        <View className="absolute -bottom-0.5 -right-0.5 bg-primary p-1.5 rounded-full border-2 border-background">
                            <Pencil size={11} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </MotiView>

                {/* TEXT DETAILS */}
                <View className="gap-1 flex-1">
                    <View className="flex-row items-center gap-1.5 flex-wrap">
                        <Text className="text-foreground text-xl font-bold tracking-tight">
                            {displayName}
                        </Text>
                        <CheckCircle2 size={18} color="#ffffff" fill="#6d28d9" className="mt-0.5" />
                    </View>

                    {username && (
                        <Text className="text-muted-foreground text-sm font-medium">
                            @{username}
                        </Text>
                    )}

                    {/* Comment out Collector Level Badge for Demo */}
                    {/* <Badge
                        variant="secondary"
                        className="flex-row items-center gap-1.5 bg-secondary border border-border/10 px-2.5 py-1 rounded-lg self-start mt-0.5"
                    >
                        <ShieldCheck size={14} color="#6d28d9" />
                        <Text className="text-foreground text-xs font-semibold">
                            Collector Level 4
                        </Text>
                    </Badge> */}

                    {/* Join Date Row */}
                    {memberSince && (
                        <View className="flex-row items-center gap-1 mt-1">
                            <Calendar size={12} color="#94a3b8" />
                            <Text className="text-muted-foreground text-[11px] font-medium">
                                Member since {memberSince}
                            </Text>
                        </View>
                    )}

                    {/* Followers · Following — tap to open the lists */}
                    {me && (
                        <View className="flex-row items-center gap-3 mt-1">
                            <TouchableOpacity accessibilityRole="button" onPress={() => openFollows('followers')}>
                                <Text className="text-muted-foreground text-xs">
                                    <Text className="text-foreground font-bold">{counts.followers ?? '–'}</Text> Followers
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" onPress={() => openFollows('following')}>
                                <Text className="text-muted-foreground text-xs">
                                    <Text className="text-foreground font-bold">{counts.following ?? '–'}</Text> Following
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

        </MotiView>
    )
}