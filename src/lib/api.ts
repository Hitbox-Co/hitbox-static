import { useAuth } from '@clerk/clerk-expo'
import { useCallback } from 'react'

export const API_URL = process.env.EXPO_PUBLIC_API_URL

export interface ApiError {
    code: string
    message: string
    details?: unknown
}

export class ApiRequestError extends Error {
    constructor(
        public status: number,
        public error: ApiError,
    ) {
        super(error.message)
        this.name = 'ApiRequestError'
    }
}



/** Matches PATCH /api/v1/users/me body. */
export interface UpdateMeInput {
    username?: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
}

/** Matches GET /api/v1/auth/me (req.auth). */
export interface AuthPrincipal {
    accountId: string
    clerkUserId: string
    email: string
    role: 'USER'
    sessionId: string
}

/** One entry of a 422 VALIDATION_ERROR's `details`. `path` is the field name. */
export interface ValidationDetail {
    path: string
    message: string
    code?: string
    receivedType?: string
    received?: string
}

/** One (role, organization) pair from GET /api/v1/authz/me. */
export interface RoleGrant {
    roleId: string
    roleName: string
    /** Set only for organization-scoped staff roles. */
    organizationId: string | null
}

/**
 * Matches GET /api/v1/authz/me. Permission keys read `resource:action:scope`.
 * A brand-new user can have empty lists (no role is assigned at sign-up), so
 * treat this as a UI hint, never as a gate on core buyer features.
 */
export interface AuthzGrants {
    userId: string
    permissions: string[]
    roles: RoleGrant[]
}

/** Matches GET /api/v1/health — the one response with no `data` wrapper. */
export interface HealthStatus {
    status: string
    /** Server process uptime, seconds. */
    uptime: number
}

/** Body of POST /api/v1/auth/registration/validate. Unknown fields are rejected. */
export interface RegistrationValidateInput {
    email: string
    username?: string
    firstName?: string
    lastName?: string
}

/** Response of POST /api/v1/auth/registration/validate. */
export interface RegistrationValidateResult {
    valid: true
    /** Trimmed and lowercased — use this value for the Clerk sign-up. */
    email: string
}


export type ProductCategory =
    | 'TRADING_CARD' | 'FIGURE' | 'POSTER' | 'BOOK' | 'AUTOGRAPH' | 'JERSEY'
    | 'DIGITAL_ASSET' | 'ACCESSORY' | 'GAME_BOX' | 'CARD_PACK' | 'OTHER'
export type ProductGenre =
    | 'MUSIC' | 'SPORTS' | 'FILM' | 'GAMING' | 'PUBLICATION' | 'ART' | 'ANIME' | 'OTHER'
export type ProductType = 'GROUP' | 'INDIVIDUAL'
export type ProductRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'EXCLUSIVE'
export type MarketplaceStatus = 'TRENDING_NOW' | 'NEW_RELEASE' | 'TOP_CREATORS'

export interface ProductImage {
    id: string
    title: string | null
    description: string | null
    url: string
}

export interface Artist {
    id: string
    name: string
    slug: string
    bio: string | null
    imageUrl: string | null
    genre: ProductGenre | null
    isVerified: boolean
}

export interface PageMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface Paginated<T> {
    data: T[]
    meta: PageMeta
}

/**
 * Authenticated fetch against the HitBox backend. Attaches the Clerk session
 * JWT as `Authorization: Bearer <token>` — required by all 🔒 endpoints.
 *
 * const api = useApi()
 * const me = await api.get<Me>('/api/v1/users/me')
 * await api.patch<Me>('/api/v1/users/me', { username: 'ayan_2' })
 */
export function useApi() {
    const { getToken } = useAuth()

    const request = useCallback(
        async <T>(path: string, options: RequestInit = {}): Promise<T> => {
            const send = (token: string | null) =>
                fetch(`${API_URL}${path}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        // Skips ngrok's free-tier browser interstitial page
                        'ngrok-skip-browser-warning': 'true',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        ...options.headers,
                    },
                })

            // A fresh token per request: Clerk session tokens live about a minute,
            // and getToken() hands back its cached one while that is still valid.
            const token = await getToken()
            let res = await send(token)

            // AUTH_INVALID_TOKEN (expired, or just stale) → refresh once, bypassing
            // the cache, and retry once. The server rejects the token before it
            // reads the request, so nothing was processed the first time. A second
            // failure is left to the caller (the account watcher signs out).
            if (res.status === 401 && token) {
                const peek = await res.clone().json().catch(() => null)
                if (peek?.error?.code === 'AUTH_INVALID_TOKEN') {
                    const fresh = await getToken({ skipCache: true })
                    if (fresh) res = await send(fresh)
                }
            }

            if (res.status === 204) return undefined as T

            const body = await res.json().catch(() => null)

            if (!res.ok) {
                throw new ApiRequestError(
                    res.status,
                    body?.error ?? { code: 'INTERNAL_ERROR', message: `Request failed (${res.status})` },
                )
            }

            return body as T
        },
        [getToken],
    )

    return {
        get: async <T>(path: string) => (await request<{ data: T }>(path)).data,
        /** For list endpoints — preserves the pagination `meta` envelope. */
        getPage: <T>(path: string) => request<Paginated<T>>(path),
        /**
         * For the rare endpoint whose body is NOT wrapped in `{ data }` — e.g. the
         * orders list, whose fields sit at the top level. Returns the body as sent.
         */
        getRaw: <T>(path: string) => request<T>(path),
        post: async <T>(path: string, body?: unknown) =>
            (await request<{ data: T }>(path, { method: 'POST', body: body != null ? JSON.stringify(body) : undefined })).data,
        patch: async <T>(path: string, body: unknown) =>
            (await request<{ data: T }>(path, { method: 'PATCH', body: JSON.stringify(body) })).data,
        delete: async (path: string) => { await request<undefined>(path, { method: 'DELETE' }) },
    }
}
