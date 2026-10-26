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
import { EditProfileFormData, editProfileSchema } from '../validation/editProfile'

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
        defaultValues: { username: '', firstName: '', lastName: '' },
    })

    // Seed the form once the profile arrives.
    useEffect(() => {
        if (me) {
            reset({
                username: me.username ?? '',
                firstName: me.firstName ?? '',
                lastName: me.lastName ?? '',
            })
        }
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
        const payload: Record<string, string> = {}
        if (data.username !== (me?.username ?? '')) payload.username = data.username
        if (data.firstName !== (me?.firstName ?? '')) payload.firstName = data.firstName
        if (data.lastName !== (me?.lastName ?? '')) payload.lastName = data.lastName

        if (Object.keys(payload).length === 0) {
            setSaved(true)
            return
        }

        try {
            const updated = await updateMe.mutateAsync(payload)
            reset({
                username: updated.username ?? '',
                firstName: updated.firstName ?? '',
                lastName: updated.lastName ?? '',
            })
            setSaved(true)
        } catch (err) {
            if (err instanceof ApiRequestError) {
                // 409 USERS_USERNAME_TAKEN → attach to the field that caused it.
                if (err.error.code === 'USERS_USERNAME_TAKEN') {
                    setError('username', { message: 'That username is already taken.' })
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
                        <ActivityIndicator size="large" color="#8B5CF6" />
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

                        {/* --- Username --- */}
                        <Field label="Username" error={errors.username?.message}>
                            <Controller
                                control={control}
                                name="username"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={inputClass(!!errors.username)}
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

                        {/* --- First name --- */}
                        <Field label="First Name" error={errors.firstName?.message}>
                            <Controller
                                control={control}
                                name="firstName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={inputClass(!!errors.firstName)}
                                        placeholder="John"
                                        placeholderTextColor="#9ca3af"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                        </Field>

                        {/* --- Last name --- */}
                        <Field label="Last Name" error={errors.lastName?.message}>
                            <Controller
                                control={control}
                                name="lastName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={inputClass(!!errors.lastName)}
                                        placeholder="Doe"
                                        placeholderTextColor="#9ca3af"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                        </Field>

                        {/* --- Email (read-only: owned by Clerk) --- */}
                        <View className="mb-4">
                            <Text className="text-gray-300 mb-1 font-medium">Email</Text>
                            <View className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <Text className="text-zinc-400">{me?.email ?? '—'}</Text>
                            </View>
                            <Text className="text-zinc-500 text-xs mt-1">
                                Email is managed by your sign-in provider and can&apos;t be changed here.
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
