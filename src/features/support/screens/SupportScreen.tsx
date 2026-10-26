import { router } from 'expo-router'
import { ChevronLeft, MessagesSquare } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import SupportContactCard from '../components/SupportContactCard'
import SupportHeader from '../components/SupportHeader'
import { SUPPORT_CHANNELS } from '../data/support'

/**
 * Support / Contact Us — email plus the two regional phone lines.
 *
 * Structured like `LegalDocument`: same header bar, same card treatment, same
 * back-handling, so a user arriving from the header button sees a screen that
 * belongs to the app rather than a bolt-on.
 */
export default function SupportScreen() {
    const { width } = useWindowDimensions()
    // Matches the breakpoint MainHeader already uses for its tablet sizing.
    const isTablet = width >= 768

    const goBack = () => {
        // Deep links can land here with nothing behind them.
        if (router.canGoBack()) router.back()
        else router.replace('/discover')
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
                        Support
                    </Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: isTablet ? 32 : 24,
                        paddingBottom: 48,
                    }}
                >
                    <SupportHeader />

                    {/* Chat first: it triages the problem and then opens the right
                        channel with the conversation attached, so it's a better
                        starting point than picking a channel cold. */}
                    <MotiView
                        from={{ opacity: 0, translateY: 12 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        className="mt-4"
                    >
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Open the support chat"
                            onPress={() => router.push('/support/chat')}
                            activeOpacity={0.85}
                            className="flex-row items-center gap-3 rounded-2xl border border-primary/40 bg-primary-10 p-4 active:opacity-80"
                        >
                            <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                                <MessagesSquare size={18} color="#ffffff" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-white text-base font-bold">Chat with support</Text>
                                <Text className="text-neutral-400 text-xs mt-0.5 leading-4">
                                    Answer a couple of questions and we&apos;ll route you to the right place.
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </MotiView>

                    {/* Stacked on phones; a row once there's width for more than
                        one channel. Email is the only one today, so this renders as
                        a single card either way. */}
                    <View className={isTablet ? 'mt-6 flex-row gap-4' : 'mt-6 gap-4'}>
                        {SUPPORT_CHANNELS.map((channel, index) => (
                            <SupportContactCard
                                key={channel.id}
                                channel={channel}
                                delay={index * 80}
                                className={isTablet ? 'flex-1' : undefined}
                            />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}
