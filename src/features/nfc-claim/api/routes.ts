import { tapIdentity } from '@/lib/tap-url'
import type { TapUrl } from '@/lib/tap-url'

/**
 * Claims module endpoints for the tap-URL flow. The app sends the values the
 * tag's URL carries (`u` — or `b` on a batch-key tag — plus `e` and `c`) and
 * nothing else. It reads `u` from the link text; it never reads the chip itself.
 */
export const CLAIM_ROUTES = {
    /** 🔒 claim an item with a tap URL's own b/e/c. Body: `{ u|b, e, c, visibility }`. */
    claim: '/api/v1/claim',
} as const

/**
 * Public authenticity check for a tap — never claims. A GET, so the values ride
 * in the query string; `u`, `e` and `c` are hex and `b` is URL-safe by construction,
 * but the identifying value is still encoded.
 */
export function buildVerifyTapPath(tap: TapUrl) {
    const id = tapIdentity(tap)
    const [name, value] = Object.entries(id)[0]!
    return `/api/v1/verify?${name}=${encodeURIComponent(value)}&e=${tap.e}&c=${tap.c}`
}

/**
 * TanStack Query keys for the NFC claim feature.
 *
 * Both are keyed by `e`: it differs on every tap, so one tap is one key. That is
 * what lets a remounted screen reuse its tap's answer instead of sending the URL
 * a second time — which the server would refuse as a replay.
 */
export const claimKeys = {
    all: ['claims'] as const,
    claimTap: (e: string) => ['claims', 'claim', e] as const,
    verifyTap: (e: string) => ['claims', 'verify', e] as const,
}
