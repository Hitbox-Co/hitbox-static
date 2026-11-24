import * as SecureStore from 'expo-secure-store'
import { useSyncExternalStore } from 'react'

/**
 * The buyer's market choice, persisted on the device.
 *
 * - `auto` (default): the market is worked out from the buyer's address, then the
 *   device region (see `useActiveMarket`). `marketId` then only caches the last
 *   market that resolved to.
 * - `manual`: the buyer picked one in the market sheet; `marketId` is theirs until
 *   they choose "Automatic" again.
 *
 * Not a secret, but SecureStore is already a dependency and is synchronous to
 * read, so the first render already knows the market.
 */
export type MarketMode = 'auto' | 'manual'

interface MarketState {
    marketId: string | null
    mode: MarketMode
}

const STORAGE_KEY = 'hitbox.market'

function load(): MarketState {
    try {
        const raw = SecureStore.getItem(STORAGE_KEY)
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<MarketState>
            return {
                marketId: typeof parsed.marketId === 'string' ? parsed.marketId : null,
                mode: parsed.mode === 'manual' ? 'manual' : 'auto',
            }
        }
    } catch {
        // Unreadable storage is the same as a first launch.
    }
    return { marketId: null, mode: 'auto' }
}

let state: MarketState = load()
const listeners = new Set<() => void>()

function set(next: MarketState) {
    if (next.marketId === state.marketId && next.mode === state.mode) return
    state = next
    try {
        SecureStore.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // Losing the preference is better than failing the screen.
    }
    listeners.forEach((l) => l())
}

export const marketActions = {
    /** The buyer chose a market: it sticks until they pick "Automatic". */
    chooseManual(marketId: string) {
        set({ marketId, mode: 'manual' })
    },
    /** Back to deriving the market from the address / device region. */
    chooseAutomatic() {
        set({ marketId: state.marketId, mode: 'auto' })
    },
    /** Record what automatic resolved to (no change of mode). */
    recordResolved(marketId: string) {
        if (state.mode === 'auto') set({ marketId, mode: 'auto' })
    },
}

/** Ids from the last `GET /markets`. Empty until it loads. */
let knownMarketIds: Set<string> = new Set()
export function setKnownMarkets(ids: string[]) {
    knownMarketIds = new Set(ids)
}
/** True unless the markets are loaded and this id is not among them (a stale id is never sent). */
export function isSendableMarketId(id: string): boolean {
    return knownMarketIds.size === 0 || knownMarketIds.has(id)
}

export function getMarketState(): MarketState {
    return state
}

const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export function useMarketState(): MarketState {
    return useSyncExternalStore(subscribe, () => state, () => state)
}
