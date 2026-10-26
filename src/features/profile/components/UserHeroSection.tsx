import { useUser } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Calendar, CheckCircle2, ChevronRight, Gem, Pencil } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import { useMe } from '../api/getProfile'


export default function UserHeroSection() {
    const { user } = useUser()
    // Backend profile (rewardPoints, canonical username). Clerk fills the gaps
    // while the query loads or if the webhook hasn't synced yet. Username and
    // names live in unsafeMetadata for email sign-ups (Clerk instance has those
    // attributes disabled), so that's the last Clerk-side fallback.
    const { data: me } = useMe()
    const meta = (user?.unsafeMetadata ?? {}) as {
        username?: string
        firstName?: string
        lastName?: string
    }

    const displayName = [me?.firstName, me?.lastName].filter(Boolean).join(' ')
        || user?.fullName
        || [meta.firstName, meta.lastName].filter(Boolean).join(' ')
        || me?.username
        || user?.username
        || meta.username
        || me?.email
        || user?.primaryEmailAddress?.emailAddress
        || 'HitBox Collector'
    const username = me?.username ?? user?.username ?? meta.username ?? null
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
            {/* LEFT SIDE: AVATAR & USER INFO (Occupies 2 out of 3 columns) */}
            <View className="col-span-2 flex-row items-center gap-4">
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
                </View>
            </View>

            {/* RIGHT SIDE: HIT POINTS BOX (Occupies 1 out of 3 columns) */}
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 400, delay: 150 }}
                className='col-span-1'
            >
                <TouchableOpacity
                    activeOpacity={0.7}
                    className="bg-card border border-border/30 p-3 rounded-xl flex-row items-center justify-between gap-1 w-full shadow-sm shadow-black/50"
                >
                    <View className="items-start gap-0.5">
                        <View className="flex-row items-center gap-1">
                            <Gem size={12} color="#6d28d9" />
                            <Text className="text-muted-foreground text-xs font-bold tracking-wider uppercase" numberOfLines={1}>
                                HIT Points
                            </Text>
                        </View>
                        <MotiText
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 350 }}
                            className="text-foreground text-lg font-black tracking-tight"
                        >
                            {(me?.rewardPoints ?? 0).toLocaleString('en-US')}
                        </MotiText>
                    </View>
                    <ChevronRight size={14} color="#475569" className="mt-3" />
                </TouchableOpacity>
            </MotiView>
        </MotiView>
    )
}