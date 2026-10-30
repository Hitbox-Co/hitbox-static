import { buildVerifyTapPath, CLAIM_ROUTES, claimKeys } from '../routes'

const E = 'EF963FF7828658A599F3041510671E88'
const C = '94EED9EE65337086'

describe('CLAIM_ROUTES', () => {
  it('claims at the singular /claim endpoint', () => {
    expect(CLAIM_ROUTES.claim).toBe('/api/v1/claim')
  })
})

describe('buildVerifyTapPath', () => {
  it('puts b, e and c in the query string, in that order', () => {
    expect(buildVerifyTapPath({ b: '786', e: E, c: C })).toBe(`/api/v1/verify?b=786&e=${E}&c=${C}`)
  })

  it('carries the long public code unchanged', () => {
    const b = 'nks068cs53pdkc2rkpkc0w'
    expect(buildVerifyTapPath({ b, e: E, c: C })).toContain(`b=${b}&`)
  })

  it('encodes b, so a stray character cannot add a parameter', () => {
    const path = buildVerifyTapPath({ b: 'a&c=1', e: E, c: C })
    expect(path).toContain('b=a%26c%3D1&')
    expect(path.match(/[?&]c=/g)).toHaveLength(1)
  })

  it('never carries a chip UID — only the three tap values', () => {
    const path = buildVerifyTapPath({ b: '786', e: E, c: C })
    expect(Object.fromEntries(new URLSearchParams(path.split('?')[1]))).toEqual({ b: '786', e: E, c: C })
  })
})

describe('claimKeys', () => {
  it('keys a tap by its e, which differs on every tap', () => {
    expect(claimKeys.claimTap(E)).toEqual(['claims', 'claim', E])
    expect(claimKeys.verifyTap(E)).toEqual(['claims', 'verify', E])
  })

  it('keeps claim and verify answers apart for the same tap', () => {
    expect(claimKeys.claimTap(E)).not.toEqual(claimKeys.verifyTap(E))
  })

  it('has a shared prefix for invalidation', () => {
    expect(claimKeys.all).toEqual(['claims'])
    expect(claimKeys.claimTap(E).slice(0, 1)).toEqual(claimKeys.all)
  })
})

describe('buildVerifyTapPath for a per-tag tap (u)', () => {
  const U = '04DE5F1EACC040'

  it('puts u, e and c in the query string, in that order', () => {
    expect(buildVerifyTapPath({ u: U, e: E, c: C })).toBe(`/api/v1/verify?u=${U}&e=${E}&c=${C}`)
  })

  it('never sends b for a u tap', () => {
    expect(buildVerifyTapPath({ u: U, e: E, c: C })).not.toContain('b=')
  })
})
