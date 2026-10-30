import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View as MotiView } from 'moti';
import React, { useEffect } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TapUrl } from '@/lib/tap-url';
import { useVerifyTap } from '../api/useVerifyTap';
import { GenuineBanner, NoticeCard, ProductBox, Row, ownerNameOf } from '../components/TapCards';
import { TapVerified } from '../types/claim';

/**
 * Read-only authenticity check for a tap — no sign-in, nothing claimed.
 * Shows "Authentic", the product, and who owns it (when they have said it may
 * be shown).
 *
 * The tap's URL is spent by this check, so this screen cannot offer a Claim
 * button: claiming needs a fresh tap, from the Claim section.
 */
export default function TapVerifyScreen({ tap }: { tap: TapUrl }) {
    const verify = useVerifyTap(tap);
    const result = verify.data;

    // The server will not say why a tap failed — the help screen is the answer.
    useEffect(() => {
        if (result && !result.verified) router.replace('/item-not-authenticated' as never);
    }, [result]);

    return (
        <SafeAreaView className="flex-1 bg-[#050507]">
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center my-2 mb-2">
                    <Image source={require('@/assets/images/HitBoxLogo.png')} contentFit="contain" style={{ width: 50, height: 50 }} />
                    <Text className="text-neutral-500 text-[11px] font-bold uppercase tracking-widest mt-3">Authenticity check</Text>
                </MotiView>

                {verify.isPending && (
                    <View className="items-center mt-16">
                        <ActivityIndicator size="large" color="#208AEF" />
                        <Text className="text-neutral-300 mt-4 text-base font-medium">Verifying this item…</Text>
                    </View>
                )}

                {verify.isError && (
                    <NoticeCard
                        tone="bad"
                        title="Couldn't reach HitBox"
                        body="We couldn't confirm that tap. Check your connection, then hold your phone to the tag again."
                    />
                )}

                {result?.verified && <Authentic result={result} />}
            </ScrollView>

            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-5 mb-2">
                {result?.verified && !result.claimed && (
                    <TouchableOpacity
                        onPress={() => router.replace('/scan' as never)}
                        activeOpacity={0.85}
                        className="bg-primary rounded-xl h-14 items-center justify-center mb-3"
                    >
                        <Text className="text-white text-base font-bold">Claim it: tap the tag again</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.85}
                    className="bg-transparent border border-[#2A2A32] rounded-xl h-14 items-center justify-center"
                >
                    <Text className="text-neutral-200 text-base font-bold">Done</Text>
                </TouchableOpacity>
            </MotiView>
        </SafeAreaView>
    );
}

function Authentic({ result }: { result: TapVerified }) {
    const ownerName = ownerNameOf(result.owner);
    const ownerLine = !result.claimed
        ? 'Not claimed yet. This item is still available.'
        : ownerName
            ? `Owned by ${ownerName}.`
            : 'Owned by another collector.';

    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="mt-4">
            <NoticeCard tone="good" title="Authentic" body={ownerLine}>
                <GenuineBanner label="GENUINE HITBOX PRODUCT" />
                <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4 mb-4">
                    <Row label="Item" value={result.sku.skuCode} />
                    <Row label="Status" value={result.claimed ? 'Claimed' : 'Unclaimed'} />
                    <Row label="Owner" value={result.claimed ? (ownerName ?? 'Private') : '— unclaimed —'} />
                    <Row label="Verified at" value={new Date(result.verifiedAt).toLocaleString()} />
                </View>
                <ProductBox product={result.product} serial={result.sku.serialNumber} />
            </NoticeCard>
        </MotiView>
    );
}
