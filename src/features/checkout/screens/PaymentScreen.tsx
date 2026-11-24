import { router } from 'expo-router'
import { CreditCard, ShieldCheck } from 'lucide-react-native'
import React from 'react'
import { Text, View } from 'react-native'

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
import { formatMoney } from '../utils/money'
import { useCheckoutPlan } from '../hooks/useCheckoutQuote'

/**
 * 04 · Payment method (Figma). Payment is taken by Stripe's payment sheet, which
 * shows the card form and any wallets the device supports on the next step, so
 * there is nothing to pick or store here.
 */
export default function PaymentScreen() {
    const { item, isLoading, isError, notForSale, refetch } = useCheckoutItem()
    const { quote } = useCheckoutPlan()

    if (!item) {
        return (
            <CheckoutShell>
                <PageIntro title="Payment" />
                <NothingToCheckout loading={isLoading} error={isError} notForSale={notForSale} onRetry={refetch} />
            </CheckoutShell>
        )
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <Text className="w-full pb-1 font-syne text-[11px] text-[#6b7280]">
                        {"You'll review your order before making a payment."}
                    </Text>
                    <View className="w-full">
                        {quote && <TotalRow label={`Order total · ${quote.currency}`} value={formatMoney(quote.totalAmount, quote.currency)} />}
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
                <GroupedCard selected className="gap-[14px]">
                    <View className="flex-row items-center gap-[10px]">
                        <Radio selected />
                        <CreditCard size={18} color="#2563eb" />
                        <Text className="font-syne-bold text-[13px] text-[#111827]">Card</Text>
                    </View>
                    <Divider />
                    <View className="flex-row items-start gap-[10px] pl-7">
                        <ShieldCheck size={16} color="#2563eb" />
                        <Text className="flex-1 font-syne text-[11px] leading-[16px] text-[#6b7280]">
                            You pay securely with Stripe. Card details are entered on the next step and never touch HitBox.
                        </Text>
                    </View>
                </GroupedCard>
            </View>
        </CheckoutShell>
    )
}
