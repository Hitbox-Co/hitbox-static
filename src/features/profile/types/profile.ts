export type ProfileVisibility = 'PUBLIC' | 'PRIVATE'

/** What anyone may see — GET /api/v1/users/:id (only when the profile is PUBLIC). */
export interface PublicUser {
    id: string
    /** Null if never set. */
    handle: string | null
    fullName: string | null
    avatarUrl: string | null
    bio: string | null
    createdAt: string
}

/** What I see about myself — GET / PATCH /api/v1/users/me. */
export interface Me extends PublicUser {
    email: string
    phone: string | null
    /** Always "USER" today. */
    role: 'USER'
    /** New accounts start PRIVATE: no public profile until the user opts in. */
    profileVisibility: ProfileVisibility
    /** Coarse ("Austin, TX"); never shown to others. */
    generalLocation: string | null
    /** Not editable through this API. */
    preferredMarketId: string | null
    isActive: boolean
    updatedAt: string
}
