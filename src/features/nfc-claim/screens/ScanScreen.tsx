import { router } from 'expo-router';
import { BadgeCheck, Nfc, ScanLine, ShieldCheck } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getNfcStatus,
    normalizeTagId,
    promptEnableNfcIfNeeded,
    startTagListener,
    type NfcStatus,
} from '@/lib/nfc';

/** Navigate to the claim page for a (normalized) tag id. */
export function goToClaim(tagId: string) {
    const id = normalizeTagId(tagId);
    if (!id) return;
    router.push(`/claim/${id}` as never);
}

/** Navigate to the read-only verify page for a (normalized) tag id. */
export function goToVerify(tagId: string) {
    const id = normalizeTagId(tagId);
    if (!id) return;
    router.push(`/verify/${id}` as never);
}

type Action = 'claim' | 'verify';

/**
 * NFC section — the in-app entry point for claiming and verifying.
 * Reads a tag by tapping (foreground listener, live on this screen) or by
 * typing the id, then routes to Claim or Verify.
 */
export default function ScanScreen() {
    const [status, setStatus] = useState<NfcStatus | null>(null);
    const [manual, setManual] = useState('');
    const [action, setAction] = useState<Action>('claim');
    const [lastTag, setLastTag] = useState<string | null>(null);

    // NFC availability + prompt to enable when it's off.
    useEffect(() => {
        void (async () => {
            const s = await getNfcStatus();
            setStatus(s);
            if (s.supported && !s.enabled) void promptEnableNfcIfNeeded();
        })();
    }, []);

    // Live tap listener while this screen is open.
    const onTag = useCallback(
        (tagId: string) => {
            setLastTag(tagId);
            if (action === 'verify') goToVerify(tagId);
            else goToClaim(tagId);
        },
        [action],
    );

    useEffect(() => {
        const stop = startTagListener(onTag);
        return () => stop();
    }, [onTag]);

    const normalized = normalizeTagId(manual);
    const canGo = normalized.length > 0;

    return (
        <SafeAreaView
            // No bottom edge: these routes render inside (tabs), so the tab bar
            // already reserves the safe area below.
            edges={["top", "left", "right"]}
            className="flex-1 bg-[#050507]"
        >
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center my-2">
                    <View className="flex items-center justify-center w-full mb-5">

                        <Image
                            source={require("@/assets/images/HitBoxLogo.png")}
                            resizeMode="contain"
                            style={{
                                width: 50,
                                height: 50,
                            }}
                        />

                    </View>
                    <Text className="text-neutral-500 text-[11px] font-bold uppercase tracking-widest mt-1">
                        NFC claim &amp; verify
                    </Text>
                </MotiView>

                {/* Claim / Verify toggle — decides where a tap takes you */}
                <View className="flex-row bg-[#0F0F13] border border-[#1F1F24] rounded-2xl p-1.5 mt-4 mb-6">
                    {([
                        'claim'
                        // , 'verify'
                    ] as Action[]).map((a) => {
                        const active = action === a;
                        return (
                            <TouchableOpacity
                                key={a}
                                onPress={() => setAction(a)}
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

                {/* Pulsing tap prompt */}
                <View className="items-center">
                    <MotiView
                        from={{ opacity: 0.4, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1.06 }}
                        transition={{ type: 'timing', duration: 900, loop: true, repeatReverse: true }}
                        className="bg-[#0C1B2E] p-8 rounded-full border"
                        style={{ borderColor: '#208AEF' }}
                    >
                        <Nfc color="#208AEF" size={64} />
                    </MotiView>

                    <Text className="text-white text-2xl font-black tracking-tight mt-7 mb-2">
                        {action === 'claim' ? 'Tap to claim' : 'Tap to verify'}
                    </Text>
                    <Text className="text-[14px] text-neutral-400 text-center font-medium leading-5 px-6">
                        Hold the top-back of your phone against the collectible&apos;s NFC tag.
                    </Text>

                    {lastTag && (
                        <Text className="text-[12px] text-neutral-500 font-medium mt-3">Last read: {lastTag}</Text>
                    )}

                    {status && !status.supported && (
                        <Text className="text-amber-400 font-semibold text-[13px] text-center mt-4 px-6">
                            NFC isn&apos;t available on this build/device — use the manual entry below.
                        </Text>
                    )}
                    {status?.supported && !status.enabled && (
                        <TouchableOpacity onPress={() => void promptEnableNfcIfNeeded()} className="mt-4">
                            <Text className="text-primary font-bold text-[15px]">NFC is off — turn it on</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Manual entry — works without a physical tap */}
                <View className="bg-[#0F0F13] border border-[#1F1F24] rounded-2xl p-4 mt-8">
                    <Text className="text-[12px] text-neutral-400 font-medium uppercase tracking-wider mb-2">
                        Or enter a tag id
                    </Text>
                    <View className="flex-row items-center bg-[#08060b] border border-[#26262E] rounded-xl px-3 h-14">
                        <ScanLine color="#71717A" size={18} />
                        <TextInput
                            value={manual}
                            onChangeText={setManual}
                            placeholder="534A70C1610001"
                            placeholderTextColor="#525252"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            className="flex-1 text-white text-base ml-2"
                        />
                    </View>

                    <View className="flex-row gap-3 mt-3">
                        <TouchableOpacity
                            onPress={() => goToClaim(manual)}
                            disabled={!canGo}
                            activeOpacity={0.85}
                            className={`flex-1 h-13 py-3.5 rounded-xl flex-row items-center justify-center gap-1.5 ${canGo ? 'bg-primary' : 'bg-[#1A1A22]'}`}
                        >
                            <BadgeCheck color="#FFF" size={17} />
                            <Text className="text-white font-bold text-sm">Claim</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => goToVerify(manual)}
                            disabled={!canGo}
                            activeOpacity={0.85}
                            className={`flex-1 h-13 py-3.5 rounded-xl flex-row items-center justify-center gap-1.5 border ${canGo ? 'border-primary' : 'border-[#26262E]'}`}
                        >
                            <ShieldCheck color={canGo ? '#208AEF' : '#52525B'} size={17} />
                            <Text className={`font-bold text-sm ${canGo ? 'text-primary' : 'text-neutral-600'}`}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
