import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from '@tanstack/react-query'

import { AuthzGrants, useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { AUTH_ROUTES, authKeys } from './routes'

/**
 * GET /api/v1/authz/me 🔒 — the caller's roles and permission keys
 * (`resource:action:scope`, e.g. `nfc-tag-claim:claim:own`).
 *
 * A **UI hint only**: the server re-checks permissions on every protected route,
 * and a brand-new user legitimately has empty lists (no role is assigned at
 * sign-up). So do not hide core buyer features just because a key is missing;
 * use this to show or hide things like staff-only entries.
 */
export function useAuthz() {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: authKeys.authz,
        queryFn: () => api.get<AuthzGrants>(AUTH_ROUTES.authz),
        enabled: !!isSignedIn,
        retry: retryAuthAware,
        staleTime: 5 * 60 * 1000,
    })
}

/** Whether a permission key is among the caller's grants. False while unknown. */
export function hasPermission(grants: AuthzGrants | undefined, key: string): boolean {
    return !!grants?.permissions.includes(key)
}
