import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { BadgeCheck } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";


interface CreatorCardProps {
  item: {
    id: string;
    name: string;
    username: string;
    followers: string;
    verified: boolean;
    image: string;
  }
}


export default function SingleCreatorCard({ item }: CreatorCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="w-32 overflow-hidden rounded-3xl"
      onPress={() => router.push(`/artists/${item.id}`)}
    >
      <BlurView
        intensity={10}
        tint="dark"
        className="overflow-hidden rounded-3xl"
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
          className="items-center rounded-3xl px-3 py-5 border border-primary-40"
        >
          {/* Avatar */}
          <Image
            source={{ uri: item.image }}
            className="h-20 w-20 rounded-full border-2 border-zinc-600"
            resizeMode="cover"
          />

          {/* Name */}
          <View className="mt-3 flex-row items-center">
            <Text
              numberOfLines={1}
              className="text-sm font-bold text-white"
            >
              {item.name}
            </Text>

            {item.verified && (
              <BadgeCheck
                size={13}
                color="#ffffff"
                fill="#6d28d9"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>

          {/* Username */}
          <Text
            numberOfLines={1}
            className="mt-1 text-[11px] text-zinc-400"
          >
            @{item.username}
          </Text>

          {/* Followers */}
          <Text className="mt-1 text-[11px] text-zinc-500">
            {item.followers} followers
          </Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}