import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useMarketplaceFeed } from '../getMarketplaceFeed'

/**
 * Unit tests for the useMarketplaceFeed query hook.
 * See src/features/marketplace/__tests__/README.md for the documented matrix.
 */

const mockGet = jest.fn()

jest.mock('@/lib/api', () => ({ useApi: () => ({ get: mockGet, getPage: jest.fn() }) }))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

beforeEach(() => jest.clearAllMocks())

describe('useMarketplaceFeed', () => {
  it('fetches GET /api/v1/marketplace and returns the feed', async () => {
    const feed = { featured: [{ id: '1' }], newListings: [] }
    mockGet.mockResolvedValueOnce(feed)

    const { result } = renderHook(() => useMarketplaceFeed(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGet).toHaveBeenCalledWith('/api/v1/marketplace')
    expect(result.current.data).toEqual(feed)
  })

  it('surfaces an error when the request fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('offline'))

    const { result } = renderHook(() => useMarketplaceFeed(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toEqual(new Error('offline'))
  })
})
