import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { takePendingClaim } from '@/lib/pending-claim';

/**
 * Landing route for the Clerk OAuth redirect (hitboxstatic://sso-callback).
 *
 * IMPORTANT: Clerk finishes creating the session *asynchronously* after the
 * browser redirect lands here, so `isSignedIn` is usually still false on the
 * first render. We therefore WAIT for the session instead of bouncing — an
 * immediate redirect to the login page is what caused the sign-in loop.
 * We never send the user back to login from here.
 */
const POLL_MS = 250;
const MAX_WAIT_MS = 15_000;

export default function SSOCallback() {
    const { isLoaded, isSignedIn } = useAuth();

    useEffect(() => {
        let done = false;
        let waited = 0;

        const leave = () => {
            if (done) return;
            done = true;
            const tag = takePendingClaim();
            // Always land on the claim page when we know the tag; the claim
            // screen decides what to show based on the session it sees.
            router.replace((tag ? `/claim/${tag}` : '/(tabs)/discover') as never);
        };

        const timer = setInterval(() => {
            waited += POLL_MS;
            if (isLoaded && isSignedIn) leave();
            else if (waited >= MAX_WAIT_MS) leave();
        }, POLL_MS);

        return () => clearInterval(timer);
    }, [isLoaded, isSignedIn]);

    return (
        <View className="flex-1 items-center justify-center bg-[#050507]">
            <ActivityIndicator size="large" color="#208AEF" />
            <Text className="text-neutral-300 mt-4 text-base font-medium">Finishing sign-in…</Text>
        </View>
    );
}
