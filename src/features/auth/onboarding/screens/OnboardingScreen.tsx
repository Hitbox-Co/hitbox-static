import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowRight, Bell, Fingerprint, ScanLine, Ticket, type LucideIcon } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROPOSITIONS: { Icon: LucideIcon; title: string; body: string }[] = [
    { Icon: ScanLine, title: 'NFC Physical Ownership', body: 'Tap the real item. Make ownership verifiable.' },
    { Icon: Fingerprint, title: 'Provenance Ledger & Resale', body: 'A record that travels with your collectible.' },
    { Icon: Ticket, title: 'Real-World Exclusive VIP Access', body: 'Turn authenticated drops into experiences.' },
];

/**
 * Welcome / onboarding — the light "Y2K" layout from the UX-DESIGN Figma file
 * (HitBox · Onboarding). Shown right after a successful sign-in, then hands off
 * to Discover. Like the sign-up screen it is white, so it pins dark status-bar
 * icons.
 */
export default function OnboardingScreen() {
    const { isSignedIn } = useAuth();

    const enterApp = () => router.replace('/(tabs)/discover');

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />

            <SafeAreaView className="flex-1">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                >
                    {/* Brand + notifications. 52 high to match the Figma navigation bar. */}
                    <View className="h-[52px] flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Image
                                source={require('@/assets/images/HitBoxLogo.png')}
                                resizeMode="cover"
                                style={{ width: 28, height: 28, borderRadius: 6 }}
                            />
                            <Text className="font-orbitron text-[15px] text-[#183570]">HitBox</Text>
                        </View>
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Notifications"
                            hitSlop={12}
                            onPress={() => router.push('/notifications')}
                        >
                            <Bell size={20} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <MotiView
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        className="mt-3 gap-5"
                    >
                        {/* Hero artwork. The Figma crops it to 115% height, shifted up 7.57%. */}
                        <View
                            className="h-[380px] w-full overflow-hidden rounded bg-[#3f9a5a]"
                            style={{
                                shadowColor: '#1a4db2',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.14,
                                shadowRadius: 10,
                                elevation: 4,
                            }}
                        >
                            <Image
                                source={require('@/assets/images/onboarding-hero.jpg')}
                                resizeMode="cover"
                                style={{
                                    position: 'absolute',
                                    left: 0,
                                    width: '100%',
                                    height: '115.13%',
                                    top: '-7.57%',
                                }}
                            />
                        </View>

                        <Text className="font-orbitron text-[8px] leading-[12px] text-[#2563eb]">
                            PHYSICAL COLLECTIBLES. DIGITAL POSSIBILITIES.
                        </Text>

                        <Text
                            className="font-orbitron-black text-[29px] leading-[32px] text-black"
                            style={{
                                textShadowColor: 'rgba(64,107,204,0.17)',
                                textShadowOffset: { width: 0, height: 1 },
                                textShadowRadius: 1,
                            }}
                        >
                            {'Own the rare.\nUnlock the real.'}
                        </Text>

                        <Text className="font-syne text-[13.5px] leading-[20px] text-[#374151]">
                            Collect artist-led drops, authenticate what you own and step inside a world beyond the shelf.
                        </Text>

                        {/* Information card */}
                        <LinearGradient
                            colors={['#eef2ff', '#f5f8ff']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{
                                gap: 12,
                                padding: 16,
                                borderRadius: 4,
                                borderWidth: 1,
                                borderColor: '#bfdbfe',
                                shadowColor: '#2663eb',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 16,
                                elevation: 2,
                            }}
                        >
                            {PROPOSITIONS.map(({ Icon, title, body }) => (
                                <View key={title} className="flex-row items-center gap-3">
                                    <LinearGradient
                                        colors={['#dbeafe', '#c7d7fe']}
                                        start={{ x: 0, y: 0.5 }}
                                        end={{ x: 1, y: 0.5 }}
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: '#bfdbfe',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon size={20} color="#2563eb" />
                                    </LinearGradient>
                                    <View className="flex-1 gap-1">
                                        <Text className="font-syne-bold text-[13px] text-[#111827]">{title}</Text>
                                        <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">{body}</Text>
                                    </View>
                                </View>
                            ))}
                        </LinearGradient>

                        {/* Points utility */}
                        <View className="h-[35px] flex-row items-center gap-[7px] rounded bg-[rgba(255,183,3,0.08)] px-3">
                            <Ticket size={15} color="#ffb703" />
                            <Text className="font-syne-bold text-[9.5px] text-[#2563eb]">
                                Points = Redeemable VIP Experiences
                            </Text>
                        </View>

                        {/* Continue */}
                        <View className="items-center">
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Continue"
                                activeOpacity={0.85}
                                onPress={enterApp}
                                className="h-12 w-[234px] flex-row items-center justify-center gap-2 rounded-[30px] border border-[#2563eb] bg-[#2563eb]"
                            >
                                <Text className="font-syne-bold text-[13px] text-white">Continue</Text>
                                <ArrowRight size={17} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* The Figma shows this for a first-time visitor; once signed in it would
                            point at a screen they have just come from, so it is left out. */}
                        {!isSignedIn && (
                            <Text className="text-center font-syne text-[13px] text-[#111827]">
                                {'Already a collector?  '}
                                <Text
                                    accessibilityRole="link"
                                    onPress={() => router.replace('/(auth)/register')}
                                >
                                    Sign in
                                </Text>
                            </Text>
                        )}

                        <View className="gap-[6px]">
                            <Text className="text-center font-syne text-[10px] leading-[15px] text-[#6b7280]">
                                Your collection, your privacy. No location needed to join.
                            </Text>
                            <Text className="text-center font-syne text-[10px] leading-[15px] text-[#6b7280]">
                                By continuing, you agree to Terms & Privacy Policy.
                            </Text>
                        </View>
                    </MotiView>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
