import { useAuth } from '@clerk/clerk-expo';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, ArrowUpRight } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import SignInPopup from '@/components/auth/SignInPopup';
import {
    getNfcStatus,
    promptEnableNfcIfNeeded,
    startTagListener,
    type NfcStatus,
} from '@/lib/nfc';
import { describeTagProblem, type TagReading } from '@/lib/ndef-tap';
import { parseTapUrl, tapIdentity, type TapUrl } from '@/lib/tap-url';
import { ActionPillButton, NfcScanGraphic } from '../components/NfcGraphics';
import NfcShell from '../components/NfcShell';

type Action = 'claim' | 'verify';

/**
 * Hands a tap to the screen that sends it to the server. The three values ride
 * as route params; they are single-use, so the destination screens send them
 * once and keep the answer (see useClaimTap).
 */
export function goToTap(action: Action, tap: TapUrl) {
    const pathname = action === 'claim' ? '/claim' : '/verify/check';
    router.push({ pathname, params: { ...tapIdentity(tap), e: tap.e, c: tap.c } } as never);
}

const STEPS = ['1 · Tap', '2 · Verify', '3 · Reveal'];

/**
 * NFC section — the in-app entry point for claiming and verifying, in the light
 * layout from the UX-DESIGN Figma ("NFC — Ready to authenticate").
 *
 * Reads the URL a tag carries (never its UID) by tapping — a foreground
 * listener, live only while this screen is focused — or from a pasted link, then
 * routes to Claim or Verify. The Claim / Verify buttons at the bottom choose
 * what a tap does; with a link pasted, pressing one also submits it.
 *
 * Claim needs a session, and a tag's URL works once, so Claim asks the user to
 * sign in BEFORE they tap rather than after: a tap made while signed out could
 * not be claimed. Verify is public and never asks.
 */
export default function ScanScreen() {
    const { isLoaded, isSignedIn } = useAuth();
    const signedIn = isLoaded && !!isSignedIn;
    const focused = useIsFocused();
    // "Verify authenticity" on a product opens the scanner already in Verify mode.
    const { mode } = useLocalSearchParams<{ mode?: string }>();

    const [status, setStatus] = useState<NfcStatus | null>(null);
    const [pasted, setPasted] = useState('');
    const [pasteError, setPasteError] = useState(false);
    const [action, setAction] = useState<Action>(mode === 'verify' ? 'verify' : 'claim');
    const [askSignIn, setAskSignIn] = useState(false);
    // Why the last tag could not be used (blank, wrong link, a link that never changes…).
    const [problem, setProblem] = useState<Exclude<TagReading, { kind: 'tap' }> | null>(null);

    // NFC availability + prompt to enable when it's off.
    useEffect(() => {
        void (async () => {
            const s = await getNfcStatus();
            setStatus(s);
            if (s.supported && !s.enabled) void promptEnableNfcIfNeeded();
        })();
    }, []);

    // Claim needs a session before the tap; verify never does.
    const needsSignIn = action === 'claim' && isLoaded && !signedIn;
    const listening = focused && !needsSignIn && (action === 'verify' || signedIn);

    const onTap = useCallback(
        (tap: TapUrl) => {
            setProblem(null);
            goToTap(action, tap);
        },
        [action],
    );
    // A tag that cannot be read is a problem with the tag, which the app can name
    // precisely — unlike a tap the server refused, which it never explains.
    const onProblem = useCallback((reading: Exclude<TagReading, { kind: 'tap' }>) => setProblem(reading), []);

    // Live tap listener, only while this screen is in front and ready.
    useEffect(() => {
        if (!listening) return;
        const stop = startTagListener({ onTap, onProblem });
        return () => stop();
    }, [listening, onTap, onProblem]);

    const submitPaste = (chosen: Action) => {
        const tap = parseTapUrl(pasted);
        if (!tap) {
            setPasteError(true);
            return;
        }
        setPasteError(false);
        if (chosen === 'claim' && !signedIn) {
            setAskSignIn(true);
            return;
        }
        goToTap(chosen, tap);
    };

    /** Picks the action; with a link in the box, it also sends it. */
    const onChoose = (chosen: Action) => {
        setAction(chosen);
        setProblem(null);
        if (pasted.trim()) submitPaste(chosen);
    };

    const nfcOff = !!status?.supported && !status.enabled;
    const nfcMissing = !!status && !status.supported;

    // One line under the heading: what the screen is doing right now.
    const statusText = needsSignIn
        ? 'SIGN IN TO START'
        : nfcMissing
            ? 'NFC UNAVAILABLE · PASTE A LINK'
            : nfcOff
                ? 'NFC IS OFF · TAP TO TURN ON'
                : 'SCANNING · WAITING FOR TAP';
    const live = listening && !nfcMissing && !nfcOff;

    return (
        <NfcShell>
            <Text className="px-5 py-1 font-orbitron text-[8px] tracking-[0.4px] text-[#2563eb]">
                NFC CLAIM &amp; VERIFY
            </Text>

            {/* Steps */}
            <View className="flex-row gap-2 px-5 py-[9px]">
                {STEPS.map((step, i) => (
                    <View
                        key={step}
                        className={`flex-1 items-center rounded border py-[10px] ${i === 0 ? 'border-[#bfdbfe] bg-[#eff6ff]' : 'border-[#dbeafe] bg-[#f3f6ff]'
                            }`}
                    >
                        <Text
                            className={`text-[10px] ${i === 0 ? 'font-syne-bold text-[#2563eb]' : 'font-syne-semibold text-[#6b7280]'}`}
                        >
                            {step}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Tap card */}
            <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="mx-5 items-center gap-6 rounded border border-[#dbeafe] bg-white px-6 py-7"
                style={{
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.13,
                    shadowRadius: 12,
                    elevation: 4,
                }}
            >
                <NfcScanGraphic active={live} />

                <View className="w-full items-center gap-2">
                    <Text className="text-center font-orbitron-black text-[26px] leading-[30px] tracking-[-0.6px] text-[#111827]">
                        {needsSignIn ? 'Sign in to claim' : action === 'claim' ? 'Tap to claim' : 'Tap to verify'}
                    </Text>
                    <Text className="text-center font-syne text-[13px] leading-[20px] text-[#6b7280]">
                        {needsSignIn
                            ? "A tag's link works once, so sign in first, then tap."
                            : "Hold the top of your phone against the collectible's NFC tag"}
                    </Text>
                </View>

                {needsSignIn ? (
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setAskSignIn(true)}
                        activeOpacity={0.85}
                        className="h-11 items-center justify-center rounded-[30px] bg-[#111827] px-8"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">Sign in</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        accessibilityRole={nfcOff ? 'button' : 'text'}
                        disabled={!nfcOff}
                        onPress={() => void promptEnableNfcIfNeeded()}
                        className="flex-row items-center justify-center gap-2"
                    >
                        <View className="size-[18px] items-center justify-center">
                            <MotiView
                                from={{ opacity: 0.35 }}
                                animate={{ opacity: live ? 1 : 0.35 }}
                                transition={{ type: 'timing', duration: 800, loop: live, repeatReverse: true }}
                                className="size-[6px] rounded-full bg-[#2563eb]"
                            />
                        </View>
                        <Text className="font-syne-bold text-[11px] tracking-[0.5px] text-[#2563eb]">{statusText}</Text>
                    </TouchableOpacity>
                )}

                {problem && !needsSignIn && (
                    <View className="w-full rounded border border-[#fecaca] bg-[#fef2f2] p-4">
                        <View className="flex-row items-center gap-2">
                            <AlertTriangle color="#dc2626" size={16} />
                            <Text className="flex-1 font-syne-bold text-[13px] text-[#111827]">
                                {describeTagProblem(problem).title}
                            </Text>
                        </View>
                        <Text className="mt-2 font-syne text-xs leading-[18px] text-[#6b7280]">
                            {describeTagProblem(problem).hint}
                        </Text>
                    </View>
                )}

                {/* Divider */}
                <View className="w-full flex-row items-center gap-3">
                    <View className="h-px flex-1 bg-[#dbeafe]" />
                    <Text className="font-syne-semibold text-[11px] tracking-[1.2px] text-[#6b7280]">OR PASTE A TAG LINK</Text>
                    <View className="h-px flex-1 bg-[#dbeafe]" />
                </View>

                {/* Works without a physical tap (emulator, testing) */}
                <View className="w-full">
                    <TextInput
                        value={pasted}
                        onChangeText={(text) => {
                            setPasted(text);
                            setPasteError(false);
                        }}
                        placeholder="https://hitboxcollectibles.com/verify?u=…"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="go"
                        onSubmitEditing={() => pasted.trim() && onChoose(action)}
                        className={`rounded border bg-[#f3f6ff] px-4 py-[13px] font-syne text-[13px] text-[#111827] ${pasteError ? 'border-[#dc2626]' : 'border-[#dbeafe]'
                            }`}
                    />
                    {pasteError && (
                        <Text className="mt-2 font-syne-medium text-xs text-[#dc2626]">That isn&apos;t a HitBox tag link.</Text>
                    )}
                </View>

                <View className="w-full flex-row items-center gap-[10px]">
                    <ActionPillButton
                        label="Claim"
                        selected={action === 'claim'}
                        onPress={() => onChoose('claim')}
                        icon={<ArrowUpRight size={15} color={action === 'claim' ? '#fff' : '#111827'} />}
                    />
                    <ActionPillButton
                        label="Verify"
                        selected={action === 'verify'}
                        onPress={() => onChoose('verify')}
                    />
                </View>
            </MotiView>

            <Text className="px-5 pt-5 text-center font-syne text-[10px] leading-[15px] text-[#6b7280]">
                Move your phone slowly · remove thick cases · try again
            </Text>

            <SignInPopup
                open={askSignIn}
                onOpenChange={setAskSignIn}
                title="Sign in to claim"
                description="Sign in to claim items and add them to your collection."
                // Signed in → the listener starts by itself; nothing else to resume.
            />
        </NfcShell>
    );
}
