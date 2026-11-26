import React from 'react'
import { Text, View } from 'react-native'

import { Address } from '@/features/addresses/types/address'

/** "Alex Morgan · Home", the two address lines and the phone, as in the Figma. */
export function AddressLines({ address }: { address: Address }) {
    const line1 = [address.line1, address.line2].filter(Boolean).join(', ')
    const line2 = [address.city, [address.state, address.postalCode].filter(Boolean).join(' '), address.countryCode]
        .filter(Boolean)
        .join(', ')
    return (
        <View className="flex-1 gap-1">
            <Text className="font-syne-bold text-[13px] leading-[19px] text-[#111827]">
                {`${address.recipientName} · ${address.label}${address.isDefault ? ' · Default' : ''}`}
            </Text>
            <Text className="font-syne text-xs leading-[17px] text-[#374151]">{line1}</Text>
            <Text className="font-syne text-xs leading-[17px] text-[#374151]">{line2}</Text>
            {address.phone && <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">{address.phone}</Text>}
        </View>
    )
}
