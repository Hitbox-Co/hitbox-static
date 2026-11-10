import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import PopupEmailForm from '@/components/auth/PopupEmailForm';
import PopupSsoButtons from '@/components/auth/PopupSsoButtons';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Method = 'options' | 'email';

interface SignInPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Headline — say *why* sign-in is being asked for (e.g. "Sign in to claim"). */
    title?: string;
    description?: string;
    /**
     * Fired once a Clerk session is active. The popup has already closed itself,
     * so the caller can simply resume whatever it was doing (claim, follow,
     * save…) — nothing navigates.
     */
    onSignedIn?: () => void;
    /**
     * Which pane to open on. `'email'` skips the options list and lands straight
     * on the email + password form (used by the sign-up screen's "Continue with
     * Email"). Default `'options'`.
     */
    initialMethod?: Method;
    /** White card matching the light sign-up screen. Default is the dark card. */
    light?: boolean;
}

const METHOD_TITLES: Record<Exclude<Method, 'options'>, string> = {
    email: 'Sign In with Email',
    // phone: 'Verify Phone Number',
};

/**
 * 
 * ```tsx
 * const [askSignIn, setAskSignIn] = useState(false);
 *
 * <SignInPopup
 *     open={askSignIn}
 *     onOpenChange={setAskSignIn}
 *     title="Sign in to claim"
 *     description="Claim this item to add it to your collection."
 *     onSignedIn={() => void doTheThing()}
 * />
 * ```
 */
export default function SignInPopup({
    open,
    onOpenChange,
    title = 'Sign in to continue',
    description = 'Sign in to your HitBox account to continue where you left off.',
    onSignedIn,
    initialMethod = 'options',
    light = false,
}: SignInPopupProps) {
    const [method, setMethod] = useState<Method>(initialMethod);
    const { isSignedIn } = useAuth();

    // Kept in a ref so the "already signed in" effect below doesn't re-run every
    // time the caller passes a fresh closure.
    const onSignedInRef = useRef(onSignedIn);
    onSignedInRef.current = onSignedIn;

    // Clerk's `isSignedIn` flips true at roughly the same moment a form's
    // `setActive` resolves, so both paths below can race to report success. The
    // caller must only be resumed once (a second call would fire the gated action
    // twice), so the first one through wins.
    const firedRef = useRef(false);

    /** A session went active — close and hand back to the caller. */
    const finish = () => {
        if (firedRef.current) return;
        firedRef.current = true;
        onOpenChange(false);
        setMethod(initialMethod);
        onSignedInRef.current?.();
    };

    // Opened while a session already exists (e.g. signed in on another screen in
    // the meantime): there is nothing to ask for, so resume immediately.
    useEffect(() => {
        if (!open) {
            firedRef.current = false;
            return;
        }
        if (isSignedIn) finish();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, isSignedIn]);

    const handleOpenChange = (next: boolean) => {
        onOpenChange(next);
        if (!next) {
            // After the exit animation, so the body doesn't visibly swap first.
            setTimeout(() => setMethod(initialMethod), 200);
        }
    };

    /** Links that genuinely need a full screen (register, password reset). */
    const leaveTo = (pathname: string) => {
        onOpenChange(false);
        setMethod(initialMethod);
        router.push(pathname as never);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={light
                    ? 'bg-white opacity-100 border w-[350px] border-[#dbeafe] p-6 rounded-lg max-w-lg mx-auto shadow-xl shadow-black/20'
                    : 'bg-background opacity-100 border w-[350px] border-primary p-6 rounded-3xl max-w-lg mx-auto shadow-xl shadow-primary'}
            >
                <DialogHeader className="mb-2">
                    {method === 'options' ? (
                        <>
                            <View className="flex items-center justify-center w-full">
                                <Image
                                    source={require("@/assets/images/HitBoxLogo.png")}
                                    resizeMode="contain"
                                    style={{
                                        width: 40,
                                        height: 40,
                                    }}
                                />
                            </View>
                            <DialogTitle className={light ? 'font-syne-bold text-xl text-[#111827] mt-2' : 'text-white text-xl font-bold mt-2'}>{title}</DialogTitle>
                            <Text className={light ? 'font-syne text-xs text-[#6b7280] mt-1 pr-6' : 'text-neutral-400 text-xs mt-1 pr-6'}>{description}</Text>
                        </>
                    ) : (
                        <View className="flex-row items-center gap-x-2">
                            {/* Opened straight on the form: there is no options list to go back to. */}
                            {initialMethod !== 'email' && (
                                <TouchableOpacity
                                    className="active:opacity-60"
                                    hitSlop={12}
                                    onPress={() => setMethod('options')}
                                >
                                    <ChevronLeft size={22} color={light ? '#111827' : '#FFFFFF'} />
                                </TouchableOpacity>
                            )}
                            <DialogTitle className={light ? 'font-syne-bold text-xl text-[#111827]' : 'text-white text-xl font-bold'}>
                                {METHOD_TITLES[method]}
                            </DialogTitle>
                        </View>
                    )}
                </DialogHeader>

                <ScrollView
                    className="max-h-[420px]"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {method === 'options' && (
                        <View className="gap-y-3 pt-2">
                            {/* --- ALTERNATIVE SOCIAL SIGN INS --- */}
                            <PopupSsoButtons onSuccess={finish} />

                            {/* --- DIVIDER --- */}
                            <View className="flex-row items-center my-2">
                                <View className="flex-1 h-[1px] bg-neutral-800" />
                                <Text className="text-neutral-500 text-[11px] px-3 font-semibold">OR CONTINUE WITH</Text>
                                <View className="flex-1 h-[1px] bg-neutral-800" />
                            </View>

                            <TouchableOpacity
                                className="flex-row items-center justify-between bg-background border border-neutral-800 h-14 px-4 rounded-2xl w-full"
                                onPress={() => setMethod('email')}
                            >
                                <View className="flex-row items-center gap-x-3">
                                    <Mail size={22} color="#FFFFFF" />
                                    <Text className="text-white font-semibold text-base">Continue with Email</Text>
                                </View>
                                <ChevronRight size={18} color="#525252" />
                            </TouchableOpacity>

                            {/* <TouchableOpacity
                                className="flex-row items-center justify-between bg-background border border-neutral-800 p-4 rounded-2xl w-full"
                                onPress={() => setMethod('phone')}
                            >
                                <View className="flex-row items-center gap-x-3">
                                    <Phone size={22} color="#FFFFFF" />
                                    <View>
                                        <Text className="text-white font-semibold text-base">Continue with Phone Number</Text>
                                        <Text className="text-neutral-500 text-xs">We&apos;ll send you a verification code</Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color="#525252" />
                            </TouchableOpacity> */}
                        </View>
                    )}

                    {method === 'email' && (
                        <PopupEmailForm
                            light={light}
                            onSuccess={finish}
                            onForgotPassword={() => leaveTo('/(auth)/forget-password')}
                        />
                    )}

                    {/* {method === 'phone' && <PopupPhoneForm onSuccess={finish} />} */}
                </ScrollView>

                {/* Bottom Footer Section */}
                {method === 'options' && (
                    <View className="items-center gap-y-3 mt-2">
                        <View className="flex-row items-center gap-x-1">
                            <Text className="text-neutral-400 text-sm">Don&apos;t have an account?</Text>
                            <TouchableOpacity onPress={() => leaveTo('/(auth)/register')}>
                                <Text className="text-primary font-semibold text-sm">Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-center text-neutral-600 text-[11px] leading-relaxed">
                            By continuing, you agree to HitBox&apos;s{'\n'}
                            <Text className="text-neutral-500 underline">Terms of Service</Text> and{' '}
                            <Text className="text-neutral-500 underline">Privacy Policy</Text>.
                        </Text>
                    </View>
                )}
            </DialogContent>
        </Dialog>
    );
}
