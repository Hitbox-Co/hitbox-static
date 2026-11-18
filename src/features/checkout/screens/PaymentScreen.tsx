import { router } from 'expo-router'
import { CreditCard, Plus, Wallet } from 'lucide-react-native'
import React from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'

import { MOCK_SAVED_CARD } from '../data/mockCheckout'
import {
    CheckoutProgress,
    CheckoutShell,
    Divider,
    GroupedCard,
    NothingToCheckout,
    OrderItemRow,
    PageIntro,
    PrimaryAction,
    SectionHeading,
    TotalRow,
} from '../components/CheckoutParts'
import { Radio } from '../components/Radio'
import { useCheckoutItem } from '../hooks/useCheckoutItem'
import { checkoutActions, useCheckoutState } from '../store/checkoutStore'
import { formatUsd } from '../utils/money'

/** 04 · Payment method (Figma). Saved card and wallets are mock until a payments API exists. */
export default function PaymentScreen() {
    const { item, totals, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const { paymentMethod } = useCheckoutState()

    if (!item || !totals) {
        return (
            <CheckoutShell>
                <PageIntro title="Payment" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    const cardSelected = paymentMethod === 'card'

    return (
        <CheckoutShell
            footer={
                <>
                    <Text className="w-full pb-1 font-syne text-[11px] text-[#6b7280]">
                        {"You'll review your order before making a payment."}
                    </Text>
                    <View className="w-full">
                        <TotalRow label="Order total · USD" value={formatUsd(totals.total)} />
                    </View>
                    <PrimaryAction label="Continue to review" onPress={() => router.push('/checkout/review' as never)} />
                </>
            }
        >
            <CheckoutProgress stage={2} />
            <PageIntro title="Payment" subtitle="Choose how you'd like to pay." />
            <OrderItemRow item={item} />

            <View className="gap-[10px]">
                <SectionHeading title="Payment method" />

                <TouchableOpacity
                    accessibilityRole="radio"
                    accessibilityState={{ selected: cardSelected }}
                    activeOpacity={0.9}
                    onPress={() => checkoutActions.selectPayment('card')}
                >
                    <GroupedCard selected={cardSelected} className="gap-[14px]">
                        <View className="flex-row items-center gap-[10px]">
                            <Radio selected={cardSelected} />
                            <CreditCard size={18} color="#2563eb" />
                            <Text className="font-syne-bold text-[13px] text-[#111827]">{MOCK_SAVED_CARD.brand}</Text>
                        </View>
                        <Divider />
                        <View className="gap-[10px] pl-7">
                            <Text className="font-syne text-[10px] tracking-[0.5px] text-[#6b7280]">SAVED CARD</Text>
                            <Text className="font-syne-bold text-base tracking-[1px] text-[#111827]">
                                {`••••  ••••  ••••  ${MOCK_SAVED_CARD.last4}`}
                            </Text>
                            <Text className="font-syne text-xs text-[#111827]">{MOCK_SAVED_CARD.holder}</Text>
                            <Text className="font-syne text-[11px] text-[#6b7280]">Expiry •• / ••</Text>
                            <TouchableOpacity
                                accessibilityRole="button"
                                activeOpacity={0.7}
                                onPress={() => Alert.alert('Add a card', 'Adding a card is coming soon.')}
                                className="flex-row items-center gap-[6px] pt-1"
                            >
                                <Plus size={14} color="#2563eb" />
                                <Text className="font-syne-bold text-xs text-[#2563eb]">Add a different card</Text>
                            </TouchableOpacity>
                        </View>
                    </GroupedCard>
                </TouchableOpacity>

                <GroupedCard className="gap-0 py-0">
                    <WalletOption
                        label="Apple Pay"
                        selected={paymentMethod === 'apple_pay'}
                        onPress={() => checkoutActions.selectPayment('apple_pay')}
                    />
                    <Divider />
                    <WalletOption
                        label="Google Pay"
                        selected={paymentMethod === 'google_pay'}
                        onPress={() => checkoutActions.selectPayment('google_pay')}
                    />
                </GroupedCard>
            </View>
        </CheckoutShell>
    )
}

function WalletOption({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            activeOpacity={0.8}
            onPress={onPress}
            className="h-[55px] flex-row items-center gap-3"
        >
            <Radio selected={selected} />
            <Wallet size={18} color="#2563eb" />
            <Text className="font-syne-medium text-[13px] text-[#111827]">{label}</Text>
        </TouchableOpacity>
    )
}
