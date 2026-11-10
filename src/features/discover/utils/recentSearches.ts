import { useSyncExternalStore } from 'react'

/** The few fields the search list needs — enough to redraw a card without refetching. */
export interface RecentSearchItem {
    id: string
    name: string
    imageUrl: string | null
    rewardPoints?: number | null
    priceInDollars?: string | null
}

const MAX_RECENTS = 6

let recents: RecentSearchItem[] = []
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

/**
 * Remember an item the user opened from search, newest first.
 *
 * Kept in memory for the session only: there is no backend history endpoint,
 * and nothing here is worth a storage dependency. It resets when the app
 * restarts.
 */
export function addRecentSearch(item: RecentSearchItem) {
    recents = [item, ...recents.filter((r) => r.id !== item.id)].slice(0, MAX_RECENTS)
    emit()
}

export function clearRecentSearches() {
    recents = []
    emit()
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function useRecentSearches() {
    return useSyncExternalStore(subscribe, () => recents, () => recents)
}
