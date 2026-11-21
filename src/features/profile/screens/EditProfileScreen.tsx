import { useUser } from '@clerk/clerk-expo'
import { zodResolver } from '@hookform/resolvers/zod'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Camera, Check, Trash2, User } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { ApiRequestError } from '@/lib/api'
import { useMe } from '../api/getProfile'
import { useUpdateMe } from '../api/updateProfile'
import { useRemoveAvatar, useUploadAvatar } from '../api/uploadAvatar'
import { Me } from '../types/profile'
import { EditProfileFormData, editProfileSchema } from '../validation/editProfile'

/** A profile as form values (null → ""). */
const toForm = (me?: Me): EditProfileFormData => ({
    handle: me?.handle ?? '',
    fullName: me?.fullName ?? '',
    bio: me?.bio ?? '',
    phone: me?.phone ?? '',
    generalLocation: me?.generalLocation ?? '',
    profileVisibility: me?.profileVisibility ?? 'PRIVATE',
})

export default function EditProfileScreen() {
    const { user } = useUser()
    const { data: me, isLoading } = useMe()
    const updateMe = useUpdateMe()
    const uploadAvatar = useUploadAvatar()
    const removeAvatar = useRemoveAvatar()

    const [apiError, setApiError] = useState<string | null>(null)
    const [saved, setSaved] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: toForm(),
    })

    // Seed the form once the profile arrives.
    useEffect(() => {
        if (me) reset(toForm(me))
    }, [me, reset])

    // Clerk is the source of truth for the avatar — it updates instantly on upload.
    const avatarUrl = user?.imageUrl ?? me?.avatarUrl ?? null
    const isAvatarBusy = uploadAvatar.isPending || removeAvatar.isPending

    const pickImage = async () => {
        setApiError(null)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Allow photo access to change your profile picture.')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        })

        if (result.canceled || !result.assets[0]) return

        const asset = result.assets[0]
        // Clerk accepts a data URI; fall back to the local file URI.
        const file = asset.base64
            ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
            : asset.uri

        try {
            await uploadAvatar.mutateAsync(file)
        } catch (err) {
            setApiError(err instanceof Error ? err.message : 'Could not upload the image.')
        }
    }

    const confirmRemoveImage = () => {
        Alert.alert('Remove photo', 'Remove your profile picture?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    setApiError(null)
                    try {
                        await removeAvatar.mutateAsync()
                    } catch (err) {
                        setApiError(err instanceof Error ? err.message : 'Could not remove the image.')
                    }
                },
            },
        ])
    }

    const onSubmit = async (data: EditProfileFormData) => {
        setApiError(null)
        setSaved(false)

        // Send only what actually changed — PATCH treats every field as optional.
        // handle / fullName / phone cannot be cleared, so an empty value is "unchanged".
        const was = toForm(me)
        const payload: Record<string, string> = {}
        if (data.handle && data.handle !== was.handle) payload.handle = data.handle
        if (data.fullName && data.fullName !== was.fullName) payload.fullName = data.fullName
        if (data.phone && data.phone !== was.phone) payload.phone = data.phone
        if (data.bio !== was.bio) payload.bio = data.bio
        if (data.generalLocation !== was.generalLocation) payload.generalLocation = data.generalLocation
        if (data.profileVisibility !== was.profileVisibility) payload.profileVisibility = data.profileVisibility

        if (Object.keys(payload).length === 0) {
            setSaved(true)
            return
        }

        try {
            const updated = await updateMe.mutateAsync(payload)
            reset(toForm(updated))
            setSaved(true)
        } catch (err) {
            if (err instanceof ApiRequestError) {
                // 409 USERS_HANDLE_TAKEN → attach to the field that caused it.
                if (err.error.code === 'USERS_HANDLE_TAKEN') {
                    setError('handle', { message: 'That username is already taken.' })
                    return
                }
                setApiError(err.error.message)
                return
            }
            setApiError('Could not save your profile. Check your connection.')
        }
    }

    const saveDisabled = isSubmitting || !isDirty

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
            <CheckoutShell
                showBag={false}
                footer={
                    <View className="w-full gap-[10px]">
                        {!!apiError && <Text className="text-center font-syne text-[12px] text-[#dc2626]">{apiError}</Text>}
                        {saved && !apiError && (
                            <View className="flex-row items-center justify-center gap-1.5">
                                <Check size={14} color="#16a34a" />
                                <Text className="font-syne-semibold text-[12px] text-[#16a34a]">Profile updated</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityState={{ disabled: saveDisabled }}
                            onPress={handleSubmit(onSubmit)}
                            disabled={saveDisabled}
                            activeOpacity={0.85}
                            className="h-[52px] items-center justify-center rounded-[30px] bg-black"
                            style={{ opacity: saveDisabled ? 0.4 : 1 }}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="font-syne-bold text-[14px] text-white">Save changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                }
            >
                <PageIntro title="Edit profile" subtitle="How you appear to other collectors." />

                {isLoading ? (
                    <View className="mt-16 items-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : (
                    <>
                        {/* --- Avatar --- */}
                        <View className="items-center">
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Change profile photo"
                                onPress={pickImage}
                                disabled={isAvatarBusy}
                                activeOpacity={0.9}
                            >
                                <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#2563eb] bg-[#eff6ff]">
                                    {avatarUrl ? (
                                        <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                    ) : (
                                        <User size={44} color="#93c5fd" />
                                    )}
                                    {isAvatarBusy && (
                                        <View className="absolute inset-0 items-center justify-center bg-black/40">
                                            <ActivityIndicator size="small" color="#fff" />
                                        </View>
                                    )}
                                </View>
                                <View className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#2563eb] p-2">
                                    <Camera size={16} color="#fff" />
                                </View>
                            </TouchableOpacity>

                            <Text className="mt-3 font-syne text-[11px] text-[#6b7280]">
                                {isAvatarBusy ? 'Uploading…' : 'Tap to change your photo'}
                            </Text>

                            {avatarUrl && !isAvatarBusy && (
                                <TouchableOpacity onPress={confirmRemoveImage} className="mt-2 flex-row items-center gap-1.5">
                                    <Trash2 size={13} color="#ef4444" />
                                    <Text className="font-syne-semibold text-[11px] text-[#ef4444]">Remove photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* --- Profile details --- */}
                        <GroupedCard>
                            <Field label="Username" error={errors.handle?.message}>
                                <Controller
                                    control={control}
                                    name="handle"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className={inputClass(!!errors.handle)}
                                            placeholder="johndoe123"
                                            placeholderTextColor="#9ca3af"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    )}
                                />
                            </Field>

                            <Field label="Full name" error={errors.fullName?.message}>
                                <Controller
                                    control={control}
                                    name="fullName"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className={inputClass(!!errors.fullName)}
                                            placeholder="John Doe"
                                            placeholderTextColor="#9ca3af"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    )}
                                />
                            </Field>

                            <Field label="Bio" error={errors.bio?.message}>
                                <Controller
                                    control={control}
                                    name="bio"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className={inputClass(!!errors.bio)}
                                            placeholder="Tell collectors about yourself"
                                            placeholderTextColor="#9ca3af"
                                            multiline
                                            maxLength={500}
                                            style={{ minHeight: 88, textAlignVertical: 'top' }}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    )}
                                />
                            </Field>
                        </GroupedCard>

                        {/* --- Private details --- */}
                        <GroupedCard>
                            <Field label="Location" error={errors.generalLocation?.message}>
                                <Controller
                                    control={control}
                                    name="generalLocation"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className={inputClass(!!errors.generalLocation)}
                                            placeholder="Austin, TX"
                                            placeholderTextColor="#9ca3af"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    )}
                                />
                                <Text className="font-syne text-[10px] text-[#9ca3af]">
                                    A city or region, never an address. Only you see it.
                                </Text>
                            </Field>

                            <Field label="Phone" error={errors.phone?.message}>
                                <Controller
                                    control={control}
                                    name="phone"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className={inputClass(!!errors.phone)}
                                            placeholder="+1 555 0100"
                                            placeholderTextColor="#9ca3af"
                                            keyboardType="phone-pad"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    )}
                                />
                            </Field>

                            <Field label="Email">
                                <View className="rounded-[10px] border border-[#e5e7eb] bg-[#f3f4f6] px-[14px] py-[13px]">
                                    <Text className="font-syne text-[13px] text-[#6b7280]">{me?.email ?? '—'}</Text>
                                </View>
                                <Text className="font-syne text-[10px] leading-[15px] text-[#9ca3af]">
                                    Email is managed by your sign-in provider and can&apos;t be changed here. Username, name and photo can be reset when you change them in your sign-in account.
                                </Text>
                            </Field>
                        </GroupedCard>

                        {/* --- Public profile --- */}
                        <GroupedCard>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1 gap-1 pr-3">
                                    <Text className="font-syne-bold text-[13px] text-[#111827]">Public profile</Text>
                                    <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                                        Let other collectors see your name, photo and bio, and see you as the owner when they scan an item you made public. Off by default.
                                    </Text>
                                </View>
                                <Controller
                                    control={control}
                                    name="profileVisibility"
                                    render={({ field: { onChange, value } }) => (
                                        <Switch
                                            accessibilityLabel="Public profile"
                                            value={value === 'PUBLIC'}
                                            onValueChange={(on) => onChange(on ? 'PUBLIC' : 'PRIVATE')}
                                            trackColor={{ true: '#2563eb' }}
                                        />
                                    )}
                                />
                            </View>
                        </GroupedCard>
                    </>
                )}
            </CheckoutShell>
        </KeyboardAvoidingView>
    )
}

function inputClass(hasError: boolean) {
    return `rounded-[10px] border bg-white px-[14px] py-[13px] font-syne text-[14px] text-[#111827] ${hasError ? 'border-[#ef4444]' : 'border-[#dbeafe]'}`
}

function Field({
    label,
    error,
    children,
}: {
    label: string
    error?: string
    children: React.ReactNode
}) {
    return (
        <View className="gap-[6px]">
            <Text className="font-syne-bold text-[11px] uppercase tracking-[0.5px] text-[#6b7280]">{label}</Text>
            {children}
            {error && <Text className="font-syne text-[12px] text-[#dc2626]">{error}</Text>}
        </View>
    )
}
