import { Gift, ShieldCheck, UsersRound, type LucideIcon } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Text, View } from 'react-native'

const PERKS: { Icon: LucideIcon; title: string; body: string }[] = [
    { Icon: ShieldCheck, title: '100% Verified', body: 'Authentic ownership you can trust' },
    { Icon: Gift, title: 'Unlock Rewards', body: 'Access exclusive rewards & drops' },
    { Icon: UsersRound, title: 'Join Community', body: 'Connect with fellow collectors' },
]

export default function Step2Perks() {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-5 gap-3 rounded border border-[#dbeafe] bg-[#f3f6ff] p-[14px]"
        >
            {PERKS.map(({ Icon, title, body }) => (
                <View key={title} className="flex-row items-center gap-3">
                    <View className="size-[34px] items-center justify-center rounded border border-[#dbeafe] bg-white">
                        <Icon size={19} color="#2563eb" />
                    </View>
                    <View className="flex-1 gap-[3px]">
                        <Text className="font-syne-bold text-[13px] text-[#111827]">{title}</Text>
                        <Text className="font-syne text-[11.5px] leading-4 text-[#6b7280]">{body}</Text>
                    </View>
                </View>
            ))}
        </MotiView>
    )
}
