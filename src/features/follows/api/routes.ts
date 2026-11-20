import { FollowingType } from '../types/follow'

/**
 * Follows endpoints. Follow / unfollow need the session (POST / DELETE, no
 * body, both idempotent). The lists are public; a token only fills in
 * `isFollowedByYou` on each row.
 */
export const FOLLOW_ROUTES = {
    user: (userId: string) => `/api/v1/follows/users/${encodeURIComponent(userId)}`,
    artist: (artistId: string) => `/api/v1/follows/artists/${encodeURIComponent(artistId)}`,
    followers: (userId: string) => `/api/v1/follows/users/${encodeURIComponent(userId)}/followers`,
    following: (userId: string) => `/api/v1/follows/users/${encodeURIComponent(userId)}/following`,
} as const

export const followKeys = {
    all: ['follows'] as const,
    followers: (userId: string, limit: number) => ['follows', 'followers', userId, limit] as const,
    following: (userId: string, type: FollowingType, limit: number) => ['follows', 'following', userId, type, limit] as const,
}

export function buildFollowersPath(userId: string, page: number, limit: number) {
    return `${FOLLOW_ROUTES.followers(userId)}?page=${page}&limit=${limit}`
}

export function buildFollowingPath(userId: string, type: FollowingType, page: number, limit: number) {
    return `${FOLLOW_ROUTES.following(userId)}?type=${type}&page=${page}&limit=${limit}`
}

/** Every id the API takes is a uuid; anything else is a 422, so it is never sent. */
export const isUuid = (value: string | undefined | null): value is string =>
    !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
