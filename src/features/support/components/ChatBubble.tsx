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
            <View className="rounded-xl border border-primary/40 bg-primary-10 px-4 py-3 mb-4">
                <Text className="text-neutral-300 text-xs leading-5 font-medium text-center">
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
                    <View className="w-6 h-6 rounded-full border border-primary/40 bg-primary-10 items-center justify-center">
                        <HandHelping size={12} color="#a78bfa" />
                    </View>
                    <Text className="text-purple-400 text-[11px] font-semibold uppercase tracking-widest">
                        HitBox Support
                    </Text>
                </View>
            )}

            <View
                className={
                    isUser
                        ? 'rounded-2xl rounded-br-md bg-primary px-4 py-3'
                        : 'rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3'
                }
            >
                <Text
                    className={`text-sm leading-6 ${isUser ? 'text-white font-medium' : 'text-neutral-200'}`}
                >
                    {message.text}
                </Text>
            </View>
        </MotiView>
    )
}
