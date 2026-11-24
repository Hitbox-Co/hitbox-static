import React, { useState } from 'react'
import { Text, TouchableOpacity } from 'react-native'

import { useActiveMarket } from '../hooks/useActiveMarket'
import MarketSheet from './MarketSheet'

/** "Change region" — opens the market sheet. Used by empty states and "not available" messages. */
export default function ChangeRegionButton({ dark = false }: { dark?: boolean }) {
    const { market, markets, mode } = useActiveMarket()
    const [open, setOpen] = useState(false)
    if (!markets.length) return null
    return (
        <>
            <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Change region"
                activeOpacity={0.8}
                onPress={() => setOpen(true)}
                className={`rounded-[30px] px-5 py-2 ${dark ? 'bg-white' : 'bg-[#111827]'}`}
            >
                <Text className={`font-syne-bold text-[13px] ${dark ? 'text-[#111827]' : 'text-white'}`}>Change region</Text>
            </TouchableOpacity>
            <MarketSheet
                visible={open}
                onClose={() => setOpen(false)}
                markets={markets}
                selectedId={market?.id}
                automatic={mode === 'auto'}
            />
        </>
    )
}
