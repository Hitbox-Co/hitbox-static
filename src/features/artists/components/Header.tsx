import { router } from 'expo-router'
import { Bell, ChevronLeft, Upload } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Header() {
    return (
        <SafeAreaView className="absolute top-0 left-4 right-4 z-10 flex-row justify-between items-center">

            {/* Back Button */}
            <TouchableOpacity
                className="bg-white p-2 rounded border border-[#dbeafe]"
                onPress={() => router.back()}
            >
                <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>

            {/* Right Side Icons */}
            <View className="flex-row gap-x-3">
                <TouchableOpacity className="bg-white p-2 rounded border border-[#dbeafe] relative">
                    <Bell size={22} color="#111827" />
                    <View className="absolute top-1 right-1 bg-[#2563eb] w-4 h-4 rounded-full items-center justify-center">
                        <Text className="text-[9px] text-white font-syne-bold">3</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity className="bg-white p-2 rounded border border-[#dbeafe]">
                    <Upload size={22} color="#111827" />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
}