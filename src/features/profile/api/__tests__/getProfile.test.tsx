import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useMe, useUser } from '../getProfile'

/**
 * Unit tests for the profile read hooks (useMe, useUser).
 * See src/features/profile/__tests__/README.md for the documented matrix.
 */

const mockGet = jest.fn()
let mockIsSignedIn = true

jest.mock('@/lib/api', () => ({ useApi: () => ({ get: mockGet, getPage: jest.fn() }) }))
jest.mock('@clerk/clerk-expo', () => ({ useAuth: () => ({ isSignedIn: mockIsSignedIn }) }))
jest.mock('@/lib/queries', () => ({
  queryKeys: {
    me: ['users', 'me'],
    user: (id: string) => ['users', id],
    authMe: ['auth', 'me'],
  },
  retryAuthAware: () => false,
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const me = {
  id: '3f6a2c1e-8b4d-4e7a-9c2f-1d5e6b7a8c90',
  handle: 'ayan',
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

const UID = '9b1d7e3a-4c2f-4a8b-b6d1-2e3f4a5b6c7d'

beforeEach(() => {
  jest.clearAllMocks()
  mockIsSignedIn = true
})

describe('useMe', () => {
  it('fetches GET /api/v1/users/me and returns the profile', async () => {
    mockGet.mockResolvedValueOnce(me)
    const { result } = renderHook(() => useMe(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/users/me')
    expect(result.current.data).toEqual(me)
  })

  it('is disabled (no fetch) when signed out', async () => {
    mockIsSignedIn = false
    const { result } = renderHook(() => useMe(), { wrapper })

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(mockGet).not.toHaveBeenCalled()
  })
})

describe('useUser', () => {
  it('does not fetch a non-uuid id (the server would answer 500)', async () => {
    const { result } = renderHook(() => useUser('u_2'), { wrapper })
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(mockGet).not.toHaveBeenCalled()
  })

  it('fetches the public profile for a given id', async () => {
    mockGet.mockResolvedValueOnce({ id: UID, handle: 'other' })
    const { result } = renderHook(() => useUser(UID), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGet).toHaveBeenCalledWith(`/api/v1/users/${UID}`)
  })

  it('is disabled when the id is undefined', async () => {
    const { result } = renderHook(() => useUser(undefined), { wrapper })

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(mockGet).not.toHaveBeenCalled()
  })
})
