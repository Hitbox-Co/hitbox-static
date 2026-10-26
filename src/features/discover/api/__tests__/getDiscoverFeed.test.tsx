import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useDiscoverFeed } from '../getDiscoverFeed'

/**
 * Unit tests for the useDiscoverFeed query hook.
 * See src/features/discover/__tests__/README.md for the documented matrix.
 */

const mockGet = jest.fn()

jest.mock('@/lib/api', () => ({
  useApi: () => ({ get: mockGet, getPage: jest.fn() }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => jest.clearAllMocks())

describe('useDiscoverFeed', () => {
  it('fetches GET /api/v1/discover and returns the feed', async () => {
    const feed = { featured: [], trending: [{ id: '1' }], newReleases: [], topCreators: [] }
    mockGet.mockResolvedValueOnce(feed)

    const { result } = renderHook(() => useDiscoverFeed(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/discover')
    expect(result.current.data).toEqual(feed)
  })

  it('surfaces an error when the request fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() => useDiscoverFeed(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(new Error('network down'))
  })
})
