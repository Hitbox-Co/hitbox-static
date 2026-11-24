import { useAuth } from '@clerk/clerk-expo'
import { router, useLocalSearchParams } from 'expo-router'
import { Check, ShoppingBag } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from 'react-native'

import SignInPopup from '@/components/auth/SignInPopup'
import { describeApiError } from '@/lib/api-errors'
import { formatRewardPoints } from '@/features/products/utils/format'
import { useClearCart, useRemoveCartItem } from '../api/cartMutations'
import { cartErrorMessage, unavailableLabel } from '../api/cartErrors'
import { useCart } from '../api/getCart'
import {
    AmountRow,
    CheckoutShell,
    Divider,
    GroupedCard,
    PageIntro,
    PrimaryAction,
    RarityChip,
    RewardsBox,
    SecondaryLink,
    SectionHeading,
    TotalRow,
} from '../components/CheckoutParts'
import { checkoutActions } from '../store/checkoutStore'
import { CartItemView } from '../types/checkout'
import PriceText from '@/features/market/components/PriceText'
import { usePriceView } from '@/features/market/hooks/usePriceView'
import { formatMoney } from '../utils/money'

/**
 * 01 · Your cart (Figma), on the Cart API (`GET/DELETE /cart`).
 *
 * The cart is a list of drops the buyer means to buy — one unit per row, no
 * quantity, no stored price (price and availability are read live). Each row is
 * paid for on its own, so each has its own Checkout. Delivery, payment and the
 * steps after this screen are still the static mock flow.
 */
export default function CartScreen() {
    // Set by Add to Cart, so the "added" note only shows right after adding.
    const { added, name } = useLocalSearchParams<{ added?: string; name?: string }>()
    const { isLoaded, isSignedIn } = useAuth()
    const [askSignIn, setAskSignIn] = useState(false)

    const cart = useCart()
    const removeItem = useRemoveCartItem()
    const clearCart = useClearCart()

    // Signed out: the cart belongs to an account.
    if (isLoaded && !isSignedIn) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Your cart" subtitle="Sign in to see what you've added." />
                <View className="mt-10 items-center gap-3 px-6">
                    <ShoppingBag size={36} color="#9ca3af" />
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setAskSignIn(true)}
                        className="rounded-[30px] bg-[#111827] px-6 py-3"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">Sign in</Text>
                    </TouchableOpacity>
                </View>
                <SignInPopup
                    open={askSignIn}
                    onOpenChange={setAskSignIn}
                    title="Sign in to see your cart"
                    description="Your cart is saved to your HitBox account."
                />
            </CheckoutShell>
        )
    }

    if (cart.isLoading || !isLoaded) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Your cart" />
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    if (cart.isError || !cart.data) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Your cart" />
                <View className="mt-16 items-center gap-3 px-6">
                    <Text className="text-center font-syne text-sm leading-5 text-[#6b7280]">
                        {cart.error ? describeApiError(cart.error, "Couldn't load your cart.") : "Couldn't load your cart."}
                    </Text>
                    <TouchableOpacity onPress={() => cart.refetch()} className="rounded-[30px] bg-[#111827] px-5 py-2">
                        <Text className="font-syne-bold text-[13px] text-white">Retry</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    const { items, summary } = cart.data

    if (items.length === 0) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Your cart" subtitle="One more piece of your universe." />
                <View className="mt-16 items-center gap-3 px-6">
                    <ShoppingBag size={36} color="#9ca3af" />
                    <Text className="text-center font-syne text-sm text-[#6b7280]">Your cart is empty.</Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)/discover' as never)}
                        className="rounded-[30px] bg-[#111827] px-5 py-2"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">Browse drops</Text>
                    </TouchableOpacity>
                </View>
            </CheckoutShell>
        )
    }

    const onRemove = (item: CartItemView) =>
        removeItem.mutate(item.id, {
            onError: (err) => Alert.alert('Could not remove', cartErrorMessage(err)),
        })

    const onClear = () =>
        Alert.alert('Empty your cart?', 'This removes every item.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Empty cart',
                style: 'destructive',
                onPress: () =>
                    clearCart.mutate(undefined, {
                        onError: (err) => Alert.alert('Could not empty the cart', cartErrorMessage(err)),
                    }),
            },
        ])

    /** Each row is its own order: hand just this drop to the checkout flow. */
    const onCheckout = (item: CartItemView) => {
        checkoutActions.startWith(item.productId, item.variant?.label ?? null, item.variant?.id ?? null)
        router.push('/checkout/delivery' as never)
    }

    // The footer joins currencies; the order summary below lists one line each.
    const subtotalText = summary.subtotals.length
        ? summary.subtotals.map((s) => formatMoney(s.amount, s.currency)).join(' + ')
        : '—'
    // One line per currency: two appear when some rows are priced in another market.
    const subtotalLabel = `Subtotal · ${summary.purchasableCount} item${summary.purchasableCount === 1 ? '' : 's'}`

    const pendingPoints = items.reduce(
        (sum, item) => sum + (item.product?.isPurchasable ? (item.product.rewardPoints ?? 0) : 0),
        0,
    )
    const points = pendingPoints > 0 ? formatRewardPoints(pendingPoints) : null

    return (
        <CheckoutShell
            showBag={false}
            footer={
                <>
                    <View className="w-full">
                        <TotalRow label="Subtotal" value={subtotalText} />
                    </View>
                    <Text className="w-full font-syne text-[10px] leading-[14px] text-[#6b7280]">
                        Each drop is paid for separately — use Checkout on the item you want.
                    </Text>
                    <SecondaryLink label="Continue shopping" onPress={() => router.replace('/(tabs)/discover' as never)} />
                </>
            }
        >
            <PageIntro title="Your cart" subtitle="One more piece of your universe." />

            {added === '1' && (
                <View className="flex-row items-center gap-2 rounded bg-[#eff6ff] p-3">
                    <Check size={16} color="#2563eb" />
                    <Text className="flex-1 font-syne-semibold text-xs leading-[17px] text-[#2563eb]">
                        {name ? `${name} added to your cart` : 'Added to your cart'}
                    </Text>
                </View>
            )}

            <View className="gap-[14px]">
                <SectionHeading
                    title={items.length === 1 ? 'Your drop' : 'Your drops'}
                    action={items.length > 1 ? 'Empty cart' : undefined}
                    onAction={onClear}
                />
                {items.map((item) => (
                    <CartRow
                        key={item.id}
                        item={item}
                        removing={removeItem.isPending && removeItem.variables === item.id}
                        onRemove={() => onRemove(item)}
                        onCheckout={() => onCheckout(item)}
                    />
                ))}
            </View>

            <GroupedCard>
                <SectionHeading title="Order summary" />
                {summary.subtotals.length ? (
                    summary.subtotals.map((s, i) => (
                        <AmountRow
                            key={s.currency}
                            label={i === 0 ? subtotalLabel : `And in ${s.currency}`}
                            value={formatMoney(s.amount, s.currency)}
                        />
                    ))
                ) : (
                    <AmountRow label={subtotalLabel} value="—" />
                )}
                {summary.subtotals.length > 1 && (
                    <Text className="font-syne text-[11px] leading-[16px] text-[#d97706]">
                        Some drops are not sold in your market, so they are priced in another currency.
                    </Text>
                )}
                <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    Delivery and tax are calculated at checkout. Prices are the current ones and can change.
                </Text>
            </GroupedCard>

            {points && <RewardsBox title={`${points} pending with these purchases`} caption="Awarded after successful payment." />}
        </CheckoutShell>
    )
}

/** One cart row: the drop, its variant, live price, state and its own Checkout. */
function CartRow({
    item,
    removing,
    onRemove,
    onCheckout,
}: {
    item: CartItemView
    removing: boolean
    onRemove: () => void
    onCheckout: () => void
}) {
    const product = item.product
    // Not sold in the selected market (the server fell back to another market's price): no Checkout.
    const soldHere = usePriceView(product?.price).soldHere
    const outOfRegion = product?.unavailableReason === 'NOT_AVAILABLE_IN_REGION'

    return (
        <GroupedCard className={outOfRegion ? 'opacity-60' : undefined}>
            {product ? (
                <View className="flex-row items-center gap-3">
                    <View style={{ width: 112, height: 112, borderRadius: 4, overflow: 'hidden', backgroundColor: '#eef2ff' }}>
                        {product.imageUrl ? (
                            <Image source={{ uri: product.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                        ) : null}
                    </View>
                    <View className="flex-1 gap-[5px]">
                        <Text numberOfLines={2} className="font-syne-bold text-[19px] leading-[23px] text-[#111827]">
                            {product.name}
                        </Text>
                        {product.artist && <Text className="font-syne text-[11px] text-[#2563eb]">{product.artist.name}</Text>}
                        {item.variant && <Text className="font-syne text-[11px] text-[#6b7280]">{item.variant.label}</Text>}
                        <View className="flex-row items-center justify-between">
                            {product.price ? (
                                <PriceText price={product.price} className="font-syne-bold text-[17px] text-[#111827]" />
                            ) : (
                                <Text className="font-syne-bold text-[17px] text-[#111827]">—</Text>
                            )}
                            <RarityChip rarity={product.rarity} />
                        </View>
                    </View>
                </View>
            ) : (
                <Text className="font-syne text-xs leading-[18px] text-[#6b7280]">
                    This drop is no longer available.
                </Text>
            )}

            {product && !product.isPurchasable && (
                <View className="rounded border border-[#fcd34d] bg-[#fffaed] px-3 py-2">
                    <Text className="font-syne-semibold text-[11px] text-[#d97706]">
                        {unavailableLabel(product.unavailableReason)}
                    </Text>
                </View>
            )}

            <Divider />

            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => Alert.alert('Save for later', 'Saved items are coming soon.')}
                >
                    <Text className="font-syne-bold text-xs text-[#2563eb]">Save for later</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" hitSlop={8} disabled={removing} onPress={onRemove}>
                    {removing ? (
                        <ActivityIndicator size="small" color="#6b7280" />
                    ) : (
                        <Text className="font-syne text-[11px] text-[#6b7280] underline">Remove</Text>
                    )}
                </TouchableOpacity>
            </View>

            {product && (
                <PrimaryAction label="Checkout" onPress={onCheckout} disabled={!product.isPurchasable || !soldHere} />
            )}
        </GroupedCard>
    )
}
