import { LucideProps } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import Svg, { Circle } from 'react-native-svg';

export const CollectionProgressSection = ({ artist }: {
    artist: {
        name: string;
        handle: string;
        bio: string;
        stats: {
            label: string;
            value: number;
            icon: React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>;
        }[];
        collectionProgress: {
            id: string;
            title: string;
            series: string;
            progress: number; // Native number input from database
            count: string;
            bg: string;
        }[];
        featuredRewards: {
            id: string;
            type: string;
            title: string;
            subtitle: string;
            progress: string;
            bg: string;
        }[];
        latestReleases: {
            id: string;
            title: string;
            type: string;
            price: string;
            bg: string;
        }[];
        upcomingEvent: {
            date: string;
            title: string;
            location: string;
            perk: string;
        };
    }
}) => {

    const size = 32;
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mb-6">
            {artist.collectionProgress.map((item) => {
                // Safely clamp progress number boundaries between 0 and 100
                const percentage = Math.min(Math.max(item.progress || 0, 0), 100);

                // Dynamically calculate structural line offset gap length
                const strokeDashoffset = circumference - (percentage / 100) * circumference;

                return (
                    <View key={item.id} className="bg-white rounded p-3 mr-4 w-52 border border-[#dbeafe]">
                        <Image source={{ uri: item.bg }} className="w-full h-24 rounded mb-3" />

                        <Text className="text-[#111827] font-syne-bold text-sm" numberOfLines={1}>{item.title}</Text>
                        <Text className="text-[#6b7280] font-syne text-xs mb-3">{item.series}</Text>

                        {/* Progress Layout Section */}
                        <View className="flex-row items-center gap-x-3">

                            {/* Circular SVG Progress Ring with explicit native rotation style */}
                            <View style={{ transform: [{ rotate: '-90deg' }] }}>
                                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                                    {/* Background Track Circle */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="#dbeafe"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                    />
                                    {/* Active Dynamic Progress Ring */}
                                    <Circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        stroke="#2563eb"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                    />
                                </Svg>
                            </View>

                            {/* Label Text Track Stack layout matching image_de5659.png */}
                            <View className="flex-1">
                                <Text className="text-[#111827] font-syne-bold text-sm leading-tight">{percentage}%</Text>
                                <Text className="text-[#6b7280] font-syne text-[11px] mt-0.5">{item.count}</Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
};