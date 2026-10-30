import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import type { TapUrl } from '@/lib/tap-url'
import { VerifyTapResult } from '../types/claim'
import { buildVerifyTapPath, claimKeys } from './routes'

/**
 * GET /api/v1/verify?u=&e=&c= — public authenticity check. Needs no session
 * (anyone can check an item) and never claims anything.
 *
 * Same one-shot rule as useClaimTap: a tap URL works once, so the answer is
 * kept for the tap that produced it (keyed by e) and never refetched. To check
 * again — or to claim after checking — the user taps the tag again.
 *
 * A verified:false answer is an ordinary 200: the server will not say why.
 */
export function useVerifyTap(tap: TapUrl | null) {
    const api = useApi()

    return useQuery({
        queryKey: claimKeys.verifyTap(tap?.e ?? ''),
        queryFn: () => api.get<VerifyTapResult>(buildVerifyTapPath(tap!)),
        enabled: !!tap,
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    })
}
