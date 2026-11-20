import { useUser } from '@clerk/clerk-expo'
import { zodResolver } from '@hookform/resolvers/zod'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { ArrowLeft, Camera, Check, Trash2, User } from 'lucide-react-native'
import { MotiView } from 'moti'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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

    return (
        <SafeAreaView
            // No bottom edge: these routes render inside (tabs), so the tab bar
            // already reserves the safe area below.
            edges={["top", "left", "right"]}
            className="flex-1 bg-background"
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 border-b border-border/20">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800"
                        activeOpacity={0.8}
                    >
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text className="text-white text-base font-bold ml-3">Edit Profile</Text>
                </View>

                {isLoading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* --- Avatar --- */}
                        <View className="items-center mb-8">
                            <TouchableOpacity
                                onPress={pickImage}
                                disabled={isAvatarBusy}
                                activeOpacity={0.9}
                                className="relative"
                            >
                                <MotiView
                                    animate={{ scale: avatarUrl ? 1 : 0.97 }}
                                    transition={{ type: 'spring', damping: 15 }}
                                    className="w-32 h-32 rounded-full border-4 border-primary/60 overflow-hidden bg-white/10 items-center justify-center"
                                >
                                    {avatarUrl ? (
                                        <Image
                                            source={{ uri: avatarUrl }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <User size={48} color="rgba(255,255,255,0.6)" />
                                    )}

                                    {isAvatarBusy && (
                                        <View className="absolute inset-0 bg-black/50 items-center justify-center">
                                            <ActivityIndicator size="small" color="#fff" />
                                        </View>
                                    )}
                                </MotiView>

                                <View className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-2 border-background">
                                    <Camera size={18} color="#fff" />
                                </View>
                            </TouchableOpacity>

                            <Text className="text-gray-400 text-xs mt-3">
                                {isAvatarBusy ? 'Uploading…' : 'Tap to change your photo'}
                            </Text>

                            {avatarUrl && !isAvatarBusy && (
                                <TouchableOpacity
                                    onPress={confirmRemoveImage}
                                    className="flex-row items-center gap-1.5 mt-2"
                                >
                                    <Trash2 size={13} color="#f87171" />
                                    <Text className="text-red-400 text-xs font-medium">Remove photo</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* --- Username (handle) --- */}
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

                        {/* --- Full name --- */}
                        <Field label="Full Name" error={errors.fullName?.message}>
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

                        {/* --- Bio --- */}
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

                        {/* --- Location (coarse; never shown to others) --- */}
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
                            <Text className="text-zinc-500 text-xs mt-1">A city or region, never an address. Only you see it.</Text>
                        </Field>

                        {/* --- Phone --- */}
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

                        {/* --- Public profile --- */}
                        <View className="mb-4 flex-row items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                            <View className="flex-1 pr-3">
                                <Text className="text-gray-300 font-medium">Public profile</Text>
                                <Text className="text-zinc-500 text-xs mt-1">
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
                                    />
                                )}
                            />
                        </View>

                        {/* --- Email (read-only: owned by Clerk) --- */}
                        <View className="mb-4">
                            <Text className="text-gray-300 mb-1 font-medium">Email</Text>
                            <View className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <Text className="text-zinc-400">{me?.email ?? '—'}</Text>
                            </View>
                            <Text className="text-zinc-500 text-xs mt-1">
                                Email is managed by your sign-in provider and can&apos;t be changed here. Username, name and photo can be reset when you change them in your sign-in account.
                            </Text>
                        </View>

                        {apiError && (
                            <Text className="text-red-400 text-sm text-center mb-3">{apiError}</Text>
                        )}

                        {saved && !apiError && (
                            <View className="flex-row items-center justify-center gap-1.5 mb-3">
                                <Check size={14} color="#34d399" />
                                <Text className="text-emerald-400 text-sm">Profile updated</Text>
                            </View>
                        )}

                        {/* --- Save --- */}
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitting || !isDirty}
                            className={`p-4 rounded-xl items-center justify-center mt-2 ${isSubmitting || !isDirty ? 'bg-primary/40' : 'bg-primary'
                                }`}
                            activeOpacity={0.85}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text className="text-white font-semibold text-lg">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

function inputClass(hasError: boolean) {
    return `bg-white/10 text-white p-4 rounded-xl border ${hasError ? 'border-red-500' : 'border-white/20'}`
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
        <View className="mb-4">
            <Text className="text-gray-300 mb-1 font-medium">{label}</Text>
            {children}
            {error && <Text className="text-red-400 text-sm mt-1">{error}</Text>}
        </View>
    )
}
