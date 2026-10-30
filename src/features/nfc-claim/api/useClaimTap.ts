import { useQuery, useQueryClient } from '@tanstack/react-query'

import { collectionKeys } from '@/features/collections/api/routes'
import { useApi } from '@/lib/api'
import { tapIdentity } from '@/lib/tap-url'
import type { TapUrl } from '@/lib/tap-url'
import { ClaimTapResult } from '../types/claim'
import { ACCOUNT_RETRY_DELAY_MS, shouldRetryClaim } from './claimErrors'
import { CLAIM_ROUTES, claimKeys } from './routes'

/**
 * POST /api/v1/claim 🔒 — claims the item with the tap URL's own u/e/c.
 * The claimer is always the signed-in user; the server takes no user id.
 *
 * **A tap URL is good for exactly one request.** The chip's counter rises on
 * every tap, and the server refuses a counter it has already seen. So this is
 * deliberately a one-shot query rather than a mutation:
 *
 *   - it is keyed by the tap, so a screen that remounts (back, rotate, a
 *     provider re-render) reads the answer it already has instead of sending
 *     the URL again and being told "not verified";
 *   - it does not resend after a network failure — that leaves it unknown
 *     whether the server saw the tap, so the honest recovery is to tap again.
 *     The one exception is "your account is not set up yet" (a sign-up can be
 *     seconds ahead of the webhook that creates its row): the server refuses
 *     that before it reads the tap, so it alone is retried — see claimErrors;
 *   - nothing here hands a screen a refetch.
 *
 * Pass enabled=false until Clerk reports a session, otherwise this 401s and the
 * tap is wasted.
 *
 * A verified:false answer is an ordinary 200: the server will not say why.
 */
export function useClaimTap(tap: TapUrl | null, enabled = true) {
    const api = useApi()
    const queryClient = useQueryClient()

    return useQuery({
        queryKey: claimKeys.claimTap(tap?.e ?? ''),
        queryFn: async () => {
            const result = await api.post<ClaimTapResult>(CLAIM_ROUTES.claim, {
                ...tapIdentity(tap!),
                e: tap!.e,
                c: tap!.c,
                visibility: 'PRIVATE',
            })
            // A new item joined the shelf.
            if (result.verified && result.outcome === 'CLAIMED') {
                void queryClient.invalidateQueries({ queryKey: collectionKeys.all })
            }
            return result
        },
        enabled: !!tap && enabled,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        retry: shouldRetryClaim,
        retryDelay: ACCOUNT_RETRY_DELAY_MS,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })
}
