import { useAuth } from '@clerk/clerk-expo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { NOTICES } from '../data/notices';
import { AppNotification, SeenRecord } from '../types/notification';
import { GUEST_SCOPE, loadSeenRecord, persistSeenRecord } from '../utils/seen';
import { notificationKeys } from '../api/routes';

/**
 * The notification feed and its read state.
 *
 * Signed out and signed in are separate feeds *and* separate read state: the
 * scope is the Clerk user id when there's a session and `guest` when there
 * isn't, so signing in surfaces the member notices unread while a guest's
 * dismissals stay theirs. Nothing is ever deleted — a notice is only seen or
 * unseen.
 *
 * Both the bell badge in `MainHeader` and the notifications screen call this, and
 * they stay in step because the read state is a single Query cache entry.
 */
export function useNotifications() {
    const { isSignedIn, userId } = useAuth();
    const scope = isSignedIn && userId ? userId : GUEST_SCOPE;
    const audience = isSignedIn ? 'member' : 'guest';

    const queryClient = useQueryClient();
    const key = notificationKeys.seen(scope);

    const record = useQuery({
        queryKey: key,
        queryFn: () => loadSeenRecord(scope),
        // Device-local state: nothing else can change it behind our back.
        staleTime: Infinity,
        gcTime: Infinity,
    });

    const persist = useMutation({
        mutationFn: (next: SeenRecord) => persistSeenRecord(scope, next),
    });

    const notifications = useMemo<AppNotification[]>(() => {
        if (!record.data) return [];
        const { anchor, seen } = record.data;

        return NOTICES.filter((n) => n.audience === audience || n.audience === 'all')
            .map(({ ageMinutes, audience: _audience, ...rest }) => ({
                ...rest,
                createdAt: anchor - ageMinutes * 60_000,
                seen: seen.includes(rest.id),
            }))
            .sort((a, b) => b.createdAt - a.createdAt);
    }, [record.data, audience]);

    const unreadCount = useMemo(
        () => notifications.reduce((total, n) => (n.seen ? total : total + 1), 0),
        [notifications],
    );

    /** Cache first so the row reacts instantly, disk after. */
    const markSeen = useCallback(
        (ids: string[]) => {
            const current = queryClient.getQueryData<SeenRecord>(key);
            if (!current) return;

            const merged = Array.from(new Set([...current.seen, ...ids]));
            if (merged.length === current.seen.length) return;

            const next: SeenRecord = { ...current, seen: merged };
            queryClient.setQueryData(key, next);
            persist.mutate(next);
        },
        // `key` is derived from `scope`; persist is stable per scope.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [queryClient, scope],
    );

    const markAllSeen = useCallback(
        () => markSeen(notifications.map((n) => n.id)),
        [markSeen, notifications],
    );

    return {
        notifications,
        unreadCount,
        isLoading: record.isPending,
        refresh: record.refetch,
        markSeen,
        markAllSeen,
    };
}
