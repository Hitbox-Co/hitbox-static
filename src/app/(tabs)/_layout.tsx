import { useAuth } from "@clerk/clerk-expo";
import { BlurView } from "expo-blur";
import { router, Tabs, usePathname } from "expo-router";
import {
  House,
  Layers,
  ScanLine,
  ShoppingBag,
  UserRound,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SignInPopup from "@/components/auth/SignInPopup";

/**
 * Tabs whose screens can't work without a Clerk session. They stay **visible**
 * while signed out so a guest can see what the app offers; pressing one opens
 * the sign-in popup instead of loading the screen, and the press is replayed
 * once a session exists.
 */
const GATED_TABS = {
  collections: {
    href: "/(tabs)/collections",
    title: "Sign in to see your collection",
    description:
      "Every item you claim lands in your collection. Sign in to open it.",
  },
  profile: {
    href: "/(tabs)/profile",
    title: "Sign in to view your profile",
    description: "Sign in to manage your HitBox profile, rewards and settings.",
  },
} as const;

type GatedTab = keyof typeof GATED_TABS;

/**
 * Tabs that own a nested Stack (`marketplace/[tourId]`,
 * `collections/view-collection`).
 *
 * Pressing the tab you're already on is a no-op by default: React Navigation
 * jumps to an already-focused tab without touching its stack, so a product
 * detail pushed on top of the Marketplace list just stays there and the tab
 * looks broken. These pop the nested stack back to the tab's own root instead.
 *
 * `pathname` is the route as `usePathname()` reports it (group segments
 * stripped); `root` is the href to pop back to.
 */
const NESTED_TABS = {
  collections: { pathname: "/collections", root: "/(tabs)/collections" },
  discover: { pathname: "/discover", root: "/(tabs)/discover" },
  marketplace: { pathname: "/marketplace", root: "/(tabs)/marketplace" },
} as const;

type NestedTab = keyof typeof NESTED_TABS;

const isGated = (name: string): name is GatedTab => name in GATED_TABS;
const isNested = (name: string): name is NestedTab => name in NESTED_TABS;

// Order, labels and icons follow the Figma "Floating navigation": Scan is the
// last item, not a raised centre button.
const TAB_ITEMS = [
  { key: "discover", label: "Discover", a11y: "Discover", Icon: House },
  { key: "collections", label: "My Collection", a11y: "My Collections", Icon: Layers },
  { key: "marketplace", label: "Market", a11y: "Marketplace", Icon: ShoppingBag },
  { key: "profile", label: "Profile", a11y: "Profile", Icon: UserRound },
  // The a11y label is the stable selector UI tests use for the scan tab.
  { key: "scan", label: "Scan", a11y: "Scan NFC Tag", Icon: ScanLine },
] as const;

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

interface FloatingTabBarProps extends TabBarProps {
  onGatedTabPress: (name: GatedTab) => void;
}

const ACTIVE = "#42526c";
const INACTIVE = "#6b7280";

function FloatingTabBar({
  state,
  navigation,
  onGatedTabPress,
}: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const currentRouteName = state.routes[state.index]?.name ?? "";

  return (
    <View
      pointerEvents="box-none"
      style={[styles.tabBarWrapper, { paddingBottom: insets.bottom }]}
    >
      {/* Frosted white bar: 57% white over a blur, #dbeafe hairline, 40px top corners. */}
      <BlurView
        intensity={Platform.OS === "ios" ? 60 : 90}
        tint="light"
        style={[StyleSheet.absoluteFill, styles.glass]}
      />
      <View style={styles.tabButtonsRow}>
        {TAB_ITEMS.map((tab) => {
          const route = state.routes.find(
            (r) =>
              r.name === tab.key ||
              r.name === `${tab.key}/index` ||
              r.name.startsWith(tab.key)
          );
          const routeTargetName = route?.name ?? tab.key;

          const isFocused =
            currentRouteName === tab.key ||
            currentRouteName === `${tab.key}/index` ||
            currentRouteName.startsWith(tab.key);

          const { label, a11y, Icon } = tab;

          const onPress = () => {
            if (isGated(tab.key) && !isSignedIn) {
              onGatedTabPress(tab.key);
              return;
            }

            if (isNested(tab.key)) {
              const { pathname: tabPath, root } = NESTED_TABS[tab.key];
              if (pathnameRef.current.startsWith(`${tabPath}/`)) {
                router.dismissTo(root);
                return;
              }
            }

            if (route) {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(routeTargetName);
              }
            } else {
              navigation.navigate(tab.key as any);
            }
          };

          const onLongPress = () => {
            if (route) {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            }
          };

          const color = isFocused ? ACTIVE : INACTIVE;

          return (
            <TouchableOpacity
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={a11y}
              activeOpacity={0.7}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <Icon color={color} size={21} strokeWidth={isFocused ? 2 : 1.75} />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color,
                    fontFamily: isFocused ? "Syne_700Bold" : "Syne_500Medium",
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const [gatedTab, setGatedTab] = useState<GatedTab | null>(null);
  const targetRef = useRef<GatedTab | null>(null);

  const handleGatedTabPress = (name: GatedTab) => {
    targetRef.current = name;
    setGatedTab(name);
  };

  return (
    <>
      <Tabs
        backBehavior="history"
        tabBar={(props: any) => (
          <FloatingTabBar
            {...props}
            onGatedTabPress={handleGatedTabPress}
          />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="discover"
          options={{
            title: "Discover",
            popToTopOnBlur: true,
          }}
        />

        <Tabs.Screen
          name="collections"
          options={{
            title: "My Collections",
            popToTopOnBlur: true,
          }}
        />

        <Tabs.Screen
          name="scan"
          options={{
            title: "Scan",
          }}
        />

        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Marketplace",
            popToTopOnBlur: true,
          }}
        />

        {/* Pushed screens that keep the tab bar */}
        <Tabs.Screen name="(details)" options={{ href: null }} />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>

      <SignInPopup
        open={!!gatedTab}
        onOpenChange={(open) => {
          if (!open) setGatedTab(null);
        }}
        title={gatedTab ? GATED_TABS[gatedTab].title : undefined}
        description={gatedTab ? GATED_TABS[gatedTab].description : undefined}
        onSignedIn={() => {
          const target = targetRef.current;
          targetRef.current = null;
          setGatedTab(null);
          if (target) router.push(GATED_TABS[target].href);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  // Docked to the bottom edge, 10px in from each side (371 of 390 in the Figma).
  tabBarWrapper: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#dbeafe",
    overflow: "hidden",
    // iOS gets a real gaussian blur from BlurView, so the Figma's 57% white
    // fill works as-is. Android's BlurView is far weaker, so the content
    // scrolling behind would stay legible through it — the opacity has to come
    // from the fill instead.
    backgroundColor: Platform.select({
      ios: "rgba(255, 255, 255, 0.57)",
      default: "rgba(255, 255, 255, 0.92)",
    }),
  },
  glass: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: "hidden",
  },
  tabButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    paddingHorizontal: 9,
  },
  tabButton: {
    flex: 1,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    fontSize: 9.5,
    textAlign: "center",
  },
});
