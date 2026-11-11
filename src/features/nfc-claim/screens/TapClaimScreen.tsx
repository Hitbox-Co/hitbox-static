import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import SignInPopup from '@/components/auth/SignInPopup';
import type { TapUrl } from '@/lib/tap-url';
import { classifyClaimFailure } from '../api/claimErrors';
import { useClaimTap } from '../api/useClaimTap';
import NfcShell from '../components/NfcShell';
import OwnedProvenance from '../components/OwnedProvenance';
import { NoticeCard, ProductBox, Row, ownerNameOf } from '../components/TapCards';
import { ClaimResult } from '../types/claim';
import SucessfulClaimScreen from './SucessfulClaimScreen';

/**
 * A tap, claimed. The Claim section's destination: the user is already signed
 * in (the Scan screen asks before they tap), the URL is sent to the server once,
 * and whatever comes back is shown:
 *
 *   CLAIMED                    → SucessfulClaimScreen ("It's officially yours")
 *   ALREADY_CLAIMED (by you)   → OwnedProvenance
 *   ALREADY_CLAIMED (other)    → "claimed by <owner>"
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

    if (result?.verified && result.outcome === 'ALREADY_CLAIMED' && result.claimedByYou) {
        return <OwnedProvenance result={result} />;
    }

    return (
        <NfcShell
            withTabBar={false}
            footer={
                <View className="gap-3 px-5 pb-2 pt-2">
                    {isLoaded && !signedIn && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={() => setAskSignIn(true)}
                            activeOpacity={0.85}
                            className="h-12 items-center justify-center rounded-[30px] bg-[#111827]"
                        >
                            <Text className="font-syne-bold text-[13px] text-white">Sign in</Text>
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
            {isLoaded && !signedIn && (
                <NoticeCard
                    tone="warn"
                    title="Sign in to claim"
                    body="Sign in first. This tag's link works once, so it is only sent when you are ready."
                />
            )}

            {signedIn && claim.isPending && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="mt-4 font-syne-medium text-base text-[#6b7280]">Verifying this item…</Text>
                </View>
            )}

            {claim.isError && <ClaimFailureNotice error={claim.error} />}

            {result?.verified && result.outcome !== 'CLAIMED' && <Outcome result={result} />}

            <SignInPopup
                open={askSignIn}
                onOpenChange={setAskSignIn}
                title="Sign in to claim"
                description="Sign in to claim this item and add it to your collection."
                // Nothing to resume: useClaimTap is enabled the moment the session lands.
            />
        </NfcShell>
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

/** Every outcome except a fresh claim and your own item, which have their own screens. */
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

    // ALREADY_CLAIMED by someone else (who may keep it private).
    return (
        <NoticeCard tone="warn" title="Already claimed" body={result.message}>
            <View className="mb-4 w-full rounded border border-[#dbeafe] bg-white px-4">
                <Row label="Owner" value={ownerName ?? 'Private collector'} />
                {result.claimedAt ? <Row label="Claimed" value={new Date(result.claimedAt).toLocaleString()} /> : null}
            </View>
            <ProductBox product={result.product} serial={result.sku.serialNumber} />
        </NoticeCard>
    );
}
