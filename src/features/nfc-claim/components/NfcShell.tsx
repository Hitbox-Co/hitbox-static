import { router, useIsFocused } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeft, Ellipsis } from 'lucide-react-native'
import React from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

/** Back when there is somewhere to go back to; the Scan tab's root has nowhere. */
export function goBackOrHome() {
    if (router.canGoBack()) router.back()
    else router.replace('/(tabs)/discover' as never)
}

/**
 * The light page frame shared by the NFC screens (Figma: "NFC — Ready to
 * authenticate" and "Owned product"): pale blue ground, a "Back" link and an
 * overflow menu on top, then scrolling content with room for the floating tab
 * bar underneath.
 */
export default function NfcShell({
    children,
    footer,
    background = '#f5f9ff',
    withTabBar = true,
}: {
    children: React.ReactNode
    /** Pinned under the scroll area (e.g. a Done button). */
    footer?: React.ReactNode
    background?: string
    /**
     * True for screens inside the tab bar (Scan), which floats over the bottom.
     * The pushed claim / verify routes have no tab bar, so they keep the
     * bottom safe area instead.
     */
    withTabBar?: boolean
}) {
    const isFocused = useIsFocused()

    const openMenu = () =>
        Alert.alert('NFC claim & verify', undefined, [
            { text: 'Get help', onPress: () => router.push('/support' as never) },
            { text: 'Cancel', style: 'cancel' },
        ])

    return (
        <SafeAreaView
            // Inside (tabs) the tab bar already reserves the safe area below.
            edges={withTabBar ? ['top', 'left', 'right'] : ['top', 'bottom', 'left', 'right']}
            style={{ flex: 1, backgroundColor: background }}
        >
            {isFocused && <StatusBar style="dark" />}

            <View className="h-[52px] flex-row items-center justify-between px-5">
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    hitSlop={12}
                    activeOpacity={0.7}
                    onPress={goBackOrHome}
                    className="flex-row items-center gap-2"
                >
                    <ArrowLeft size={20} color="#111827" />
                    <Text className="font-syne-semibold text-xs text-[#111827]">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="More"
                    hitSlop={12}
                    activeOpacity={0.7}
                    onPress={openMenu}
                >
                    <Ellipsis size={20} color="#111827" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                // Room under the last row for the floating tab bar, when there is one.
                contentContainerStyle={{ paddingBottom: withTabBar ? 128 : 32 }}
            >
                {children}
            </ScrollView>

            {footer}
        </SafeAreaView>
    )
}
