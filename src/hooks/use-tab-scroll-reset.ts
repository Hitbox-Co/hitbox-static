import { useIsFocused } from 'expo-router';
import { useEffect, useRef, type RefObject } from 'react';
import type { ScrollView } from 'react-native';

/**
 * Returns a tab to its opening state whenever it regains focus: scrolled to the
 * top, plus whatever `onReset` clears.
 *
 * Tab screens stay mounted, so React Navigation hands them back exactly as the
 * user left them — scrolled down, with a chip selected or a menu open.
 *
 * Driven by `useIsFocused()` rather than `useFocusEffect()` on purpose. These
 * screens live in a Stack nested inside the Tabs navigator, and `useFocusEffect`
 * binds to the *nearest* navigator — the inner stack, whose own focus never
 * changes when you switch tabs. `useIsFocused` folds in every ancestor's focus
 * state, so it flips on a tab change the way this needs.
 *
 * `onReset` is read through a ref so the effect depends only on focus. Callers
 * can pass an inline arrow without it re-running on every render, and it is
 * never stale.
 */
export function useTabScrollReset(
    ref: RefObject<ScrollView | null>,
    onReset?: () => void,
) {
    const isFocused = useIsFocused();

    const onResetRef = useRef(onReset);
    onResetRef.current = onReset;

    useEffect(() => {
        if (!isFocused) return;

        onResetRef.current?.();

        // Deferred a frame: a scroll dispatched while the tab is still
        // transitioning gets swallowed, Android especially.
        const frame = requestAnimationFrame(() => {
            ref.current?.scrollTo({ y: 0, animated: false });
        });

        return () => cancelAnimationFrame(frame);
    }, [isFocused, ref]);
}
