import { HandHelping } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Text, View } from 'react-native'

import type { ChatMessage } from '../types/support'

/**
 * One message in the support thread. `system` renders as a centred notice rather
 * than a bubble — it's the "this is automated" disclaimer, not something anyone said.
 */
export default function ChatBubble({ message }: { message: ChatMessage }) {
    if (message.author === 'system') {
        return (
            <View className="rounded border border-[#dbeafe] bg-[#eff6ff] px-4 py-3 mb-4">
                <Text className="font-syne-medium text-[12px] leading-5 text-center text-[#6b7280]">
                    {message.text}
                </Text>
            </View>
        )
    }

    const isUser = message.author === 'user'

    return (
        <MotiView
            from={{ opacity: 0, translateY: 8 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
            className={`mb-3 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
        >
            {!isUser && (
                <View className="flex-row items-center gap-2 mb-1.5">
                    <View className="w-6 h-6 rounded bg-[#eff6ff] items-center justify-center">
                        <HandHelping size={12} color="#2563eb" />
                    </View>
                    <Text className="font-syne-bold text-[11px] uppercase tracking-widest text-[#2563eb]">
                        HitBox Support
                    </Text>
                </View>
            )}

            <View
                className={
                    isUser
                        ? 'rounded-2xl rounded-br-md bg-black px-4 py-3'
                        : 'rounded-2xl rounded-bl-md border border-[#dbeafe] bg-[#eff6ff] px-4 py-3'
                }
            >
                <Text
                    className={`leading-6 text-[14px] ${isUser ? 'font-syne-medium text-white' : 'font-syne text-[#111827]'}`}
                >
                    {message.text}
                </Text>
            </View>
        </MotiView>
    )
}
