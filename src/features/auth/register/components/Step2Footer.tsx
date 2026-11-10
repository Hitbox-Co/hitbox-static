import React from 'react'
import { Text, View } from 'react-native'

export default function Step2Footer({ onSignIn }: { onSignIn: () => void }) {
    return (
        <View className="mt-[18px] gap-[18px]">
            {/* OR divider */}
            <View className="flex-row items-center gap-3">
                <View className="h-px flex-1 bg-[#dbeafe]" />
                <Text className="font-syne-semibold text-[9px] tracking-[1.2px] text-[#6b7280]">OR</Text>
                <View className="h-px flex-1 bg-[#dbeafe]" />
            </View>

            <Text className="text-center font-syne text-xs text-[#111827]">
                {'Already have an account? '}
                <Text
                    accessibilityRole="link"
                    className="font-syne-bold text-[#2563eb]"
                    onPress={onSignIn}
                >
                    Sign in
                </Text>
            </Text>

            <Text className="text-center font-syne text-[10px] leading-[15px] text-[#6b7280]">
                {'By continuing, you agree to HitBox’s\n'}
                <Text className="text-[#111827] underline">Terms of use</Text>
                {' and '}
                <Text className="text-[#111827] underline">Privacy Policy</Text>
            </Text>
        </View>
    )
}
