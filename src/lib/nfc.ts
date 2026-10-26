import { Alert, Platform } from 'react-native';
import NfcManager, { NfcEvents, type TagEvent } from 'react-native-nfc-manager';

/**
 * NFC helpers for the tap-to-claim flow.
 *
 * The tag id we send to the API is the chip's UID with all separators removed
 * and upper-cased — e.g. a tag read as "53:4A:70:C1:61:00:01" becomes
 * "534A70C1610001". That normalized string must match `Product.tagId` in the
 * backend exactly, so we normalize on every read.
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

/** Strip separators/whitespace and upper-case → the canonical tag id. */
export function normalizeTagId(raw?: string | null): string {
    return (raw ?? '').replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
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
 * Listen for tag taps while the Scan screen is open. Calls `onTag` with the
 * normalized tag id on every discovery. Returns a cleanup function that stops
 * scanning — scanning is scoped to `/scan`, not the whole app.
 */
export function startTagListener(onTag: (tagId: string) => void): () => void {
    let cancelled = false;

    NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
        const id = normalizeTagId(tag?.id);
        if (id && !cancelled) onTag(id);
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
