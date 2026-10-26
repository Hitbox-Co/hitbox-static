import { NotificationSeed } from '../types/notification';

/**
 * The notice copy the app ships with.
 *
 * Unlike the legacy `data/*.js` mock files in other features, this is **not** a
 * stand-in for a backend response — HitBox has no notifications endpoint, and
 * these are product messages the app itself owns. When an endpoint does arrive,
 * replace `hooks/useNotifications.ts` and keep the same `AppNotification` shape;
 * nothing else has to change.
 *
 * `ageMinutes` is measured from the scope's anchor (first launch for a guest,
 * first authed load for a member), so the list always reads as a plausible
 * history and keeps ageing with real time instead of resetting on every open.
 */
export const NOTICES: NotificationSeed[] = [
    // ── Signed out ──────────────────────────────────────────────────────────
    {
        id: 'guest.secure-collection',
        audience: 'guest',
        kind: 'account',
        title: 'Sign in to secure your collection',
        body: 'Claimed items are tied to your account. Sign in so your collection and rewards follow you to any device.',
        ageMinutes: 4,
        href: '/(auth)/register',
    },
    {
        id: 'guest.tap-before-you-trust',
        audience: 'guest',
        kind: 'tip',
        title: 'Tap before you trust',
        body: 'Every HitBox item carries an NFC tag. Tap it to confirm the item is genuine — no account needed to check.',
        ageMinutes: 96,
        href: '/scan',
    },
    {
        id: 'guest.first-tap-claims',
        audience: 'guest',
        kind: 'security',
        title: 'First tap claims first ownership',
        body: 'Only the first person to tap an unclaimed tag can claim it. Keep your item’s tag to yourself until you do.',
        ageMinutes: 1_490,
    },

    // ── Signed in ───────────────────────────────────────────────────────────
    {
        id: 'member.welcome',
        audience: 'member',
        kind: 'account',
        title: 'You’re signed in',
        body: 'Welcome to HitBox. Your collection, claims and rewards are all set up and ready.',
        ageMinutes: 0,
    },
    {
        id: 'member.claim-next',
        audience: 'member',
        kind: 'claim',
        title: 'Claim your next item',
        body: 'Tap an unclaimed NFC tag and confirm the claim to add the item to your collection.',
        ageMinutes: 38,
        href: '/scan',
    },
    {
        id: 'member.ledger',
        audience: 'member',
        kind: 'security',
        title: 'Every claim lands on the ledger',
        body: 'Claims are written to the provenance ledger, so an item’s ownership history stays verifiable by anyone.',
        ageMinutes: 265,
    },
    {
        id: 'member.finish-profile',
        audience: 'member',
        kind: 'tip',
        title: 'Finish your profile',
        body: 'Add a display name and avatar so other collectors recognise you on the items you own.',
        ageMinutes: 2_640,
        href: '/edit-profile',
    },

    // ── Both ────────────────────────────────────────────────────────────────
    {
        id: 'all.marketplace-drop',
        audience: 'all',
        kind: 'drop',
        title: 'New drop live in Marketplace',
        body: 'Fresh collectibles just landed. Take a look before they’re claimed.',
        ageMinutes: 620,
        href: '/(tabs)/marketplace',
    },
];
