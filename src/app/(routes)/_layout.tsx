import { Stack } from "expo-router";
import React from "react";

/**
 * Pushed full-screen routes with **no tab bar** — the tap outcome screens
 * (`claim/[tagId]`, `verify/[tagId]`), which own their whole viewport and end in
 * their own Done / back actions.
 *
 * `(routes)` is a group segment, so the URLs carry no trace of it:
 * `claim/[tagId]` is `/claim/<TAGID>`, which is what NFC tags encode as
 * `hitboxstatic://claim/<TAGID>` (AGENTS.md §8).
 *
 * Screens that should keep the tab bar live in `(tabs)/(details)` instead.
 */
export default function RoutesLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
