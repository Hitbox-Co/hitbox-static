import { router, useFocusEffect, useIsFocused } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { BellOff, ChevronLeft, CheckCheck } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import NotificationRow from '../components/NotificationRow';
import { useNotifications } from '../hooks/useNotifications';
import { AppNotification } from '../types/notification';

/** How long an unread row stays highlighted before the screen marks it read. */
const AUTO_READ_DELAY_MS = 2_000;

/**
 * `/notifications` — the full feed.
 *
 * Read state is per account and lives on the device (see `utils/seen.ts`), so a
 * notice a user has already looked at doesn't come back unread on the next
 * launch. There is no delete: a notice is either seen or unseen.
 */
export default function NotificationsScreen() {
    const { notifications, unreadCount, isLoading, refresh, markSeen, markAllSeen } = useNotifications();
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();

    // Opening the feed counts as reading it — same as the badge clearing once
    // you've looked. The delay leaves the unread accents on screen long enough
    // to be noticed instead of vanishing mid-render.
    useFocusEffect(
        useCallback(() => {
            const timer = setTimeout(() => markAllSeen(), AUTO_READ_DELAY_MS);
            return () => clearTimeout(timer);
        }, [markAllSeen]),
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const handlePress = (notification: AppNotification) => {
        markSeen([notification.id]);
        if (notification.href) router.push(notification.href as never);
    };

    return (
        <SafeAreaView
            // No bottom edge: this route renders inside (tabs), so the tab bar
            // already reserves the safe area below.
            edges={["top", "left", "right"]}
            style={{ flex: 1, backgroundColor: '#f6f9fc' }}
        >
            {isFocused && <ExpoStatusBar style="dark" />}

            {/* Header */}
            <View className="h-12 flex-row items-center bg-white px-5">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    hitSlop={12}
                    className="size-8 items-center justify-center rounded bg-[#eff6ff]"
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={19} color="#111827" />
                </TouchableOpacity>

                <Text className="ml-3 font-syne-bold text-[18px] text-[#111827]">Notifications</Text>

                {unreadCount > 0 && (
                    <View className="ml-2 rounded-full bg-[#2563eb] px-2 py-0.5">
                        <Text className="font-syne-bold text-[10.5px] text-white">{unreadCount} new</Text>
                    </View>
                )}

                {unreadCount > 0 && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        className="ml-auto flex-row items-center"
                        hitSlop={8}
                        onPress={() => markAllSeen()}
                    >
                        <CheckCheck size={16} color="#2563eb" />
                        <Text className="ml-1 font-syne-bold text-[12px] text-[#2563eb]">Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View className="h-px bg-[#e5e7eb]" />

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120, paddingTop: 16, paddingHorizontal: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
                    }
                >
                    {notifications.length === 0 ? (
                        <MotiView
                            from={{ opacity: 0, translateY: 12 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            className="mt-24 items-center"
                        >
                            <View className="h-20 w-20 items-center justify-center rounded-full bg-[#eff6ff]">
                                <BellOff color="#2563eb" size={34} />
                            </View>
                            <Text className="mt-4 font-syne-bold text-[17px] text-[#111827]">You’re all caught up</Text>
                            <Text className="mt-1 px-10 text-center font-syne text-[13px] leading-5 text-[#6b7280]">
                                New activity on your items and drops will show up here.
                            </Text>
                        </MotiView>
                    ) : (
                        notifications.map((notification, index) => (
                            <MotiView
                                key={notification.id}
                                from={{ opacity: 0, translateY: 10 }}
                                animate={{ opacity: 1, translateY: 0 }}
                                transition={{ type: 'timing', duration: 260, delay: index * 45 }}
                            >
                                <NotificationRow
                                    notification={notification}
                                    onPress={() => handlePress(notification)}
                                />
                            </MotiView>
                        ))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
