import { HandHelping } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Text, View } from 'react-native'

import { SUPPORT_HEADING, SUPPORT_SUBHEADING } from '../data/support'

/**
 * Title block for the support screen. Same title-card treatment as
 * `LegalDocument` — eyebrow row, heading, supporting copy — so the two screens
 * reached from settings read as siblings.
 */
export default function SupportHeader() {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
        >
            <View className="flex-row items-center gap-2 mb-3">
                <HandHelping size={18} color="#a78bfa" />
                <Text className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
                    HitBox Support
                </Text>
            </View>

            <Text
                role="heading"
                aria-level={1}
                className="text-white text-2xl font-bold tracking-tight"
            >
                {SUPPORT_HEADING}
            </Text>

            <Text className="text-neutral-400 text-sm mt-3 leading-6">
                {SUPPORT_SUBHEADING}
            </Text>
        </MotiView>
    )
}
