import { LinearGradient } from 'expo-linear-gradient';
import { router, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, BadgeCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

import { rarityLabelOf } from '../components/TapCards';
import { NfcWaves } from '../components/NfcGraphics';
import { ClaimResult } from '../types/claim';

/** Static confetti flecks from the Figma stage: [left, top, w, h, rotation°, colour]. */
const FLECKS: [number, number, number, number, number, string][] = [
    [18, 55, 4, 8, 25, '#ffb703'],
    [309, 46, 4, 8, -18, '#ffb703'],
    [30, 197, 5, 9, 40, '#ffb703'],
    [301, 228, 4, 8, -25, '#2563eb'],
    [70, 18, 4, 8, 15, '#2563eb'],
    [284, 157, 4, 8, -35, '#ffb703'],
    [16, 269, 5, 8, 20, '#ffb703'],
    [323, 126, 4, 8, -10, '#f59e0b'],
    [50, 129, 3, 7, 30, '#a78bfa'],
    [317, 183, 3, 7, -22, '#a78bfa'],
];

/**
 * Shown **only** after a successful claim — `POST /claim` returned
 * `outcome: 'CLAIMED'`. The green "It's officially yours" reveal from the Figma
 * ("NFC — Verified reveal"), filled from the real claim result: product, rarity,
 * claim code and number. Nothing here is invented.
 */
export default function SucessfulClaimScreen({ result }: { result?: ClaimResult }) {
    const isFocused = useIsFocused();
    const { width } = useWindowDimensions();

    const product = result?.product;
    const rarity = rarityLabelOf(product?.rarity);
    const claimNo = result?.claim?.claimedNo;
    const ledgerNumber = result?.claim?.claimCode ?? result?.sku?.skuCode ?? '—';

    return (
        <View className="flex-1 bg-white">
            {isFocused && <StatusBar style="dark" />}
            <LinearGradient
                // Figma: green until about a third of the way down, then fading to white.
                colors={['#4bf389', '#4bf389', '#ffffff', '#ffffff']}
                locations={[0, 0.31, 0.795, 1]}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <ConfettiCannon
                count={80}
                origin={{ x: width / 2, y: -150 }}
                autoStart
                fadeOut
                fallSpeed={2800}
                explosionSpeed={20}
                colors={['#ffb703', '#2563eb', '#a78bfa', '#f59e0b']}
            />

            <SafeAreaView edges={['top', 'left', 'right']} className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 128 }}>
                    {/* Brand + notifications */}
                    <View className="h-[52px] flex-row items-center justify-between px-5">
                        <View className="flex-row items-center gap-2">
                            <Image
                                source={require('@/assets/images/HitBoxLogo-dark.png')}
                                resizeMode="contain"
                                style={{ width: 28, height: 28 }}
                            />
                            <Text className="font-orbitron text-[15px] text-black">HitBox</Text>
                        </View>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Notifications"
                            hitSlop={12}
                            onPress={() => router.push('/notifications' as never)}
                        >
                            <Bell size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View className="gap-5 px-5 pb-6 pt-3">
                        {/* Ceremony */}
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            className="items-center gap-3"
                        >
                            <View className="rounded-full border border-[#6b7280] bg-[#111827] px-3 py-[6px]">
                                <Text className="font-syne-bold text-[10px] tracking-[0.8px] text-[#e5e7eb]">
                                    NFC AUTHENTICATION COMPLETE
                                </Text>
                            </View>
                            <Text className="text-center font-orbitron-black text-[27px] leading-[31px] tracking-[-0.6px] text-[#111827]">
                                {"It's officially yours."}
                            </Text>
                            <Text className="text-center font-syne text-[13px] leading-[20px] text-[#6b7280]">
                                {result?.message ?? 'Physical possession authenticated.'}
                            </Text>
                        </MotiView>

                        {/* Ownership reveal stage */}
                        <MotiView
                            from={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'timing', duration: 450, delay: 150 }}
                            style={{
                                height: 310,
                                borderRadius: 24,
                                borderWidth: 1,
                                borderColor: '#dbeafe',
                                backgroundColor: '#111827',
                                overflow: 'hidden',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#3b82f6',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.13,
                                shadowRadius: 16,
                                elevation: 5,
                            }}
                        >
                            {/* Concentric rings + glow */}
                            {[264, 216, 168].map((size, i) => (
                                <View
                                    key={size}
                                    style={{
                                        position: 'absolute',
                                        width: size,
                                        height: size,
                                        borderRadius: size / 2,
                                        borderWidth: 1,
                                        borderColor: `rgba(59,130,246,${0.16 + i * 0.07})`,
                                    }}
                                />
                            ))}
                            <View
                                style={{
                                    position: 'absolute',
                                    width: 140,
                                    height: 140,
                                    borderRadius: 70,
                                    backgroundColor: 'rgba(59,130,246,0.16)',
                                }}
                            />
                            {/* NFC mark above the artwork */}
                            <View style={{ position: 'absolute', top: 30, opacity: 0.55 }}>
                                <NfcWaves size={24} color="#93c5fd" />
                            </View>

                            <View
                                style={{
                                    width: 164,
                                    height: 252,
                                    borderRadius: 16,
                                    backgroundColor: '#1f2937',
                                    shadowColor: '#3b82f6',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 32,
                                    elevation: 10,
                                }}
                            >
                                {product?.imageUrl ? (
                                    <Image
                                        source={{ uri: product.imageUrl }}
                                        resizeMode="cover"
                                        style={{ width: '100%', height: '100%', borderRadius: 16 }}
                                    />
                                ) : null}
                            </View>

                            {FLECKS.map(([left, top, w, h, rot, color], i) => (
                                <View
                                    key={i}
                                    style={{
                                        position: 'absolute',
                                        left,
                                        top,
                                        width: w,
                                        height: h,
                                        borderRadius: 1,
                                        backgroundColor: color,
                                        transform: [{ rotate: `${rot}deg` }],
                                    }}
                                />
                            ))}
                        </MotiView>

                        {/* Verified asset */}
                        <View className="items-center gap-2">
                            <Text className="text-center font-syne-bold text-[28px] leading-[32px] tracking-[-0.5px] text-[#111827]">
                                {product?.name ?? 'Your item'}
                            </Text>
                            <View className="flex-row items-center gap-[7px] rounded border border-[#005a21] bg-[rgba(100,255,157,0.38)] px-[10px] py-[6px]">
                                <Text className="font-syne-bold text-[10px] text-[#005a21]">VERIFIED OWNERSHIP</Text>
                                <BadgeCheck size={15} color="#005a21" />
                            </View>
                            <Text className="text-center font-syne text-[10px] leading-[15px] tracking-[0.6px] text-[#6b7280]">
                                {[product?.groupCode, rarity].filter(Boolean).join(' · ')}
                            </Text>
                        </View>

                        {/* Ledger card */}
                        <View className="gap-[10px] rounded border border-[#dbeafe] bg-[#e5e7eb] p-4">
                            <View className="self-start rounded-full border border-[rgba(255,183,3,0.19)] bg-[#fffaed] px-[10px] py-[5px]">
                                <Text className="font-syne-bold text-[9px] tracking-[0.6px] text-[#d97706]">
                                    {claimNo != null ? `PROVENANCE LEDGER · CLAIM #${claimNo}` : 'PROVENANCE LEDGER'}
                                </Text>
                            </View>
                            <Text className="font-syne-bold text-xl text-[#111827]">{ledgerNumber}</Text>
                            <Text className="font-syne text-[11px] leading-[18px] text-[#6b7280]">
                                {`Unique to ${product?.name ?? 'this item'}. NFC verification records physical possession; purchase alone does not.`}
                            </Text>
                        </View>

                        <Text className="text-center font-syne text-[13px] leading-[20px] text-[#6b7280]">
                            Added to your collection.
                        </Text>

                        <View className="items-center">
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Continue"
                                activeOpacity={0.85}
                                onPress={() => router.replace('/(tabs)/collections' as never)}
                                className="h-12 w-[240px] items-center justify-center rounded-[30px] border border-[#2563eb] bg-[#111827]"
                            >
                                <Text className="font-syne-bold text-[13px] text-white">Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
