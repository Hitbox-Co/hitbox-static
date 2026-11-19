import { useQuery } from '@tanstack/react-query'

import { API_URL, ApiRequestError, HealthStatus } from '@/lib/api'
import { AUTH_ROUTES, authKeys } from './routes'

/**
 * GET /api/v1/health — public, so no token, and (unlike every other route) the
 * body is `{ status, uptime }` with no `data` wrapper, which is why this does
 * not go through `useApi()`. Rate limited like any /api/v1 route (429).
 */
export async function fetchHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_URL}${AUTH_ROUTES.health}`, {
        // Skips ngrok's free-tier browser interstitial page
        headers: { 'ngrok-skip-browser-warning': 'true' },
    })
    if (!res.ok) {
        throw new ApiRequestError(res.status, {
            code: res.status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR',
            message: `Health check failed (${res.status})`,
        })
    }
    return (await res.json()) as HealthStatus
}

/**
 * A connectivity probe: is the API reachable? Does not retry, because the
 * answer *is* the failure — a screen can show "can't reach HitBox" off `isError`.
 */
export function useApiHealth(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: authKeys.health,
        queryFn: fetchHealth,
        enabled: options?.enabled ?? true,
        retry: false,
        staleTime: 30_000,
    })
}
