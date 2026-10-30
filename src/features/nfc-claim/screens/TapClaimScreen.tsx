import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View as MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignInPopup from '@/components/auth/SignInPopup';
import type { TapUrl } from '@/lib/tap-url';
import { classifyClaimFailure } from '../api/claimErrors';
import { useClaimTap } from '../api/useClaimTap';
import { NoticeCard, ProductBox, Row, ownerNameOf } from '../components/TapCards';
import { ClaimResult } from '../types/claim';
import SucessfulClaimScreen from './SucessfulClaimScreen';

/**
 * A tap, claimed. The Claim section's destination: the user is already signed
 * in (the Scan screen asks before they tap), the URL is sent to the server once,
 * and whatever comes back is shown:
 *
 *   CLAIMED                    → SucessfulClaimScreen
 *   ALREADY_CLAIMED            → "you own this" / "claimed by <owner>"
 *   CLAIMED_BY_OTHER_JUST_NOW  → someone beat you by a moment
 *   UNAVAILABLE                → authentic, but frozen right now
 *   verified: false            → the "couldn't validate" help screen
 *   network / server failure   → tap again (never resend: a tap URL works once)
 */
export default function TapClaimScreen({ tap }: { tap: TapUrl }) {
    const { isLoaded, isSignedIn } = useAuth();
    const signedIn = isLoaded && !!isSignedIn;
    const [askSignIn, setAskSignIn] = useState(false);

    // Held back until there is a session: a 401 would spend the tap for nothing.
    const claim = useClaimTap(tap, signedIn);
    const result = claim.data;

    // The server will not say why a tap failed, so there is nothing to show but
    // the help screen. Replaced rather than pushed: back goes to the scanner.
    useEffect(() => {
        if (result && !result.verified) router.replace('/item-not-authenticated' as never);
    }, [result]);

    if (result?.verified && result.outcome === 'CLAIMED') {
        return <SucessfulClaimScreen result={result} />;
    }

    return (
        <SafeAreaView className="flex-1 bg-[#050507]">
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center my-2 mb-6">
                    <Image source={require('@/assets/images/HitBoxLogo.png')} contentFit="contain" style={{ width: 40, height: 40 }} />
                </MotiView>

                {isLoaded && !signedIn && (
                    <NoticeCard
                        tone="warn"
                        title="Sign in to claim"
                        body="Sign in first. This tag's link works once, so it is only sent when you are ready."
                    />
                )}

                {signedIn && claim.isPending && (
                    <View className="items-center mt-16">
                        <ActivityIndicator size="large" color="#208AEF" />
                        <Text className="text-neutral-300 mt-4 text-base font-medium">Verifying this item…</Text>
                    </View>
                )}

                {claim.isError && <ClaimFailureNotice error={claim.error} />}

                {result?.verified && result.outcome !== 'CLAIMED' && <Outcome result={result} />}
            </ScrollView>

            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-5 mb-2">
                {isLoaded && !signedIn && (
                    <TouchableOpacity
                        onPress={() => setAskSignIn(true)}
                        activeOpacity={0.85}
                        className="bg-primary rounded-xl h-14 items-center justify-center mb-3"
                    >
                        <Text className="text-white text-base font-bold">Sign in</Text>
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

            <SignInPopup
                open={askSignIn}
                onOpenChange={setAskSignIn}
                title="Sign in to claim"
                description="Sign in to claim this item and add it to your collection."
                // Nothing to resume: useClaimTap is enabled the moment the session lands.
            />
        </SafeAreaView>
    );
}

/**
 * Why the claim request itself failed. Named, because "Couldn't reach HitBox"
 * for a refusal the server did send sends people off to check their Wi-Fi.
 */
function ClaimFailureNotice({ error }: { error: unknown }) {
    switch (classifyClaimFailure(error)) {
        case 'ACCOUNT_NOT_READY':
            return (
                <NoticeCard
                    tone="warn"
                    title="Your account is still being set up"
                    body="This can take a moment after signing up. Wait a few seconds, then hold your phone to the tag again. Nothing was claimed."
                />
            );
        case 'SESSION_EXPIRED':
            return (
                <NoticeCard
                    tone="warn"
                    title="Please sign in again"
                    body="Your session has ended. Sign in, then hold your phone to the tag again."
                />
            );
        default:
            return (
                <NoticeCard
                    tone="bad"
                    title="Couldn't reach HitBox"
                    body="We couldn't confirm that tap. Check your connection, then hold your phone to the tag again."
                />
            );
    }
}

/** Every outcome except a fresh claim, which has its own celebratory screen. */
function Outcome({ result }: { result: ClaimResult }) {
    const ownerName = ownerNameOf(result.owner);

    if (result.outcome === 'CLAIMED_BY_OTHER_JUST_NOW') {
        return (
            <NoticeCard tone="warn" title="Someone beat you to it" body={result.message}>
                <ProductBox product={result.product} serial={result.sku.serialNumber} />
            </NoticeCard>
        );
    }

    if (result.outcome === 'UNAVAILABLE') {
        return (
            <NoticeCard tone="warn" title="Not available right now" body={result.message}>
                <ProductBox product={result.product} serial={result.sku.serialNumber} />
            </NoticeCard>
        );
    }

    // ALREADY_CLAIMED — by you, or by someone else (who may keep it private).
    return (
        <NoticeCard
            tone={result.claimedByYou ? 'good' : 'warn'}
            title={result.claimedByYou ? 'You already own this item' : 'Already claimed'}
            body={result.message}
        >
            <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4 mb-4">
                <Row label="Owner" value={result.claimedByYou ? `${ownerName ?? 'You'} (you)` : (ownerName ?? 'Private collector')} />
                {result.claimedAt ? <Row label="Claimed" value={new Date(result.claimedAt).toLocaleString()} /> : null}
            </View>
            <ProductBox product={result.product} serial={result.sku.serialNumber} />
        </NoticeCard>
    );
}
