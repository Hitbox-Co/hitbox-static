import { InstagramSvg } from '@/components/icons/InstagramIcon';
import { XSvg } from '@/components/icons/XIcon';
import { YoutubeSvg } from '@/components/icons/YoutubeIcon';
import { MultiBorderImageContainer } from '@/components/MultiBorderImageContainer';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { UserRoundCheck, UserRoundPlus, Verified } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ImageBackground, Text, TouchableOpacity, View } from 'react-native';

import { followErrorMessage, useFollowArtist, useIsFollowingArtist } from '@/features/follows/api/follows';
import { isUuid } from '@/features/follows/api/routes';
import Header from './Header';

export default function ProfileSection({ artist, artistId }: {
    artist: {
        name: string;
        handle: string;
        bio: string
    }
    /** The artist's id (from Discover's creators / drop cards) — drives the real Follow button. */
    artistId?: string
}) {
    const { isSignedIn } = useAuth();
    const isFollowing = useIsFollowingArtist(artistId);
    const followArtist = useFollowArtist();
    // Optimistic: follow/unfollow is idempotent, so the button flips at once.
    const [pending, setPending] = useState<boolean | null>(null);
    const on = pending ?? isFollowing === true;

    const onFollowPress = () => {
        if (!isUuid(artistId)) return;
        if (!isSignedIn) {
            Alert.alert('Sign in to follow', 'Sign in to follow artists.', [
                { text: 'Not now', style: 'cancel' },
                { text: 'Sign in', onPress: () => router.push('/(auth)/register' as never) },
            ]);
            return;
        }
        const next = !on;
        setPending(next);
        followArtist.mutate(
            { artistId, follow: next },
            {
                onSettled: () => setPending(null),
                onError: (err) => Alert.alert("Couldn't update", followErrorMessage(err)),
            },
        );
    };

    return (
        <View className="bg-background w-full">
            {/* Sticky Header Section */}
            <Header />

            {/* Cover Image */}
            <View className="relative w-full h-48 bg-zinc-800">
                <ImageBackground
                    source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1170&auto=format&fit=crop' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* PROFILE IMAGE OVERLAP */}
                <View className="absolute -bottom-[70px] left-6 right-6 z-20 flex-row items-end gap-x-4">

                    {/* Profile Avatar Image */}
                    <MultiBorderImageContainer
                        source={{ uri: 'https://picsum.photos/150/150?random=11' }}
                    />

                    {/* ARTIST NAME & HANDLE WRAPPER */}
                    {/* flex-1 is critical here! It forces the text container to fill the remaining width and wrap lines instead of overflowing the screen */}
                    <View className="flex-1 pb-1">

                        {/* Name and Verification Badge */}
                        <View className="flex-row items-center gap-x-1.5 flex-wrap">
                            <Text className="text-foreground text-2xl font-bold text-left" numberOfLines={1}>
                                {artist.name}
                            </Text>
                            <Verified size={18} color="white" fill="#6d28d9" />
                        </View>

                        {/* Handle */}
                        <Text className="text-muted-foreground text-sm font-medium mt-0.5 text-left" numberOfLines={1}>
                            {artist.handle}
                        </Text>

                        {/* Bio text - now wraps correctly thanks to flex-1 on the parent */}

                    </View>
                </View>
                <Text className="text-foreground px-8 text-sm mt-20 font-normal text-left" numberOfLines={2}>
                    {artist.bio}
                </Text>
            </View>

            {/* MAIN CONTENT BLOCK  */}
            <View className="px-6 pt-[115px] pb-4">

                {/* FOLLOW ACTION BUTTON */}
                <View className="flex-row items-center justify-between mt-4">

                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={on ? 'Unfollow artist' : 'Follow artist'}
                        onPress={onFollowPress}
                        disabled={followArtist.isPending || !isUuid(artistId)}
                        className={`px-5 py-2 gap-x-2 rounded-lg flex-row items-center justify-center ${on ? 'bg-zinc-800 border border-zinc-700' : 'bg-primary'}`}
                    >
                        {on ? <UserRoundCheck size={20} color={"white"} /> : <UserRoundPlus size={20} color={"white"} />}
                        <Text className="text-white font-semibold text-sm items-center flex justify-center">
                            {on ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>

                    {/* Socials Icon */}
                    <View className="flex-row items-start justify-between gap-x-4">

                        <View className="flex-row gap-4 min-w-[70px]">
                            <View className="flex-row items-center gap-x-2">

                                <InstagramSvg />

                            </View>

                            <View className="flex-row items-center gap-x-2">

                                <XSvg />

                            </View>

                            <View className="flex-row items-center gap-x-2">

                                <YoutubeSvg />

                            </View>
                        </View>
                    </View>
                </View>

            </View>
        </View>
    );
}