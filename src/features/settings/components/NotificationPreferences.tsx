import { ArrowLeft, Check } from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import { Image as RNImage, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Pref = { id: string; title: string; body: string; label: string }

const PREFS: Pref[] = [
    { id: 'push', title: 'Push Notifications', body: 'Receive instant updates on your mobile screen', label: 'Push notifications' },
    { id: 'email', title: 'Email Notifications', body: 'Receive summaries and transactional emails', label: 'Email notifications' },
    { id: 'drops', title: 'Exclusive Drops & Offers', body: 'Be the first to know about new releases', label: 'Drop alerts' },
    { id: 'activity', title: 'Account Activity', body: 'Security alerts, login checks and details', label: 'Activity alerts' },
]

/**
 * Notification preferences — the light page for Settings → Notification
 * Preferences. Four switches, each confirming with a short "… enabled/disabled"
 * line.
 *
 * The switches are kept on this screen only: the backend has no
 * notification-preferences endpoint yet, so nothing is saved or sent. (That is
 * how the previous version behaved too.)
 */
export default function NotificationPreferences({ onBack }: { onBack: () => void }) {
    const [on, setOn] = useState<Record<string, boolean>>({ push: true, email: false, drops: true, activity: true })
    const [message, setMessage] = useState<string | null>(null)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

    const change = (pref: Pref, value: boolean) => {
        setOn((o) => ({ ...o, [pref.id]: value }))
        setMessage(`${pref.label} ${value ? 'enabled' : 'disabled'}`)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => setMessage(null), 2500)
    }

    return (
        <SafeAreaView
            // No bottom edge: this route renders inside (tabs), so the tab bar already reserves it.
            edges={['top', 'left', 'right']}
            style={{ flex: 1, backgroundColor: '#f5f9ff' }}
        >
            <View className="h-12 flex-row items-center justify-between bg-white px-5">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Back to settings"
                        onPress={onBack}
                        className="size-8 items-center justify-center rounded bg-[#eff6ff]"
                    >
                        <ArrowLeft size={17} color="#111827" />
                    </TouchableOpacity>
                    <View className="flex-row items-center gap-[7px]">
                        <RNImage source={require('@/assets/images/HitBoxLogo-dark.png')} resizeMode="contain" style={{ width: 24, height: 24 }} />
                        <Text className="font-orbitron text-[14px] text-[#111827]">HitBox</Text>
                    </View>
                </View>
                <Text className="font-syne-semibold text-[10px] tracking-[1.2px] text-[#374151]">NOTIFICATION PREFERENCES</Text>
            </View>
            <View className="h-px bg-[#e5e7eb]" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120, gap: 16 }}>
                <Text className="font-syne-extrabold text-[13px] text-[#1f2937]">Notification Channels</Text>

                {message && (
                    <View className="flex-row items-center gap-2 rounded border border-[#bbf7d0] bg-[#ecfdf3] px-3 py-2.5">
                        <Check size={15} color="#16a34a" />
                        <Text className="font-syne-semibold text-[12px] text-[#166534]">{message}</Text>
                    </View>
                )}

                <View className="overflow-hidden rounded border border-[#e5e7eb] bg-white">
                    {PREFS.map((pref, i) => (
                        <View
                            key={pref.id}
                            className={`flex-row items-center justify-between px-3.5 py-3.5 ${i > 0 ? 'border-t border-[#eef2f7]' : ''}`}
                        >
                            <View className="flex-1 pr-4">
                                <Text className="font-syne-bold text-[14px] text-[#111827]">{pref.title}</Text>
                                <Text className="mt-0.5 font-syne text-[12px] leading-[17px] text-[#6b7280]">{pref.body}</Text>
                            </View>
                            <Switch
                                accessibilityLabel={pref.title}
                                value={on[pref.id]}
                                onValueChange={(v) => change(pref, v)}
                                trackColor={{ false: '#d1d5db', true: '#2563eb' }}
                                thumbColor="#ffffff"
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
