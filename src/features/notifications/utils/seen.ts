import * as SecureStore from 'expo-secure-store';

import { SeenRecord } from '../types/notification';

/**
 * Read/unread state lives on the device — there is no notifications endpoint —
 * and is keyed per **scope** so two accounts on one phone don't share it:
 * a Clerk user id when signed in, `guest` when not.
 *
 * SecureStore is used because it's the only storage module already in the native
 * build (Clerk's token cache needs it). The payload is a handful of ids, well
 * inside its size limits. Keys may only contain `A-Za-z0-9._-`, which both
 * `guest` and Clerk's `user_…` ids satisfy.
 */
const KEY_PREFIX = 'hitbox.notifications.v1.';

export const GUEST_SCOPE = 'guest';

function keyFor(scope: string) {
    return `${KEY_PREFIX}${scope}`;
}

/**
 * Loads the scope's record, creating it on first use. The anchor is written once
 * and never moved: it's the instant this scope's feed "started", so relative
 * timestamps grow with real time instead of resetting on every open.
 */
export async function loadSeenRecord(scope: string): Promise<SeenRecord> {
    try {
        const raw = await SecureStore.getItemAsync(keyFor(scope));
        if (raw) {
            const parsed = JSON.parse(raw) as Partial<SeenRecord>;
            if (typeof parsed?.anchor === 'number' && Array.isArray(parsed.seen)) {
                return { anchor: parsed.anchor, seen: parsed.seen.filter((id) => typeof id === 'string') };
            }
        }
    } catch {
        // Unreadable or corrupt — fall through and start a fresh record.
    }

    const fresh: SeenRecord = { anchor: Date.now(), seen: [] };
    await persistSeenRecord(scope, fresh);
    return fresh;
}

export async function persistSeenRecord(scope: string, record: SeenRecord): Promise<void> {
    try {
        await SecureStore.setItemAsync(keyFor(scope), JSON.stringify(record));
    } catch {
        // Storage failures only cost the read state, never the feed itself.
    }
}
