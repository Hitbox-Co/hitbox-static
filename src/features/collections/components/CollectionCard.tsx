import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Globe, Lock } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { collectionErrorMessage } from "../api/collectionErrors";
import { useUpdateCollectionVisibility } from "../api/updateCollectionVisibility";
import { CollectionCardData, serialLabel } from "../utils/mapCollectionItem";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

interface Props {
  item: CollectionCardData;
}

export default function CollectionCard({ item }: Props) {
  const { width } = useWindowDimensions();
  const CARD_WIDTH = (width - 56) / 3;

  // PATCH /collections/me/:skuId — takes the SKU id, not the shelf-row id.
  const updateVisibility = useUpdateCollectionVisibility();
  const isPublic = item.visibility === "PUBLIC";
  const toggleVisibility = () =>
    updateVisibility.mutate(
      { skuId: item.skuId, visibility: isPublic ? "PRIVATE" : "PUBLIC" },
      { onError: (err) => Alert.alert("Couldn't update visibility", collectionErrorMessage(err)) },
    );

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        {
          width: CARD_WIDTH,
        },
        animatedStyle,
      ]}
      onPressIn={() =>
        (scale.value = withSpring(0.97))
      }
      onPressOut={() =>
        (scale.value = withSpring(1))
      }
      onPress={() => {
        router.push({
          pathname: "/collections/view-collection",
          params: { id: item.id },
        });
      }}
    >
      <View
        className="rounded-3xl border border-[#232C3F] bg-[#0B1018] p-2.5"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: {
            width: 0,
            height: 5,
          },
          elevation: 6,
        }}
      >
        {/* IMAGE */}
        <View
          className="overflow-hidden rounded-2xl"
          style={{
            height: CARD_WIDTH * 0.82,
          }}
        >
          <Image
            source={item.image}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
          />

          <LinearGradient
            colors={[
              "transparent",
              "rgba(0,0,0,0.65)",
            ]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 35,
            }}
          />

          {item.featured && (
            <LinearGradient
              colors={["#A855F7", "#7C3AED"]}
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 7,
                }}
              >
                FEATURED
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* CONTENT */}
        <View className="mt-3">
          <Text
            numberOfLines={2}
            className="font-bold text-white"
            style={{
              fontSize: 10,
              lineHeight: 13,
            }}
          >
            {item.title}
          </Text>

          <Text
            numberOfLines={1}
            className="mt-1 text-zinc-400"
            style={{
              fontSize: 8,
            }}
          >
            {item.subtitle}
          </Text>
        </View>

        {/* SERIAL + VISIBILITY — one card is one physical unit */}
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 8, fontWeight: "700" }}>
            {serialLabel(item.serial)}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPublic ? "Public. Tap to make private" : "Private. Tap to make public"}
            hitSlop={8}
            disabled={updateVisibility.isPending}
            onPress={toggleVisibility}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isPublic ? "#7C3AED" : "#232C3F",
              backgroundColor: isPublic ? "rgba(124,58,237,0.18)" : "#111827",
              paddingHorizontal: 5,
              paddingVertical: 2,
            }}
          >
            {updateVisibility.isPending ? (
              <ActivityIndicator size="small" color="#2563eb" style={{ transform: [{ scale: 0.55 }] }} />
            ) : isPublic ? (
              <Globe size={8} color="#C4B5FD" />
            ) : (
              <Lock size={8} color="#8B95A7" />
            )}
            <Text style={{ color: isPublic ? "#C4B5FD" : "#8B95A7", fontSize: 7, fontWeight: "700" }}>
              {isPublic ? "Public" : "Private"}
            </Text>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}