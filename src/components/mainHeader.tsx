import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, Settings, UserPlus } from "lucide-react-native";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

interface MainHeaderProps {
  title: string;
  subtitle?: string;
  /** Overrides the live unread count from `useNotifications()`. */
  notificationCount?: number;
  /** Overrides the default push to `/notifications`. */
  onNotificationPress?: () => void;
  onSettingsPress?: () => void;
  /** Overrides the default push to `/(auth)/register` on the signed-out button. */
  onSignUpPress?: () => void;
  className?: string;
  /** 'compact' shows the title inline with the icons (no logo row), subtitle below. */
  variant?: "default" | "compact";
  /** Wraps the header in a frosted liquid glass container. */
  glass?: boolean;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  title,
  subtitle,
  notificationCount,
  onNotificationPress,
  onSettingsPress,
  onSignUpPress,
  className,
  variant = "default",
  glass = false,
}) => {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { unreadCount } = useNotifications();

  // Callers may pin a count; otherwise the badge follows the real feed.
  const badgeCount = notificationCount ?? unreadCount;

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push("/notifications");
    }
  };

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      router.push("/settings");
    }
  };

  const handleSignUpPress = () => {
    if (onSignUpPress) {
      onSignUpPress();
    } else {
      router.push("/(auth)/register");
    }
  };

  const isSmall = width < 375;
  const isTablet = width >= 768;

  const logoSize = isTablet ? 46 : isSmall ? 34 : 38;
  const titleSize = isTablet ? 42 : isSmall ? 30 : 34;
  const iconSize = isTablet ? 22 : 19;
  const buttonSize = isTablet ? 48 : 42;

  const headerInner = (
    <View
      className={cn("px-4 pt-3 pb-3", !glass && className)}
      style={{
        paddingHorizontal: isTablet ? 28 : 16,
      }}
    >
      {/* Top Row */}
      <View className="flex-row items-center justify-between">
        {variant === "compact" ? (
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontSize: isTablet ? 36 : isSmall ? 24 : 30,
              fontWeight: "900",
              color: "white",
              letterSpacing: -0.5,
              marginRight: 12,
            }}
          >
            {title}
          </Text>
        ) : (
          <View className="flex-row items-center">
            <Image
              source={require("@/assets/images/HitBoxLogo.png")}
              resizeMode="contain"
              style={{
                width: logoSize,
                height: logoSize,
              }}
            />
          </View>
        )}

        <View className="flex-row items-center">
          {/* Notifications Button with Glass Styling */}
          <TouchableOpacity
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={
              badgeCount > 0
                ? `Notifications, ${badgeCount} unread`
                : "Notifications"
            }
            onPress={handleNotificationPress}
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.14)",
              borderTopColor: "rgba(255, 255, 255, 0.25)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 10,
              // Ambient glow shadow
              shadowColor: "#8B5CF6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Bell size={iconSize} color="white" strokeWidth={2} />

            {badgeCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: "#8B5CF6",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 4,
                  borderWidth: 1.5,
                  borderColor: "#000000",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 9,
                    fontWeight: "800",
                  }}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Settings when signed in, Sign Up when not */}
          {isSignedIn ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleSettingsPress}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              style={{
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.14)",
                borderTopColor: "rgba(255, 255, 255, 0.25)",
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Settings size={iconSize} color="white" strokeWidth={2} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              onPress={handleSignUpPress}
              style={{
                height: buttonSize,
                borderRadius: buttonSize / 2,
                backgroundColor: "#7C3AED",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: isTablet ? 18 : 14,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderTopColor: "rgba(255, 255, 255, 0.4)",
                shadowColor: "#7C3AED",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
                elevation: 6,
              }}
            >
              <UserPlus size={iconSize - 3} color="white" strokeWidth={2.5} />
              <Text
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: isTablet ? 14 : 12,
                  marginLeft: 5,
                }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Header Content */}
      {(variant !== "compact" || !!subtitle) && (
        <View
          style={{
            marginTop: variant === "compact" ? 6 : isTablet ? 24 : 16,
          }}
        >
          {variant !== "compact" && (
            <Text
              style={{
                fontSize: titleSize,
                fontWeight: "900",
                color: "white",
                letterSpacing: -0.5,
              }}
            >
              {title}
            </Text>
          )}

          {subtitle && (
            <Text
              style={{
                marginTop: variant === "compact" ? 0 : 6,
                fontSize: isTablet ? 16 : variant === "compact" ? 12 : 14,
                color: "#9CA3AF",
                lineHeight: variant === "compact" ? 17 : 21,
                maxWidth: "94%",
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (glass) {
    return (
      <View
        className={cn("mx-4 my-2 overflow-hidden rounded-3xl", className)}
        style={{
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderTopColor: "rgba(255, 255, 255, 0.24)",
          backgroundColor: Platform.select({
            ios: "rgba(18, 14, 28, 0.65)",
            default: "rgba(15, 12, 22, 0.92)",
          }),
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.45,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 60 : 85}
          tint="dark"
          style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: "hidden" }]}
        />
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.12)",
            "rgba(255, 255, 255, 0.02)",
            "rgba(0, 0, 0, 0.35)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />
        {headerInner}
      </View>
    );
  }

  return headerInner;
};

export default MainHeader;
