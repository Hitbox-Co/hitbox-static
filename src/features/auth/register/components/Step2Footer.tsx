import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function Step2Footer() {
    return (
        <View className="items-center mt-8 gap-y-4">
            <TouchableOpacity className="flex-row gap-x-1">
                <Text className="text-neutral-400 text-sm">Already have an account?</Text>
                <Text
                    className="text-primary font-semibold text-sm"
                    onPress={() => router.push('/(auth)/login')}
                >
                    Sign In
                </Text>
            </TouchableOpacity>

            <Text className="text-center text-neutral-600 text-[11px] leading-6 px-6">
                By continuing, you agree to HitBox’s{'\n'}
                <Text className="text-neutral-400 underline">Terms of use</Text> and{' '}
                <Text className="text-neutral-400 underline">Privacy Policy</Text>.
            </Text>
        </View>
    )
}