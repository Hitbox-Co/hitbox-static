import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';

import SignInPopup from '@/components/auth/SignInPopup';
import type { TapUrl } from '@/lib/tap-url';
import NfcShell from '../components/NfcShell';
import TapClaimScreen from './TapClaimScreen';
import TapVerifyScreen from './TapVerifyScreen';

/**
 * Where a tag's link lands when it opens the app from outside — the chip's URL
 * (`https://hitboxcollectibles.com/verify?b=&e=&c=`) delivered as an App Link /
 * Universal Link, with no Claim / Verify choice made yet.
 *
 * The link works once, and nothing has been sent to the server yet, so this
 * screen does not guess:
 *
 *   signed in   → claim. Opening your own collectible in HitBox is a claim.
 *   signed out  → ask: sign in and claim, or just check it is genuine.
 */
export default function TapEntryScreen({ tap }: { tap: TapUrl }) {
    const { isLoaded, isSignedIn } = useAuth();
    const [mode, setMode] = useState<'choose' | 'verify'>('choose');
    const [askSignIn, setAskSignIn] = useState(false);

    if (!isLoaded) {
        return (
            <NfcShell withTabBar={false}>
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </NfcShell>
        );
    }

    if (isSignedIn) return <TapClaimScreen tap={tap} />;
    if (mode === 'verify') return <TapVerifyScreen tap={tap} />;

    return (
        <NfcShell withTabBar={false}>
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center px-5 pt-6">
                <Image
                    source={require('@/assets/images/HitBoxLogo-dark.png')}
                    resizeMode="contain"
                    style={{ width: 56, height: 56 }}
                />
                <Text className="mt-6 text-center font-orbitron-black text-2xl leading-[28px] tracking-[-0.5px] text-[#111827]">
                    HitBox item detected
                </Text>
                <Text className="mt-2 px-4 text-center font-syne text-[13px] leading-[20px] text-[#6b7280]">
                    What would you like to do? This tag&apos;s link works once, so choose before we use it.
                </Text>
            </MotiView>

            <View className="mt-8 items-center gap-3 px-5">
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setAskSignIn(true)}
                    activeOpacity={0.85}
                    className="h-12 w-full flex-row items-center justify-center gap-2 rounded-[30px] border border-[#2563eb] bg-[#2563eb]"
                >
                    <BadgeCheck color="#fff" size={18} />
                    <Text className="font-syne-bold text-[13px] text-white">Sign in &amp; claim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => setMode('verify')}
                    activeOpacity={0.85}
                    className="h-12 w-full flex-row items-center justify-center gap-2 rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    <ShieldCheck color="#2563eb" size={18} />
                    <Text className="font-syne-bold text-[13px] text-[#2563eb]">Just check it&apos;s genuine</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/discover' as never)} className="py-3">
                    <Text className="font-syne-semibold text-[13px] text-[#6b7280]">Not now</Text>
                </TouchableOpacity>
            </View>

            <SignInPopup
                open={askSignIn}
                onOpenChange={setAskSignIn}
                title="Sign in to claim"
                description="Sign in to claim this item and add it to your collection."
                // Signed in → this screen re-renders into TapClaimScreen by itself.
            />
        </NfcShell>
    );
}
