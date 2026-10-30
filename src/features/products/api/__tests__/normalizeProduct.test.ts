import { normalizeProduct } from '../normalizeProduct'
import { formatRewardPoints } from '../../../discover/utils/format'

/** A `GET /products/:id` body as the current backend sends it (catalog restructure). */
const current = {
  id: 'cc8184ca-a533-4704-8c5e-1a0924b6c874',
  groupCode: '410000040001',
  name: 'Ronin Rookie — Single Card',
  description: 'A card',
  category: 'TRADING_CARD',
  rarity: 'RARE',
  status: 'PUBLISHED',
  totalSupply: 25,
  releaseStart: '2026-07-01T00:00:00.000Z',
  createdAt: '2026-06-01T00:00:00.000Z',
  images: ['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg'],
  price: { amount: '25.00', currency: 'USD', isFree: false },
}

describe('normalizeProduct — current API shape', () => {
  const product = normalizeProduct(current)

  it('maps groupCode to productCode (no more "#ined")', () => {
    expect(product.productCode).toBe('410000040001')
  })

  it('reads the price from price.amount', () => {
    expect(product.priceInDollars).toBe('25.00')
  })

  it('turns image URL strings into image objects', () => {
    expect(product.images.map((i) => i.url)).toEqual(['https://cdn.example/a.jpg', 'https://cdn.example/b.jpg'])
  })

  it('uses totalSupply as the supply, and zero sold', () => {
    expect(product.inventoryUnit).toBe(25)
    expect(product.unitsSold).toBe(0)
  })

  it('has no points rather than undefined points', () => {
    expect(product.rewardPoints).toBeNull()
  })

  it('uses releaseStart as the release date, and status as the state', () => {
    expect(product.releaseDate).toBe('2026-07-01T00:00:00.000Z')
    expect(product.state).toBe('PUBLISHED')
  })
})

describe('normalizeProduct — older API shape still works', () => {
  it('keeps the old field names when they are present', () => {
    const product = normalizeProduct({
      id: 'p1',
      productCode: '123456780001',
      name: 'Old',
      priceInDollars: '89.99',
      rewardPoints: 1200,
      inventoryUnit: 100,
      unitsSold: 40,
      images: [{ id: 'i1', title: null, description: null, url: 'https://cdn.example/x.jpg' }],
    })
    expect(product.productCode).toBe('123456780001')
    expect(product.priceInDollars).toBe('89.99')
    expect(product.rewardPoints).toBe(1200)
    expect(product.inventoryUnit).toBe(100)
    expect(product.unitsSold).toBe(40)
    expect(product.images[0]!.url).toBe('https://cdn.example/x.jpg')
  })
})

describe('normalizeProduct — missing and odd values never throw', () => {
  it('handles an empty body', () => {
    const product = normalizeProduct(null)
    expect(product.images).toEqual([])
    expect(product.priceInDollars).toBeNull()
    expect(product.rarity).toBeNull()
    expect(product.collection).toBeNull()
  })

  it('drops image entries that are neither URLs nor image objects', () => {
    const product = normalizeProduct({ id: 'x', images: ['https://a/b.jpg', null, 42, { nope: true }] })
    expect(product.images.map((i) => i.url)).toEqual(['https://a/b.jpg'])
  })
})

describe('formatRewardPoints (the Discover crash)', () => {
  it('is null when points are missing, instead of throwing', () => {
    expect(formatRewardPoints(undefined)).toBeNull()
    expect(formatRewardPoints(null)).toBeNull()
    expect(formatRewardPoints(Number.NaN)).toBeNull()
  })

  it('still formats real points', () => {
    expect(formatRewardPoints(12500)).toBe('12,500 pts')
    expect(formatRewardPoints(0)).toBe('0 pts')
  })
})
