import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from '@tanstack/react-query'

import { ApiRequestError, useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { RewardDetail, RewardSummary, RewardTeaser } from '../types/reward'
import { REWARD_ROUTES, rewardKeys } from './routes'

/** 4xx answers that will not change on retry. */
const isFinal = (err: unknown) => err instanceof ApiRequestError && [403, 404, 422].includes(err.status)

/** GET /api/v1/rewards 🔒 — my unlocked rewards, newest unlock first. */
export function useRewards() {
    const api = useApi()
    const { isSignedIn } = useAuth()
    return useQuery({
        queryKey: rewardKeys.list,
        queryFn: () => api.get<RewardSummary[]>(REWARD_ROUTES.list),
        enabled: !!isSignedIn,
        retry: retryAuthAware,
        staleTime: 1000 * 30,
    })
}

/**
 * GET /api/v1/rewards/collections/:collectionId 🔒 — the locked teaser.
 * ⚠️ A GET that can WRITE: if the set is complete but not yet unlocked, the
 * server unlocks it right now and answers `unlocked: true`. A 404 means "no live
 * reward" — the block is simply hidden, so it is not retried.
 */
export function useRewardTeaser(collectionId: string | null | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    return useQuery({
        queryKey: rewardKeys.teaser(collectionId ?? ''),
        queryFn: () => api.get<RewardTeaser>(REWARD_ROUTES.teaser(collectionId!)),
        enabled: !!isSignedIn && !!collectionId,
        retry: (count, err) => !isFinal(err) && retryAuthAware(count, err),
        // A claim in the Scan tab changes progress, so don't hold it long.
        staleTime: 1000 * 20,
    })
}

/**
 * GET /api/v1/rewards/:rewardId 🔒 — opens an unlocked reward. Signed links last
 * `expiresIn` (3600 s) and must not be cached past that, so `gcTime` is 0 and the
 * query refetches on every open. 403 CONTENT_REWARD_LOCKED carries
 * `details.collectionId`.
 */
export function useReward(rewardId: string | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    return useQuery({
        queryKey: rewardKeys.detail(rewardId ?? ''),
        queryFn: () => api.get<RewardDetail>(REWARD_ROUTES.byId(rewardId!)),
        enabled: !!isSignedIn && !!rewardId,
        retry: (count, err) => !isFinal(err) && retryAuthAware(count, err),
        staleTime: 0,
        gcTime: 0,
    })
}

/** The collection to open the teaser for, from a CONTENT_REWARD_LOCKED error. */
export function lockedCollectionId(err: unknown): string | null {
    if (err instanceof ApiRequestError && err.error.code === 'CONTENT_REWARD_LOCKED') {
        const id = (err.error.details as { collectionId?: unknown } | undefined)?.collectionId
        return typeof id === 'string' ? id : null
    }
    return null
}
