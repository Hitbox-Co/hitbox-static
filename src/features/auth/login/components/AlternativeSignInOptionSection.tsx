import { useSSO } from '@clerk/clerk-expo'
import * as Linking from 'expo-linking'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { ChevronRight } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { AppleSvg } from '@/components/icons/AppleIcon'
import { GoogleSvg } from '@/components/icons/GoogleIcon'
import { getClerkErrorMessage, useWarmUpBrowser } from '../../utils/clerk'

WebBrowser.maybeCompleteAuthSession()

type SSOStrategy = 'oauth_google' | 'oauth_apple'

export default function AlternativeSignInOptionSection() {
    useWarmUpBrowser()

    const { startSSOFlow } = useSSO()
    const [pendingStrategy, setPendingStrategy] = useState<SSOStrategy | null>(null)
    const [error, setError] = useState<string | null>(null)

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
                router.replace('/(auth)/onboarding' as never)
            }
            // No createdSessionId means the user cancelled or needs extra steps
            // (e.g. MFA) — nothing to do here.
        } catch (err) {
            setError(getClerkErrorMessage(err))
        } finally {
            setPendingStrategy(null)
        }
    }

    return (
        <View className="gap-y-3">
            <TouchableOpacity
                className="flex-row items-center justify-between bg-white h-14 px-4 rounded-2xl w-full"
                disabled={!!pendingStrategy}
                onPress={() => handleSSO('oauth_google')}
            >
                <View className="flex-row items-center gap-x-3">
                    <GoogleSvg />
                    <Text className="text-black font-semibold text-base">Continue with Google</Text>
                </View>
                {pendingStrategy === 'oauth_google'
                    ? <ActivityIndicator size="small" color="#000000" />
                    : <ChevronRight size={18} color="#A3A3A3" />}
            </TouchableOpacity>

            <TouchableOpacity
                className="flex-row items-center justify-between bg-white h-14 px-4 rounded-2xl w-full"
                disabled={!!pendingStrategy}
                onPress={() => handleSSO('oauth_apple')}
            >
                <View className="flex-row items-center gap-x-3">
                    <AppleSvg />
                    <Text className="text-black font-semibold text-base">Continue with Apple</Text>
                </View>
                {pendingStrategy === 'oauth_apple'
                    ? <ActivityIndicator size="small" color="#000000" />
                    : <ChevronRight size={18} color="#A3A3A3" />}
            </TouchableOpacity>

            {error && (
                <Text className="text-red-500 text-xs font-medium text-center">{error}</Text>
            )}
        </View>
    )
}
