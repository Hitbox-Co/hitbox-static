import { useAuth } from '@clerk/clerk-expo'
import { router } from 'expo-router'
import { Heart } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, TouchableOpacity, View } from 'react-native'

import { describeApiError } from '@/lib/api-errors'
import { useToggleWishlist } from '../api/toggleWishlist'

interface WishlistHeartProps {
    productId: string
    /** From the API: true / false when signed in, null for a guest. */
    isWishlisted: boolean | null
    /** `card` sits on a white chip over the artwork; `hero` is the pink heart on the dark banner. */
    variant?: 'card' | 'hero'
    size?: number
}

/**
 * The heart on a drop. It shows the server's `isWishlisted`; a tap flips it
 * straight away and then asks the server (POST / DELETE `/wishlist`). If that
 * fails the heart goes back and says why. A guest is asked to sign in first —
 * `isWishlisted` is `null` for them, which draws as an outline.
 */
export default function WishlistHeart({ productId, isWishlisted, variant = 'card', size = 13 }: WishlistHeartProps) {
    const { isSignedIn } = useAuth()
    const toggle = useToggleWishlist()
    // What the buyer just chose, held until the refetch brings the same answer back.
    const [pending, setPending] = useState<boolean | null>(null)

    useEffect(() => {
        if (pending !== null && isWishlisted === pending) setPending(null)
    }, [isWishlisted, pending])

    const on = pending ?? isWishlisted === true

    const onPress = () => {
        if (!isSignedIn) {
            Alert.alert('Sign in to save', 'Sign in to add drops to your wishlist.', [
                { text: 'Not now', style: 'cancel' },
                { text: 'Sign in', onPress: () => router.push('/(auth)/register' as never) },
            ])
            return
        }
        const next = !on
        setPending(next)
        toggle.mutate(
            { productId, wishlisted: next },
            {
                onError: (err) => {
                    setPending(null)
                    Alert.alert("Couldn't update your wishlist", describeApiError(err))
                },
            },
        )
    }

    const color = variant === 'hero' ? (on ? '#f43f5e' : '#fda4af') : on ? '#ef4444' : '#374151'
    const fill = variant === 'hero' ? (on ? '#f43f5e' : '#fda4af') : on ? '#ef4444' : 'transparent'

    const icon = <Heart size={size} color={color} fill={fill} />

    if (variant === 'hero') {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={on ? 'Remove from wishlist' : 'Add to wishlist'}
                activeOpacity={0.7}
                hitSlop={10}
                onPress={onPress}
            >
                {icon}
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={on ? 'Remove from wishlist' : 'Add to wishlist'}
            activeOpacity={0.7}
            hitSlop={6}
            onPress={(e) => {
                e.stopPropagation()
                onPress()
            }}
            className="absolute right-[10px] top-[10px] size-[26px] items-center justify-center rounded bg-white/80"
        >
            <View>{icon}</View>
        </TouchableOpacity>
    )
}
