import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BadgeCheck, ShieldCheck } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignInPopup from '@/components/auth/SignInPopup';
import type { TapUrl } from '@/lib/tap-url';
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
            <SafeAreaView className="flex-1 bg-[#050507] items-center justify-center">
                <ActivityIndicator size="large" color="#208AEF" />
            </SafeAreaView>
        );
    }

    if (isSignedIn) return <TapClaimScreen tap={tap} />;
    if (mode === 'verify') return <TapVerifyScreen tap={tap} />;

    return (
        <SafeAreaView className="flex-1 bg-[#050507]">
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" contentContainerStyle={{ paddingBottom: 40 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-6">
                    <Image source={require('@/assets/images/HitBoxLogo.png')} contentFit="contain" style={{ width: 56, height: 56 }} />
                    <Text className="text-white text-2xl font-black mt-6 text-center">HitBox item detected</Text>
                    <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4 mt-2">
                        What would you like to do? This tag&apos;s link works once, so choose before we use it.
                    </Text>
                </MotiView>

                <View className="mt-8 gap-y-3">
                    <TouchableOpacity
                        onPress={() => setAskSignIn(true)}
                        activeOpacity={0.85}
                        className="bg-primary rounded-xl h-14 flex-row gap-2 items-center justify-center"
                    >
                        <BadgeCheck color="#FFF" size={20} />
                        <Text className="text-white text-base font-bold">Sign in &amp; claim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setMode('verify')}
                        activeOpacity={0.85}
                        className="border border-primary rounded-xl h-14 flex-row gap-2 items-center justify-center"
                    >
                        <ShieldCheck color="#208AEF" size={20} />
                        <Text className="text-primary text-base font-bold">Just check it&apos;s genuine</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)/discover' as never)} className="py-3 items-center">
                        <Text className="text-neutral-400 font-semibold">Not now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SignInPopup
                open={askSignIn}
                onOpenChange={setAskSignIn}
                title="Sign in to claim"
                description="Sign in to claim this item and add it to your collection."
                // Signed in → this screen re-renders into TapClaimScreen by itself.
            />
        </SafeAreaView>
    );
}
