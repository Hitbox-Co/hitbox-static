import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type { TapUrl } from '@/lib/tap-url';
import { useVerifyTap } from '../api/useVerifyTap';
import NfcShell from '../components/NfcShell';
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
        <NfcShell
            withTabBar={false}
            footer={
                <View className="gap-3 px-5 pb-2 pt-2">
                    {result?.verified && !result.claimed && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={() => router.replace('/scan' as never)}
                            activeOpacity={0.85}
                            className="h-12 items-center justify-center rounded-[30px] bg-[#111827]"
                        >
                            <Text className="font-syne-bold text-[13px] text-white">Claim it: tap the tag again</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => router.back()}
                        activeOpacity={0.85}
                        className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                    >
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Done</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            <Text className="px-5 pb-2 pt-1 font-orbitron text-[8px] tracking-[0.4px] text-[#2563eb]">
                AUTHENTICITY CHECK
            </Text>

            {verify.isPending && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="mt-4 font-syne-medium text-base text-[#6b7280]">Verifying this item…</Text>
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
        </NfcShell>
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
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
            <NoticeCard tone="good" title="Authentic" body={ownerLine}>
                <GenuineBanner label="GENUINE HITBOX PRODUCT" />
                <View className="mb-4 w-full rounded border border-[#dbeafe] bg-white px-4">
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
