import { useAuth } from '@clerk/clerk-expo';
import { router, usePathname } from 'expo-router';
import { ScanLine } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarBaseHeight } from '@/constants/theme';

/**
 * Routes where the button would be pointless or in the way. `usePathname()`
 * drops group segments, so `/scan` arrives here as `/scan`.
 */
const HIDDEN_ON = [
    '/scan',            // already scanning
    '/claim',           // mid-claim — the screen owns its own actions
    '/verify',
    '/login',
    '/register',
    '/forget-password',
    '/sso-callback',
    '/privacy-policy',  // long reads reached mid-sign-up — the button just covers text
    '/terms-of-use',
];

/**
 * Routes that render the bottom tab bar, which the button has to clear — the
 * four tabs plus the pushed screens that live inside `(tabs)/(details)`.
 */
const TAB_ROUTES = [
    '/discover',
    '/collections',
    '/marketplace',
    '/profile',
    '/settings',
    '/edit-profile',
    '/artists',
    '/notifications',
];

/**
 * Floating scan button — the app-wide entry point into `/scan`.
 *
 * Rendered once in `src/app/_layout.tsx` as a sibling of the navigator, so it
 * survives every route change instead of being re-mounted per screen. It clears
 * the tab bar (plus the system nav bar below it) on tab routes, sits just above
 * the safe area elsewhere, and is hidden on the routes listed above.
 *
 * Tapping only *navigates*: scanning itself stays scoped to the scan screen —
 * there is deliberately no app-wide tag listener (see AGENTS.md §8).
 */
export default function ScanFab() {
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    // The navigator shows a spinner until Clerk restores the session; a button
    // floating over that reads as a glitch.
    const { isLoaded } = useAuth();

    if (!isLoaded) return null;
    if (HIDDEN_ON.some((route) => pathname.startsWith(route))) return null;

    // The tab bar is TabBarBaseHeight + insets.bottom tall, so on a tab route the
    // button has to start above both; elsewhere only the safe area matters.
    const onTabRoute = TAB_ROUTES.some((route) => pathname.startsWith(route));
    const bottom = insets.bottom + (onTabRoute ? TabBarBaseHeight + 12 : 24);

    return (
        <View pointerEvents="box-none" style={{ bottom }} className="absolute right-5 items-center">
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Scan an NFC tag"
                activeOpacity={0.85}
                onPress={() => router.push('/scan')}
                className="h-16 w-16 rounded-full bg-primary items-center justify-center border-2 border-white/50 shadow-lg shadow-primary/40"
            >
                <ScanLine color="#FFFFFF" size={28} />
            </TouchableOpacity>

            <Text className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mt-1">
                Scan
            </Text>
        </View>
    );
}
