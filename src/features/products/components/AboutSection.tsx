import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface AboutSectionProps {
  aboutText: string;
  rarity: string;
  supply: number;
  ownedPercentage: number;
}

export default function AboutSection({ aboutText, rarity, supply, ownedPercentage }: AboutSectionProps) {
  const radius = 24;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (ownedPercentage / 100) * circumference;

  return (
    <View className="flex-row items-stretch gap-4">
      {/* Left Column: Details */}
      <View className="flex-[1.3] justify-between pr-1">
        <View className="gap-2">
          <Text className="text-[15px] font-bold text-white">
            About This Item
          </Text>
          <Text className="text-[11px] leading-[18px] text-zinc-400">
            {aboutText}
          </Text>
        </View>

        {/* <TouchableOpacity 
          className="mt-4 border border-zinc-800 bg-transparent rounded-full px-3 py-2 self-start flex-row items-center gap-1.5"
          onPress={() => console.log("Learn more clicked")}
        >
          <Text className="text-[10px] font-black text-zinc-300">
            Learn More About This Collection
          </Text>
          <ChevronRight size={10} color="#a1a1aa" />
        </TouchableOpacity> */}
      </View>

      {/* Right Column: Rarity & Supply Card */}
      <View className="flex-[1] bg-[#110e16]/30 border border-white/5 rounded-[20px] p-3 justify-between">
        {/* Rarity row */}
        {/* <View className="flex-row items-center justify-between border-b border-white/5 pb-2.5">
          <Text className="text-[10px] text-zinc-400 font-semibold">Rarity</Text>
           
          <View className="flex-row items-center gap-1">
            <View className="h-2 w-2 rounded-sm bg-[#a855f7] rotate-45" />
            <Text className="text-[10px] font-bold text-[#a855f7]">{rarity}</Text>
          </View>
        </View> */}

        {/* Supply details and ring chart */}
        <View className="flex-row items-center justify-between pt-3">
          <View className="gap-0.5">
            <Text className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Supply</Text>
            <Text className="text-[20px] font-black text-white leading-none">{supply}</Text>
            <Text className="text-[9px] text-zinc-500 font-medium mt-0.5">Minted</Text>
          </View>

          {/* SVG Progress Ring */}
          <View className="relative items-center justify-center h-[56px] w-[56px]">
            <Svg height="56" width="56" viewBox="0 0 56 56">
              {/* Background Ring */}
              <Circle
                cx="28"
                cy="28"
                r={radius}
                stroke="#1c1626"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Highlight Progress Arc */}
              <Circle
                cx="28"
                cy="28"
                r={radius}
                stroke="#a855f7"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
              />
            </Svg>
            <View className="absolute inset-0 items-center justify-center">
              <Text className="text-[10px] font-black text-white">
                {ownedPercentage}%
              </Text>
            </View>
          </View>
        </View>

        {/* Caption */}
        <Text className="text-[9px] text-zinc-500 font-medium text-right mt-2">
          of supply sold
        </Text>
      </View>
    </View>
  );
}
