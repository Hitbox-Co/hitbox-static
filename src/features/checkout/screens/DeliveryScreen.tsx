import { router } from 'expo-router'
import { Plus, Truck } from 'lucide-react-native'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

import { paymentErrorMessage } from '@/features/payments/api/errors'
import {
    CheckoutProgress,
    CheckoutShell,
    GroupedCard,
    NothingToCheckout,
    OrderItemRow,
    PageIntro,
    PrimaryAction,
    SecondaryLink,
    SectionHeading,
} from '../components/CheckoutParts'
import { AddressLines } from '../components/AddressLines'
import { QuoteSummary } from '../components/QuoteSummary'
import { Radio } from '../components/Radio'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { useCheckoutPlan } from '../hooks/useCheckoutQuote'
import { checkoutActions } from '../store/checkoutStore'

/** 02 · Delivery (Figma). Buy Now enters here and skips the cart. Addresses are the buyer's saved address book. */
export default function DeliveryScreen() {
    const { item, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const plan = useCheckoutPlan()
    const { address, addresses, quote } = plan

    if (!item) {
        return (
            <CheckoutShell>
                <PageIntro title="Delivery" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const canContinue = !!address && quote?.availability === 'IN_STOCK'

    return (
        <CheckoutShell
            footer={
                <>
                    <PrimaryAction
                        label="Continue to payment"
                        disabled={!canContinue}
                        onPress={() => router.push('/checkout/payment' as never)}
                    />
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
                    action={address ? 'Edit' : undefined}
                    onAction={address ? () => router.push({ pathname: '/checkout/address', params: { edit: address.id } } as never) : undefined}
                />
                {plan.addressesLoading ? (
                    <ActivityIndicator color="#2563eb" />
                ) : plan.addressesError ? (
                    <Text className="font-syne text-xs text-[#dc2626]">Could not load your addresses. Pull back and try again.</Text>
                ) : (
                    addresses.map((a) => {
                        const selected = a.id === address?.id
                        return (
                            <TouchableOpacity
                                key={a.id}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                activeOpacity={0.85}
                                onPress={() => checkoutActions.selectAddress(a.id)}
                            >
                                <GroupedCard selected={selected}>
                                    <View className="flex-row items-start gap-3">
                                        <Radio selected={selected} />
                                        <AddressLines address={a} />
                                    </View>
                                </GroupedCard>
                            </TouchableOpacity>
                        )
                    })
                )}
                {!plan.addressesLoading && addresses.length === 0 && !plan.addressesError && (
                    <Text className="font-syne text-xs leading-[17px] text-[#6b7280]">
                        Add a delivery address to continue. It is also used for billing, which decides the tax on your invoice.
                    </Text>
                )}
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
                        <Text className="font-syne-bold text-xs text-[#2563eb]">Free</Text>
                    </View>
                </GroupedCard>
            </View>

            {plan.quoteLoading && <ActivityIndicator color="#2563eb" />}
            {plan.quoteError != null && (
                <Text className="font-syne text-xs text-[#dc2626]">{paymentErrorMessage(plan.quoteError)}</Text>
            )}
            {quote && <QuoteSummary quote={quote} />}
        </CheckoutShell>
    )
}
