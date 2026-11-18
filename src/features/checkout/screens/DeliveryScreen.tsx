import { router } from 'expo-router'
import { Plus, Truck } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { MOCK_DELIVERY_FEE_USD } from '../data/mockCheckout'
import {
    AmountRow,
    CheckoutProgress,
    CheckoutShell,
    Divider,
    GroupedCard,
    NothingToCheckout,
    OrderItemRow,
    PageIntro,
    PrimaryAction,
    SecondaryLink,
    SectionHeading,
    TotalRow,
} from '../components/CheckoutParts'
import { Radio } from '../components/Radio'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { checkoutActions, useCheckoutState } from '../store/checkoutStore'
import { formatUsd } from '../utils/money'
import { AddressLines } from '../components/AddressLines'

/** 02 · Delivery (Figma). Buy Now enters here and skips the cart. */
export default function DeliveryScreen() {
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const { addresses, selectedAddressId } = useCheckoutState()

    if (!item || !totals) {
        return (
            <CheckoutShell>
                <PageIntro title="Delivery" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <PrimaryAction label="Continue to payment" onPress={() => router.push('/checkout/payment' as never)} />
                    <SecondaryLink label="Back to shopping" onPress={() => router.replace('/(tabs)/discover' as never)} />
                </>
            }
        >
            <CheckoutProgress stage={1} />
            <PageIntro title="Delivery" />
            <OrderItemRow item={item} />

            <View className="gap-[10px]">
                <SectionHeading
                    title="Deliver to"
                    action="Change"
                    onAction={() => router.push({ pathname: '/checkout/address', params: { edit: selectedAddressId } } as never)}
                />
                {addresses.map((address) => {
                    const selected = address.id === selectedAddressId
                    return (
                        <TouchableOpacity
                            key={address.id}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            activeOpacity={0.85}
                            onPress={() => checkoutActions.selectAddress(address.id)}
                        >
                            <GroupedCard selected={selected}>
                                <View className="flex-row items-start gap-3">
                                    <Radio selected={selected} />
                                    <AddressLines address={address} />
                                </View>
                            </GroupedCard>
                        </TouchableOpacity>
                    )
                })}
                <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.7}
                    onPress={() => router.push('/checkout/address' as never)}
                    className="h-6 flex-row items-center gap-[6px]"
                >
                    <Plus size={14} color="#2563eb" />
                    <Text className="font-syne-bold text-xs text-[#2563eb]">Add a new address</Text>
                </TouchableOpacity>
            </View>

            <View className="gap-[10px]">
                <SectionHeading title="Delivery method" />
                <GroupedCard selected>
                    <View className="flex-row items-center gap-[10px]">
                        <Radio selected />
                        <Truck size={18} color="#2563eb" />
                        <View className="flex-1 gap-[3px]">
                            <Text className="font-syne-bold text-xs text-[#111827]">Standard delivery</Text>
                            <Text className="font-syne text-[10px] text-[#6b7280]">Delivery updates with your order</Text>
                        </View>
                        <Text className="font-syne-bold text-xs text-[#2563eb]">{formatUsd(MOCK_DELIVERY_FEE_USD)}</Text>
                    </View>
                </GroupedCard>
            </View>

            <View className="gap-[10px]">
                <AmountRow label={`Subtotal · ${item.quantity} item${item.quantity === 1 ? '' : 's'}`} value={formatUsd(totals.subtotal)} />
                <AmountRow label="Standard delivery" value={formatUsd(totals.delivery)} />
                <AmountRow label="Tax" value={formatUsd(totals.tax)} />
                <Divider />
                <TotalRow label="Total · USD" value={formatUsd(totals.total)} />
            </View>
        </CheckoutShell>
    )
}
