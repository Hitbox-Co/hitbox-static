import { LucideIcon } from "lucide-react-native";
import { MotiView } from "moti";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface CategoryCardProps {
  title: string;
  Icon: LucideIcon;
  active?: boolean;
  onPress?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  Icon,
  active = false,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <MotiView
          animate={{
            scale: pressed ? 0.96 : 1,
          }}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 250,
          }}
          className="mr-2.5 overflow-hidden rounded-xl"
        >
          <View
            style={{
              height: 44,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 25,
              paddingHorizontal: 12,
              backgroundColor: active
                ? "#7C3AED"
                : "rgba(255, 255, 255, 0.06)",
              borderWidth: 1,
              borderColor: active
                ? "#8B5CF6"
                : "rgba(255, 255, 255, 0.10)",
              shadowColor: active ? "#7C3AED" : "transparent",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: active ? 0.4 : 0,
              shadowRadius: 8,
              elevation: active ? 4 : 0,
            }}
          >
            {/* Icon Container */}
            {active ? (
              <View
                style={{
                  marginRight: 8,
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  backgroundColor: "rgba(255, 255, 255, 0.18)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={15} color="#ffffff" strokeWidth={2.5} />
              </View>
            ) : (
              <View style={{ marginRight: 8 }}>
                <Icon size={16} color="#D4D4D8" strokeWidth={2} />
              </View>
            )}

            {/* Text */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: active ? "700" : "500",
                color: active ? "#ffffff" : "#F4F4F5",
              }}
            >
              {title}
            </Text>
          </View>
        </MotiView>
      )}
    </Pressable>
  );
};

export default CategoryCard;
