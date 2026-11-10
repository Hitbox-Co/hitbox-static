import { router } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { armOnboarding } from '@/lib/onboarding-gate'
import RegistrationDetailsForm from '../components/RegistrationDetailsForm'



export default function UserDetailsScreen() {
    // Finishing registration lands on onboarding (see onboarding-gate).
    useEffect(() => {
        armOnboarding()
    }, [])

    return (
        <View className="flex-1 bg-background">
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop' }}
                className="absolute inset-0 opacity-20 justify-end"
                resizeMode="cover"
            />
            <SafeAreaView className="flex-1">

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                >
                    <View className="py-4 flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 self-start active:opacity-60 bg-black/20 rounded-full">
                            <ChevronLeft size={30} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-white">User Details</Text>
                    </View>

                    <RegistrationDetailsForm />

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}