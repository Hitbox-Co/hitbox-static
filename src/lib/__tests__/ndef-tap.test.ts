import {
  decodeUriPayload,
  describeTagProblem,
  parseNdefMessage,
  readTagRecords,
  type NdefRecordLike,
} from '../ndef-tap'

/**
 * Reading a tag, end to end minus the radio: the records below are built the
 * way real tag writers build them, byte for byte.
 */

const E = 'EF963FF7828658A599F3041510671E88'
const C = '94EED9EE65337086'
const LIVE = `https://hitboxcollectibles.com/verify?b=786&e=${E}&c=${C}`

const bytes = (text: string) => Array.from(text, (ch) => ch.charCodeAt(0))

/** A well-known URI record, scheme abbreviated with `prefixCode` like TagWriter does. */
const uriRecord = (url: string, prefixCode = 0x04, prefix = 'https://'): NdefRecordLike => ({
  tnf: 0x01,
  type: [0x55],
  payload: [prefixCode, ...bytes(url.startsWith(prefix) ? url.slice(prefix.length) : url)],
})

const textRecord = (text: string): NdefRecordLike => ({
  tnf: 0x01,
  type: [0x54],
  payload: [0x02, ...bytes('en'), ...bytes(text)],
})

/** Raw bytes of a short NDEF record (SR set), as stored on the chip. */
const rawShort = (tnf: number, type: string, payload: number[], flags: { mb?: boolean; me?: boolean }) => [
  (flags.mb ? 0x80 : 0) | (flags.me ? 0x40 : 0) | 0x10 | tnf,
  type.length,
  payload.length,
  ...bytes(type),
  ...payload,
]

describe('a tag written with the usual URL action (URI record)', () => {
  it('reads the tap from an https:// record', () => {
    expect(readTagRecords([uriRecord(LIVE)])).toEqual({ kind: 'tap', tap: { b: '786', e: E, c: C } })
  })

  it('reads the picc= / cmac= spelling NFC Utils and TagWriter write', () => {
    const url = `https://hitboxcollectibles.com/verify?b=786&picc=${E}&cmac=${C}`
    expect(readTagRecords([uriRecord(url)])).toEqual({ kind: 'tap', tap: { b: '786', e: E, c: C } })
  })

  it('reads the long nks… batch code too', () => {
    const b = 'nks068cs53pdkc2rkpkc0w'
    const url = `https://hitboxcollectibles.com/verify?b=${b}&e=${E}&c=${C}`
    expect(readTagRecords([uriRecord(url)])).toEqual({ kind: 'tap', tap: { b, e: E, c: C } })
  })

  it('reads an https://www. record (prefix 0x02)', () => {
    const url = `https://www.hitboxcollectibles.com/verify?b=786&e=${E}&c=${C}`
    expect(readTagRecords([uriRecord(url, 0x02, 'https://www.')])).toMatchObject({ kind: 'tap' })
  })

  it('reads a record with no scheme abbreviation (prefix 0x00)', () => {
    expect(readTagRecords([uriRecord(LIVE, 0x00, '')])).toMatchObject({ kind: 'tap' })
  })

  it('accepts the payload as a typed array as well as a plain array', () => {
    const record = uriRecord(LIVE)
    expect(readTagRecords([{ ...record, payload: Uint8Array.from(record.payload as number[]) }])).toMatchObject({
      kind: 'tap',
    })
  })

  it('accepts a record type delivered as text instead of bytes', () => {
    const record = uriRecord(LIVE)
    expect(readTagRecords([{ ...record, type: 'U' }])).toMatchObject({ kind: 'tap' })
    expect(readTagRecords([{ tnf: 0x03, type: LIVE, payload: [] }])).toMatchObject({ kind: 'tap' })
  })

  it('finds the link when other records come first', () => {
    expect(readTagRecords([textRecord('HitBox'), uriRecord(LIVE)])).toMatchObject({ kind: 'tap' })
  })
})

describe('other ways a link gets written', () => {
  it('reads an absolute-URI record (TNF 3, the URL sits in the type field)', () => {
    expect(readTagRecords([{ tnf: 0x03, type: bytes(LIVE), payload: [] }])).toMatchObject({ kind: 'tap' })
  })

  it('reads a Smart Poster that wraps a URI record', () => {
    const inner = rawShort(0x01, 'U', [0x04, ...bytes(LIVE.slice('https://'.length))], { mb: true, me: true })
    expect(readTagRecords([{ tnf: 0x01, type: bytes('Sp'), payload: inner }])).toMatchObject({ kind: 'tap' })
  })

  it('does not follow a Smart Poster nested inside a Smart Poster', () => {
    const inner = rawShort(0x01, 'U', [0x04, ...bytes(LIVE.slice(8))], { mb: true, me: true })
    const outer = rawShort(0x01, 'Sp', inner, { mb: true, me: true })
    expect(readTagRecords([{ tnf: 0x01, type: bytes('Sp'), payload: outer }])).toEqual({ kind: 'no-url' })
  })
})

describe('a tag that cannot be used, and why', () => {
  it('no NDEF at all (blank tag, or not an NFC Forum tag)', () => {
    expect(readTagRecords(undefined)).toEqual({ kind: 'no-ndef' })
    expect(readTagRecords(null)).toEqual({ kind: 'no-ndef' })
    expect(readTagRecords([])).toEqual({ kind: 'no-ndef' })
  })

  it('NDEF data but no link', () => {
    expect(readTagRecords([textRecord('hello')])).toEqual({ kind: 'no-url' })
  })

  it('a URI record with an unknown scheme code is not a link', () => {
    expect(readTagRecords([{ tnf: 0x01, type: [0x55], payload: [0x99, ...bytes('x')] }])).toEqual({ kind: 'no-url' })
  })

  it("someone else's website", () => {
    const record = uriRecord('https://example.com/promo?x=1')
    expect(readTagRecords([record])).toEqual({ kind: 'bad-url', reason: 'foreign-host', host: 'example.com' })
  })

  it('plain http', () => {
    const record = uriRecord(`http://hitboxcollectibles.com/verify?b=786&e=${E}&c=${C}`, 0x03, 'http://')
    expect(readTagRecords([record])).toEqual({ kind: 'bad-url', reason: 'not-https' })
  })

  it('our site, wrong path', () => {
    const record = uriRecord(`https://hitboxcollectibles.com/claim?b=786&e=${E}&c=${C}`)
    expect(readTagRecords([record])).toEqual({ kind: 'bad-url', reason: 'wrong-path' })
  })

  it('missing parameters are named', () => {
    const record = uriRecord('https://hitboxcollectibles.com/verify?b=786')
    expect(readTagRecords([record])).toEqual({ kind: 'bad-url', reason: 'bad-params', params: ['c', 'e'] })
  })

  it('SDM mirroring off: the tag writes the all-zero template, which is flagged as static', () => {
    const template = `https://hitboxcollectibles.com/verify?b=786&e=${'0'.repeat(32)}&c=${'0'.repeat(16)}`
    expect(readTagRecords([uriRecord(template)])).toEqual({ kind: 'bad-url', reason: 'static' })
  })

  it('reports the most useful problem when a tag carries several links', () => {
    const template = `https://hitboxcollectibles.com/verify?b=786&e=${'0'.repeat(32)}&c=${'0'.repeat(16)}`
    expect(readTagRecords([uriRecord('https://example.com/'), uriRecord(template)])).toEqual({
      kind: 'bad-url',
      reason: 'static',
    })
  })

  it('still reads a good link that follows a bad one', () => {
    expect(readTagRecords([uriRecord('https://example.com/'), uriRecord(LIVE)])).toMatchObject({ kind: 'tap' })
  })
})

describe('decodeUriPayload', () => {
  it('expands the scheme prefix', () => {
    expect(decodeUriPayload([0x04, ...bytes('a.com/x')])).toBe('https://a.com/x')
    expect(decodeUriPayload([0x01, ...bytes('a.com')])).toBe('http://www.a.com')
    expect(decodeUriPayload([0x05, ...bytes('+4412345')])).toBe('tel:+4412345')
  })

  it('is null for an empty payload or an unknown prefix', () => {
    expect(decodeUriPayload([])).toBeNull()
    expect(decodeUriPayload([0xff, 0x41])).toBeNull()
  })
})

describe('parseNdefMessage', () => {
  it('splits a two-record message', () => {
    const message = [
      ...rawShort(0x01, 'T', [0x02, ...bytes('en'), ...bytes('hi')], { mb: true }),
      ...rawShort(0x01, 'U', [0x04, ...bytes('a.com')], { me: true }),
    ]
    const records = parseNdefMessage(message)!
    expect(records).toHaveLength(2)
    expect(decodeUriPayload(records[1]!.payload)).toBe('https://a.com')
  })

  it('reads a long record (SR clear, 4-byte length)', () => {
    const payload = [0x04, ...bytes('a.com')]
    const message = [0xc1, 1, 0, 0, 0, payload.length, 0x55, ...payload]
    expect(parseNdefMessage(message)).toEqual([{ tnf: 1, type: [0x55], payload }])
  })

  it('reads a record that carries an id', () => {
    const payload = [0x04, ...bytes('a.com')]
    const message = [0xd9, 1, payload.length, 2, 0x55, 0x41, 0x42, ...payload]
    expect(parseNdefMessage(message)).toEqual([{ tnf: 1, type: [0x55], payload }])
  })

  it('is null when the message is cut short', () => {
    const message = rawShort(0x01, 'U', [0x04, ...bytes('a.com')], { mb: true, me: true })
    expect(parseNdefMessage(message.slice(0, -2))).toBeNull()
  })

  it('is null for chunked records', () => {
    expect(parseNdefMessage([0xb1, 1, 1, 0x55, 0x04])).toBeNull()
  })
})

describe('describeTagProblem', () => {
  it('has words for every failure, and names the specifics', () => {
    const cases = [
      { kind: 'no-ndef' },
      { kind: 'no-url' },
      { kind: 'repeated' },
      { kind: 'bad-url', reason: 'foreign-host', host: 'example.com' },
      { kind: 'bad-url', reason: 'not-https' },
      { kind: 'bad-url', reason: 'wrong-path' },
      { kind: 'bad-url', reason: 'bad-params', params: ['e'] },
      { kind: 'bad-url', reason: 'static' },
    ] as const
    for (const reading of cases) {
      const text = describeTagProblem(reading)
      expect(text.title.length).toBeGreaterThan(0)
      expect(text.hint.length).toBeGreaterThan(0)
    }
    expect(describeTagProblem({ kind: 'bad-url', reason: 'foreign-host', host: 'example.com' }).title).toContain('example.com')
    expect(describeTagProblem({ kind: 'bad-url', reason: 'bad-params', params: ['c', 'e'] }).hint).toContain('c, e')
  })
})
