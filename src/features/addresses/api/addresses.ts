import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { ApiRequestError, useApi } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { retryAuthAware } from '@/lib/queries'
import { Address, AddressInput, AddressPatch } from '../types/address'
import { ADDRESS_ROUTES, addressKeys } from './routes'

/** GET /api/v1/users/me/addresses 🔒 — default first, then newest; at most 10, never paged. */
export function useAddresses() {
    const api = useApi()
    const { isSignedIn } = useAuth()
    return useQuery({
        queryKey: addressKeys.list,
        queryFn: () => api.get<Address[]>(ADDRESS_ROUTES.list),
        enabled: !!isSignedIn,
        retry: retryAuthAware,
        staleTime: 1000 * 30,
    })
}

/** POST — the first address a user saves becomes their default. */
export function useCreateAddress() {
    const api = useApi()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: AddressInput) => api.post<Address>(ADDRESS_ROUTES.list, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
    })
}

/** PATCH — the server checks the merged result against the per-country rules. */
export function useUpdateAddress() {
    const api = useApi()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, patch }: { id: string; patch: AddressPatch }) =>
            api.patch<Address>(ADDRESS_ROUTES.byId(id), patch),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
    })
}

/** DELETE — archives it; an old order's address copy never changes. */
export function useDeleteAddress() {
    const api = useApi()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => api.delete(ADDRESS_ROUTES.byId(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
    })
}

/** POST /:id/default — safe to repeat. */
export function useSetDefaultAddress() {
    const api = useApi()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => api.post<Address>(ADDRESS_ROUTES.makeDefault(id)),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
    })
}

/** A sentence for a failed address call, keyed on the error `code`. */
export function addressErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
        switch (err.error.code) {
            case 'USERS_ADDRESS_NOT_FOUND':
                return 'That address no longer exists.'
            case 'USERS_ADDRESS_LIMIT_REACHED':
                return 'You can save up to 10 addresses. Delete one to add another.'
            case 'USERS_ADDRESS_ARCHIVED':
                return 'That address was deleted. Pick another one.'
            case 'USERS_ADDRESS_USAGE_MISMATCH':
                return 'That address is saved for a different use. Pick another one.'
            case 'VALIDATION_ERROR':
                return 'Please check the highlighted fields.'
        }
    }
    return describeApiError(err)
}
