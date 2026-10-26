import * as Linking from 'expo-linking'
import { Share } from 'react-native'

import { Product } from '../types/product'
import { formatCategory, formatPrice, formatRarity } from './format'

/**
 * Deep link to a product's detail screen.
 *
 * `Linking.createURL` resolves to `hitboxstatic://…` in a dev/production build
 * and `exp://…` in Expo Go — no hardcoded scheme, same rule as the SSO redirect
 * (AGENTS.md §7). The path mirrors the route: `(tabs)/marketplace/[tourId]`
 * carries a *product* id despite the name.
 */
export function productShareUrl(productId: string) {
    return Linking.createURL(`/marketplace/${productId}`)
}

/** The text body of a share — product, who made it, price, then the link. */
export function productShareMessage(product: Product) {
    const artist = product.collection?.artist.name
    const lines = [
        artist ? `${product.name} by ${artist}` : product.name,
        `${formatRarity(product.rarity)} ${formatCategory(product.category)} · ${formatPrice(product.priceInDollars)}`,
        `Code ${product.productCode}`,
        '',
        productShareUrl(product.id),
    ]
    return lines.join('\n')
}

/**
 * Opens the OS share sheet for a product.
 *
 * Uses React Native's own `Share` API, so there is no extra dependency and no
 * native rebuild. Resolves `true` when the user actually shared, `false` when
 * they dismissed the sheet or it failed — callers can ignore the result.
 */
export async function shareProduct(product: Product): Promise<boolean> {
    try {
        const result = await Share.share(
            {
                title: product.name,
                message: productShareMessage(product),
            },
            // iOS lists the app name in the sheet header; Android shows a chooser title.
            { dialogTitle: `Share ${product.name}`, subject: product.name },
        )
        return result.action === Share.sharedAction
    } catch {
        // A failed or cancelled share is not worth interrupting the screen for.
        return false
    }
}
