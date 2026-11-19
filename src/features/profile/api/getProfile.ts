import { useApi } from "@/lib/api"
import { queryKeys, retryAuthAware } from "@/lib/queries"
import { useAuth } from "@clerk/clerk-expo"
import { useQuery } from "@tanstack/react-query"

import { Me, PublicUser } from "../types/profile"
import { PROFILE_ROUTES, isUserId } from "./routes"

/** GET /api/v1/users/me — full own profile (email, visibility, location…). 404 USERS_NOT_FOUND = archived. */
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

/**
 * GET /api/v1/users/:id — another user's public profile. Answers 404
 * USERS_NOT_FOUND for a missing, archived or PRIVATE profile (deliberately
 * indistinguishable). The query stays idle for a non-uuid id: the server would
 * answer 500.
 */
export function useUser(id: string | undefined) {
    const api = useApi()

    return useQuery({
        queryKey: queryKeys.user(id ?? ''),
        queryFn: () => api.get<PublicUser>(PROFILE_ROUTES.byId(id!)),
        staleTime: 1000 * 60 * 5,
        enabled: !!id && isUserId(id),
        // A 404 (missing / private) will not change on retry.
        retry: (count, err) => (err as { status?: number })?.status !== 404 && count < 2,
    })
}
