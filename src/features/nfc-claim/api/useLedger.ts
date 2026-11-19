import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { LedgerEntry } from '../types/claim'
import { buildLedgerPath, claimKeys } from './routes'

/**
 * GET /api/v1/ledger/:tagId — an item's provenance chain, oldest first. Public,
 * and unlike verify/claim it does NOT spend a tap, so it can be fetched (and
 * refetched) freely. `tagId` is the chip UID — the tap URL's `u`. A batch-key
 * tag (`b`) has no UID in its link, so it gets no ledger: pass undefined.
 *
 * A 404 (CLAIMS_TAG_NOT_FOUND) just means "no chain to show"; it is not retried.
 */
export function useLedger(tagId: string | undefined) {
    const api = useApi()

    return useQuery({
        queryKey: claimKeys.ledger(tagId ?? ''),
        queryFn: () => api.get<LedgerEntry[]>(buildLedgerPath(tagId!)),
        enabled: !!tagId,
        staleTime: 1000 * 60,
        retry: (count, err) => (err as { status?: number })?.status !== 404 && count < 2,
    })
}
