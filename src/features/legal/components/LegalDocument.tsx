import { router } from 'expo-router'
import { ChevronLeft, ShieldCheck } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

import type { LegalBlock, LegalDocumentMeta, LegalSection } from '../types/legal'

/**
 * Renderer shared by the privacy policy and terms of use screens — both are the
 * same thing: a long read-only document reached from the registration form,
 * where the checkbox in that form stays the acceptance control.
 */
export default function LegalDocument({
    meta,
    sections,
    /** Label on the closing button; both documents return to sign up. */
    backLabel = 'Back to sign up',
}: {
    meta: LegalDocumentMeta
    sections: LegalSection[]
    backLabel?: string
}) {
    const goBack = () => {
        // Deep links can land here with nothing behind them.
        if (router.canGoBack()) router.back()
        else router.replace('/(auth)/register')
    }

    const openLink = (href: string) => {
        Linking.openURL(href).catch(() => {
            // Nothing to recover from — the address is still readable on screen.
        })
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header bar */}
                <View className="flex-row items-center gap-3 px-5 py-4 border-b border-[#dbeafe]">
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={goBack}
                        hitSlop={8}
                        className="w-10 h-10 rounded bg-[#eff6ff] items-center justify-center active:opacity-60"
                    >
                        <ChevronLeft size={22} color="#111827" />
                    </TouchableOpacity>

                    <Image
                        source={require('@/assets/images/HitBoxLogo-dark.png')}
                        resizeMode="contain"
                        style={{ width: 32, height: 32 }}
                    />

                    <Text className="text-[#111827] font-orbitron text-sm flex-1" numberOfLines={1}>
                        {meta.title}
                    </Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
                >
                    {/* Title card */}
                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        className="mt-6 rounded border border-[#dbeafe] bg-[#eff6ff] p-5"
                    >
                        <View className="flex-row items-center gap-2 mb-3">
                            <ShieldCheck size={18} color="#2563eb" />
                            <Text className="text-[#2563eb] text-xs font-syne-bold uppercase tracking-widest">
                                {meta.company}
                            </Text>
                        </View>

                        <Text className="text-[#111827] text-2xl font-orbitron tracking-tight">
                            {meta.title}
                        </Text>

                        <Text className="text-[#6b7280] font-syne text-xs mt-3 leading-5">
                            Effective Date: {meta.effectiveDate}
                            {'\n'}
                            Last Updated: {meta.lastUpdated}
                        </Text>
                    </MotiView>

                    {meta.preamble?.map((text, index) => (
                        <NoticeBlock key={`preamble-${index}`} text={text} />
                    ))}

                    {sections.map((section) => (
                        <View key={section.number} className="mt-8">
                            <View className="flex-row items-baseline gap-2 mb-3">
                                <Text className="text-[#2563eb] text-sm font-syne-bold">
                                    {section.number}.
                                </Text>
                                <Text className="text-[#111827] text-base font-orbitron uppercase tracking-wide flex-1">
                                    {section.title}
                                </Text>
                            </View>

                            {section.blocks.map((block, index) => (
                                <LegalBlockView
                                    key={`${section.number}-${index}`}
                                    block={block}
                                    onOpenLink={openLink}
                                />
                            ))}
                        </View>
                    ))}

                    {meta.footer && (
                        <Text className="text-[#9ca3af] font-syne text-xs text-center mt-10">
                            {meta.footer}
                        </Text>
                    )}

                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={goBack}
                        className="mt-8 h-[52px] rounded-[30px] items-center justify-center bg-black active:opacity-80"
                    >
                        <Text className="text-white font-syne-bold text-base">{backLabel}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

function NoticeBlock({ text }: { text: string }) {
    return (
        <View className="mt-4 rounded border border-[#dbeafe] bg-[#eff6ff] px-4 py-3">
            <Text className="text-[#111827] font-syne-semibold text-xs leading-5">{text}</Text>
        </View>
    )
}

function LegalBlockView({
    block,
    onOpenLink,
}: {
    block: LegalBlock
    onOpenLink: (href: string) => void
}) {
    if (block.kind === 'notice') {
        return <NoticeBlock text={block.text} />
    }

    if (block.kind === 'subheading') {
        return <Text className="text-[#111827] text-sm font-syne-bold mt-4 mb-2">{block.text}</Text>
    }

    if (block.kind === 'listItem') {
        return (
            <View className="flex-row mb-2 pl-1">
                <Text className="text-[#2563eb] text-sm leading-6 w-7">{block.marker}</Text>
                <Text className="text-[#6b7280] font-syne text-sm leading-6 flex-1">{block.text}</Text>
            </View>
        )
    }

    if (block.kind === 'contact') {
        return (
            <View className="flex-row flex-wrap items-baseline mt-2">
                <Text className="text-[#9ca3af] font-syne text-sm">{block.label}: </Text>
                {block.href ? (
                    <Text
                        accessibilityRole="link"
                        onPress={() => onOpenLink(block.href!)}
                        className="text-[#2563eb] text-sm font-syne-semibold"
                    >
                        {block.value}
                    </Text>
                ) : (
                    <Text className="text-[#111827] text-sm font-syne-semibold">{block.value}</Text>
                )}
            </View>
        )
    }

    return <Text className="text-[#6b7280] font-syne text-sm leading-6 mb-3">{block.text}</Text>
}
