/** Mirrors the Follows API (`/api/v1/follows`). */

/** What follow and unfollow return. */
export interface FollowResult {
    /** Your state after the call. */
    following: boolean
    /** The target's follower count after the call. */
    followerCount: number
}

/** A collector in a followers / following list. */
export interface FollowUserView {
    id: string
    handle: string | null
    fullName: string | null
    avatarUrl: string | null
    /** Private profile: their name and stats show, their items do not. */
    isPrivate: boolean
    followedAt: string
    /** Your Follow button for this row; null for guests and on your own row. */
    isFollowedByYou: boolean | null
}

/** An artist in a following list (`?type=artists`). */
export interface FollowArtistView {
    id: string
    name: string
    slug: string
    avatarUrl: string | null
    followedAt: string
}

export type FollowingType = 'users' | 'artists'
