import { ChevronRight, Globe } from 'lucide-react-native'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { useActiveMarket } from '../hooks/useActiveMarket'
import { flagEmoji, marketLabel } from '../utils/format'
import MarketSheet from './MarketSheet'

/**
 * "Market · India · INR" — opens the market sheet. `compact` is the small chip for
 * the Delivery header; the default is a Settings-style row.
 */
export default function MarketRow({ compact = false }: { compact?: boolean }) {
    const { market, markets, mode } = useActiveMarket()
    const [open, setOpen] = useState(false)
    if (!market) return null

    const label = marketLabel(market)

    return (
        <>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Market: ${label}`}
                activeOpacity={0.8}
                onPress={() => setOpen(true)}
                className={
                    compact
                        ? 'flex-row items-center gap-2 self-start rounded-[30px] border border-[#dbeafe] bg-white px-3 py-[6px]'
                        : 'h-[52px] flex-row items-center gap-3 px-4'
                }
            >
                {compact ? (
                    <Text className="text-[13px]">{flagEmoji(market.countryCodes[0])}</Text>
                ) : (
                    <Globe size={18} color="#2563eb" />
                )}
                <View className={compact ? 'flex-row items-center gap-1' : 'flex-1'}>
                    <Text className="font-syne-medium text-[12px] text-[#111827]">{compact ? label : 'Market'}</Text>
                    {!compact && (
                        <Text className="font-syne text-[11px] text-[#6b7280]">
                            {mode === 'auto' ? `${label} · automatic` : label}
                        </Text>
                    )}
                </View>
                {!compact && <ChevronRight size={16} color="#9ca3af" />}
            </TouchableOpacity>

            <MarketSheet
                visible={open}
                onClose={() => setOpen(false)}
                markets={markets}
                selectedId={market.id}
                automatic={mode === 'auto'}
            />
        </>
    )
}
