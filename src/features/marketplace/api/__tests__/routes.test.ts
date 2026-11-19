import {
  buildMarketplaceFeedPath,
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
  it('has a stable all key', () => {
    expect(marketplaceKeys.all).toEqual(['marketplace'])
  })

  it('keys the feed by category, "all" when there is none', () => {
    expect(marketplaceKeys.feed()).toEqual(['marketplace', 'feed', 'all'])
    expect(marketplaceKeys.feed('cards')).toEqual(['marketplace', 'feed', 'cards'])
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

describe('buildMarketplaceFeedPath', () => {
  it('is the bare feed path for All Items', () => {
    expect(buildMarketplaceFeedPath()).toBe('/api/v1/marketplace')
  })

  it('adds the category chip', () => {
    expect(buildMarketplaceFeedPath('figures')).toBe('/api/v1/marketplace?category=figures')
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
    expect(buildMarketplaceListingsPath({ sort: 'popular' })).toBe(
      '/api/v1/marketplace/listings?sort=popular'
    )
  })

  it('sends featured as the literal strings true / false', () => {
    expect(buildMarketplaceListingsPath({ featured: true })).toBe(
      '/api/v1/marketplace/listings?featured=true'
    )
    expect(buildMarketplaceListingsPath({ featured: false })).toBe(
      '/api/v1/marketplace/listings?featured=false'
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
        featured: true,
        category: 'apparel',
        search: 'x',
        sort: 'popular',
        page: 3,
        limit: 10,
      })
    ).toBe(
      '/api/v1/marketplace/listings?featured=true&category=apparel&search=x&sort=popular&page=3&limit=10'
    )
  })

  it('omits falsy page 0 and empty search', () => {
    expect(buildMarketplaceListingsPath({ page: 0, search: '' })).toBe(
      '/api/v1/marketplace/listings'
    )
  })
})
