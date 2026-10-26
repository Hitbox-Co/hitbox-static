import { useClerk } from '@clerk/clerk-expo'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Bell, ChevronRight, HandHelping, Lock, LogOut, User } from 'lucide-react-native'
import { MotiView } from 'moti'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function MenuSection({
    setActiveTab
}: {
    setActiveTab: (val: 'menu' | 'personal' | 'security' | 'notifications') => void
}) {
    const { signOut } = useClerk();
    const queryClient = useQueryClient();


    const handleSignOut = async () => {
        await signOut();
        queryClient.clear();
        router.replace('/');
    };


    return (
        <MotiView
            key="menu"
            from={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'timing', duration: 200 }}
            className="gap-4"
        >
            <Text className="text-muted-foreground text-sm font-semibold uppercase tracking-wider mb-1 px-1">
                Account Settings
            </Text>

            <View className="bg-card border border-border/30 rounded-2xl overflow-hidden">
                <TouchableOpacity
                    onPress={() => {
                        setActiveTab('personal');
                        router.push('/edit-profile');
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between p-4 border-b border-border/30"
                >
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-9 h-9 rounded-xl bg-violet-600/10 items-center justify-center border border-violet-500/20">
                            <User size={18} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground text-sm font-bold">Personal Information</Text>
                            <Text className="text-muted-foreground text-xs">Update username, bio, and email info</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('security')}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between p-4 border-b border-border/30"
                >
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-9 h-9 rounded-xl bg-violet-600/10 items-center justify-center border border-violet-500/20">
                            <Lock size={18} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground text-sm font-bold">Security & Password</Text>
                            <Text className="text-muted-foreground text-xs">Manage passwords, Face ID and 2FA</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('notifications')}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between p-4 border-b border-border/30"
                >
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-9 h-9 rounded-xl bg-violet-600/10 items-center justify-center border border-violet-500/20">
                            <Bell size={18} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground text-sm font-bold">Notifications</Text>
                            <Text className="text-muted-foreground text-xs">Toggle push notifications and emails</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* Support — leaves settings entirely, so it pushes a route
                    rather than switching the local tab like the rows above. */}
                <TouchableOpacity
                    onPress={() => router.push('/support')}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Support and contact us"
                    className="flex-row items-center justify-between p-4 border-b border-border/30"
                >
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-9 h-9 rounded-xl bg-violet-600/10 items-center justify-center border border-violet-500/20">
                            <HandHelping size={18} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground text-sm font-bold">Support</Text>
                            <Text className="text-muted-foreground text-xs">Chat with us or contact the team by email</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>

                {/* Sign Out */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    activeOpacity={0.7}
                    className="flex-row items-center justify-between p-4"
                >
                    <View className="flex-row items-center gap-4 flex-1">
                        <View className="w-9 h-9 rounded-xl bg-destructive-80/30 items-center justify-center border border-violet-500/20">
                            <LogOut size={20} color="red" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-foreground text-sm font-bold">Sign Out</Text>
                            <Text className="text-muted-foreground text-xs">Log out of your HitBox account</Text>
                        </View>
                    </View>
                    <ChevronRight size={18} color="#94a3b8" />
                </TouchableOpacity>
            </View>
        </MotiView>
    )
}