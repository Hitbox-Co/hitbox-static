import { useApi } from '@/lib/api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { CollectionItem, UserCollectionFilters } from '../types/collection'
import { buildUserCollectionPath, collectionKeys } from './routes'

/**
 * GET /api/v1/collections/user/:userId — another user's showcase: only their
 * PUBLIC items, newest first. `userId` is the account id (`id` from the users
 * API). Public, so it works signed out and ignores the token.
 *
 * An unknown user id answers with an empty list, not a 404 — render that as
 * "nothing shared yet". (A value that is not a UUID makes the server 500, so
 * pass ids exactly as the API gave them.)
 */
export function useUserCollection(userId: string | undefined, filters: UserCollectionFilters = {}) {
    const api = useApi()

    return useQuery({
        queryKey: collectionKeys.user(userId ?? '', filters),
        queryFn: () => api.getPage<CollectionItem>(buildUserCollectionPath(userId!, filters)),
        enabled: !!userId,
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 2,
    })
}
