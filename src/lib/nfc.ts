import { Alert, Platform } from 'react-native';
import NfcManager, { NfcEvents, type TagEvent } from 'react-native-nfc-manager';

import { readTagRecords, type TagReading } from './ndef-tap';
import type { TapUrl } from './tap-url';

/**
 * NFC helpers for the tap-to-claim flow.
 *
 * A chip is read for the URL it carries, never for its UID. On every tap the
 * chip writes a fresh, single-use URL (`…/verify?b=&e=&c=`); we extract those
 * three values and send them to the server, which does all the decrypting. The
 * UID is deliberately not read: it is the anti-counterfeiting secret, and a
 * flow that sent it would let anyone with a cloned UID pass.
 */

let started = false;

/** Start the NFC stack once. Safe to call repeatedly. */
export async function initNfc(): Promise<boolean> {
    if (started) return true;
    try {
        await NfcManager.start();
        started = true;
        return true;
    } catch {
        return false;
    }
}

export interface NfcStatus {
    supported: boolean;
    enabled: boolean;
}

export async function getNfcStatus(): Promise<NfcStatus> {
    // Make sure the native stack is started before querying — otherwise
    // isSupported()/isEnabled() can throw and look like "NFC off".
    const ok = await initNfc();
    if (!ok) return { supported: false, enabled: false };
    try {
        const supported = await NfcManager.isSupported();
        const enabled = supported ? await NfcManager.isEnabled() : false;
        return { supported, enabled };
    } catch {
        return { supported: false, enabled: false };
    }
}

/**
 * On app open (Android): if the device has NFC but it's turned off, prompt the
 * user to enable it and deep-link them into the system NFC settings. Android
 * doesn't let an app toggle NFC itself, so opening settings is the closest we
 * can do. No-op on iOS (Core NFC has no global toggle).
 */
export async function promptEnableNfcIfNeeded(): Promise<void> {
    if (Platform.OS !== 'android') return;
    await initNfc();
    const { supported, enabled } = await getNfcStatus();
    if (!supported || enabled) return;

    Alert.alert(
        'Turn on NFC',
        'HitBox needs NFC to scan and claim your collectible. Enable it in settings, then come back.',
        [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: () => { void NfcManager.goToNfcSetting(); } },
        ],
    );
}

/**
 * What one discovered tag came to: a tap URL, or the specific reason there is
 * none. Android delivers the NDEF message read at discovery, so the chip's
 * mirrored e/c for this very tap are already in it; iOS delivers the first NDEF
 * message of the session (an empty list for a tag without NDEF).
 */
export function readTag(tag: TagEvent | null | undefined): TagReading {
    return readTagRecords(tag?.ndefMessage);
}

export interface TagListenerHandlers {
    /** A chip with one of our tap URLs was read. Fires once per tap. */
    onTap: (tap: TapUrl) => void;
    /**
     * A chip was read but gave no usable tap URL — blank, wrong link, a link
     * that never changes. Says what is wrong with the tag, so the screen can too.
     */
    onProblem?: (reading: Exclude<TagReading, { kind: 'tap' }>) => void;
}

/** One physical tap can raise DiscoverTag more than once; the extras must not count. */
const DUPLICATE_WINDOW_MS = 3000;

/**
 * The last tap's `e`, kept across listeners. A live chip's link changes on every
 * tap, so the same `e` again — beyond the double-event window — means the chip
 * is not counting, and the server would only refuse it as a replay.
 */
let lastSeen: { e: string; at: number } | null = null;

/** Dev-only trace of what a read came to. Never prints e or c. */
function traceRead(reading: TagReading) {
    if (!__DEV__) return;
    const detail =
        reading.kind === 'tap'
            ? `${reading.tap.u !== undefined ? 'u' : 'b'} tag`
            : reading.kind === 'bad-url'
                ? reading.reason
                : '';
    console.log(`[nfc] tag read: ${reading.kind} ${detail}`.trim());
}

/**
 * Listen for tag taps while the Scan screen is focused. Returns a cleanup
 * function that stops scanning — scanning is scoped to the Scan tab, not the
 * whole app.
 */
export function startTagListener(handlers: TagListenerHandlers): () => void {
    let cancelled = false;

    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
        if (cancelled) return;
        const reading = readTag(tag);
        traceRead(reading);

        if (reading.kind !== 'tap') {
            handlers.onProblem?.(reading);
            return;
        }

        const { tap } = reading;
        const now = Date.now();
        if (lastSeen && tap.e === lastSeen.e) {
            if (now - lastSeen.at < DUPLICATE_WINDOW_MS) return; // the same tap, twice
            lastSeen = { e: tap.e, at: now };
            handlers.onProblem?.({ kind: 'repeated' });
            return;
        }
        lastSeen = { e: tap.e, at: now };
        handlers.onTap(tap);
    });

    // Make sure the native stack is up before registering, otherwise the very
    // first registration on a cold start can silently fail.
    void (async () => {
        const ok = await initNfc();
        if (!ok || cancelled) return;
        try {
            await NfcManager.registerTagEvent();
        } catch {
            /* NFC off / unsupported */
        }
    })();

    return () => {
        cancelled = true;
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        void NfcManager.unregisterTagEvent().catch(() => { /* ignore */ });
    };
}
