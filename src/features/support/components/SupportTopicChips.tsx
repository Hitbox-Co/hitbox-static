import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import type { SupportTopic } from '../types/support'

/**
 * Suggested topics under the latest agent message. They disappear once picked —
 * a scripted assistant that keeps offering the same menu after answering reads
 * as broken, and the composer is always there for anything not listed.
 */
export default function SupportTopicChips({
    topics,
    onPick,
}: {
    topics: SupportTopic[]
    onPick: (topic: SupportTopic) => void
}) {
    if (topics.length === 0) return null

    return (
        <View className="self-start max-w-[92%] mb-4 flex-row flex-wrap gap-2">
            {topics.map((topic) => (
                <TouchableOpacity
                    key={topic.id}
                    accessibilityRole="button"
                    accessibilityLabel={topic.label}
                    onPress={() => onPick(topic)}
                    activeOpacity={0.8}
                    className="rounded-full border border-primary/40 bg-primary-10 px-4 py-2.5 active:opacity-70"
                >
                    <Text className="text-purple-300 text-[13px] font-semibold">{topic.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}
