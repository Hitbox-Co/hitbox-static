import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from '@tanstack/react-query'

import {
    ApiRequestError,
    AuthPrincipal,
    useApi
} from './api'

// Shared, cross-feature query keys (feature-specific keys live in each
// feature's api/routes.ts — e.g. discoverKeys, marketplaceKeys, productKeys).
export const queryKeys = {
    authMe: ['auth', 'me'] as const,
    me: ['users', 'me'] as const,
    user: (id: string) => ['users', id] as const,
}

/**
 * How long to wait before asking again when the account row does not exist yet.
 * The backend will not ask Clerk to create it again for 10 seconds after a
 * failed attempt, so retrying sooner only repeats the same 401.
 */
export const ACCOUNT_RETRY_DELAY_MS = 10_000

/**
 * Right after sign-up the Clerk webhook may not have created the local user
 * row yet, so the backend answers 401 AUTH_ACCOUNT_NOT_FOUND for a valid
 * token. Retry those a few times (spaced out — see `retryDelayAuthAware`);
 * fail fast on anything else that's 4xx.
 */
export function retryAuthAware(failureCount: number, error: unknown) {
    if (error instanceof ApiRequestError) {
        if (error.error.code === 'AUTH_ACCOUNT_NOT_FOUND') return failureCount < 3
        if (error.status >= 400 && error.status < 500) return false
    }
    return failureCount < 2
}

/**
 * The retry delay that goes with `retryAuthAware`: 10 s for the not-yet-created
 * account, TanStack's usual exponential backoff (1 s, 2 s, 4 s … capped at 30 s)
 * for everything else. Set as the QueryClient default in `src/app/_layout.tsx`.
 */
export function retryDelayAuthAware(attempt: number, error: unknown) {
    if (error instanceof ApiRequestError && error.error.code === 'AUTH_ACCOUNT_NOT_FOUND') {
        return ACCOUNT_RETRY_DELAY_MS
    }
    return Math.min(1000 * 2 ** attempt, 30_000)
}

/** GET /api/v1/auth/me — the authenticated principal. */
export function useAuthMe() {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: queryKeys.authMe,
        queryFn: () => api.get<AuthPrincipal>('/api/v1/auth/me'),
        enabled: !!isSignedIn,
        retry: retryAuthAware,
    })
}
