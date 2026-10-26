import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import HistorySection from "./HistorySection";

interface TabSectionProps {
  renderActiveContent: () => React.ReactNode;
  tourId?: string | string[];
}

const TABS = ["Details", "History", "Offers", "Listings"];

export default function TabSection({ renderActiveContent, tourId }: TabSectionProps) {
  const [activeTab, setActiveTab] = useState("Details");

  return (
    <View className="mt-5">
      {/* Tabs Horizontal List */}
      <View className="border-b border-white/5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          className="flex-row"
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className="mr-6 pb-3 relative"
              >
                <Text
                  className={`text-[13px] font-black tracking-wide ${
                    isActive ? "text-[#a855f7]" : "text-zinc-500"
                  }`}
                >
                  {tab}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full bg-[#a855f7]" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content Area */}
      <View className="px-5 mt-4">
        {activeTab === "Details" ? (
          renderActiveContent()
        ) : activeTab === "History" ? (
          <HistorySection tourId={tourId} />
        ) : (
          <View className="py-12 items-center justify-center rounded-[20px] border border-white/5 bg-[#110e16]/30">
            <Text className="text-zinc-500 text-sm font-semibold">
              {activeTab} content is currently empty.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
