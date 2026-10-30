import { analyseTapUrl, parseTapUrl, toTapUrl } from '../tap-url'

const E = 'EF963FF7828658A599F3041510671E88'
const C = '94EED9EE65337086'
const url = (qs: string, base = 'https://hitboxcollectibles.com/verify') => `${base}?${qs}`

describe('parseTapUrl', () => {
  it('reads b, e and c from a tag URL with a short batch code', () => {
    expect(parseTapUrl(url(`b=786&e=${E}&c=${C}`))).toEqual({ b: '786', e: E, c: C })
  })

  it('reads the long nks… batch code too', () => {
    const b = 'nks068cs53pdkc2rkpkc0w'
    expect(parseTapUrl(url(`b=${b}&e=${E}&c=${C}`))).toEqual({ b, e: E, c: C })
  })

  it('upper-cases e and c so one tap always has one cache key', () => {
    const tap = parseTapUrl(url(`b=786&e=${E.toLowerCase()}&c=${C.toLowerCase()}`))
    expect(tap).toEqual({ b: '786', e: E, c: C })
  })

  it('accepts any parameter order, a trailing slash, www, a fragment and extra params', () => {
    expect(parseTapUrl(`https://www.hitboxcollectibles.com/verify/?c=${C}&utm=x&e=${E}&b=101#top`)).toEqual({
      b: '101',
      e: E,
      c: C,
    })
  })

  it('is case-insensitive about the host and path', () => {
    expect(parseTapUrl(`https://HitBoxCollectibles.com/VERIFY?b=786&e=${E}&c=${C}`)).not.toBeNull()
  })

  it.each([
    ['another host', url(`b=786&e=${E}&c=${C}`, 'https://evil.example.com/verify')],
    ['a look-alike host', url(`b=786&e=${E}&c=${C}`, 'https://hitboxcollectibles.com.evil.io/verify')],
    ['userinfo trick', url(`b=786&e=${E}&c=${C}`, 'https://hitboxcollectibles.com@evil.io/verify')],
    ['plain http', url(`b=786&e=${E}&c=${C}`, 'http://hitboxcollectibles.com/verify')],
    ['another path', url(`b=786&e=${E}&c=${C}`, 'https://hitboxcollectibles.com/claim')],
    ['the root path', url(`b=786&e=${E}&c=${C}`, 'https://hitboxcollectibles.com/')],
    ['a custom scheme', url(`b=786&e=${E}&c=${C}`, 'hitboxstatic://verify')],
    ['a missing b', url(`e=${E}&c=${C}`)],
    ['a missing e', url(`b=786&c=${C}`)],
    ['a missing c', url(`b=786&e=${E}`)],
    ['no query at all', 'https://hitboxcollectibles.com/verify'],
    ['a short e', url(`b=786&e=${E.slice(1)}&c=${C}`)],
    ['a long e', url(`b=786&e=${E}0&c=${C}`)],
    ['a non-hex e', url(`b=786&e=${'Z'.repeat(32)}&c=${C}`)],
    ['a short c', url(`b=786&e=${E}&c=${C.slice(1)}`)],
    ['a non-hex c', url(`b=786&e=${E}&c=${'G'.repeat(16)}`)],
    ['a too-short b', url(`b=12&e=${E}&c=${C}`)],
    ['a too-long b', url(`b=${'a'.repeat(21)}&e=${E}&c=${C}`)],
    ['a b with illegal characters', url(`b=78%206&e=${E}&c=${C}`)],
    ['a nks-looking b of the wrong length', url(`b=nks123&e=${E}&c=${C}`)],
    ['a repeated parameter', url(`b=786&b=787&e=${E}&c=${C}`)],
    ['a bad percent escape', url(`b=786&e=%E0%A4%A&c=${C}`)],
    ['an empty string', ''],
    ['whitespace', '   '],
  ])('rejects %s', (_label, input) => {
    expect(parseTapUrl(input)).toBeNull()
  })

  it('rejects null and undefined', () => {
    expect(parseTapUrl(null)).toBeNull()
    expect(parseTapUrl(undefined)).toBeNull()
  })
})

describe('toTapUrl (values from route params)', () => {
  it('accepts well-formed values', () => {
    expect(toTapUrl({ b: '786', e: E, c: C })).toEqual({ b: '786', e: E, c: C })
  })

  it('rejects missing or non-string values', () => {
    expect(toTapUrl({ b: '786', e: E })).toBeNull()
    expect(toTapUrl({ b: '786', e: [E], c: C })).toBeNull()
    expect(toTapUrl({})).toBeNull()
  })
})

describe('alternative parameter names (NXP TagWriter style: picc_data / cmac)', () => {
  it('reads picc_data and cmac', () => {
    expect(parseTapUrl(url(`b=786&picc_data=${E}&cmac=${C}`))).toEqual({ b: '786', e: E, c: C })
  })

  it('reads picc and cmac', () => {
    expect(parseTapUrl(url(`b=786&picc=${E}&cmac=${C}`))).toEqual({ b: '786', e: E, c: C })
  })

  it('reads a mix of the short and long names', () => {
    expect(parseTapUrl(url(`b=786&e=${E}&cmac=${C}`))).toEqual({ b: '786', e: E, c: C })
    expect(parseTapUrl(url(`b=786&picc_data=${E}&c=${C}`))).toEqual({ b: '786', e: E, c: C })
  })

  it('is case-insensitive about the names', () => {
    expect(parseTapUrl(url(`b=786&PICC_DATA=${E}&CMAC=${C}`))).toEqual({ b: '786', e: E, c: C })
  })

  it('always hands back the short names, with upper-case hex', () => {
    const tap = parseTapUrl(url(`b=786&picc_data=${E.toLowerCase()}&cmac=${C.toLowerCase()}`))!
    expect(Object.keys(tap).sort()).toEqual(['b', 'c', 'e'])
    expect(tap.e).toBe(E)
  })

  it('accepts the same value under two names', () => {
    expect(parseTapUrl(url(`b=786&e=${E}&picc_data=${E}&c=${C}`))).toEqual({ b: '786', e: E, c: C })
  })

  it('refuses two names carrying different values', () => {
    const other = 'A'.repeat(32)
    expect(analyseTapUrl(url(`b=786&e=${E}&picc_data=${other}&c=${C}`))).toEqual({
      ok: false,
      reason: 'bad-params',
      params: ['e'],
    })
  })

  it('still refuses a repeated name, even with the same value', () => {
    expect(parseTapUrl(url(`b=786&cmac=${C}&cmac=${C}&e=${E}`))).toBeNull()
  })

  it('names the missing parameter by its short name', () => {
    expect(analyseTapUrl(url(`b=786&picc_data=${E}`))).toEqual({
      ok: false,
      reason: 'bad-params',
      params: ['c'],
    })
  })

  it('flags the all-zero template under the long names too', () => {
    const template = url(`b=786&picc_data=${'0'.repeat(32)}&cmac=${'0'.repeat(16)}`)
    expect(analyseTapUrl(template)).toEqual({ ok: false, reason: 'static' })
  })
})

describe('toTapUrl with route params from a link opened outside the app', () => {
  it('accepts picc_data and cmac', () => {
    expect(toTapUrl({ b: '786', picc_data: E, cmac: C })).toEqual({ b: '786', e: E, c: C })
  })

  it('refuses an array (a repeated query parameter), even of agreeing values', () => {
    expect(toTapUrl({ b: '786', e: [E], c: C })).toBeNull()
    expect(toTapUrl({ b: '786', e: [E, E], c: C })).toBeNull()
  })

  it('refuses conflicting names', () => {
    expect(toTapUrl({ b: '786', e: E, picc_data: 'A'.repeat(32), c: C })).toBeNull()
  })
})

describe('per-tag taps (u)', () => {
  const U = '04DE5F1EACC040'

  it('reads u, e and c from a tag URL', () => {
    expect(parseTapUrl(url(`u=${U}&e=${E}&c=${C}`))).toEqual({ u: U, e: E, c: C })
  })

  it('upper-cases u, e and c', () => {
    expect(parseTapUrl(url(`u=${U.toLowerCase()}&e=${E.toLowerCase()}&c=${C.toLowerCase()}`))).toEqual({
      u: U,
      e: E,
      c: C,
    })
  })

  it('reads u from route params (a link opened from outside the app)', () => {
    expect(toTapUrl({ u: U, picc_data: E, cmac: C })).toEqual({ u: U, e: E, c: C })
  })

  it('refuses a u that is not 14 hex characters', () => {
    for (const bad of ['04DE5F', `${U}00`, '04DE5F1EACC04G', '']) {
      expect(parseTapUrl(url(`u=${bad}&e=${E}&c=${C}`))).toBeNull()
    }
  })

  it('refuses both u and b, and reports both', () => {
    expect(parseTapUrl(url(`u=${U}&b=786&e=${E}&c=${C}`))).toBeNull()
    expect(analyseTapUrl(url(`u=${U}&b=786&e=${E}&c=${C}`))).toEqual({
      ok: false,
      reason: 'bad-params',
      params: ['b', 'u'],
    })
  })

  it('reports a missing u (neither u nor b) as u', () => {
    expect(analyseTapUrl(url(`e=${E}&c=${C}`))).toEqual({ ok: false, reason: 'bad-params', params: ['u'] })
  })

  it('refuses a repeated u, even with agreeing copies', () => {
    expect(parseTapUrl(url(`u=${U}&u=${U}&e=${E}&c=${C}`))).toBeNull()
  })

  it('flags the placeholder template (zero e or c) as static', () => {
    expect(analyseTapUrl(url(`u=${U}&e=${'0'.repeat(32)}&c=${'0'.repeat(16)}`))).toEqual({
      ok: false,
      reason: 'static',
    })
  })
})
