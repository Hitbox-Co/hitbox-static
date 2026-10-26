/**
 * Query keys for the notification feed.
 *
 * There is no `/api/v1/notifications` endpoint yet, so unlike the other
 * features' `routes.ts` this file has no URL builders — the key is here so the
 * feed reads like every other cached resource, and so a real endpoint can slot
 * in without the consumers changing.
 */
export const notificationKeys = {
    /** @param scope Clerk user id, or `guest`. */
    seen: (scope: string) => ['notifications', 'seen', scope] as const,
};
