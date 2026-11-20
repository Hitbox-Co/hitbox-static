import { useAuth } from '@clerk/clerk-expo'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useMe } from '@/features/profile/api/getProfile'
import { ApiRequestError, useApi } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { queryKeys } from '@/lib/queries'
import { FollowArtistView, FollowResult, FollowUserView, FollowingType } from '../types/follow'
import { FOLLOW_ROUTES, buildFollowersPath, buildFollowingPath, followKeys, isUuid } from './routes'

/** Refusals that will not change on retry. */
const isFinal = (err: unknown) => err instanceof ApiRequestError && [400, 401, 403, 404, 422].includes(err.status)

/** A sentence for a failed follow call, keyed on the error code. */
export function followErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
        switch (err.error.code) {
            case 'SOCIAL_CANNOT_FOLLOW_SELF':
                return "You can't follow yourself."
            case 'SOCIAL_USER_NOT_FOUND':
                return "This collector isn't available any more."
            case 'SOCIAL_ARTIST_NOT_FOUND':
                return "This artist isn't available to follow."
        }
    }
    return describeApiError(err, "Couldn't update. Please try again.")
}

/**
 * POST / DELETE /api/v1/follows/users/:userId 🔒 — follow or unfollow a
 * collector. Idempotent both ways. Private profiles can be followed too.
 */
export function useFollowUser() {
    const api = useApi()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ userId, follow }: { userId: string; follow: boolean }) => {
            const path = FOLLOW_ROUTES.user(userId)
            return follow ? api.post<FollowResult>(path) : api.delete(path).then(() => null)
        },
        onSuccess: (_result, { userId }) => {
            void queryClient.invalidateQueries({ queryKey: followKeys.all })
            // Their profile's follower count, and my following count.
            void queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) })
            void queryClient.invalidateQueries({ queryKey: queryKeys.me })
        },
    })
}

/**
 * POST / DELETE /api/v1/follows/artists/:artistId 🔒 — follow or unfollow an
 * artist (ids come from Discover's creators and from drop cards).
 */
export function useFollowArtist() {
    const api = useApi()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ artistId, follow }: { artistId: string; follow: boolean }) => {
            const path = FOLLOW_ROUTES.artist(artistId)
            return follow ? api.post<FollowResult>(path) : api.delete(path).then(() => null)
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: followKeys.all })
            void queryClient.invalidateQueries({ queryKey: queryKeys.me })
        },
    })
}

/** GET /api/v1/follows/users/:userId/followers — newest follower first. Public. */
export function useFollowersInfinite(userId: string | undefined, limit = 20) {
    const api = useApi()
    return useInfiniteQuery({
        queryKey: [...followKeys.followers(userId ?? '', limit), 'infinite'],
        queryFn: ({ pageParam }) => api.getPage<FollowUserView>(buildFollowersPath(userId!, pageParam, limit)),
        enabled: isUuid(userId),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.meta.page < (last.meta.totalPages ?? 1) ? last.meta.page + 1 : undefined),
        retry: (count, err) => !isFinal(err) && count < 2,
        staleTime: 1000 * 30,
    })
}

/** GET /api/v1/follows/users/:userId/following?type= — collectors or artists this collector follows. Public. */
export function useFollowingInfinite<T extends FollowingType>(userId: string | undefined, type: T, limit = 20) {
    const api = useApi()
    return useInfiniteQuery({
        queryKey: [...followKeys.following(userId ?? '', type, limit), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getPage<T extends 'artists' ? FollowArtistView : FollowUserView>(
                buildFollowingPath(userId!, type, pageParam, limit),
            ),
        enabled: isUuid(userId),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.meta.page < (last.meta.totalPages ?? 1) ? last.meta.page + 1 : undefined),
        retry: (count, err) => !isFinal(err) && count < 2,
        staleTime: 1000 * 30,
    })
}

/**
 * Counts for a profile header, read from each list's `meta.total` (a 1-row
 * page). Null while loading or when the list can't be read.
 */
export function useFollowCounts(userId: string | undefined) {
    const api = useApi()
    const enabled = isUuid(userId)
    const followers = useQuery({
        queryKey: [...followKeys.followers(userId ?? '', 1), 'count'],
        queryFn: () => api.getPage<FollowUserView>(buildFollowersPath(userId!, 1, 1)),
        enabled,
        retry: (count, err) => !isFinal(err) && count < 2,
        staleTime: 1000 * 30,
    })
    const following = useQuery({
        queryKey: [...followKeys.following(userId ?? '', 'users', 1), 'count'],
        queryFn: () => api.getPage<FollowUserView>(buildFollowingPath(userId!, 'users', 1, 1)),
        enabled,
        retry: (count, err) => !isFinal(err) && count < 2,
        staleTime: 1000 * 30,
    })
    return {
        followers: followers.data?.meta.total ?? null,
        following: following.data?.meta.total ?? null,
    }
}

/**
 * Whether I follow this artist. Drop and creator cards don't say, so it is
 * read from my own `following?type=artists` list (first 50 — the API's max page).
 * Null while unknown (signed out, loading, or my id not yet known).
 */
export function useIsFollowingArtist(artistId: string | undefined): boolean | null {
    const api = useApi()
    const { isSignedIn } = useAuth()
    const { data: me } = useMe()
    const myId = isSignedIn ? me?.id : undefined
    const { data } = useQuery({
        queryKey: [...followKeys.following(myId ?? '', 'artists', 50), 'mine'],
        queryFn: () => api.getPage<FollowArtistView>(buildFollowingPath(myId!, 'artists', 1, 50)),
        enabled: isUuid(myId) && !!artistId,
        retry: (count, err) => !isFinal(err) && count < 2,
        staleTime: 1000 * 30,
    })
    if (!data || !artistId) return null
    return data.data.some((a) => a.id === artistId)
}
