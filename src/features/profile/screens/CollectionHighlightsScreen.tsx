import { router } from 'expo-router'
import React from 'react'

import GlobalCollectionSection, {
    CollectibleItem,
    CollectionDetail,
} from '@/components/GlobalCollectionSection'
import { COLLECTION_HIGHLIGHTS } from '../data/collectionHighlights'

/**
 * The screen behind "View Collection" on the profile.
 *
 * Shows the same collections as the highlights row rather than the My
 * Collections tab — the button is expanding that row, not jumping to a
 * different part of the app. Rendered through `GlobalCollectionSection` so it
 * matches the collections tab's detail view.
 *
 * Backed by the shared placeholder list: these are collection groupings, and the
 * API only exposes individual owned items today.
 */
export default function CollectionHighlightsScreen() {
    const items: CollectibleItem[] = COLLECTION_HIGHLIGHTS.map((entry) => ({
        id: entry.id,
        title: entry.title,
        subtitle: `${entry.count} item${entry.count === 1 ? '' : 's'}`,
        image: { uri: entry.image },
        rarity: 'Rare',
        isNew: false,
        owned: true,
    }))

    const held = COLLECTION_HIGHLIGHTS.reduce((sum, entry) => sum + entry.count, 0)

    const collection: CollectionDetail = {
        id: 'collection-highlights',
        title: 'Collection Highlights',
        subtitle: `${COLLECTION_HIGHLIGHTS.length} collections · ${held} items`,
        image: COLLECTION_HIGHLIGHTS[0]?.image ?? '',
        featured: false,
        owned: held,
        total: held,
        progress: 100,
        category: 'Highlights',
    }

    return (
        <GlobalCollectionSection
            collection={collection}
            items={items}
            loading={false}
            onBack={() => {
                if (router.canGoBack()) router.back()
                else router.replace('/profile')
            }}
        />
    )
}
