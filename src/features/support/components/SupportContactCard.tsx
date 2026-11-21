import { Mail, Phone } from 'lucide-react-native'
import { MotiView } from 'moti'
import React, { useState } from 'react'
import { Linking, Text, TouchableOpacity, View } from 'react-native'

import { cn } from '@/lib/utils'
import type { SupportChannel } from '../types/support'

/**
 * One support channel: icon + heading, the address/number as a tappable link,
 * and a primary action button. Driven by data rather than a component per
 * channel, so adding one back to `SUPPORT_CHANNELS` needs no new UI and can't
 * drift from the others.
 *
 * Both the value and the button open the same `href`, so the whole card is
 * actionable however the user reaches for it.
 */
export default function SupportContactCard({
    channel,
    className,
    delay = 0,
}: {
    channel: SupportChannel
    className?: string
    /** Staggers the entrance so the cards arrive in order. */
    delay?: number
}) {
    const [failed, setFailed] = useState(false)

    const Icon = channel.kind === 'email' ? Mail : Phone

    const open = () => {
        setFailed(false)
        // Rejects when nothing on the device handles mailto:/tel: — common on
        // emulators and tablets with no dialer or mail account. The address stays
        // readable on screen, so the fallback is to say so rather than fail silently.
        Linking.openURL(channel.href).catch(() => setFailed(true))
    }

    return (
        <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay }}
            className={cn('rounded border border-[#dbeafe] bg-white p-5', className)}
        >
            <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded bg-[#eff6ff] items-center justify-center">
                    <Icon size={18} color="#2563eb" />
                </View>

                <Text
                    role="heading"
                    aria-level={2}
                    className="font-syne-bold text-[15px] text-[#111827] flex-1"
                    numberOfLines={1}
                >
                    {channel.title}
                </Text>
            </View>

            <Text
                accessibilityRole="link"
                accessibilityLabel={channel.accessibilityLabel}
                onPress={open}
                className="font-syne-medium text-[14px] text-[#2563eb] mt-4"
            >
                {channel.value}
            </Text>

            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={channel.accessibilityLabel}
                onPress={open}
                activeOpacity={0.8}
                className="mt-4 h-11 flex-row items-center justify-center gap-2 rounded-[30px] bg-black active:opacity-80"
            >
                <Icon size={16} color="#ffffff" />
                <Text className="font-syne-bold text-[14px] text-white">{channel.actionLabel}</Text>
            </TouchableOpacity>

            {failed && (
                <Text
                    accessibilityLiveRegion="polite"
                    className="font-syne text-[12px] mt-3 leading-5 text-[#b45309]"
                >
                    {channel.kind === 'email'
                        ? 'No email app is set up on this device. Copy the address above instead.'
                        : 'No phone app is available on this device. Dial the number above instead.'}
                </Text>
            )}
        </MotiView>
    )
}
