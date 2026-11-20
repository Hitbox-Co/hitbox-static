import { useClerk, useUser } from '@clerk/clerk-expo'
import { useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import {
    Bell,
    ChevronRight,
    FileText,
    Gift,
    Heart,
    HelpCircle,
    LogOut,
    Package,
    Pencil,
    Settings as SettingsIcon,
    ShieldCheck,
    UserRound,
} from 'lucide-react-native'
import React from 'react'
import { Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useMe } from '@/features/profile/api/getProfile'

type Row = { icon: React.ReactNode; label: string; onPress: () => void }

const ICON = 18
const BLUE = '#2563eb'

/**
 * Settings home — Figma P04 "Account & preferences". A light page: the HitBox
 * header, a navy identity card with Edit profile, then grouped rows (Account &
 * Profile, Notifications, Support) and Sign out.
 *
 * Security and Notification preferences are still the existing sub-pages of the
 * Settings screen, opened with `onOpen`. The "Activity" group (orders, invoices,
 * rewards, wishlist) is not in the Figma; it keeps the entry points added while
 * those features were built.
 */
export default function SettingsHome({ onOpen }: { onOpen: (tab: 'security' | 'notifications') => void }) {
    const { signOut } = useClerk()
    const queryClient = useQueryClient()
    const { user } = useUser()
    const { data: me } = useMe()

    const name = me?.fullName || user?.fullName || (me?.handle ? `@${me.handle}` : null) || 'HitBox Collector'
    const handle = me?.handle ?? user?.username ?? null
    const avatarUrl = user?.imageUrl ?? me?.avatarUrl ?? null

    const handleSignOut = async () => {
        await signOut()
        queryClient.clear() // drop cached user data for the next account
        router.replace('/')
    }

    const go = (path: string) => () => router.push(path as never)

    const groups: { title: string; rows: Row[] }[] = [
        {
            title: 'Account & Profile',
            rows: [
                { icon: <Pencil size={ICON} color={BLUE} />, label: 'Edit Profile', onPress: go('/edit-profile') },
                { icon: <ShieldCheck size={ICON} color={BLUE} />, label: 'Security Settings', onPress: () => onOpen('security') },
            ],
        },
        {
            title: 'Notifications',
            rows: [
                { icon: <Bell size={ICON} color={BLUE} />, label: 'Notifications', onPress: go('/notifications') },
                { icon: <SettingsIcon size={ICON} color={BLUE} />, label: 'Notification Preferences', onPress: () => onOpen('notifications') },
            ],
        },
        {
            title: 'Activity',
            rows: [
                { icon: <Package size={ICON} color={BLUE} />, label: 'My orders', onPress: go('/orders') },
                { icon: <FileText size={ICON} color={BLUE} />, label: 'My invoices', onPress: go('/invoices') },
                { icon: <Gift size={ICON} color={BLUE} />, label: 'My rewards', onPress: go('/rewards') },
                { icon: <Heart size={ICON} color={BLUE} />, label: 'Wishlist', onPress: go('/wishlist') },
            ],
        },
        {
            title: 'Support',
            rows: [{ icon: <HelpCircle size={ICON} color={BLUE} />, label: 'Help & Support', onPress: go('/support') }],
        },
    ]

    return (
        <SafeAreaView
            // No bottom edge: this route renders inside (tabs), so the tab bar already reserves it.
            edges={['top', 'left', 'right']}
            style={{ flex: 1, backgroundColor: '#f5f9ff' }}
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
                    <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">SETTINGS</Text>
                </View>

                {/* Identity card */}
                <View className="mx-5 mt-3 flex-row items-center gap-4 rounded-lg bg-[#0b1b36] p-4">
                    {avatarUrl ? (
                        <Image
                            source={{ uri: avatarUrl }}
                            style={{ width: 60, height: 60, borderRadius: 4, backgroundColor: '#1f2f4d' }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="h-[60px] w-[60px] items-center justify-center rounded bg-[#1f2f4d]">
                            <UserRound size={26} color="#94a3b8" />
                        </View>
                    )}
                    <View className="flex-1 gap-0.5">
                        <Text numberOfLines={1} className="font-syne-bold text-[22px] text-white">{name}</Text>
                        {!!handle && (
                            <Text numberOfLines={1} className="font-syne text-[12px] text-[#94a3b8]">@{handle}</Text>
                        )}
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Edit profile"
                            activeOpacity={0.7}
                            onPress={go('/edit-profile')}
                            className="mt-1 flex-row items-center gap-1.5 self-start"
                        >
                            <Pencil size={13} color="#3b82f6" />
                            <Text className="font-syne-bold text-[12px] text-[#3b82f6]">Edit profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Grouped rows */}
                {groups.map((group) => (
                    <View key={group.title} className="mt-6 px-5">
                        <Text className="mb-2 font-syne-extrabold text-[13px] text-[#1f2937]">{group.title}</Text>
                        <View className="overflow-hidden rounded border border-[#e5e7eb] bg-white">
                            {group.rows.map((row, i) => (
                                <TouchableOpacity
                                    key={row.label}
                                    accessibilityRole="button"
                                    accessibilityLabel={row.label}
                                    activeOpacity={0.7}
                                    onPress={row.onPress}
                                    className={`h-[46px] flex-row items-center justify-between px-3.5 ${i > 0 ? 'border-t border-[#eef2f7]' : ''}`}
                                >
                                    <View className="flex-row items-center gap-3">
                                        {row.icon}
                                        <Text className="font-syne-medium text-[14px] text-[#4b5563]">{row.label}</Text>
                                    </View>
                                    <ChevronRight size={16} color="#6b7280" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Sign out */}
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Sign out"
                    activeOpacity={0.8}
                    onPress={handleSignOut}
                    className="mx-5 mt-6 h-[46px] flex-row items-center justify-center gap-2 rounded-[3px] border-[1.5px] border-[#111827] bg-white"
                >
                    <LogOut size={17} color="#dc2626" />
                    <Text className="font-syne-bold text-[14px] text-[#dc2626]">Sign out</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View className="mt-5 flex-row items-center justify-center gap-3">
                    <TouchableOpacity accessibilityRole="link" onPress={go('/terms-of-use')}>
                        <Text className="font-syne text-[11px] text-[#6b7280]">Terms of service</Text>
                    </TouchableOpacity>
                    <Text className="text-[#d1d5db]">|</Text>
                    <TouchableOpacity accessibilityRole="link" onPress={go('/privacy-policy')}>
                        <Text className="font-syne text-[11px] text-[#6b7280]">Privacy policy</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
