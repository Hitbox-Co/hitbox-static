export type ProfileVisibility = 'PUBLIC' | 'PRIVATE'

/** The base fields every profile has. */
export interface PublicUser {
    id: string
    /** Null if never set. */
    handle: string | null
    fullName: string | null
    avatarUrl: string | null
    bio: string | null
    createdAt: string
}

/** Shown on every profile, private or not. Deactivated/deleted accounts are left out of the follow counts. */
export interface ProfileStats {
    /** Items on their shelf — counted, never listed, when private. */
    claimedItems: number
    /** Artist collections they hold items from. */
    artistCollections: number
    collectionProgress: { owned: number; total: number; percentage: number }
    /** Collectors following them. */
    followers: number
    /** Collectors they follow. */
    following: number
    /** Artists they follow. */
    followingArtists: number
}

/**
 * A collector's profile as anyone sees it — GET /users/:id and
 * /users/handle/:handle. Returned for PUBLIC **and** PRIVATE profiles: private
 * hides what they own, never who they are.
 */
export interface Profile extends PublicUser {
    /** profileVisibility = PRIVATE → hide the items, show "This profile is private". */
    isPrivate: boolean
    stats: ProfileStats
    /** Null for guests. */
    viewer: {
        /** You opened your own profile. */
        isSelf: boolean
        /** Drives the Follow / Following button. */
        isFollowing: boolean
    } | null
}

/** What I see about myself — GET / PATCH /api/v1/users/me. */
export interface Me extends PublicUser {
    email: string
    phone: string | null
    /** Always "USER" today. */
    role: 'USER'
    /** New accounts start PRIVATE: the items stay hidden until the user opts in. */
    profileVisibility: ProfileVisibility
    /** Coarse ("Austin, TX"); never shown to others. */
    generalLocation: string | null
    /** Not editable through this API. */
    preferredMarketId: string | null
    isActive: boolean
    updatedAt: string
    /** On GET /users/me only — PATCH answers without it. */
    stats?: ProfileStats
}
