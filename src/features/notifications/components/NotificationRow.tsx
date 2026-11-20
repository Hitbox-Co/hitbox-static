import { BadgeCheck, Box, ChevronRight, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppNotification, NotificationKind } from '../types/notification';
import { formatAge } from '../utils/format';

/** Icon + accent per kind, so the list reads at a glance (light UI: a soft wash behind a strong tint). */
const LOOK: Record<NotificationKind, { Icon: typeof ShieldCheck; tint: string; wash: string }> = {
    account: { Icon: UserCircle2, tint: '#2563eb', wash: '#eff6ff' },
    security: { Icon: ShieldCheck, tint: '#16a34a', wash: '#ecfdf3' },
    claim: { Icon: BadgeCheck, tint: '#0891b2', wash: '#ecfeff' },
    drop: { Icon: Box, tint: '#d97706', wash: '#fffbeb' },
    tip: { Icon: Sparkles, tint: '#db2777', wash: '#fdf2f8' },
};

export default function NotificationRow({
    notification,
    onPress,
}: {
    notification: AppNotification;
    onPress: () => void;
}) {
    const { Icon, tint, wash } = LOOK[notification.kind];
    const unread = !notification.seen;

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${notification.title}${unread ? ', unread' : ''}`}
            activeOpacity={0.8}
            onPress={onPress}
            className={`mb-3 flex-row items-start rounded-lg border p-3.5 ${unread ? 'border-[#bfdbfe] bg-white' : 'border-[#e5e7eb] bg-white'}`}
            style={unread ? { shadowColor: '#3b82f6', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 } : undefined}
        >
            <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: wash }}>
                <Icon color={tint} size={20} />
            </View>

            <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                    <Text
                        className={`flex-1 pr-2 text-[14px] ${unread ? 'font-syne-bold text-[#111827]' : 'font-syne-semibold text-[#4b5563]'}`}
                        numberOfLines={2}
                    >
                        {notification.title}
                    </Text>
                    {unread && <View className="h-2 w-2 rounded-full bg-[#2563eb]" />}
                </View>

                <Text className="mt-1 font-syne text-[12.5px] leading-[19px] text-[#6b7280]">{notification.body}</Text>

                <View className="mt-2 flex-row items-center">
                    <Text className="font-syne-medium text-[11px] text-[#9ca3af]">{formatAge(notification.createdAt)}</Text>
                    {notification.href && (
                        <View className="ml-auto flex-row items-center">
                            <Text className="font-syne-bold text-[11px] text-[#2563eb]">Open</Text>
                            <ChevronRight size={13} color="#2563eb" />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
