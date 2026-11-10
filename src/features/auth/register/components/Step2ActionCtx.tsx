import { useSSO } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { ArrowRight, Mail } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { AppleSvg } from '@/components/icons/AppleIcon'
import { GoogleSvg } from '@/components/icons/GoogleIcon'
import { getClerkErrorMessage, useWarmUpBrowser } from '../../utils/clerk'
import { AnimatedButton } from './AnimatedButton'

WebBrowser.maybeCompleteAuthSession()

type SSOStrategy = 'oauth_google' | 'oauth_apple' | 'oauth_facebook'

/**
 * The three entry buttons from the Figma sign-up screen. Each is a 234×48 pill,
 * centred, with its icon pinned left and an arrow pinned right while the label
 * sits in the middle.
 */
function PillButton({
    label,
    onPress,
    icon,
    loading,
    tone,
    accessibilityLabel,
}: {
    label: string
    onPress: () => void
    icon?: React.ReactNode
    loading?: boolean
    tone: 'dark' | 'blue' | 'outline'
    accessibilityLabel?: string
}) {
    const surface =
        tone === 'dark'
            ? 'bg-[#111827]'
            : tone === 'blue'
                ? 'bg-[#2563eb] border border-[#2563eb]'
                : 'border border-[#2563eb]'
    const onDark = tone !== 'outline'

    return (
        <View className="items-center">
            <View className="w-[234px]" accessibilityLabel={accessibilityLabel} accessibilityRole="button">
                <AnimatedButton
                    onPress={onPress}
                    className={`h-12 flex-row items-center justify-center rounded-[30px] ${surface}`}
                >
                    {icon && <View className="absolute left-4 w-5 items-center">{icon}</View>}
                    <Text
                        className={`${tone === 'outline' ? 'font-syne-semibold text-[12.5px] text-[#111827]' : 'font-syne-bold text-[13px] text-white'}`}
                    >
                        {label}
                    </Text>
                    <View className="absolute right-4">
                        {loading
                            ? <ActivityIndicator size="small" color={onDark ? '#fff' : '#111827'} />
                            : <ArrowRight size={17} color={onDark ? '#fff' : '#111827'} />}
                    </View>
                </AnimatedButton>
            </View>
        </View>
    )
}

export default function Step2ActionCtx({ onEmail }: { onEmail: () => void }) {
    useWarmUpBrowser()

    const { startSSOFlow } = useSSO()
    const [pendingStrategy, setPendingStrategy] = useState<SSOStrategy | null>(null)
    const [error, setError] = useState<string | null>(null)

    // SSO covers both sign-up and sign-in: new users get an account created
    // by Clerk, and the user.created webhook projects it onto the backend.
    const handleSSO = async (strategy: SSOStrategy) => {
        if (pendingStrategy) return
        setPendingStrategy(strategy)
        setError(null)

        try {
            const { createdSessionId, setActive } = await startSSOFlow({
                strategy,
                // No hardcoded scheme: resolves to exp://<host> in Expo Go and
                // hitboxstatic:// in dev/production builds.
                redirectUrl: Linking.createURL('/'),
            })

            if (createdSessionId && setActive) {
                await setActive({ session: createdSessionId })
                router.replace('/(tabs)/discover')
            }
            // No createdSessionId → user cancelled or extra steps are required.
        } catch (err) {
            console.log(getClerkErrorMessage(err))
            setError(getClerkErrorMessage(err))
        } finally {
            setPendingStrategy(null)
        }
    }

    return (
        <View className="mt-6 gap-3">
            <Text className="font-orbitron text-[8px] tracking-[0.4px] text-[#2563eb]">
                CREATE YOUR ACCOUNT
            </Text>

            <View className="gap-4">
                {/* Email + password sign-up form (Clerk email-code) */}
                <PillButton
                    tone="dark"
                    label="Create your Account"
                    onPress={() => router.push('/(auth)/register/details')}
                />

                <PillButton
                    tone="blue"
                    label="Continue"
                    accessibilityLabel="Continue with Apple"
                    icon={<AppleSvg color="#ffffff" />}
                    loading={pendingStrategy === 'oauth_apple'}
                    onPress={() => handleSSO('oauth_apple')}
                />

                <PillButton
                    tone="outline"
                    label="Continue with Google"
                    icon={<GoogleSvg />}
                    loading={pendingStrategy === 'oauth_google'}
                    onPress={() => handleSSO('oauth_google')}
                />

                {/* Email sign-in: straight to the email form in a popup. */}
                <PillButton
                    tone="outline"
                    label="Continue with Email"
                    icon={<Mail size={19} color="#111827" />}
                    onPress={onEmail}
                />
            </View>


            {error && (
                <Text className="text-center font-syne-medium text-xs text-red-500">{error}</Text>
            )}
        </View>
    )
}
