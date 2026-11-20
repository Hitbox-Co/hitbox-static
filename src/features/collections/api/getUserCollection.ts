import { useApi } from '@/lib/api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { CollectionItem, UserCollectionFilters } from '../types/collection'
import { isUuid } from './collectionErrors'
import { buildUserCollectionPath, collectionKeys } from './routes'

/**
 * GET /api/v1/collections/user/:userId — another collector's showcase: the
 * items they marked PUBLIC, newest first. `userId` is the account id (`id` from
 * the users API). Works signed out; when the token belongs to the shelf's owner,
 * the server returns their whole shelf instead.
 *
 * Two refusals that will not change on retry, so they are not retried — show
 * them with `collectionErrorMessage`:
 *   403 COLLECTIONS_PROFILE_PRIVATE — the collector's profile is private (no items at all)
 *   404 COLLECTIONS_USER_NOT_FOUND  — no such collector (a malformed id included)
 *
 * When the profile is already known to be private, pass `enabled: false` and
 * skip the call.
 */
export function useUserCollection(
    userId: string | undefined,
    filters: UserCollectionFilters = {},
    options: { enabled?: boolean } = {},
) {
    const api = useApi()

    return useQuery({
        queryKey: collectionKeys.user(userId ?? '', filters),
        queryFn: () => api.getPage<CollectionItem>(buildUserCollectionPath(userId!, filters)),
        // A non-uuid id cannot be a collector. The current dev server answers it
        // with a 500 (the doc says 404), so it is never sent.
        enabled: !!userId && isUuid(userId) && (options.enabled ?? true),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 2,
        retry: (count, err) => {
            const status = (err as { status?: number })?.status
            return status !== 403 && status !== 404 && count < 2
        },
    })
}
