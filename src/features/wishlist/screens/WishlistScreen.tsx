import { useAuth } from '@clerk/clerk-expo'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Alert, Switch, Text, TouchableOpacity, View } from 'react-native'

import { useAddToCart } from '@/features/checkout/api/cartMutations'
import { CheckoutShell, GroupedCard, PageIntro } from '@/features/checkout/components/CheckoutParts'
import { DISCOVER_PLACEHOLDER_IMAGE, formatDiscoverPrice } from '@/features/discover/utils/format'
import { describeApiError } from '@/lib/api-errors'
import ForbiddenNote from '@/features/auth/components/ForbiddenNote'
import { useRemoveWishlistItem, useUpdateWishlistItem, useWishlistInfinite } from '../api/wishlist'
import { WishlistItemView } from '../types/wishlist'
import { unavailableLabel } from '../utils/format'

/**
 * Wishlist — the drops the buyer saved, newest first (`GET /api/v1/wishlist`,
 * 20 at a time). Rows stay when a drop ends, so each shows its current state:
 * buyable ones get Add to cart, the rest are greyed with the reason.
 */
export default function WishlistScreen() {
    const { isLoaded, isSignedIn } = useAuth()
    const wishlist = useWishlistInfinite()
    const items = wishlist.data?.pages.flatMap((page) => page.data) ?? []
    const total = wishlist.data?.pages[0]?.meta.total ?? 0

    if (isLoaded && !isSignedIn) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Wishlist" subtitle="Sign in to see your saved drops." />
                <View className="mt-10 items-center">
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => router.push('/(auth)/register' as never)}
                        className="rounded-[30px] bg-[#111827] px-6 py-3"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">Sign in</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell showBag={false}>
            <PageIntro
                title="Wishlist"
                subtitle={total > 0 ? `${total} saved drop${total === 1 ? '' : 's'}` : 'Drops you save appear here.'}
            />

            {(wishlist.isLoading || !isLoaded) && (
                <View className="mt-16 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            )}

            {wishlist.isError && !wishlist.isLoading && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {describeApiError(wishlist.error, "Couldn't load your wishlist.")}
                    </Text>
                    <ForbiddenNote error={wishlist.error} />
                    <TouchableOpacity onPress={() => wishlist.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!wishlist.isLoading && !wishlist.isError && items.length === 0 && (
                <View className="mt-12 items-center gap-3 px-6">
                    <Heart size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        Nothing saved yet. Tap the heart on a drop to keep it here.
                    </Text>
                </View>
            )}

            {items.map((item) => (
                <WishlistRow key={item.id} item={item} />
            ))}

            {wishlist.hasNextPage && (
                <TouchableOpacity
                    onPress={() => wishlist.fetchNextPage()}
                    disabled={wishlist.isFetchingNextPage}
                    activeOpacity={0.8}
                    className="h-12 items-center justify-center rounded-[30px] border border-[#bfdbfe] bg-[#eff6ff]"
                >
                    {wishlist.isFetchingNextPage ? (
                        <ActivityIndicator size="small" color="#2563eb" />
                    ) : (
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Load More</Text>
                    )}
                </TouchableOpacity>
            )}
        </CheckoutShell>
    )
}

function WishlistRow({ item }: { item: WishlistItemView }) {
    const update = useUpdateWishlistItem()
    const remove = useRemoveWishlistItem()
    const addToCart = useAddToCart()
    const product = item.product

    const fail = (title: string) => (err: unknown) => Alert.alert(title, describeApiError(err))

    // The drop row is gone: nothing to show but a way to clear the entry.
    if (!product) {
        return (
            <GroupedCard>
                <View className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 font-syne text-[12px] text-[#6b7280]">This drop is no longer available.</Text>
                    <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel="Remove from wishlist"
                        onPress={() => remove.mutate(item.id, { onError: fail("Couldn't remove it") })}
                        disabled={remove.isPending}
                    >
                        <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </GroupedCard>
        )
    }

    const price = formatDiscoverPrice(product.price)
    const reason = unavailableLabel(product.unavailableReason, product.status)
    const artist = product.artist?.name

    const open = () => {
        if (!product.isViewable) return
        router.push({ pathname: '/discover/[productId]', params: { productId: product.id } } as never)
    }

    const add = () =>
        addToCart.mutate(
            { productId: item.productId, variantId: item.variant?.id },
            {
                onSuccess: () => Alert.alert('Added to cart', product.name),
                onError: fail("Couldn't add to cart"),
            },
        )

    return (
        <GroupedCard>
            <View style={{ opacity: product.isPurchasable ? 1 : 0.6 }} className="flex-row gap-3">
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open ${product.name}`} onPress={open} disabled={!product.isViewable}>
                    <Image
                        source={{ uri: product.imageUrl ?? DISCOVER_PLACEHOLDER_IMAGE }}
                        style={{ width: 72, height: 72, borderRadius: 8, backgroundColor: '#eef2ff' }}
                        contentFit="cover"
                    />
                </TouchableOpacity>
                <View className="flex-1 gap-0.5">
                    <Text numberOfLines={2} className="font-syne-bold text-[13px] text-[#111827]">{product.name}</Text>
                    {!!artist && <Text numberOfLines={1} className="font-syne text-[11px] text-[#6b7280]">{artist}</Text>}
                    {item.variant && (
                        <Text numberOfLines={1} className="font-syne-semibold text-[11px] text-[#2563eb]">{item.variant.label}</Text>
                    )}
                    {!!price && <Text className="font-syne-bold text-[14px] text-[#111827]">{price}</Text>}
                </View>
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Remove from wishlist"
                    hitSlop={8}
                    onPress={() => remove.mutate(item.id, { onError: fail("Couldn't remove it") })}
                    disabled={remove.isPending}
                    className="h-8 w-8 items-center justify-center"
                >
                    {remove.isPending ? <ActivityIndicator size="small" color="#ef4444" /> : <Trash2 size={17} color="#ef4444" />}
                </TouchableOpacity>
            </View>

            {reason ? (
                <View className="self-start rounded border border-[#e5e7eb] bg-[#f3f4f6] px-[10px] py-[4px]">
                    <Text className="font-syne-bold text-[10px] text-[#6b7280]">{reason.toUpperCase()}</Text>
                </View>
            ) : (
                <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${product.name} to cart`}
                    activeOpacity={0.85}
                    onPress={add}
                    disabled={addToCart.isPending}
                    className="h-11 flex-row items-center justify-center gap-2 rounded-[30px] bg-[#2563eb]"
                    style={{ opacity: addToCart.isPending ? 0.6 : 1 }}
                >
                    <ShoppingBag size={15} color="#fff" />
                    <Text className="font-syne-bold text-[13px] text-white">{addToCart.isPending ? 'Adding…' : 'Add to cart'}</Text>
                </TouchableOpacity>
            )}

            {/* Stored so the toggle can show; nothing sends the alert yet. */}
            <View className="flex-row items-center justify-between">
                <Text className="font-syne text-[11px] text-[#6b7280]">Tell me when it&apos;s available</Text>
                <Switch
                    accessibilityLabel="Notify me when available"
                    value={item.notifyOnAvailable}
                    disabled={update.isPending}
                    onValueChange={(on) =>
                        update.mutate({ itemId: item.id, notifyOnAvailable: on }, { onError: fail("Couldn't update the alert") })
                    }
                />
            </View>
        </GroupedCard>
    )
}
