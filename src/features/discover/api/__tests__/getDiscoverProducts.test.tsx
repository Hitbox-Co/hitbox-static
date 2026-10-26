import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'

import { useDiscoverProducts } from '../getDiscoverProducts'

/**
 * Unit tests for the useDiscoverProducts query hook.
 * See src/features/discover/__tests__/README.md for the documented matrix.
 */

const mockGetPage = jest.fn()

jest.mock('@/lib/api', () => ({
  useApi: () => ({ get: jest.fn(), getPage: mockGetPage }),
}))

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

const page = { data: [{ id: '1' }], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }

beforeEach(() => jest.clearAllMocks())

describe('useDiscoverProducts', () => {
  it('fetches the bare products path with no filters', async () => {
    mockGetPage.mockResolvedValueOnce(page)
    const { result } = renderHook(() => useDiscoverProducts(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockGetPage).toHaveBeenCalledWith('/api/v1/discover/products')
    expect(result.current.data).toEqual(page)
  })

  it('builds the path from filters (search + page)', async () => {
    mockGetPage.mockResolvedValueOnce(page)
    renderHook(() => useDiscoverProducts({ search: 'ptv', page: 2 }), { wrapper })

    await waitFor(() =>
      expect(mockGetPage).toHaveBeenCalledWith('/api/v1/discover/products?search=ptv&page=2')
    )
  })

  it('does not fetch when disabled', async () => {
    mockGetPage.mockResolvedValue(page)
    const { result } = renderHook(
      () => useDiscoverProducts({ search: 'x' }, { enabled: false }),
      { wrapper }
    )

    // Query is disabled → stays pending/idle and never calls the API.
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(mockGetPage).not.toHaveBeenCalled()
  })
})
