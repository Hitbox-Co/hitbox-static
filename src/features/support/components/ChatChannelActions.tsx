import { Mail, Phone } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { SUPPORT_CHANNELS } from '../data/support'
import type { SupportChannel } from '../types/support'

/**
 * The hand-off buttons under an agent message — the point where the chat stops
 * talking and connects the user to a real channel. Which ones appear is decided
 * per topic, so a claiming question doesn't offer the unconnected phone lines.
 */
export default function ChatChannelActions({
    channelIds,
    onOpen,
}: {
    channelIds: string[]
    /** Owned by the screen, which builds the mailto: with the transcript attached. */
    onOpen: (channel: SupportChannel) => void
}) {
    const channels = SUPPORT_CHANNELS.filter((c) => channelIds.includes(c.id))
    if (channels.length === 0) return null

    return (
        <View className="self-start max-w-[85%] mb-4 gap-2">
            {channels.map((channel) => {
                const Icon = channel.kind === 'email' ? Mail : Phone
                const isEmail = channel.kind === 'email'

                return (
                    <TouchableOpacity
                        key={channel.id}
                        accessibilityRole="button"
                        accessibilityLabel={channel.accessibilityLabel}
                        onPress={() => onOpen(channel)}
                        activeOpacity={0.8}
                        className={`flex-row items-center gap-2 rounded-xl px-4 h-11 ${
                            isEmail
                                ? 'bg-primary active:opacity-80'
                                : 'border border-white/10 bg-white/5 active:opacity-70'
                        }`}
                    >
                        <Icon size={15} color={isEmail ? '#ffffff' : '#a78bfa'} />
                        <Text
                            className={`text-sm font-semibold ${isEmail ? 'text-white' : 'text-neutral-200'}`}
                        >
                            {isEmail ? 'Email support' : `Call ${channel.title.replace(' Support', '')}`}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}
