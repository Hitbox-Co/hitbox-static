import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { PortalHost } from '@rn-primitives/portal';
import { initCurrency } from '@/lib/currency';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // consider data fresh for 1 min
    },
  },
});

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  // Resolve the display currency before any price renders: `formatPrice` reads
  // the result synchronously, so a price shown before this lands would be stuck
  // in USD until something re-rendered it. Runs alongside Clerk's own restore,
  // inside the spinner the user is already waiting on, and self-limits to 4s so
  // a slow GPS fix can't hold up launch.
  const [currencyReady, setCurrencyReady] = React.useState(false);

  // The app stayed up: forget any earlier automatic retries, so a later,
  // unrelated failure gets its full budget. (A failing tree is torn down before
  // this fires, so a real fault cannot reset its own counter.)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      autoRetries = 0;
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    void initCurrency().finally(() => {
      if (!cancelled) setCurrencyReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Wait for Clerk to restore the session before evaluating route guards,
  // otherwise signed-in users get bounced to public routes on cold start.
  if (!isLoaded || !currencyReady) {
    return (
      <View className="flex-1 items-center justify-center bg-[#08060b]">
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#08060b",
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      {/* Auth screens stay navigable in any state; the private routes
          (profile, collections) are protected in (tabs)/_layout.tsx. */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      {/* Full-screen pushes with no tab bar: claim + verify. The ones that keep
          the tab bar (scan, settings, edit-profile, artists, notifications) live
          in (tabs)/(details) instead. */}
      <Stack.Screen
        name="(routes)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="index" />
    </Stack>
  );
}

/**
 * Catches what would otherwise end the app: expo-router renders this in place of
 * the layout when anything under it throws, and `retry` mounts it again.
 *
 * Added for one rare cold-start failure. Clerk throws "You've added multiple
 * <ClerkProvider> components" when a second provider mounts before the first has
 * cleaned up — and that happens for real when Android starts MainActivity twice
 * in one process (a launch, then a tag link that arrives a moment later with
 * CLEAR_TASK): the old activity is not destroyed for ~2s, so two React roots
 * briefly coexist. Nothing is wrong with the tree, so the fix is to wait for the
 * old one to go and mount again. That case retries by itself, a few times and
 * with a pause (a single immediate retry lands while the old root is still
 * alive), then stops, so a real fault cannot loop. Everything else shows a
 * message and a button instead of closing the app.
 */
const AUTO_RETRY_LIMIT = 4;
const AUTO_RETRY_DELAY_MS = 1500;
let autoRetries = 0;

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const duplicateClerk = /multiple <ClerkProvider>/i.test(error?.message ?? '');
  const retrying = duplicateClerk && autoRetries < AUTO_RETRY_LIMIT;

  React.useEffect(() => {
    if (!retrying) return;
    const timer = setTimeout(() => {
      autoRetries += 1;
      void retry();
    }, AUTO_RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [retrying, retry]);

  return (
    <View className="flex-1 items-center justify-center bg-[#08060b] px-8">
      {retrying ? (
        <ActivityIndicator size="large" color="#6C5CE7" />
      ) : (
        <>
          <Text className="text-white text-xl font-black text-center">Something went wrong</Text>
          <Text className="text-neutral-400 text-center mt-2 mb-6">
            HitBox hit an unexpected problem. Try again.
          </Text>
          <TouchableOpacity
            onPress={() => {
              autoRetries = 0;
              void retry();
            }}
            activeOpacity={0.85}
            className="bg-primary rounded-xl h-12 px-8 items-center justify-center"
          >
            <Text className="text-white font-bold">Try again</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <View className="flex-1">
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
        <QueryClientProvider client={queryClient}>
          <RootNavigator />
          {/* Scanning is reached from the Scan tab now, so there is no floating
              button here — one hovering over its own tab button read as a
              duplicate. `src/components/ScanFab.tsx` is kept but unused. */}
          <PortalHost />
        </QueryClientProvider>
      </ClerkProvider>
    </View>
  );
}