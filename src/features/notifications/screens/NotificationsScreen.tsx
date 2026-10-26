import { router, useFocusEffect } from 'expo-router';
import { BellOff, ChevronLeft, CheckCheck } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
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
            className="flex-1 bg-[#050507]"
        >
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View className="flex-row items-center px-4 pt-2 pb-3">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    hitSlop={12}
                    className="p-1 -ml-1 active:opacity-60"
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <Text className="text-white text-xl font-black ml-1">Notifications</Text>

                {unreadCount > 0 && (
                    <View className="ml-2 rounded-full bg-primary px-2 py-0.5">
                        <Text className="text-white text-[11px] font-black">{unreadCount} new</Text>
                    </View>
                )}

                {unreadCount > 0 && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        className="ml-auto flex-row items-center active:opacity-60"
                        hitSlop={8}
                        onPress={() => markAllSeen()}
                    >
                        <CheckCheck size={16} color="#8B5CF6" />
                        <Text className="text-primary text-xs font-bold ml-1">Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            ) : (
                <ScrollView
                    className="px-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 32, paddingTop: 4 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
                    }
                >
                    {notifications.length === 0 ? (
                        <MotiView
                            from={{ opacity: 0, translateY: 12 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            className="items-center mt-24"
                        >
                            <View className="h-20 w-20 rounded-full bg-[#12121A] border border-[#24242E] items-center justify-center">
                                <BellOff color="#4B4B57" size={34} />
                            </View>
                            <Text className="text-white text-lg font-bold mt-4">You’re all caught up</Text>
                            <Text className="text-neutral-400 text-sm text-center mt-1 px-10 leading-5">
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
