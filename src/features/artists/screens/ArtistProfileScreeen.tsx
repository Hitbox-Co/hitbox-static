import { useLocalSearchParams } from 'expo-router';
import { Box, Calendar, ChevronRight, ShoppingBag, Sparkles, Trophy } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { CollectionProgressSection } from '../components/CollectionProgressSection';
import ProfileSection from '../components/ProfileSection';

const DUMMY_ARTIST_DATA = {
    name: 'Pierce The Veil',
    handle: '@piercetheveil',
    bio: 'Official collections, experiences, and rewards from Pierce The Veil.',
    stats: [
        { label: 'Collections', value: 8, icon: Box },
        { label: 'Products', value: 143, icon: ShoppingBag },
        { label: 'Rewards', value: 12, icon: Trophy },
        { label: 'Experiences', value: 7, icon: Sparkles },
        { label: 'Events', value: 3, icon: Calendar },
    ],
    collectionProgress: [
        { id: '1', title: 'Warped Tour 2026', series: 'Signature Series', progress: 8, count: '8 / 140', bg: 'https://picsum.photos/300/200?random=1' },
        { id: '2', title: 'Misadventures', series: 'Album Collection', progress: 91, count: '21 / 23', bg: 'https://picsum.photos/300/200?random=2' },
        { id: '3', title: 'Collide With The Sky', series: 'Classic Series', progress: 42, count: '10 / 24', bg: 'https://picsum.photos/300/200?random=3' },
    ],
    featuredRewards: [
        { id: '1', type: 'REWARD', title: 'Backstage Access', subtitle: 'Warped Tour 2026', progress: '15 / 140', bg: 'https://picsum.photos/200/300?random=4' },
        { id: '2', type: 'EXPERIENCE', title: 'VIP Meet & Greet', subtitle: 'Signature Series', progress: '117 / 150', bg: 'https://picsum.photos/200/300?random=5' },
        { id: '3', type: 'REWARD', title: 'Exclusive Music Video', subtitle: 'Misadventures', progress: '21 / 23', bg: 'https://picsum.photos/200/300?random=6' },
    ],
    latestReleases: [
        { id: '1', title: 'Warped Tour 2026', type: 'VIP Laminate', price: '1,250', bg: 'https://picsum.photos/200/200?random=7' },
        { id: '2', title: 'PTV Funko Pop! #02', type: 'Pierce The Veil', price: '850', bg: 'https://picsum.photos/200/200?random=8' },
        { id: '3', title: 'Pierce The Veil', type: 'Signature Series Pack', price: '3,200', bg: 'https://picsum.photos/200/200?random=9' },
    ],
    upcomingEvent: {
        date: 'JUN 18',
        title: 'Pierce The Veil Live',
        location: 'The Forum, Los Angeles, CA',
        perk: 'Exclusive Experience Available'
    }
};

export default function ArtistProfileScreen() {
    const { artistId } = useLocalSearchParams();
    const artist = DUMMY_ARTIST_DATA;

    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>

            {/* Header Hero Background, Follow Button & Socials */}
            <ProfileSection artistId={typeof artistId === 'string' ? artistId : undefined} artist={{
                name: DUMMY_ARTIST_DATA.name,
                handle: DUMMY_ARTIST_DATA.handle,
                bio: DUMMY_ARTIST_DATA.bio
            }} />


            {/* Stats Row Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-4 px-2 border-y border-[#dbeafe]">
                {artist.stats.map((stat, idx) => {
                    const IconComponent = stat.icon;
                    return (
                        <View key={idx} className="items-center justify-center mx-3 w-16">
                            <View className="bg-[#eff6ff] p-2 rounded mb-1 items-center justify-center w-12 h-12 border border-[#dbeafe]">
                                <IconComponent size={20} color="#2563eb" />
                            </View>
                            <Text className="text-[#111827] text-base font-syne-bold">{stat.value}</Text>
                            <Text className="text-[#6b7280] font-syne text-[10px] text-center mt-0.5">{stat.label}</Text>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Your Collection Progress */}
            <SectionHeader title="Your Collection Progress" actionText="View All Collections" />
            <CollectionProgressSection artist={artist} />

            {/* Featured Rewards & Experiences */}
            <SectionHeader title="Featured Rewards & Experiences" actionText="View All" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mb-6">
                {artist.featuredRewards.map((item) => {

                    const [current, total] = item.progress
                        .replace(/[^\d/]/g, '') // strip out non-numeric characters if any remain
                        .split('/')
                        .map(Number);

                    const progressPercent = total ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;

                    return (
                        <View key={item.id} className="bg-white rounded p-2 mr-4 w-40 border border-[#dbeafe] relative">
                            <Image source={{ uri: item.bg }} className="w-full h-32 rounded mb-2" />

                            <Badge className="bg-[#2563eb] border-transparent absolute top-4 left-4 px-2 py-0.5 rounded">
                                <Text className="text-white text-[9px] font-syne-bold">{item.type}</Text>
                            </Badge>

                            <Text className="text-[#111827] font-syne-bold text-xs" numberOfLines={1}>{item.title}</Text>
                            <Text className="text-[#6b7280] font-syne text-[11px] mb-2">{item.subtitle}</Text>

                            {/* Dynamic Progress Bar Track */}
                            <View className="w-full h-[3px] bg-[#dbeafe] rounded-full mb-2 overflow-hidden">
                                <View
                                    className="h-full bg-[#2563eb] rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </View>

                            <Text className="text-[#2563eb] text-xs font-syne-bold">{item.progress}</Text>
                        </View>
                    );
                })}
            </ScrollView>

            {/*  Latest Releases */}
            <SectionHeader title="Latest Releases" actionText="View All" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-4 mb-6">
                {artist.latestReleases.map((item) => (
                    <View key={item.id} className="bg-white rounded p-2 mr-4 w-36 border border-[#dbeafe] relative">
                        <Image source={{ uri: item.bg }} className="w-full h-32 rounded mb-2" />
                        <Badge className="bg-[#2563eb] border-transparent absolute top-4 left-4 px-1.5 py-0.5 rounded">
                            <Text className="text-white text-[9px] font-syne-bold">NEW</Text>
                        </Badge>
                        <Text className="text-[#111827] font-syne-bold text-xs" numberOfLines={1}>{item.title}</Text>
                        <Text className="text-[#6b7280] font-syne text-[11px] mb-2" numberOfLines={1}>{item.type}</Text>
                        <Text className="text-[#2563eb] text-xs font-syne-bold">{item.price}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Upcoming Events */}
            {/* <SectionHeader title="Upcoming Events" actionText="View All" /> */}

            {
                // [0, 1, 2, 3].map((_, index) => (
                //     // <View key={index} className="mx-4 mb-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 flex-row items-center justify-between gap-x-3">
                //     //     <View className="flex-row items-center gap-x-3 flex-1">

                //     //         {/* Premium Date Box with Purple Outline */}
                //     //         <View className="border border-purple-500/30 bg-zinc-950/80 rounded-xl items-center justify-center w-10 h-14">
                //     //             <Text className="text-purple-500 text-[9px] font-bold tracking-widest">JUN</Text>
                //     //             <Text className="text-white text-sm font-bold mt-0.5">
                //     //                 {artist.upcomingEvent.date.split(' ')[1]}
                //     //             </Text>
                //     //         </View>

                //     //         {/* Event Thumbnail Image */}
                //     //         <Image
                //     //             source={{ uri: artist.latestReleases[0]?.bg }}
                //     //             className="w-16 h-14 rounded-xl bg-zinc-800"
                //     //             resizeMode="cover"
                //     //         />

                //     //         {/* Event Info Stack */}
                //     //         <View className="flex-1 justify-center">
                //     //             <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                //     //                 {artist.upcomingEvent.title}
                //     //             </Text>
                //     //             <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
                //     //                 {artist.upcomingEvent.location}
                //     //             </Text>
                //     //             <Text className="text-purple-400 text-[11px] font-medium mt-1.5" numberOfLines={1}>
                //     //                 💎 {artist.upcomingEvent.perk}
                //     //             </Text>
                //     //         </View>
                //     //     </View>

                //     //     {/* View Event Outline Button */}
                //     //     {/* <TouchableOpacity className="border border-purple-500/40 bg-purple-500/5 px-4 py-2 rounded-xl h-10 justify-center">
                //     //         <Text className="text-purple-400 text-[10px] font-bold">View Event</Text>
                //     //     </TouchableOpacity> */}
                //     // </View>
                // ))
            }


        </ScrollView>
    );
}

const SectionHeader = ({ title, actionText }: { title: string, actionText: string }) => (
    <View className="flex-row justify-between items-center px-4 py-4">
        <Text className="text-[#111827] font-orbitron text-[13px]">{title}</Text>
        <TouchableOpacity className="flex-row items-center">
            <Text className="text-[#2563eb] text-xs font-syne-bold mr-0.5">{actionText}</Text>
            <ChevronRight size={14} color="#2563eb" />
        </TouchableOpacity>
    </View>
);