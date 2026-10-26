import { useClerk, useSignUp } from '@clerk/clerk-expo'
import { zodResolver } from '@hookform/resolvers/zod'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { Camera, Eye, EyeOff, User } from 'lucide-react-native'
import { AnimatePresence, View as MotiView } from 'moti'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ActivityIndicator, Image, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Adjust path according to your react-native-reusables setup
import { Checkbox } from '@/components/ui/checkbox'
import { getClerkErrorMessage } from '../../utils/clerk'
import { UserDetailsFormData, userDetailsSchema } from '../validation/registrationFormDetails'

export default function RegistrationDetailsForm() {
    const { signUp, setActive, isLoaded } = useSignUp()
    const clerk = useClerk()

    // 'form' → collecting details, 'verify' → waiting for the email OTP
    const [step, setStep] = useState<'form' | 'verify'>('form')
    const [otpCode, setOtpCode] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Ticking a box is not evidence the document was read, so opening each one is
    // its own precondition for submitting. Both screens are pushed on top of this
    // form rather than replacing it, so the form stays mounted and these survive
    // the detour.
    const [termsOpened, setTermsOpened] = useState(false)
    const [privacyOpened, setPrivacyOpened] = useState(false)

    const openTerms = () => {
        setTermsOpened(true)
        router.push('/terms-of-use')
    }

    const openPrivacy = () => {
        setPrivacyOpened(true)
        router.push('/privacy-policy')
    }

    /** Documents the user still has to open — drives the hint and the gate. */
    const unopenedDocuments = [
        !termsOpened && 'Terms of Use',
        !privacyOpened && 'Privacy Policy',
    ].filter(Boolean) as string[]

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<UserDetailsFormData>({
        resolver: zodResolver(userDetailsSchema),
        defaultValues: {
            profileImage: '',
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            password: '',
            countryCode: '+1',
            phoneNumber: '',
            acceptPrivacyPolicy: false,
            acceptTermsAndConditions: false,
        },
    })

    const profileImage = watch('profileImage')

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        })

        if (!result.canceled && result.assets[0].uri) {
            const asset = result.assets[0]
            // Keep a data URI so it previews locally and uploads straight to Clerk
            const value = asset.base64
                ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`
                : asset.uri
            setValue('profileImage', value, { shouldValidate: true })
        }
    }

    // Maps the form onto Clerk's sign-up. The Clerk instance only accepts
    // email + password as native sign-up params (username / first / last name
    // attributes are disabled in the Clerk dashboard), so everything else
    // travels in unsafeMetadata. Clerk's user.created webhook then projects
    // these onto the backend User row (email, username, first/last name).
    const onSubmit = async (data: UserDetailsFormData) => {
        if (!isLoaded) return
        setApiError(null)

        try {
            await signUp.create({
                emailAddress: data.email,
                password: data.password,
                unsafeMetadata: {
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: `${data.countryCode}${data.phoneNumber}`,
                    acceptedTermsAndConditions: data.acceptTermsAndConditions,
                    acceptedPrivacyPolicy: data.acceptPrivacyPolicy,
                },
            })

            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setStep('verify')
        } catch (err) {
            setApiError(getClerkErrorMessage(err))
        }
    }

    const onVerify = async () => {
        if (!isLoaded || otpCode.length !== 6) {
            setApiError('Enter the 6-digit code from your email.')
            return
        }
        setApiError(null)
        setIsVerifying(true)

        try {
            const attempt = await signUp.attemptEmailAddressVerification({ code: otpCode })

            if (attempt.status !== 'complete') {
                setApiError('Verification is incomplete. Please try again.')
                return
            }

            await setActive({ session: attempt.createdSessionId })

            // Avatar → Clerk profile image → synced to User.avatarUrl by the webhook
            const image = getValues('profileImage')
            if (image?.startsWith('data:') && clerk.user) {
                try {
                    await clerk.user.setProfileImage({ file: image })
                } catch {
                    // Non-fatal: account exists, avatar can be set later from the profile
                }
            }

            router.replace('/(tabs)/profile')
        } catch (err) {
            setApiError(getClerkErrorMessage(err))
        } finally {
            setIsVerifying(false)
        }
    }

    if (step === 'verify') {
        return (
            <View className="mt-8">
                <Text className="text-white text-xl font-bold mb-1">Verify your email</Text>
                <Text className="text-gray-400 text-sm mb-6">
                    We sent a 6-digit code to {getValues('email')}.
                </Text>

                <TextInput
                    className="bg-white/10 text-white p-4 rounded-xl border border-white/20 text-center text-lg font-bold tracking-widest"
                    placeholder="000000"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                />

                {apiError && (
                    <Text className="text-red-400 text-sm mt-3 text-center">{apiError}</Text>
                )}

                <TouchableOpacity
                    onPress={onVerify}
                    disabled={isVerifying}
                    className="p-4 rounded-xl items-center justify-center mt-6 bg-primary"
                >
                    {isVerifying
                        ? <ActivityIndicator size="small" color="#FFFFFF" />
                        : <Text className="text-white font-semibold text-lg">Verify & Create Account</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                    className="mt-4 items-center"
                    onPress={async () => {
                        setApiError(null)
                        try {
                            await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' })
                        } catch (err) {
                            setApiError(getClerkErrorMessage(err))
                        }
                    }}
                >
                    <Text className="text-purple-400 text-sm font-medium">Resend code</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View>
            {/* --- Animated Profile Picture Section --- */}
            <View className="items-center mb-8">
                <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.9}
                    className="relative"
                >
                    <MotiView
                        from={{ opacity: 0.3, scale: 0.9 }}
                        animate={{ opacity: profileImage ? 0.1 : 0.4, scale: 1.05 }}
                        transition={{
                            type: 'timing',
                            duration: 2000,
                            loop: true,
                            repeatReverse: true
                        }}
                        className="absolute inset-0 bg-purple-500 rounded-full"
                    />

                    <MotiView
                        animate={{
                            scale: profileImage ? 1 : 0.95,
                            borderColor: profileImage ? '#6d28d9' : 'rgba(255,255,255,0.2)'
                        }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-32 h-32 rounded-full border-4 overflow-hidden bg-white/10 items-center justify-center justify-items-center"
                    >
                        <AnimatePresence exitBeforeEnter>
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <MotiView
                                    key="placeholder"
                                    from={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="items-center justify-center"
                                >
                                    <User size={48} color="rgba(255, 255, 255, 0.6)" />
                                </MotiView>
                            )}
                        </AnimatePresence>
                    </MotiView>

                    <MotiView
                        from={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 300 }}
                        className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-2 border-background shadow-lg"
                    >
                        <Camera size={18} color="#fff" />
                    </MotiView>
                </TouchableOpacity>
                <Text className="text-gray-400 text-xs mt-3">Click to upload profile image</Text>
            </View>

            {/* First Name Field */}
            <View className="mb-4">
                <Text className="text-gray-300 mb-1 font-medium">First Name</Text>
                <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`bg-white/10 text-white p-4 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-white/20'}`}
                            placeholder="John"
                            placeholderTextColor="#9ca3af"
                            autoComplete="given-name"
                            textContentType="givenName"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.firstName && <Text className="text-red-400 text-sm mt-1">{errors.firstName.message}</Text>}
            </View>

            {/* Last Name Field */}
            <View className="mb-4">
                <Text className="text-gray-300 mb-1 font-medium">Last Name</Text>
                <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`bg-white/10 text-white p-4 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-white/20'}`}
                            placeholder="Doe"
                            placeholderTextColor="#9ca3af"
                            autoComplete="family-name"
                            textContentType="familyName"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.lastName && <Text className="text-red-400 text-sm mt-1">{errors.lastName.message}</Text>}
            </View>

            {/* Username Field */}
            <View className="mb-4">
                <Text className="text-gray-300 mb-1 font-medium">Username</Text>
                <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`bg-white/10 text-white p-4 rounded-xl border ${errors.username ? 'border-red-500' : 'border-white/20'}`}
                            placeholder="johndoe123"
                            placeholderTextColor="#9ca3af"
                            autoCapitalize="none"
                            autoComplete="username-new"
                            textContentType="username"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                />
                {errors.username && <Text className="text-red-400 text-sm mt-1">{errors.username.message}</Text>}
            </View>

            {/* Email Field */}
            <View className="mb-4">
                <Text className="text-gray-300 mb-1 font-medium">Email</Text>
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className={`bg-white/10 text-white p-4 rounded-xl border ${errors.email ? 'border-red-500' : 'border-white/20'}`}
                            placeholder="john@example.com"
                            placeholderTextColor="#9ca3af"
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
                {errors.email && <Text className="text-red-400 text-sm mt-1">{errors.email.message}</Text>}
            </View>

            {/* Password Field */}
            <View className="mb-4">
                <Text className="text-gray-300 mb-1 font-medium">Password</Text>
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className={`relative flex-row items-center bg-white/10 rounded-xl border ${errors.password ? 'border-red-500' : 'border-white/20'}`}>
                            <TextInput
                                className="flex-1 text-white p-4 pr-12"
                                placeholder="At least 8 characters"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoComplete="new-password"
                                textContentType="newPassword"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                            />
                            <TouchableOpacity
                                className="absolute right-4"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                {showPassword
                                    ? <EyeOff size={20} color="#9ca3af" />
                                    : <Eye size={20} color="#9ca3af" />}
                            </TouchableOpacity>
                        </View>
                    )}
                />
                {errors.password && <Text className="text-red-400 text-sm mt-1">{errors.password.message}</Text>}
            </View>

            {/* Phone Number Field */}
            <View className="mb-6">
                <Text className="text-gray-300 mb-1 font-medium">Phone Number</Text>
                <View className="flex-row gap-2">
                    <View className="w-24">
                        <Controller
                            control={control}
                            name="countryCode"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`bg-white/10 text-white p-4 rounded-xl border text-center ${errors.countryCode ? 'border-red-500' : 'border-white/20'}`}
                                    placeholder="+1"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="phone-pad"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>

                    <View className="flex-1">
                        <Controller
                            control={control}
                            name="phoneNumber"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className={`bg-white/10 text-white p-4 rounded-xl border ${errors.phoneNumber ? 'border-red-500' : 'border-white/20'}`}
                                    placeholder="1234567890"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    textContentType="telephoneNumber"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>
                </View>
                {errors.countryCode && <Text className="text-red-400 text-sm mt-1">{errors.countryCode.message}</Text>}
                {errors.phoneNumber && <Text className="text-red-400 text-sm mt-1">{errors.phoneNumber.message}</Text>}
            </View>

            {/* --- Terms of Use Checkbox --- */}
            <MotiView
                animate={{ scale: errors.acceptTermsAndConditions ? [1, 1.02, 1] : 1 }}
                transition={{ type: 'timing', duration: 250 }}
                className="flex-row items-start gap-3 mb-6 px-1"
            >
                <Controller
                    control={control}
                    name="acceptTermsAndConditions"
                    render={({ field: { value, onChange } }) => (
                        <Checkbox
                            checked={value}
                            onCheckedChange={onChange}
                            aria-labelledby="terms-label"
                            className=' border-white'
                        />
                    )}
                />
                <View className="flex-1">
                    <Text id="terms-label" className="text-gray-300 text-sm leading-5">
                        I agree to the{' '}
                        {/* Read-only detour: the checkbox above stays the acceptance control. */}
                        <Text
                            accessibilityRole="link"
                            onPress={openTerms}
                            className="text-purple-400 font-medium underline"
                        >
                            Terms of Use
                        </Text>
                    </Text>
                    {errors.acceptTermsAndConditions && (
                        <Text className="text-red-400 text-xs mt-1">{errors.acceptTermsAndConditions.message}</Text>
                    )}
                </View>
            </MotiView>

            {/* --- Privacy Policy Checkbox --- */}
            <MotiView
                animate={{ scale: errors.acceptPrivacyPolicy ? [1, 1.02, 1] : 1 }}
                transition={{ type: 'timing', duration: 250 }}
                className="flex-row items-start gap-3 mb-4 px-1"
            >
                <Controller
                    control={control}
                    name="acceptPrivacyPolicy"
                    render={({ field: { value, onChange } }) => (
                        <Checkbox
                            checked={value}
                            onCheckedChange={onChange}
                            aria-labelledby="privacy-label"
                            className=' border-white border'
                        />
                    )}
                />
                <View className="flex-1">
                    <Text id="privacy-label" className="text-gray-300 text-sm leading-5">
                        I accept the{' '}
                        {/* Read-only detour: the checkbox above stays the acceptance control. */}
                        <Text
                            accessibilityRole="link"
                            onPress={openPrivacy}
                            className="text-purple-400 font-medium underline"
                        >
                            Privacy Policy
                        </Text>
                    </Text>
                    {errors.acceptPrivacyPolicy && (
                        <Text className="text-red-400 text-xs mt-1">{errors.acceptPrivacyPolicy.message}</Text>
                    )}
                </View>
            </MotiView>


            {apiError && (
                <Text className="text-red-400 text-sm mb-3 text-center">{apiError}</Text>
            )}

            {/* Says which document is still unopened — a disabled button with no
                explanation reads as a broken form. */}
            {unopenedDocuments.length > 0 && (
                <Text className="text-amber-400 text-xs mb-3 text-center">
                    Open the {unopenedDocuments.join(' and ')} above to continue.
                </Text>
            )}

            {/* Submit Button */}
            <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || unopenedDocuments.length > 0}
                className={`p-4 rounded-xl items-center justify-center mt-2 ${isSubmitting ? 'bg-primary' : 'bg-primary-80'} ${unopenedDocuments.length > 0 ? 'opacity-40' : ''}`}
            >
                <Text className="text-white font-semibold text-lg">
                    {isSubmitting ? 'Creating account...' : 'Submit'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}