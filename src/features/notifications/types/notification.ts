/** Who a notice is written for. `all` shows in both states. */
export type NotificationAudience = 'guest' | 'member' | 'all';

/** Drives the row's icon and accent colour. */
export type NotificationKind = 'account' | 'security' | 'claim' | 'drop' | 'tip';

/**
 * A notice as authored in `data/notices.ts`. `ageMinutes` is how old the item
 * is *relative to the feed anchor* (see `utils/seen.ts`), which is what lets a
 * fixed list still read as a live feed.
 */
export interface NotificationSeed {
    id: string;
    audience: NotificationAudience;
    kind: NotificationKind;
    title: string;
    body: string;
    ageMinutes: number;
    /** Route opened when the row is pressed. */
    href?: string;
}

/** A notice resolved against the anchor and the stored seen set. */
export interface AppNotification extends Omit<NotificationSeed, 'ageMinutes' | 'audience'> {
    createdAt: number;
    seen: boolean;
}

/** What `utils/seen.ts` persists per scope (guest, or a Clerk user id). */
export interface SeenRecord {
    /** Epoch ms the feed started for this scope — set once, then reused. */
    anchor: number;
    seen: string[];
}
