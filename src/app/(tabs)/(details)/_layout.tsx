import { Stack } from "expo-router";
import React from "react";

/**
 * Pushed routes that keep the bottom tab bar: settings, edit-profile, artists,
 * notifications. (Scan used to live here; it owns a tab button now, so it sits
 * directly under `(tabs)`.)
 *
 * They live **inside** `(tabs)` so the tab bar renders under them — a screen
 * only gets it if it's a descendant of the Tabs navigator. Both `(tabs)` and
 * `(details)` are group segments, so the URLs carry no trace of either:
 * `notifications.tsx` here is simply `/notifications`.
 *
 * `(tabs)/_layout.tsx` registers this group with `href: null` so it never shows
 * up as a fifth tab button.
 *
 * The tap outcome screens (`claim`, `verify`) deliberately sit outside, in the
 * root `(routes)` group, where they get the full viewport.
 */
export default function DetailsLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
