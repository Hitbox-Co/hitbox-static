import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useMarketplaceListings } from '../getMarketplaceListings'

/**
 * Unit tests for the useMarketplaceListings query hook.
 * See src/features/marketplace/__tests__/README.md for the documented matrix.
 */

const mockGetPage = jest.fn()

jest.mock('@/lib/api', () => ({ useApi: () => ({ get: jest.fn(), getPage: mockGetPage }) }))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const pageResult = { data: [{ id: '1' }], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }

beforeEach(() => jest.clearAllMocks())

describe('useMarketplaceListings', () => {
  it('fetches the bare listings path with no filters', async () => {
    mockGetPage.mockResolvedValueOnce(pageResult)
    const { result } = renderHook(() => useMarketplaceListings(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetPage).toHaveBeenCalledWith('/api/v1/marketplace/listings')
    expect(result.current.data).toEqual(pageResult)
  })

  it('builds the path from filters (category + search + page)', async () => {
    mockGetPage.mockResolvedValueOnce(pageResult)
    renderHook(() => useMarketplaceListings({ category: 'cards', search: 'ptv', page: 2 }), {
      wrapper,
    })

    await waitFor(() =>
      expect(mockGetPage).toHaveBeenCalledWith(
        '/api/v1/marketplace/listings?category=cards&search=ptv&page=2'
      )
    )
  })

  it('does not fetch when disabled', async () => {
    mockGetPage.mockResolvedValue(pageResult)
    const { result } = renderHook(
      () => useMarketplaceListings({ category: 'figures' }, { enabled: false }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(mockGetPage).not.toHaveBeenCalled()
  })
})
