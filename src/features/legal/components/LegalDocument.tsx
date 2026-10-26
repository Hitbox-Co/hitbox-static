import { router } from 'expo-router'
import { ChevronLeft, ShieldCheck } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
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
        <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                {/* Header bar */}
                <View className="flex-row items-center gap-3 px-5 py-4 border-b border-white/10">
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={goBack}
                        hitSlop={8}
                        className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-60"
                    >
                        <ChevronLeft size={22} color="#fff" />
                    </TouchableOpacity>

                    <Image
                        source={require('@/assets/images/HitBoxLogo.png')}
                        resizeMode="contain"
                        style={{ width: 32, height: 32 }}
                    />

                    <Text className="text-white text-lg font-bold flex-1" numberOfLines={1}>
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
                        className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                        <View className="flex-row items-center gap-2 mb-3">
                            <ShieldCheck size={18} color="#a78bfa" />
                            <Text className="text-purple-400 text-xs font-semibold uppercase tracking-widest">
                                {meta.company}
                            </Text>
                        </View>

                        <Text className="text-white text-2xl font-bold tracking-tight">
                            {meta.title}
                        </Text>

                        <Text className="text-neutral-400 text-xs mt-3 leading-5">
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
                                <Text className="text-purple-400 text-sm font-bold">
                                    {section.number}.
                                </Text>
                                <Text className="text-white text-base font-bold uppercase tracking-wide flex-1">
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
                        <Text className="text-neutral-500 text-xs text-center mt-10">
                            {meta.footer}
                        </Text>
                    )}

                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={goBack}
                        className="mt-8 p-4 rounded-xl items-center justify-center bg-primary active:opacity-80"
                    >
                        <Text className="text-white font-semibold text-base">{backLabel}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

function NoticeBlock({ text }: { text: string }) {
    return (
        <View className="mt-4 rounded-xl border border-primary/40 bg-primary-10 px-4 py-3">
            <Text className="text-neutral-200 text-xs leading-5 font-medium">{text}</Text>
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
        return <Text className="text-white text-sm font-semibold mt-4 mb-2">{block.text}</Text>
    }

    if (block.kind === 'listItem') {
        return (
            <View className="flex-row mb-2 pl-1">
                <Text className="text-purple-400 text-sm leading-6 w-7">{block.marker}</Text>
                <Text className="text-neutral-400 text-sm leading-6 flex-1">{block.text}</Text>
            </View>
        )
    }

    if (block.kind === 'contact') {
        return (
            <View className="flex-row flex-wrap items-baseline mt-2">
                <Text className="text-neutral-500 text-sm">{block.label}: </Text>
                {block.href ? (
                    <Text
                        accessibilityRole="link"
                        onPress={() => onOpenLink(block.href!)}
                        className="text-purple-400 text-sm font-medium"
                    >
                        {block.value}
                    </Text>
                ) : (
                    <Text className="text-neutral-300 text-sm font-medium">{block.value}</Text>
                )}
            </View>
        )
    }

    return <Text className="text-neutral-400 text-sm leading-6 mb-3">{block.text}</Text>
}
