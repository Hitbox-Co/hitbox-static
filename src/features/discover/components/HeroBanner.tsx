import { ArrowRight } from 'lucide-react-native'
import { MotiView } from 'moti'
import React, { useEffect, useRef, useState } from 'react'
import {
    Dimensions,
    Image,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

import { DiscoverProductItem } from '../types/discover'
import { DISCOVER_PLACEHOLDER_IMAGE, formatRewardPoints } from '../utils/format'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32

interface HeroSlide {
    id: string | number
    title: string
    subtitle: string
    uri: string
}

// Static fallback shown while the discover feed loads (or if it's empty)
const SLIDER_DATA = [
    {
        id: 1,
        title: "Pierce The Veil — Signature Series Poster",
        subtitle: "Earn 12,500 pts with this drop.",
        uri: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
    },
    {
        id: 2,
        title: "Neon Genesis — Limited Edition Drop",
        subtitle: "Earn 10,000 pts with this drop.",
        uri: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200",
    },
    {
        id: 3,
        title: "Midnight Relics — Exclusive Collectible",
        subtitle: "Earn 8,500 pts with this drop.",
        uri: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200",
    },
]

interface HeroBannerProps {
    /** Featured products from GET /api/v1/discover (≤5). Falls back to static slides when absent. */
    items?: DiscoverProductItem[]
    onItemPress?: (item: DiscoverProductItem) => void
}

export default function HeroBanner({ items, onItemPress }: HeroBannerProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const scrollViewRef = useRef<ScrollView>(null)

    const featured = items ?? []
    const slides: HeroSlide[] = featured.length > 0
        ? featured.map((item) => ({
            id: item.id,
            title: item.name,
            subtitle: `Earn ${formatRewardPoints(item.rewardPoints)} with this drop.`,
            uri: item.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE,
        }))
        : SLIDER_DATA

    useEffect(() => {
        if (slides.length < 2) return
        const timer = setInterval(() => {
            const nextIndex = (activeIndex + 1) % slides.length
            setActiveIndex(nextIndex)

            scrollViewRef.current?.scrollTo({
                x: nextIndex * CAROUSEL_WIDTH,
                animated: true,
            })
        }, 4500)

        return () => clearInterval(timer)
    }, [activeIndex, slides.length])

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x
        const currentIndex = Math.round(scrollOffset / CAROUSEL_WIDTH)
        if (currentIndex !== activeIndex && currentIndex >= 0 && currentIndex < slides.length) {
            setActiveIndex(currentIndex)
        }
    }

    return (
        <View className="mt-4 mx-4">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={CAROUSEL_WIDTH}
            >
                {slides.map((item, slideIndex) => (
                    <View
                        key={item.id}
                        style={{
                            width: CAROUSEL_WIDTH,
                            height: 200,
                            borderRadius: 20,
                            backgroundColor: "#13101C",
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.08)",
                        }}
                        className="overflow-hidden p-4 flex-row justify-between items-center"
                    >
                        {/* Left Content Column */}
                        <View className="flex-1 justify-between h-full pr-3 py-1">
                            <View>
                                {/* Featured Badge */}
                                <View
                                    style={{
                                        alignSelf: "flex-start",
                                        backgroundColor: "#7C3AED",
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        borderRadius: 6,
                                    }}
                                >
                                    <Text className="text-[9px] font-extrabold tracking-wider text-white">
                                        FEATURED
                                    </Text>
                                </View>

                                {/* Title */}
                                <Text
                                    numberOfLines={2}
                                    style={{
                                        fontSize: 17,
                                        fontWeight: "800",
                                        color: "#FFFFFF",
                                        marginTop: 8,
                                        lineHeight: 22,
                                    }}
                                >
                                    {item.title}
                                </Text>

                                {/* Subtitle */}
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 12,
                                        color: "#A1A1AA",
                                        marginTop: 4,
                                    }}
                                >
                                    {item.subtitle}
                                </Text>
                            </View>

                            {/* Explore Button */}
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    const product = featured[slideIndex]
                                    if (product) onItemPress?.(product)
                                }}
                                style={{
                                    alignSelf: "flex-start",
                                    backgroundColor: "#7C3AED",
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 10,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    shadowColor: "#7C3AED",
                                    shadowOffset: { width: 0, height: 3 },
                                    shadowOpacity: 0.35,
                                    shadowRadius: 6,
                                    elevation: 3,
                                }}
                            >
                                <Text className="text-white font-bold text-xs mr-1.5">
                                    Explore Collection
                                </Text>
                                <ArrowRight size={13} color="#FFFFFF" strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        {/* Right Poster Artwork */}
                        <View
                            style={{
                                width: 110,
                                height: 160,
                                borderRadius: 12,
                                overflow: "hidden",
                                backgroundColor: "#1C1929",
                                borderWidth: 1,
                                borderColor: "rgba(255, 255, 255, 0.12)",
                                shadowColor: "#000000",
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                                elevation: 6,
                            }}
                        >
                            <Image
                                source={{ uri: item.uri }}
                                resizeMode="cover"
                                className="w-full h-full"
                            />
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Pagination Indicators */}
            <View className="flex-row justify-center items-center mt-3">
                {slides.map((_, index) => {
                    const isActive = index === activeIndex
                    return (
                        <MotiView
                            key={index}
                            animate={{
                                width: isActive ? 20 : 6,
                                backgroundColor: isActive ? "#A855F7" : "rgba(255, 255, 255, 0.25)",
                            }}
                            transition={{
                                type: "spring",
                                damping: 15,
                                stiffness: 200,
                            }}
                            style={{
                                height: 6,
                                borderRadius: 3,
                                marginHorizontal: 3,
                            }}
                        />
                    )
                })}
            </View>
        </View>
    )
}