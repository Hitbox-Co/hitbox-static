/**
 * The URL an NTAG 424 DNA chip writes on every tap:
 *
 *     https://hitboxcollectibles.com/verify?u=<UID, 14 hex>&e=<32 hex>&c=<16 hex>
 *
 *   u  the chip's UID, written once as plain text when the tag is programmed
 *      (every chip has its own keys). A lookup hint only: anyone can edit it, so
 *      the server also requires the UID inside `e` to match.
 *   e  encrypted tag data (32 hex)
 *   c  the tap's MAC (16 hex)
 *
 * Older batch-key tags carry `b` instead of `u` — the key set's short code
 * (e.g. `786`) or its long `nks…` public code, a lookup label, not a secret.
 * Exactly one of `u` / `b` is expected.
 *
 * **The app only reads and forwards these values. It never decrypts
 * anything and never holds a key** — the server does all of that, so nothing in
 * the app bundle can be used to forge a tap. This file checks the *shape* of
 * the URL, nothing more: a well-formed URL can still be fake, and the server
 * decides that.
 *
 * A tap URL is good for exactly one use (the chip's counter goes up on every
 * tap), so callers must send each one to the server once — see `useClaimTap`.
 */

interface TapUrlBase {
    e: string;
    c: string;
}

/** A tap carries either `u` (per-tag keys) or `b` (batch keys), never both. */
export type TapUrl = TapUrlBase & ({ u: string; b?: undefined } | { b: string; u?: undefined });

/** The identifying param of a tap, as it is sent to the server and passed between screens. */
export function tapIdentity(tap: TapUrl): { u: string } | { b: string } {
    return tap.u !== undefined ? { u: tap.u } : { b: tap.b! };
}

/** Hosts the chips are written with. */
const TAP_HOSTS = ['hitboxcollectibles.com', 'www.hitboxcollectibles.com'];
const TAP_PATH = '/verify';

/**
 * `nks` + 19 Crockford base32 chars (the long public code), or a 3-20 char short
 * code. A short code never starts with "nks" — the server refuses to create one
 * that does — so a half-formed `nks…` is a typo, not a short code.
 */
const B_PATTERN = /^(nks[0-9a-hjkmnp-tv-z]{19}|(?![nN][kK][sS])[A-Za-z0-9._-]{3,20})$/;
const U_PATTERN = /^[0-9a-fA-F]{14}$/;
const E_PATTERN = /^[0-9a-fA-F]{32}$/;
const C_PATTERN = /^[0-9a-fA-F]{16}$/;

/**
 * The names a parameter may arrive under. Tag writers disagree: NXP's own
 * examples (and TagWriter's default URL) say `picc_data` and `cmac`, ours say
 * `e` and `c`. Both are the same two values, so both are read — the app always
 * sends the server the short names.
 */
const U_NAMES = ['u'];
const B_NAMES = ['b'];
const E_NAMES = ['e', 'picc', 'picc_data', 'piccdata'];
const C_NAMES = ['c', 'cmac'];

/**
 * The one value a parameter has under any of its names.
 *   undefined  not present under any name
 *   null       ambiguous: repeated, or two names carrying different values
 *   string     the value
 * The same value under two names (`e=X&picc=X`) is not a conflict.
 */
function pickParam(params: Map<string, string[]>, names: string[]): string | null | undefined {
    const values = names.flatMap((name) => params.get(name) ?? []);
    if (values.length === 0) return undefined;
    const distinct = new Set(values);
    if (distinct.size > 1) return null;
    // Repeated under one name is ambiguous even when the copies agree.
    if (names.some((name) => (params.get(name)?.length ?? 0) > 1)) return null;
    return values[0];
}

type TapParam = 'u' | 'b' | 'e' | 'c';

/** Which of u|b / e / c are missing, ambiguous or malformed. */
function checkParams(params: Map<string, string[]>): {
    bad: TapParam[];
    tap?: TapUrl;
} {
    const u = pickParam(params, U_NAMES);
    const b = pickParam(params, B_NAMES);
    const e = pickParam(params, E_NAMES);
    const c = pickParam(params, C_NAMES);
    const bad: TapParam[] = [];

    // Exactly one of u / b. Neither is reported as the missing `u` (the current
    // format); both is reported as both, since a tag cannot be two things.
    let identity: { u: string } | { b: string } | undefined;
    if (u !== undefined && b !== undefined) {
        bad.push('u', 'b');
    } else if (b !== undefined) {
        if (typeof b === 'string' && B_PATTERN.test(b)) identity = { b };
        else bad.push('b');
    } else if (typeof u === 'string' && U_PATTERN.test(u)) {
        // Upper-case: the same chip is always the same `u`.
        identity = { u: u.toUpperCase() };
    } else {
        bad.push('u');
    }
    if (typeof e !== 'string' || !E_PATTERN.test(e)) bad.push('e');
    if (typeof c !== 'string' || !C_PATTERN.test(c)) bad.push('c');
    if (bad.length > 0 || !identity) return { bad };
    // Upper-case the hex so the same tap always has the same cache key.
    return {
        bad,
        tap: { ...identity, e: (e as string).toUpperCase(), c: (c as string).toUpperCase() } as TapUrl,
    };
}

/**
 * Shape check of the three values, whatever they were read from — route params
 * included, which is how a link opened from outside the app arrives (so the
 * `picc_data` / `cmac` spellings are accepted here too).
 */
export function toTapUrl(values: Record<string, unknown>): TapUrl | null {
    const params = new Map<string, string[]>();
    for (const [key, value] of Object.entries(values)) {
        // Only a plain string counts. expo-router hands back an array when a
        // query parameter was repeated, which is ambiguous — so it reads as
        // missing, exactly like a repeated name in a raw URL.
        if (typeof value === 'string') params.set(key.toLowerCase(), [value]);
    }
    return checkParams(params).tap ?? null;
}

/**
 * Why a URL was not accepted as a tap URL. Used to tell the person holding the
 * tag what is actually wrong with it — almost always a tag-writer setup
 * mistake — never to tell an attacker anything: it is computed on the phone.
 */
export type TapUrlProblem =
    /** Not an https URL at all. */
    | { reason: 'not-https' }
    /** A web link, but to some other site. */
    | { reason: 'foreign-host'; host: string }
    /** Our site, but not the /verify path. */
    | { reason: 'wrong-path' }
    /** u (or b), e or c is missing, malformed, or repeated. */
    | { reason: 'bad-params'; params: TapParam[] }
    /**
     * Well-formed, but e or c is a placeholder (all zeros): the chip is writing
     * the template, not live values — SDM mirroring is not switched on.
     */
    | { reason: 'static' };

export type TapUrlAnalysis = { ok: true; tap: TapUrl } | ({ ok: false } & TapUrlProblem);

/**
 * Reads `u` (or `b`), `e`, `c` out of a tag URL, or says why it cannot.
 *
 * Parsed by hand rather than with `URL` / `URLSearchParams`: React Native's
 * implementations are incomplete, and this must behave the same on every
 * device.
 */
export function analyseTapUrl(raw: string | null | undefined): TapUrlAnalysis {
    const match = /^https:\/\/([^/?#]+)(\/[^?#]*)?(?:\?([^#]*))?(?:#.*)?$/i.exec((raw ?? '').trim());
    if (!match) return { ok: false, reason: 'not-https' };

    const host = match[1]!.toLowerCase();
    if (!TAP_HOSTS.includes(host)) return { ok: false, reason: 'foreign-host', host };

    const path = (match[2] ?? '/').replace(/\/+$/, '') || '/';
    if (path.toLowerCase() !== TAP_PATH) return { ok: false, reason: 'wrong-path' };

    const params = new Map<string, string[]>();
    for (const pair of (match[3] ?? '').split('&')) {
        if (!pair) continue;
        const eq = pair.indexOf('=');
        const key = (eq === -1 ? pair : pair.slice(0, eq)).toLowerCase();
        let value = eq === -1 ? '' : pair.slice(eq + 1);
        try {
            value = decodeURIComponent(value.replace(/\+/g, ' '));
        } catch {
            // A value that cannot be decoded is not a usable value: record it
            // as something no pattern accepts, so the parameter reads as bad.
            value = '%';
        }
        params.set(key, [...(params.get(key) ?? []), value]);
    }

    const { bad, tap } = checkParams(params);
    if (!tap) return { ok: false, reason: 'bad-params', params: [...bad].sort() };

    // A template that was never switched to live mirroring is all zeros.
    if (/^0+$/.test(tap.e) || /^0+$/.test(tap.c)) return { ok: false, reason: 'static' };

    return { ok: true, tap };
}

/**
 * Reads `b`, `e`, `c` out of a tag URL. Null unless it is an https link to our
 * host and the `/verify` path with all three values well-formed and live.
 */
export function parseTapUrl(raw: string | null | undefined): TapUrl | null {
    const result = analyseTapUrl(raw);
    return result.ok ? result.tap : null;
}
