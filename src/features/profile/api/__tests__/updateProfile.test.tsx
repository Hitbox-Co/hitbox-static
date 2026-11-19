import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useUpdateMe } from '../updateProfile'

/**
 * Unit tests for the profile update mutation (useUpdateMe).
 * See src/features/profile/__tests__/README.md for the documented matrix.
 */

const mockPatch = jest.fn()

jest.mock('@/lib/api', () => ({ useApi: () => ({ patch: mockPatch }) }))
jest.mock('@/lib/queries', () => ({
  queryKeys: { me: ['users', 'me'], user: (id: string) => ['users', id], authMe: ['auth', 'me'] },
}))

let client: QueryClient

function wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const updated = {
  id: '3f6a2c1e-8b4d-4e7a-9c2f-1d5e6b7a8c90',
  handle: 'ayan_2',
  fullName: 'Ayan Saha',
  avatarUrl: null,
  bio: null,
  createdAt: '2026-07-16T04:41:00.000Z',
  email: 'ayan@example.com',
  phone: null,
  role: 'USER',
  profileVisibility: 'PRIVATE',
  generalLocation: null,
  preferredMarketId: null,
  isActive: true,
  updatedAt: '2026-07-16T04:41:00.000Z',
}

beforeEach(() => {
  jest.clearAllMocks()
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
})

describe('useUpdateMe', () => {
  it('PATCHes /api/v1/users/me with the input', async () => {
    mockPatch.mockResolvedValueOnce(updated)
    const { result } = renderHook(() => useUpdateMe(), { wrapper })

    result.current.mutate({ handle: 'ayan_2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/users/me', { handle: 'ayan_2' })
  })

  it('writes the updated profile into the me cache on success', async () => {
    mockPatch.mockResolvedValueOnce(updated)
    const { result } = renderHook(() => useUpdateMe(), { wrapper })

    result.current.mutate({ handle: 'ayan_2' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(client.getQueryData(['users', 'me'])).toEqual(updated)
  })

  it('surfaces the error and leaves the cache untouched on failure', async () => {
    mockPatch.mockRejectedValueOnce(new Error('USERS_HANDLE_TAKEN'))
    const { result } = renderHook(() => useUpdateMe(), { wrapper })

    result.current.mutate({ username: 'taken' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(client.getQueryData(['users', 'me'])).toBeUndefined()
  })
})
