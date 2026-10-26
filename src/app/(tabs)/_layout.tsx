import { useAuth } from "@clerk/clerk-expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs, usePathname } from "expo-router";
import { Box, Compass, Handbag, ScanQrCode, User } from "lucide-react-native";
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

const TAB_ITEMS = [
  { key: "discover", label: "Discover", Icon: Compass },
  { key: "collections", label: "My Collections", Icon: Box },
  { key: "scan", label: "Scan", Icon: ScanQrCode },
  { key: "marketplace", label: "Marketplace", Icon: Handbag },
  { key: "profile", label: "Profile", Icon: User },
] as const;

type TabKey = (typeof TAB_ITEMS)[number]["key"];

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

interface LiquidGlassTabBarProps extends TabBarProps {
  onGatedTabPress: (name: GatedTab) => void;
}

function LiquidGlassTabBar({
  state,
  descriptors,
  navigation,
  onGatedTabPress,
}: LiquidGlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const currentRouteName = state.routes[state.index]?.name ?? "";
  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.tabBarWrapper,
        {
          bottom: bottomInset,
        },
      ]}
    >
      {/* Liquid Glass Pill Container */}
      <View style={styles.glassContainer}>
        <BlurView
          intensity={Platform.OS === "ios" ? 75 : 95}
          tint="dark"
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: 40, overflow: "hidden" },
          ]}
        />
        {/* Specular glass highlight gradient overlay */}
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.12)",
            "rgba(255, 255, 255, 0.02)",
            "rgba(0, 0, 0, 0.35)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 40 }]}
        />

        <View style={styles.tabButtonsRow}>
          {TAB_ITEMS.map((tab) => {
            const route = state.routes.find(
              (r) =>
                r.name === tab.key ||
                r.name === `${tab.key}/index` ||
                r.name.startsWith(tab.key)
            );
            const routeKey = route?.key ?? tab.key;
            const routeTargetName = route?.name ?? tab.key;

            const isFocused =
              currentRouteName === tab.key ||
              currentRouteName === `${tab.key}/index` ||
              currentRouteName.startsWith(tab.key);

            const { label, Icon } = tab;
            const isScan = tab.key === "scan";

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

            if (isScan) {
              return (
                <TouchableOpacity
                  key={tab.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel="Scan NFC Tag"
                  activeOpacity={0.85}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.scanTabButton}
                >
                  {/* Elevated glowing scan action button */}
                  <View style={styles.scanGlowWrapper}>
                    <LinearGradient
                      colors={["#A855F7", "#7C3AED", "#6D28D9"]}
                      start={{ x: 0.2, y: 0 }}
                      end={{ x: 0.8, y: 1 }}
                      style={styles.scanGradientCircle}
                    >
                      <ScanQrCode color="#FFFFFF" size={24} strokeWidth={2.2} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.scanLabel}>Scan</Text>
                </TouchableOpacity>
              );
            }

            const activeColor = "#A855F7";
            const inactiveColor = "#9CA3AF";
            const iconColor = isFocused ? activeColor : "#E4E4E7";

            return (
              <TouchableOpacity
                key={tab.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={label}
                activeOpacity={0.7}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerActive,
                  ]}
                >
                  <Icon
                    color={iconColor}
                    size={24}
                    strokeWidth={isFocused ? 2.2 : 1.8}
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? activeColor : inactiveColor,
                      fontWeight: isFocused ? "700" : "500",
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
          <LiquidGlassTabBar
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
  tabBarWrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    alignItems: "center",
    // Ambient liquid glass drop shadow
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 24,
    elevation: 16,
  },
  glassContainer: {
    width: "100%",
    height: 74,
    borderRadius: 40,
    overflow: "visible",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    borderTopColor: "rgba(255, 255, 255, 0.26)",
    // iOS gets a real gaussian blur from BlurView, so the fill can stay
    // translucent and let the frosted effect show. Android's BlurView is far
    // weaker — at 0.72 the content scrolling behind stayed fully legible
    // through the bar — so the opacity has to come from the fill instead.
    backgroundColor: Platform.select({
      ios: "rgba(16, 12, 24, 0.72)",
      default: "rgba(13, 11, 20, 0.96)",
    }),
  },
  tabButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: "100%",
    paddingHorizontal: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
  },
  // Ringed badge on the selected tab. Width/height 32 with radius 16 makes the
  // circle, so it stays aligned with the unfocused tabs rather than nudging the
  // row — only the outline and tint appear.
  iconContainerActive: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(168, 85, 247, 0.55)",
    backgroundColor: "rgba(168, 85, 247, 0.14)",
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2.5,
    textAlign: "center",
  },
  scanTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
    marginTop: -22,
  },
  scanGlowWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(147, 51, 234, 0.28)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(168, 85, 247, 0.45)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  scanGradientCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  scanLabel: {
    fontSize: 10.5,
    marginTop: 3,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "center",
  },
});

