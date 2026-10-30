import { useAuth } from '@clerk/clerk-expo';
import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { AlertTriangle, BadgeCheck, Link2, Nfc, ShieldCheck } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignInPopup from '@/components/auth/SignInPopup';
import {
    getNfcStatus,
    promptEnableNfcIfNeeded,
    startTagListener,
    type NfcStatus,
} from '@/lib/nfc';
import { describeTagProblem, type TagReading } from '@/lib/ndef-tap';
import { parseTapUrl, tapIdentity, type TapUrl } from '@/lib/tap-url';

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

/**
 * NFC section — the in-app entry point for claiming and verifying.
 *
 * Reads the URL a tag carries (never its UID) by tapping — a foreground
 * listener, live only while this screen is focused — or from a pasted link, then
 * routes to Claim or Verify.
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

    const tapFromPaste = parseTapUrl(pasted);
    const submitPaste = () => {
        if (!tapFromPaste) {
            setPasteError(true);
            return;
        }
        setPasteError(false);
        if (action === 'claim' && !signedIn) {
            setAskSignIn(true);
            return;
        }
        goToTap(action, tapFromPaste);
    };

    return (
        <SafeAreaView
            // No bottom edge: these routes render inside (tabs), so the tab bar
            // already reserves the safe area below.
            edges={['top', 'left', 'right']}
            className="flex-1 bg-[#050507]"
        >
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center my-2">
                    <View className="flex items-center justify-center w-full mb-5">
                        <Image
                            source={require('@/assets/images/HitBoxLogo.png')}
                            resizeMode="contain"
                            style={{ width: 50, height: 50 }}
                        />
                    </View>
                    <Text className="text-neutral-500 text-[11px] font-bold uppercase tracking-widest mt-1">
                        NFC claim &amp; verify
                    </Text>
                </MotiView>

                {/* Claim / Verify toggle — decides where a tap takes you */}
                <View className="flex-row bg-[#0F0F13] border border-[#1F1F24] rounded-2xl p-1.5 mt-4 mb-6">
                    {(['claim', 'verify'] as Action[]).map((a) => {
                        const active = action === a;
                        return (
                            <TouchableOpacity
                                key={a}
                                onPress={() => {
                                    setAction(a);
                                    setProblem(null);
                                }}
                                activeOpacity={0.85}
                                className={`flex-1 h-11 rounded-xl flex-row items-center justify-center gap-1.5 ${active ? 'bg-primary' : 'bg-transparent'}`}
                            >
                                {a === 'claim'
                                    ? <BadgeCheck color={active ? '#FFF' : '#71717A'} size={16} />
                                    : <ShieldCheck color={active ? '#FFF' : '#71717A'} size={16} />}
                                <Text className={`font-bold text-sm ${active ? 'text-white' : 'text-neutral-500'}`}>
                                    {a === 'claim' ? 'Claim' : 'Verify'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Tap prompt — or, for Claim while signed out, the sign-in prompt */}
                <View className="items-center">
                    <MotiView
                        from={{ opacity: 0.4, scale: 0.9 }}
                        animate={{ opacity: needsSignIn ? 0.4 : 1, scale: needsSignIn ? 0.95 : 1.06 }}
                        transition={{ type: 'timing', duration: 900, loop: !needsSignIn, repeatReverse: true }}
                        className="bg-[#0C1B2E] p-8 rounded-full border"
                        style={{ borderColor: '#208AEF' }}
                    >
                        <Nfc color="#208AEF" size={64} />
                    </MotiView>

                    {needsSignIn ? (
                        <>
                            <Text className="text-white text-2xl font-black tracking-tight mt-7 mb-2">Sign in to claim</Text>
                            <Text className="text-[14px] text-neutral-400 text-center font-medium leading-5 px-6">
                                A tag&apos;s link works once, so sign in first, then tap.
                            </Text>
                            <TouchableOpacity
                                onPress={() => setAskSignIn(true)}
                                activeOpacity={0.85}
                                className="bg-primary rounded-xl h-12 px-8 items-center justify-center mt-5"
                            >
                                <Text className="text-white font-bold text-[15px]">Sign in</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text className="text-white text-2xl font-black tracking-tight mt-7 mb-2">
                                {action === 'claim' ? 'Tap to claim' : 'Tap to verify'}
                            </Text>
                            <Text className="text-[14px] text-neutral-400 text-center font-medium leading-5 px-6">
                                Hold the top-back of your phone against the collectible&apos;s NFC tag.
                            </Text>
                        </>
                    )}

                    {problem && !needsSignIn && (
                        <View className="w-full bg-[#2A1414] border border-[#7A1C1C] rounded-xl p-4 mt-6">
                            <View className="flex-row items-center">
                                <AlertTriangle color="#FF3B30" size={18} />
                                <Text className="text-white font-bold text-[15px] ml-2 flex-1">
                                    {describeTagProblem(problem).title}
                                </Text>
                            </View>
                            <Text className="text-neutral-300 text-[13px] leading-5 mt-2">
                                {describeTagProblem(problem).hint}
                            </Text>
                        </View>
                    )}

                    {status && !status.supported && (
                        <Text className="text-amber-400 font-semibold text-[13px] text-center mt-4 px-6">
                            NFC isn&apos;t available on this build/device — paste a tag link below.
                        </Text>
                    )}
                    {status?.supported && !status.enabled && (
                        <TouchableOpacity onPress={() => void promptEnableNfcIfNeeded()} className="mt-4">
                            <Text className="text-primary font-bold text-[15px]">NFC is off — turn it on</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Paste a tag link — works without a physical tap (emulator, testing) */}
                <View className="bg-[#0F0F13] border border-[#1F1F24] rounded-2xl p-4 mt-8">
                    <Text className="text-[12px] text-neutral-400 font-medium uppercase tracking-wider mb-2">
                        Or paste a tag link
                    </Text>
                    <View className="flex-row items-center bg-[#08060b] border border-[#26262E] rounded-xl px-3 h-14">
                        <Link2 color="#71717A" size={18} />
                        <TextInput
                            value={pasted}
                            onChangeText={(text) => {
                                setPasted(text);
                                setPasteError(false);
                            }}
                            placeholder="https://hitboxcollectibles.com/verify?u=…"
                            placeholderTextColor="#525252"
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="flex-1 text-white text-base ml-2"
                        />
                    </View>
                    {pasteError && (
                        <Text className="text-red-400 text-[13px] font-medium mt-2">
                            That isn&apos;t a HitBox tag link.
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={submitPaste}
                        disabled={!pasted.trim()}
                        activeOpacity={0.85}
                        className={`h-13 py-3.5 rounded-xl flex-row items-center justify-center gap-1.5 mt-3 ${pasted.trim() ? 'bg-primary' : 'bg-[#1A1A22]'}`}
                    >
                        {action === 'claim' ? <BadgeCheck color="#FFF" size={17} /> : <ShieldCheck color="#FFF" size={17} />}
                        <Text className="text-white font-bold text-sm">{action === 'claim' ? 'Claim' : 'Verify'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SignInPopup
                open={askSignIn}
                onOpenChange={setAskSignIn}
                title="Sign in to claim"
                description="Sign in to claim items and add them to your collection."
                // Signed in → the listener starts by itself; nothing else to resume.
            />
        </SafeAreaView>
    );
}
