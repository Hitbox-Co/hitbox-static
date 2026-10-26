import { cn } from "@/lib/utils";
import { BlurView } from "expo-blur";
import { Mic, Search, X } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, TextInput, TouchableOpacity, View } from "react-native";

interface MainSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onVoicePress?: () => void;
  onClear?: () => void;
  classname?: string;
}

export default function MainSearchBar({
  placeholder = "Search artists, albums...",
  value,
  onChangeText,
  onVoicePress,
  onClear,
  classname,
}: MainSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Only worth showing while there is something to clear.
  const hasText = !!value?.length;

  const handleClear = () => {
    onChangeText?.("");
    onClear?.();
  };

  return (
    <View className={cn("mx-4 my-2", classname)}>
      <BlurView
        intensity={Platform.OS === "ios" ? 40 : 80}
        tint="dark"
        className="overflow-hidden"
        style={{
          borderWidth: 1,
          borderColor: isFocused ? "#8B5CF6" : "rgba(255, 255, 255, 0.08)",
          backgroundColor: "rgba(18, 16, 26, 0.65)",
          borderRadius: 25
        }}
      >
        <View className="h-12 flex-row items-center px-4 ">
          <Search size={19} color="#8B5CF6" strokeWidth={2.2} />

          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#71717A"
            className="ml-3 flex-1 text-[14px] text-white"
            cursorColor="#8B5CF6"
            selectionColor="#8B5CF6"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Clear — rendered only while the field has text */}
          {hasText && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              activeOpacity={0.7}
              hitSlop={10}
              onPress={handleClear}
              className="ml-1 h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }}
            >
              <X size={12} color="#E4E4E7" strokeWidth={3} />
            </TouchableOpacity>
          )}

          <View
            className="mx-2.5 h-5 w-[1px]"
            style={{
              backgroundColor: isFocused
                ? "rgba(139, 92, 246, 0.4)"
                : "rgba(255, 255, 255, 0.12)",
            }}
          />

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voice search"
            activeOpacity={0.7}
            onPress={onVoicePress}
            className="p-1"
          >
            <Mic
              size={18}
              color={isFocused ? "#8B5CF6" : "#71717A"}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}
