import React from 'react'
import { Text, View } from 'react-native'

import { CheckoutQuote } from '@/features/payments/types/payments'
import { formatMoney } from '../utils/money'
import { AmountRow, Divider, TotalRow } from './CheckoutParts'

const TAX_NAME: Record<string, string> = { GST: 'GST', SALES_TAX: 'sales tax', EXEMPT: 'tax' }

/** Why Buy is disabled, in a sentence; null when the drop can be bought. */
export function unavailableText(quote: CheckoutQuote): string | null {
    if (quote.availability === 'IN_STOCK') return null
    switch (quote.unavailableReason) {
        case 'SOLD_OUT':
            return 'Sold out — check back soon.'
        case 'NOT_OPEN_YET':
            return 'This drop is not open yet.'
        case 'CLOSED':
            return 'This drop has closed.'
        default:
            return 'This drop is not on sale right now.'
    }
}

/**
 * The server's price breakdown. Prices are tax-inclusive: the total is the sticker
 * price and exactly what the card is charged, so tax is shown as "included".
 */
export function QuoteSummary({ quote }: { quote: CheckoutQuote }) {
    const money = (v: string) => formatMoney(v, quote.currency)
    const hasTax = quote.taxType != null && Number(quote.taxAmount) > 0
    const blocked = unavailableText(quote)

    return (
        <View className="gap-[10px]">
            <AmountRow label="Price before tax" value={money(quote.subtotal)} />
            {hasTax && (
                <AmountRow
                    label={`Includes ${TAX_NAME[quote.taxType!] ?? 'tax'} · ${Number(quote.taxRate)}%`}
                    value={money(quote.taxAmount)}
                />
            )}
            {Number(quote.shippingAmount) > 0 && <AmountRow label="Delivery" value={money(quote.shippingAmount)} />}
            <Divider />
            <TotalRow label={`Total · ${quote.currency}`} value={money(quote.totalAmount)} />
            {blocked && <Text className="font-syne-semibold text-[11px] text-[#dc2626]">{blocked}</Text>}
        </View>
    )
}
