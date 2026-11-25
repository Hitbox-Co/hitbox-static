import { useSyncExternalStore } from 'react'

import { DiscoverPrice } from '../types/discover'

/** The few fields the search list needs — enough to redraw a card without refetching. */
export interface RecentSearchItem {
    id: string
    name: string
    imageUrl: string | null
    rewardPoints?: number | null
    price?: DiscoverPrice | null
    artistName?: string | null
}

const MAX_RECENTS = 6

/*
 * Kept in memory for the session only: there is no backend history endpoint,
 * and nothing here is worth a storage dependency. Both lists reset when the
 * app restarts.
 */

let recents: RecentSearchItem[] = []
let terms: string[] = []
const listeners = new Set<() => void>()

const emit = () => listeners.forEach((l) => l())

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/** Remember an item the user opened from search, newest first. */
export function addRecentSearch(item: RecentSearchItem) {
    recents = [item, ...recents.filter((r) => r.id !== item.id)].slice(0, MAX_RECENTS)
    emit()
}

/**
 * Remember a word the user searched for (Figma "Recent searches" chips),
 * newest first, case-insensitively de-duplicated.
 */
export function addRecentTerm(term: string) {
    const clean = term.trim()
    if (clean.length < 2) return
    terms = [clean, ...terms.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, MAX_RECENTS)
    emit()
}

export function clearRecentSearches() {
    recents = []
    terms = []
    emit()
}

export function useRecentSearches() {
    return useSyncExternalStore(subscribe, () => recents, () => recents)
}

export function useRecentTerms() {
    return useSyncExternalStore(subscribe, () => terms, () => terms)
}
