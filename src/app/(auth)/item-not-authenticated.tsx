import { router } from 'expo-router';
import {
    AlertOctagon,
    AlertTriangle,
    Headphones,
    Layers,
    Lightbulb,
    RefreshCw,
    Smartphone,
    WifiOff,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import NfcShell from '@/features/nfc-claim/components/NfcShell';

const REASONS = [
    { Icon: Smartphone, title: 'NFC is turned off', body: 'Please enable NFC in your device settings.' },
    { Icon: AlertOctagon, title: 'Tag is damaged or not working', body: 'The NFC tag may be damaged or not functioning.' },
    { Icon: Smartphone, title: 'Phone moved too quickly', body: 'Try holding your phone closer to the tag and keep it steady.' },
    { Icon: Layers, title: 'Unsupported or invalid tag', body: 'This tag may not be supported by HitBox.' },
];

/**
 * Help screen for a tap that could not be validated — light, to match the rest
 * of the NFC flow (see the Figma "NFC" frames).
 */
export default function ItemNotAuthenticated() {
    // Reached by replacing the result screen after a tap that did not verify,
    // so back lands on the scanner — where the user taps the tag again. (A tag's
    // link works once, so the failed tap cannot be retried.)
    const onTryAgain = () => router.back();

    return (
        <NfcShell
            withTabBar={false}
            footer={
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 500, delay: 500 }}
                    className="gap-3 px-5 pb-2 pt-2"
                >
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.85}
                        onPress={onTryAgain}
                        className="h-12 flex-row items-center justify-center gap-2 rounded-[30px] bg-[#111827]"
                    >
                        <RefreshCw color="#fff" size={16} />
                        <Text className="font-syne-bold text-[13px] text-white">Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.85}
                        onPress={() => router.replace('/(tabs)/discover' as never)}
                        className="h-12 flex-row items-center justify-center gap-2 rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                    >
                        <Headphones color="#2563eb" size={16} />
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Get Help</Text>
                    </TouchableOpacity>
                </MotiView>
            }
        >
            {/* Validation status */}
            <MotiView
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 600, delay: 150 }}
                className="items-center px-5 pb-6 pt-2"
            >
                <View className="mb-4 rounded-full border border-[#fecaca] bg-[#fef2f2] p-5">
                    <AlertTriangle color="#dc2626" size={48} />
                </View>
                <Text className="mb-2 text-center font-orbitron-black text-[24px] leading-[28px] tracking-[-0.5px] text-[#111827]">
                    Item Validation <Text className="text-[#dc2626]">Failed</Text>
                </Text>
                <Text className="max-w-sm px-3 text-center font-syne text-[13px] leading-[20px] text-[#6b7280]">
                    {"We couldn't validate this product because the "}
                    <Text className="font-syne-semibold text-[#111827]">NFC tag</Text> could not be read safely.
                </Text>
            </MotiView>

            <View className="gap-4 px-5">
                {/* Main error */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 200 }}
                    className="flex-row items-start gap-4 rounded border border-[#dbeafe] bg-white p-4"
                >
                    <WifiOff color="#dc2626" size={26} />
                    <View className="flex-1 gap-1">
                        <Text className="font-syne-bold text-sm text-[#111827]">Unable to Read NFC Tag</Text>
                        <Text className="font-syne text-xs leading-[18px] text-[#6b7280]">
                            We were unable to read or detect a valid NFC tag.
                        </Text>
                    </View>
                </MotiView>

                {/* Possible reasons */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 300 }}
                    className="rounded border border-[#dbeafe] bg-white px-4 pt-4"
                >
                    <Text className="mb-1 font-orbitron text-base text-[#111827]">Possible Reasons</Text>
                    {REASONS.map(({ Icon, title, body }, i) => (
                        <View
                            key={title}
                            className={`flex-row items-start gap-3 py-3 ${i < REASONS.length - 1 ? 'border-b border-[#dbeafe]' : ''}`}
                        >
                            <View className="w-6 items-center pt-[2px]">
                                <Icon color="#2563eb" size={18} />
                            </View>
                            <View className="flex-1 gap-1">
                                <Text className="font-syne-bold text-[13px] text-[#111827]">{title}</Text>
                                <Text className="font-syne text-xs leading-[17px] text-[#6b7280]">{body}</Text>
                            </View>
                        </View>
                    ))}
                </MotiView>

                {/* Tip */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 400 }}
                    className="flex-row items-center gap-3 rounded border border-[#dbeafe] bg-[#eff6ff] p-4"
                >
                    <Lightbulb color="#2563eb" size={18} />
                    <Text className="flex-1 font-syne text-xs leading-[18px] text-[#374151]">
                        Make sure the NFC tag is near the top back of your phone and try again.
                    </Text>
                </MotiView>
            </View>
        </NfcShell>
    );
}
