import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import React from 'react'
import { Text, View } from 'react-native'

/**
 * Peer-to-Peer Trading banner. **Static promo**: the backend has no buyer-facing
 * resale API, so there are no live peer listings, bids or countdowns, and it
 * does not navigate anywhere. Every card on this screen is a drop sold by HitBox.
 */
export default function PromoBannerSection() {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 500 }}
            className="mx-5"
        >
            <LinearGradient
                colors={['#0b1235', '#1e3a8a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 4, padding: 20, height: 150, justifyContent: 'space-between', overflow: 'hidden' }}
            >
                {/* Soft glow, top right */}
                <View
                    style={{
                        position: 'absolute',
                        right: -40,
                        top: -40,
                        width: 160,
                        height: 160,
                        borderRadius: 80,
                        backgroundColor: 'rgba(59,130,246,0.35)',
                    }}
                />
                <View className="self-start rounded border border-[rgba(229,255,80,0.4)] bg-[rgba(188,255,71,0.15)] px-[10px] py-[5px]">
                    <Text className="font-syne-bold text-[7.5px] text-[#d1f63b]">NEW FEATURE</Text>
                </View>
                <View className="max-w-[70%] gap-1">
                    <Text className="font-orbitron-black text-[20px] leading-[24px] text-white">Peer-to-Peer Trading</Text>
                    <Text className="font-syne text-xs leading-[17px] text-[#bfdbfe]">Trade securely with other collectors.</Text>
                </View>
            </LinearGradient>
        </MotiView>
    )
}
