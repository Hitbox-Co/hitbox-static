import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignInPopup from '@/components/auth/SignInPopup';
import { armOnboarding } from '@/lib/onboarding-gate';
import Step2ActionCtx from '../components/Step2ActionCtx';
import Step2Footer from '../components/Step2Footer';
import Step2Header from '../components/Step2Header';
import Step2Perks from '../components/Step2Perks';

/**
 * Sign up / login entry — the light "Y2K" layout from the UX-DESIGN Figma file
 * (HitBox · Sign up / Login). Unlike the rest of the app this screen is white,
 * so it pins dark status-bar icons while it is mounted.
 */
export default function Step2Screen() {
    // "Continue with Email" and the "Sign in" link share one popup, opened
    // straight on the email form — there is no separate login screen to visit.
    const [signInOpen, setSignInOpen] = useState(false);

    // Anyone who signs up or in from this screen lands on onboarding; the root
    // layout acts on this the moment their session goes active (see onboarding-gate).
    useEffect(() => {
        armOnboarding();
    }, []);

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            <SafeAreaView className="flex-1">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
                >
                    {/* Brand + Skip, welcome headline */}
                    <Step2Header />

                    {/* Benefits card */}
                    <Step2Perks />

                    {/* Sign-up buttons */}
                    <Step2ActionCtx onEmail={() => setSignInOpen(true)} />

                    {/* OR divider, sign-in link, legal */}
                    <Step2Footer onSignIn={() => setSignInOpen(true)} />
                </ScrollView>
            </SafeAreaView>

            <SignInPopup
                light
                initialMethod="email"
                open={signInOpen}
                onOpenChange={setSignInOpen}
                title="Sign in with Email"
                onSignedIn={() => router.replace('/(auth)/onboarding' as never)}
            />
        </View>
    );
}
