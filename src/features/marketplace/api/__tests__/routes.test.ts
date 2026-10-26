import {
  buildMarketplaceListingsPath,
  marketplaceKeys,
  MARKETPLACE_ROUTES,
} from '../routes'

/**
 * Unit tests for the marketplace route/query-key helpers.
 * See src/features/marketplace/__tests__/README.md for the documented matrix.
 */

describe('MARKETPLACE_ROUTES', () => {
  it('exposes the feed and listings paths', () => {
    expect(MARKETPLACE_ROUTES.feed).toBe('/api/v1/marketplace')
    expect(MARKETPLACE_ROUTES.listings).toBe('/api/v1/marketplace/listings')
  })
})

describe('marketplaceKeys', () => {
  it('has stable all / feed keys', () => {
    expect(marketplaceKeys.all).toEqual(['marketplace'])
    expect(marketplaceKeys.feed).toEqual(['marketplace', 'feed'])
  })

  it('embeds filters in the listings key and defaults to {}', () => {
    expect(marketplaceKeys.listings({ category: 'cards' })).toEqual([
      'marketplace',
      'listings',
      { category: 'cards' },
    ])
    expect(marketplaceKeys.listings()).toEqual(['marketplace', 'listings', {}])
  })
})

describe('buildMarketplaceListingsPath', () => {
  it('returns the bare path with no filters', () => {
    expect(buildMarketplaceListingsPath({})).toBe('/api/v1/marketplace/listings')
  })

  it('appends category', () => {
    expect(buildMarketplaceListingsPath({ category: 'figures' })).toBe(
      '/api/v1/marketplace/listings?category=figures'
    )
  })

  it('appends search (URL-encoded)', () => {
    expect(buildMarketplaceListingsPath({ search: 'warped tour' })).toBe(
      '/api/v1/marketplace/listings?search=warped+tour'
    )
  })

  it('appends sort', () => {
    expect(buildMarketplaceListingsPath({ sort: 'price_desc' })).toBe(
      '/api/v1/marketplace/listings?sort=price_desc'
    )
  })

  it('appends page and limit', () => {
    expect(buildMarketplaceListingsPath({ page: 2, limit: 20 })).toBe(
      '/api/v1/marketplace/listings?page=2&limit=20'
    )
  })

  it('combines every filter in a stable order', () => {
    expect(
      buildMarketplaceListingsPath({
        category: 'apparel',
        search: 'x',
        sort: 'popular',
        page: 3,
        limit: 10,
      })
    ).toBe('/api/v1/marketplace/listings?category=apparel&search=x&sort=popular&page=3&limit=10')
  })

  it('omits falsy page 0 and empty search', () => {
    expect(buildMarketplaceListingsPath({ page: 0, search: '' })).toBe(
      '/api/v1/marketplace/listings'
    )
  })
})
