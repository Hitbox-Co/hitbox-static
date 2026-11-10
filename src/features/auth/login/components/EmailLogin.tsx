import { useSignIn } from '@clerk/clerk-expo';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, Eye, EyeOff, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { router } from 'expo-router';
import { getClerkErrorMessage, isAccountNotFound } from '../../utils/clerk';
import { LoginFormData, loginSchema } from '../schemas/LoginSchema';

export default function EmailLogin({
    isEmailDialogOpen,
    setIsEmailDialogOpen
}: {
    isEmailDialogOpen: boolean
    setIsEmailDialogOpen: (value: boolean) => void
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const { signIn, setActive, isLoaded } = useSignIn();

    const {
        control: emailControl,
        handleSubmit: handleEmailSubmit,
        formState: { errors: emailErrors, isSubmitting },
        reset: resetEmailForm
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    const onEmailSubmit = async (data: LoginFormData) => {
        if (!isLoaded) return;
        setApiError(null);

        try {
            const attempt = await signIn.create({
                identifier: data.email,
                password: data.password,
            });

            if (attempt.status === 'complete') {
                await setActive({ session: attempt.createdSessionId });
                setIsEmailDialogOpen(false);
                resetEmailForm();
                router.replace('/(auth)/onboarding' as never);
            } else {
                // e.g. MFA / additional verification configured in Clerk
                setApiError('Additional verification is required to sign in.');
            }
        } catch (err) {
            if (isAccountNotFound(err)) {
                setApiError('No account found with this email. Please register first.');
            } else {
                setApiError(getClerkErrorMessage(err));
            }
        }
    };


    return (
        <View>
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                <DialogTrigger asChild>
                    <TouchableOpacity className="flex-row items-center justify-between bg-background border border-neutral-800 h-14 px-4 rounded-2xl w-full">
                        <View className="flex-row items-center gap-x-3">
                            <Mail size={22} color="#FFFFFF" />
                            <Text className="text-white font-semibold text-base">Continue with Email</Text>
                        </View>
                        <ChevronRight size={18} color="#525252" />
                    </TouchableOpacity>
                </DialogTrigger>

                <DialogContent className="bg-background opacity-100 border w-[350px] border-primary p-6 rounded-3xl max-w-lg mx-auto shadow-xl shadow-primary">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-white text-xl font-bold">Sign In with Email</DialogTitle>
                        <Text className="text-neutral-400 text-xs mt-1">
                            Enter your credentials to access your account.
                        </Text>
                    </DialogHeader>

                    <View className="gap-y-4">
                        {/* Email Input */}
                        <View className="gap-y-2">
                            <Text className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                Email Address
                            </Text>
                            <Controller
                                control={emailControl}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        className={`bg-neutral-900 border ${emailErrors.email ? 'border-red-500' : 'border-neutral-800'} h-14 px-4 rounded-2xl text-white text-base`}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#525252"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoComplete="email"
                                        textContentType="emailAddress"
                                        onBlur={onBlur}
                                        onChangeText={onChange}
                                        value={value}
                                    />
                                )}
                            />
                            {emailErrors.email && (
                                <Text className="text-red-500 text-xs font-medium ml-1">{emailErrors.email.message}</Text>
                            )}
                        </View>

                        {/* Password Input */}
                        <View className="gap-y-2">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                                    Password
                                </Text>
                                <TouchableOpacity onPress={() => {
                                    setIsEmailDialogOpen(false);
                                    router.push("/(auth)/forget-password")
                                }}>
                                    <Text className="text-primary text-xs font-semibold">Forgot Password?</Text>
                                </TouchableOpacity>
                            </View>

                            <Controller
                                control={emailControl}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View className={`relative flex-row items-center justify-between bg-neutral-900 border ${emailErrors.password ? 'border-red-500' : 'border-neutral-800'} h-14 px-4 rounded-2xl w-full`}>
                                        <TextInput
                                            className="flex-1 text-white text-base h-full pr-10"
                                            placeholder="Enter your password"
                                            placeholderTextColor="#525252"
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoComplete="current-password"
                                            textContentType="password"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                        <TouchableOpacity
                                            className="absolute right-4"
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={20} color="#A3A3A3" />
                                            ) : (
                                                <Eye size={20} color="#A3A3A3" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {emailErrors.password && (
                                <Text className="text-red-500 text-xs font-medium ml-1">{emailErrors.password.message}</Text>
                            )}
                        </View>

                        {apiError && (
                            <Text className="text-red-500 text-xs font-medium text-center">{apiError}</Text>
                        )}

                        <TouchableOpacity
                            className="bg-primary h-14 items-center justify-center rounded-2xl w-full mt-2 shadow-lg shadow-primary/20"
                            disabled={isSubmitting}
                            onPress={handleEmailSubmit(onEmailSubmit)}
                        >
                            {isSubmitting
                                ? <ActivityIndicator size="small" color="#FFFFFF" />
                                : <Text className="text-white font-bold text-base">Sign In</Text>}
                        </TouchableOpacity>
                    </View>
                </DialogContent>
            </Dialog>
        </View>
    )
}