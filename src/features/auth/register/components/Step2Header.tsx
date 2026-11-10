import { router } from 'expo-router'
import { ChevronRight } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'

import { disarmOnboarding } from '@/lib/onboarding-gate'

/**
 * Brand row + welcome copy — also carries the **Skip** escape hatch.
 * `src/app/index.tsx` sends every signed-out cold start here, so without it a
 * guest has no way into the public parts of the app (discover, marketplace,
 * verifying a tag).
 */
export default function Step2Header() {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
        >
            {/* Brand row. 52 high to match the Figma navigation bar. */}
            <View className="h-[52px] flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    {/* The logo file is white-on-black, so it reads as a black tile on this white screen. */}
                    <Image
                        source={require('@/assets/images/HitBoxLogo.png')}
                        resizeMode="cover"
                        style={{ width: 28, height: 28, borderRadius: 6 }}
                    />
                    <Text className="font-orbitron text-[15px] text-[#183570]">HitBox</Text>
                </View>

                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Skip sign up and browse"
                    activeOpacity={0.7}
                    hitSlop={12}
                    onPress={() => {
                        // Browsing as a guest: a later sign-in elsewhere is not a sign-up here.
                        disarmOnboarding()
                        router.push('/(tabs)/discover')
                    }}
                    className="h-10 flex-row items-center gap-1"
                >
                    <Text className="font-syne-semibold text-xs text-[#6b7280]">Skip for now</Text>
                    <ChevronRight size={13} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <View className="mt-4 gap-3">
                {/* Two-part accent bar */}
                <View className="flex-row gap-1">
                    <View className="h-[3px] w-6 bg-[#3e58ff]" />
                    <View className="h-[3px] w-1.5 bg-[#3e58ff]" />
                </View>

                <Text className="font-orbitron-black text-[27px] leading-[31px] tracking-[-0.6px] text-black">
                    {`Let’s get you in`}
                </Text>
                <Text className="font-syne text-[13px] leading-5 text-[#6b7280]">
                    Create your account to claim your item, track your collection, and unlock exclusive experiences.
                </Text>
            </View>
        </MotiView>
    )
}
