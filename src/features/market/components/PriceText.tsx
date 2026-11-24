import React from 'react'
import { Text, View } from 'react-native'

import { MarketPrice, usePriceView } from '../hooks/usePriceView'

/**
 * THE price display: every card, detail screen and cart row renders prices through
 * this, so the amount, currency and "not sold here" note can never disagree.
 *
 * Renders nothing when the drop has no price. `className` styles the amount; the
 * small amber note under it appears when the drop is not sold in the selected market.
 */
export default function PriceText({
    price,
    className,
    noteClassName = 'font-syne-semibold text-[9px] text-[#d97706]',
}: {
    price: MarketPrice | null | undefined
    className?: string
    noteClassName?: string
}) {
    const view = usePriceView(price)
    if (!view.text) return null
    return (
        <View>
            <Text className={className}>{view.text}</Text>
            {view.note && <Text className={noteClassName}>{view.note}</Text>}
        </View>
    )
}
