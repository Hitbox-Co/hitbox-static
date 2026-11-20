import { router } from 'expo-router'
import { Check, Globe, Lock } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'

import { CheckoutShell } from '@/features/checkout/components/CheckoutParts'
import { describeApiError } from '@/lib/api-errors'
import { useMe } from '../api/getProfile'
import { useUpdateMe } from '../api/updateProfile'
import { ProfileVisibility } from '../types/profile'

/** The words for each state (Figma P05 Public / P11 Private). */
const COPY: Record<
    ProfileVisibility,
    { status: string; statusBody: string; title: string; body: string; save: string }
> = {
    PUBLIC: {
        status: 'Public profile',
        statusBody: 'Other collectors can see your profile and the items you mark public.',
        title: 'Public',
        body: 'Your name, photo, bio and stats are visible to other collectors, and so are the items you set to Public.',
        save: 'Save public profile',
    },
    PRIVATE: {
        status: 'Private profile',
        statusBody: 'Only you can see your collection.',
        title: 'Private',
        body: 'Your collection and purchase stories are hidden from other users. Your name and stats stay visible, and anyone can follow you.',
        save: 'Save private profile',
    },
}

/**
 * Profile privacy — Figma P05 / P11. One switch, `profileVisibility`, saved with
 * `PATCH /users/me`. The navy card shows what is SAVED; the two option cards are
 * what you are choosing, and Save stays off until they differ.
 *
 * What the switch does (server-side, all at once): PRIVATE hides every item you
 * hold from other collectors — their profile view, NFC taps and the ledger will
 * not name you — without touching each item's own Public/Private setting, so
 * switching back restores those choices. PUBLIC shows only the items you marked
 * Public. Your name, stats and followers are visible either way, and nobody
 * needs approval to follow you.
 */
export default function PrivacyScreen() {
    const { data: me, isLoading, isError, refetch } = useMe()
    const update = useUpdateMe()

    const saved: ProfileVisibility = me?.profileVisibility ?? 'PRIVATE'
    const [choice, setChoice] = useState<ProfileVisibility>(saved)
    const [error, setError] = useState<string | null>(null)
    const [justSaved, setJustSaved] = useState(false)

    // Follow the saved value when it first arrives or changes elsewhere
    // (e.g. the switch on Edit Profile) — but never overwrite an unsaved choice.
    useEffect(() => {
        if (me && !update.isPending) setChoice(me.profileVisibility)
    }, [me?.profileVisibility]) // eslint-disable-line react-hooks/exhaustive-deps

    const dirty = choice !== saved

    const persist = () => {
        setError(null)
        setJustSaved(false)
        update.mutate(
            { profileVisibility: choice },
            {
                onSuccess: () => setJustSaved(true),
                onError: (err) => setError(describeApiError(err, "Couldn't save your privacy setting. Please try again.")),
            },
        )
    }

    const onSave = () => {
        if (!dirty || update.isPending) return
        // Going private is the consequential direction: say what happens first.
        if (choice === 'PRIVATE') {
            Alert.alert(
                'Make your profile private?',
                'Other collectors will no longer see your items, or your name as the owner when they scan one. Your name and stats stay visible, and your own items keep their individual settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Make private', onPress: persist },
                ],
            )
            return
        }
        persist()
    }

    if (isLoading) {
        return (
            <CheckoutShell showBag={false}>
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (isError || !me) {
        return (
            <CheckoutShell showBag={false}>
                <View className="mt-16 items-center gap-3 px-6">
                    <Lock size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        Couldn&apos;t load your privacy setting.
                    </Text>
                    <TouchableOpacity onPress={() => refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    const status = COPY[saved]

    return (
        <CheckoutShell
            showBag={false}
            footer={
                <View className="w-full gap-[10px]">
                    {!!error && <Text className="text-center font-syne text-[12px] text-[#dc2626]">{error}</Text>}
                    {justSaved && !dirty && !error && (
                        <Text className="text-center font-syne-semibold text-[12px] text-[#16a34a]">Saved</Text>
                    )}
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !dirty || update.isPending }}
                        activeOpacity={0.85}
                        disabled={!dirty || update.isPending}
                        onPress={onSave}
                        className="h-[52px] items-center justify-center rounded-[3px] bg-black"
                        style={{ opacity: !dirty || update.isPending ? 0.4 : 1 }}
                    >
                        {update.isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="font-syne-bold text-[14px] text-white">{COPY[choice].save}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.85}
                        onPress={() =>
                            router.push({ pathname: '/collectors/[userId]', params: { userId: me.id, preview: '1' } } as never)
                        }
                        className="h-[52px] items-center justify-center rounded-[3px] border-[1.5px] border-[#111827] bg-white"
                    >
                        <Text className="font-syne-bold text-[14px] text-[#111827]">Preview as a visitor</Text>
                    </TouchableOpacity>
                </View>
            }
        >
            <Text className="font-syne text-[13px] text-[#6b7280]">Choose how other collectors see you.</Text>

            {/* What is saved right now */}
            <View className="gap-3 rounded-lg bg-[#0b1b36] p-5">
                <View className="flex-row items-center gap-3">
                    {saved === 'PUBLIC' ? <Globe size={22} color="#4ade80" /> : <Lock size={22} color="#94a3b8" />}
                    <Text className="font-syne-extrabold text-[22px] text-white">{status.status}</Text>
                </View>
                <Text className="font-syne text-[12px] leading-[18px] text-[#94a3b8]">{status.statusBody}</Text>
            </View>

            {/* The choice */}
            <OptionCard
                icon={<Globe size={18} color="#111827" />}
                copy={COPY.PUBLIC}
                selected={choice === 'PUBLIC'}
                onPress={() => setChoice('PUBLIC')}
            />
            <OptionCard
                icon={<Lock size={18} color="#111827" />}
                copy={COPY.PRIVATE}
                selected={choice === 'PRIVATE'}
                onPress={() => setChoice('PRIVATE')}
            />

            {/* Two switches, not one */}
            <View className="gap-1.5 rounded border border-[#2563eb] bg-[#eef4ff] p-4">
                <Lock size={16} color="#111827" />
                <Text className="font-syne-bold text-[14px] text-[#111827]">Your collection stays yours</Text>
                <Text className="font-syne text-[12px] leading-[18px] text-[#4b5563]">
                    An item is shown to others only when your profile is Public and the item itself is set to Public in My
                    Collection. This setting never changes your full sets, missing items or progress, which only you see.
                </Text>
            </View>
        </CheckoutShell>
    )
}

function OptionCard({
    icon,
    copy,
    selected,
    onPress,
}: {
    icon: React.ReactNode
    copy: { title: string; body: string }
    selected: boolean
    onPress: () => void
}) {
    return (
        <TouchableOpacity
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={copy.title}
            activeOpacity={0.85}
            onPress={onPress}
            className={`gap-2 rounded bg-white p-4 ${selected ? 'border-2 border-[#111827]' : 'border border-[#e5e7eb]'}`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    {icon}
                    <Text className="font-syne-extrabold text-[17px] text-[#111827]">{copy.title}</Text>
                </View>
                <View
                    className={`size-[22px] items-center justify-center rounded ${selected ? 'bg-black' : 'border border-[#e5e7eb] bg-[#f3f4f6]'}`}
                >
                    {selected && <Check size={14} color="#fff" />}
                </View>
            </View>
            <Text className="font-syne text-[12px] leading-[18px] text-[#6b7280]">{copy.body}</Text>
        </TouchableOpacity>
    )
}
