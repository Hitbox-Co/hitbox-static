import { analyseTapUrl, type TapUrl, type TapUrlProblem } from './tap-url';

/**
 * Pulls a HitBox tap URL out of the NDEF records a tag delivered — and, when it
 * cannot, says why.
 *
 * Pure (no native module), so every real-world way a tag gets written is
 * covered by unit tests instead of by walking around with a phone. The records
 * are what `react-native-nfc-manager` puts in `TagEvent.ndefMessage`:
 * `{ tnf, type, payload }` with the byte fields as number arrays.
 *
 * Three encodings of "a link" turn up in practice:
 *   - a **URI record** (well-known type "U"): what NXP TagWriter's URL action
 *     writes. The first payload byte abbreviates the scheme (0x04 = "https://").
 *   - a **Smart Poster** (well-known type "Sp"): a URI record wrapped in a
 *     nested NDEF message, which some writers produce.
 *   - an **absolute URI** record (TNF 3): the whole URL sits in the *type*
 *     field and the payload is empty.
 */

export interface NdefRecordLike {
    tnf: number;
    /** Bytes, or already text — the library hands over either. */
    type: ArrayLike<number> | string;
    payload: ArrayLike<number>;
}

const TNF_WELL_KNOWN = 0x01;
const TNF_ABSOLUTE_URI = 0x03;

/** NFC Forum URI RTD, table 3 — what the first payload byte stands for. */
const URI_PREFIXES = [
    '', 'http://www.', 'https://www.', 'http://', 'https://', 'tel:', 'mailto:',
    'ftp://anonymous:anonymous@', 'ftp://ftp.', 'ftps://', 'sftp://', 'smb://', 'nfs://',
    'ftp://', 'dav://', 'news:', 'telnet://', 'imap:', 'rtsp://', 'urn:', 'pop:', 'sip:',
    'sips:', 'tftp:', 'btspp://', 'btl2cap://', 'btgoep://', 'tcpobex://', 'irdaobex://',
    'file://', 'urn:epc:id:', 'urn:epc:tag:', 'urn:epc:pat:', 'urn:epc:raw:', 'urn:epc:',
    'urn:nfc:',
];

/** Bytes → text. A tap URL is ASCII, so anything outside it is simply not ours. */
function asciiOf(bytes: ArrayLike<number>, from = 0): string {
    let out = '';
    for (let i = from; i < bytes.length; i += 1) out += String.fromCharCode(bytes[i]! & 0xff);
    return out;
}

function typeText(type: ArrayLike<number> | string): string {
    return typeof type === 'string' ? type : asciiOf(type);
}

function isType(type: ArrayLike<number> | string, expected: string): boolean {
    return typeText(type) === expected;
}

/** The text of a well-known "U" record's payload, scheme prefix expanded. */
export function decodeUriPayload(payload: ArrayLike<number>): string | null {
    if (payload.length < 1) return null;
    const prefix = URI_PREFIXES[payload[0]!];
    if (prefix === undefined) return null;
    return prefix + asciiOf(payload, 1);
}

/**
 * Splits a raw NDEF message into records (NFC Forum NDEF 1.0). Null when it is
 * malformed or uses chunked records, which no tag writer produces for a URL.
 */
export function parseNdefMessage(bytes: ArrayLike<number>): NdefRecordLike[] | null {
    const records: NdefRecordLike[] = [];
    let i = 0;
    while (i < bytes.length) {
        const header = bytes[i]!;
        const shortRecord = (header & 0x10) !== 0;
        const hasId = (header & 0x08) !== 0;
        const chunked = (header & 0x20) !== 0;
        if (chunked) return null;
        const tnf = header & 0x07;

        const typeLength = bytes[i + 1];
        if (typeLength === undefined) return null;
        let cursor = i + 2;

        let payloadLength: number;
        if (shortRecord) {
            const length = bytes[cursor];
            if (length === undefined) return null;
            payloadLength = length;
            cursor += 1;
        } else {
            if (cursor + 4 > bytes.length) return null;
            payloadLength =
                bytes[cursor]! * 0x1000000 + (bytes[cursor + 1]! << 16) + (bytes[cursor + 2]! << 8) + bytes[cursor + 3]!;
            cursor += 4;
        }

        let idLength = 0;
        if (hasId) {
            const length = bytes[cursor];
            if (length === undefined) return null;
            idLength = length;
            cursor += 1;
        }

        const end = cursor + typeLength + idLength + payloadLength;
        if (end > bytes.length) return null;

        records.push({
            tnf,
            type: Array.from({ length: typeLength }, (_, k) => bytes[cursor + k]!),
            payload: Array.from({ length: payloadLength }, (_, k) => bytes[cursor + typeLength + idLength + k]!),
        });
        i = end;
        if (header & 0x40) break; // message end
    }
    return records;
}

/** Every URL a set of records holds, whichever way it was written. */
function urlsIn(records: readonly NdefRecordLike[], depth = 0): string[] {
    const urls: string[] = [];
    for (const record of records) {
        if (record.tnf === TNF_WELL_KNOWN && isType(record.type, 'U')) {
            const url = decodeUriPayload(record.payload);
            if (url) urls.push(url);
        } else if (record.tnf === TNF_ABSOLUTE_URI) {
            urls.push(typeText(record.type));
        } else if (record.tnf === TNF_WELL_KNOWN && isType(record.type, 'Sp') && depth === 0) {
            const inner = parseNdefMessage(record.payload);
            if (inner) urls.push(...urlsIn(inner, depth + 1));
        }
    }
    return urls;
}

/** What reading one tag came to. */
export type TagReading =
    | { kind: 'tap'; tap: TapUrl }
    /** The tag delivered no NDEF message at all: blank, or not an NFC Forum tag. */
    | { kind: 'no-ndef' }
    /** NDEF data, but no web address in it. */
    | { kind: 'no-url' }
    /** A web address, but not a usable HitBox tap URL. */
    | ({ kind: 'bad-url' } & TapUrlProblem)
    /** The same link as the previous tap: a live chip's link changes every time. */
    | { kind: 'repeated' };

/** Which problem to report when a tag carries several URLs: the most useful first. */
const PROBLEM_PRIORITY: TapUrlProblem['reason'][] = [
    'static',
    'bad-params',
    'wrong-path',
    'foreign-host',
    'not-https',
];

export function readTagRecords(records: readonly NdefRecordLike[] | null | undefined): TagReading {
    if (!records || records.length === 0) return { kind: 'no-ndef' };

    const urls = urlsIn(records);
    if (urls.length === 0) return { kind: 'no-url' };

    const problems: TapUrlProblem[] = [];
    for (const url of urls) {
        const analysis = analyseTapUrl(url);
        if (analysis.ok) return { kind: 'tap', tap: analysis.tap };
        const { ok: _ok, ...problem } = analysis;
        problems.push(problem as TapUrlProblem);
    }
    problems.sort(
        (a, b) => PROBLEM_PRIORITY.indexOf(a.reason) - PROBLEM_PRIORITY.indexOf(b.reason),
    );
    return { kind: 'bad-url', ...problems[0]! };
}

export interface TagProblemText {
    title: string;
    hint: string;
}

/**
 * Plain-language words for a failed read. These describe the tag, not the
 * server: a tag that was written wrongly is the one failure the app can name
 * precisely (the server never says why a *tap* was refused).
 */
export function describeTagProblem(reading: Exclude<TagReading, { kind: 'tap' }>): TagProblemText {
    switch (reading.kind) {
        case 'no-ndef':
            return {
                title: "Couldn't read this tag",
                hint: 'Hold the back of your phone flat against the tag and keep it still. If it keeps happening, the tag may be blank.',
            };
        case 'no-url':
            return {
                title: 'This tag has no link',
                hint: 'It holds data, but no web address. A HitBox tag carries a hitboxcollectibles.com link.',
            };
        case 'repeated':
            return {
                title: 'Same link as last time',
                hint: "A genuine tag's link changes on every tap. If this keeps happening, the tag's tap counter may be switched off.",
            };
        case 'bad-url':
            switch (reading.reason) {
                case 'foreign-host':
                    return {
                        title: `This tag links to ${reading.host}`,
                        hint: "That isn't a HitBox link. Check you are holding the right item.",
                    };
                case 'not-https':
                    return {
                        title: 'This tag has no HitBox link',
                        hint: 'It carries a link, but not a secure hitboxcollectibles.com one.',
                    };
                case 'wrong-path':
                    return {
                        title: "This isn't a HitBox verify link",
                        hint: 'The tag was written with the wrong address. It should end in /verify.',
                    };
                case 'bad-params':
                    return {
                        title: "This tag's link is incomplete",
                        hint: `Missing or invalid: ${reading.params.join(', ')}. The tag was written incorrectly. Re-write it with the tag writer.`,
                    };
                case 'static':
                    return {
                        title: "This tag's link never changes",
                        hint: "Its secure code isn't switched on (SDM mirroring), so it can't be verified. Re-write the tag with the tag writer.",
                    };
            }
    }
}
