import React from 'react'
import { View } from 'react-native'

/** The 18px radio from the Figma: blue ring with a solid dot when selected. */
export function Radio({ selected }: { selected: boolean }) {
    return (
        <View
            className={`size-[18px] items-center justify-center rounded-full border-2 ${selected ? 'border-[#2563eb]' : 'border-[#bfdbfe]'}`}
        >
            {selected && <View className="size-[8px] rounded-full bg-[#2563eb]" />}
        </View>
    )
}
