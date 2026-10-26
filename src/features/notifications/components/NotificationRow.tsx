import { BadgeCheck, Box, ChevronRight, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { AppNotification, NotificationKind } from '../types/notification';
import { formatAge } from '../utils/format';

/** Icon + accent per kind, so the list reads at a glance. */
const LOOK: Record<NotificationKind, { Icon: typeof ShieldCheck; tint: string; wash: string }> = {
    account: { Icon: UserCircle2, tint: '#8B5CF6', wash: '#1B1430' },
    security: { Icon: ShieldCheck, tint: '#28C76F', wash: '#0C2A1B' },
    claim: { Icon: BadgeCheck, tint: '#208AEF', wash: '#0C2033' },
    drop: { Icon: Box, tint: '#F2B807', wash: '#2A2109' },
    tip: { Icon: Sparkles, tint: '#F472B6', wash: '#2C1420' },
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
            activeOpacity={0.75}
            onPress={onPress}
            className={`flex-row items-start rounded-2xl border p-3.5 mb-2.5 ${unread ? 'bg-[#12101A] border-[#2C2542]' : 'bg-[#0D0D11] border-[#1B1B21]'
                }`}
        >
            <View
                className="h-11 w-11 rounded-full items-center justify-center"
                style={{ backgroundColor: wash, borderWidth: 1, borderColor: tint + '55' }}
            >
                <Icon color={tint} size={20} />
            </View>

            <View className="flex-1 ml-3">
                <View className="flex-row items-center">
                    <Text
                        className={`flex-1 text-[15px] pr-2 ${unread ? 'text-white font-bold' : 'text-neutral-300 font-semibold'}`}
                        numberOfLines={2}
                    >
                        {notification.title}
                    </Text>
                    {unread && <View className="h-2 w-2 rounded-full bg-primary" />}
                </View>

                <Text className="text-[13px] text-neutral-400 leading-5 mt-1">{notification.body}</Text>

                <View className="flex-row items-center mt-2">
                    <Text className="text-[11px] text-neutral-500 font-medium">
                        {formatAge(notification.createdAt)}
                    </Text>
                    {notification.href && (
                        <View className="flex-row items-center ml-auto">
                            <Text className="text-[11px] text-primary font-bold">Open</Text>
                            <ChevronRight size={13} color="#8B5CF6" />
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
