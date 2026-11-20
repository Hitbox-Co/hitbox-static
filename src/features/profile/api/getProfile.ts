import { useApi } from "@/lib/api"
import { queryKeys, retryAuthAware } from "@/lib/queries"
import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { Me, Profile, ProfileStats } from "../types/profile"
import { PROFILE_ROUTES, isUserId } from "./routes"

/** GET /api/v1/users/me — full own profile with my stats. 404 USERS_NOT_FOUND = archived. */
export function useMe() {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: queryKeys.me,
        queryFn: () => api.get<Me>(PROFILE_ROUTES.me),
        enabled: !!isSignedIn,
        staleTime: 1000 * 60 * 5,
        retry: retryAuthAware,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    })
}

const EMPTY_STATS: ProfileStats = {
    claimedItems: 0,
    artistCollections: 0,
    collectionProgress: { owned: 0, total: 0, percentage: 0 },
    followers: 0,
    following: 0,
    followingArtists: 0,
}

/**
 * Fills in what an older server leaves out, so a screen never reads
 * `profile.stats.followers` off undefined. The previous Users API answered only
 * for PUBLIC profiles (a private one was a 404), so a profile that arrives
 * without `isPrivate` is a public one; without `viewer` it is a guest view.
 */
function normalizeProfile(raw: Partial<Profile> & Pick<Profile, 'id' | 'createdAt'>): Profile {
    return {
        handle: null,
        fullName: null,
        avatarUrl: null,
        bio: null,
        ...raw,
        isPrivate: raw.isPrivate ?? false,
        stats: { ...EMPTY_STATS, ...(raw.stats ?? {}) },
        viewer: raw.viewer ?? null,
    }
}

/** A 404 (deleted / deactivated / unknown) will not change on retry. */
const retryUnlessNotFound = (count: number, err: unknown) => (err as { status?: number })?.status !== 404 && count < 2

/**
 * GET /api/v1/users/:id — a collector's profile, PUBLIC or PRIVATE (check
 * `isPrivate` before asking for their items). The token is optional: signed
 * in, `viewer` says whether I follow them and whether it is me. 404
 * USERS_NOT_FOUND only for a deleted or deactivated account. The query stays
 * idle for a non-uuid id.
 */
export function useUser(id: string | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        // Signed in vs guest changes `viewer`, so it is part of the key.
        queryKey: [...queryKeys.user(id ?? ''), isSignedIn ? 'viewer' : 'guest'],
        queryFn: async () => normalizeProfile(await api.get<Profile>(PROFILE_ROUTES.byId(id!))),
        staleTime: 1000 * 60,
        enabled: !!id && isUserId(id),
        retry: retryUnlessNotFound,
    })
}

/** GET /api/v1/users/handle/:handle — the same `Profile`, found by handle (e.g. from a "@mia.figures" link). */
export function useUserByHandle(handle: string | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    const clean = handle?.replace(/^@/, '').trim()

    return useQuery({
        queryKey: ['users', 'handle', (clean ?? '').toLowerCase(), isSignedIn ? 'viewer' : 'guest'],
        queryFn: async () => normalizeProfile(await api.get<Profile>(PROFILE_ROUTES.byHandle(clean!))),
        staleTime: 1000 * 60,
        enabled: !!clean && clean.length <= 50,
        retry: retryUnlessNotFound,
    })
}
