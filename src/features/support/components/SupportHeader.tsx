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
            className="mt-6 rounded border border-[#dbeafe] bg-white p-5"
        >
            <View className="flex-row items-center gap-2 mb-3">
                <HandHelping size={18} color="#2563eb" />
                <Text className="font-syne-bold text-[11px] uppercase tracking-widest text-[#2563eb]">
                    HitBox Support
                </Text>
            </View>

            <Text
                role="heading"
                aria-level={1}
                className="font-orbitron text-[22px] leading-[27px] tracking-[-0.5px] text-[#111827]"
            >
                {SUPPORT_HEADING}
            </Text>

            <Text className="font-syne text-[13px] mt-3 leading-[19px] text-[#6b7280]">
                {SUPPORT_SUBHEADING}
            </Text>
        </MotiView>
    )
}
