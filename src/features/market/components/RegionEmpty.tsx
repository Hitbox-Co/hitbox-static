import React from 'react'
import { Text, View } from 'react-native'

import { useActiveMarket } from '../hooks/useActiveMarket'
import { marketCountryName } from '../utils/format'
import ChangeRegionButton from './ChangeRegionButton'

/** "Nothing available in India yet" + Change region: an empty list in the selected region. */
export default function RegionEmpty({ className = 'mt-16' }: { className?: string }) {
    const { market } = useActiveMarket()
    return (
        <View className={`items-center gap-4 px-8 ${className}`}>
            <Text className="text-center font-syne text-sm text-[#6b7280]">
                {market ? `Nothing available in ${marketCountryName(market)} yet.` : 'Nothing available yet.'}
            </Text>
            <ChangeRegionButton />
        </View>
    )
}
