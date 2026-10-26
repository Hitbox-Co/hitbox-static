import { MotiView } from 'moti'
import React from 'react'
import { Image, Text, View } from 'react-native'

export default function PromoBannerSection() {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 600 }}
            className="mx-4 mb-6 relative overflow-hidden rounded-2xl bg-secondary border border-colors-primary-40 p-5 h-44 justify-between"
        >
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' }}
                className="absolute inset-0 w-fit h-fit object-cover opacity-30"
            />

            {/* Subtle gradient overlay to keep text highly legible */}
            <View className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary to-transparent w-full h-full" />

            <View className="z-10 max-w-[60%]">
                <View className="bg-primary border border-primary px-2 py-0.5 rounded-md self-start mb-2">
                    <Text className="bg-primary text-foreground text-[10px] font-bold tracking-wider">NEW FEATURE</Text>
                </View>
                <Text className="text-foreground text-xl font-bold tracking-tight">Peer-to-Peer Trading</Text>
                <Text className="text-muted-foreground text-xs mt-1 leading-4">Trade securely with other collectors.</Text>
            </View>

            {/* <Pressable className="bg-primary px-4 py-2.5 rounded-xl self-start z-10 active:opacity-90">
                <Text className="text-primary-foreground font-semibold text-xs">Start Trading</Text>
            </Pressable> */}
        </MotiView>
    )
}
