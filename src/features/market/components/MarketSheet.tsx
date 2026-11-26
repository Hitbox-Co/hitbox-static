import { Check } from 'lucide-react-native'
import React from 'react'
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native'

import { Market } from '@/features/payments/types/payments'
import { marketActions } from '../store/marketStore'
import { flagEmoji, marketLabel } from '../utils/format'

/**
 * Bottom sheet listing the markets. "Automatic (based on my address)" sits on top
 * and switches back to deriving the market; any market below it is a manual choice.
 *
 * `onlyIds` narrows the list (and hides Automatic) — used when the server says a
 * drop is only sold in some markets (`ORDERS_NO_PRICE` → `details.marketIds`).
 */
export default function MarketSheet({
    visible,
    onClose,
    markets,
    selectedId,
    automatic,
    onlyIds,
    onChosen,
}: {
    visible: boolean
    onClose: () => void
    markets: Market[]
    /** The market in use now. */
    selectedId?: string
    /** True when the current market is derived rather than chosen. */
    automatic: boolean
    onlyIds?: string[]
    /** Called after a choice, e.g. to retry the call that needed a market. */
    onChosen?: (marketId: string | null) => void
}) {
    const options = onlyIds ? markets.filter((m) => onlyIds.includes(m.id)) : markets

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable accessibilityLabel="Close" onPress={onClose} className="flex-1 bg-black/40" />
            <View className="rounded-t-2xl bg-white px-5 pb-8 pt-4">
                <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#d1d5db]" />
                <Text className="font-syne-bold text-base text-[#111827]">Market</Text>
                <Text className="mb-3 mt-1 font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    {onlyIds
                        ? 'This drop is sold in these markets. Pick one to see its price.'
                        : 'Prices and currency come from one market.'}
                </Text>

                {!onlyIds && (
                    <Option
                        label="Automatic (based on my address)"
                        selected={automatic}
                        onPress={() => {
                            marketActions.chooseAutomatic()
                            onChosen?.(null)
                            onClose()
                        }}
                    />
                )}
                {options.map((m) => (
                    <Option
                        key={m.id}
                        label={`${flagEmoji(m.countryCodes[0])}  ${marketLabel(m)}`}
                        selected={!automatic && m.id === selectedId}
                        onPress={() => {
                            marketActions.chooseManual(m.id)
                            onChosen?.(m.id)
                            onClose()
                        }}
                    />
                ))}
            </View>
        </Modal>
    )
}

function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            activeOpacity={0.8}
            onPress={onPress}
            className="h-12 flex-row items-center justify-between border-b border-[#f3f4f6]"
        >
            <Text className="font-syne-medium text-[13px] text-[#111827]">{label}</Text>
            {selected && <Check size={16} color="#2563eb" />}
        </TouchableOpacity>
    )
}
