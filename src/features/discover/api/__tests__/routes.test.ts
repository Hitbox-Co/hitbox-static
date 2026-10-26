import { buildDiscoverProductsPath, discoverKeys, DISCOVER_ROUTES } from '../routes'

/**
 * Unit tests for the discover route/query-key helpers.
 * See src/features/discover/__tests__/README.md for the documented matrix.
 */

describe('DISCOVER_ROUTES', () => {
  it('exposes the feed and products paths', () => {
    expect(DISCOVER_ROUTES.feed).toBe('/api/v1/discover')
    expect(DISCOVER_ROUTES.products).toBe('/api/v1/discover/products')
  })
})

describe('discoverKeys', () => {
  it('has a stable feed key', () => {
    expect(discoverKeys.feed).toEqual(['discover', 'feed'])
  })

  it('builds a products key with the filters embedded', () => {
    expect(discoverKeys.products({ section: 'trending' })).toEqual([
      'discover',
      'products',
      { section: 'trending' },
    ])
  })

  it('defaults products filters to an empty object', () => {
    expect(discoverKeys.products()).toEqual(['discover', 'products', {}])
  })
})

describe('buildDiscoverProductsPath', () => {
  it('returns the bare path when no filters are given', () => {
    expect(buildDiscoverProductsPath({})).toBe('/api/v1/discover/products')
  })

  it('appends section', () => {
    expect(buildDiscoverProductsPath({ section: 'new_releases' })).toBe(
      '/api/v1/discover/products?section=new_releases'
    )
  })

  it('appends search', () => {
    expect(buildDiscoverProductsPath({ search: 'ptv' })).toBe(
      '/api/v1/discover/products?search=ptv'
    )
  })

  it('URL-encodes a search term with spaces', () => {
    expect(buildDiscoverProductsPath({ search: 'pierce the veil' })).toBe(
      '/api/v1/discover/products?search=pierce+the+veil'
    )
  })

  it('appends page and limit', () => {
    expect(buildDiscoverProductsPath({ page: 2, limit: 30 })).toBe(
      '/api/v1/discover/products?page=2&limit=30'
    )
  })

  it('combines every filter in a stable order', () => {
    expect(
      buildDiscoverProductsPath({ section: 'top_creators', search: 'x', page: 3, limit: 10 })
    ).toBe('/api/v1/discover/products?section=top_creators&search=x&page=3&limit=10')
  })

  it('omits empty-string search and page 0 (falsy)', () => {
    expect(buildDiscoverProductsPath({ search: '', page: 0 })).toBe(
      '/api/v1/discover/products'
    )
  })
})
