import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

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