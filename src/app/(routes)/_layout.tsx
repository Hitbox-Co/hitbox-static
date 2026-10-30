import { Stack } from "expo-router";
import React from "react";

/**
 * Pushed full-screen routes with **no tab bar** — the tap outcome screens
 * (`claim`, `verify`, `verify/check`), which own their whole viewport and end in
 * their own Done / back actions.
 *
 * `(routes)` is a group segment, so the URLs carry no trace of it. The one that
 * matters: `verify` is `/verify`, which is the path every chip's link uses —
 * `https://hitboxcollectibles.com/verify?b=&e=&c=` — so opening that link (an
 * App Link / Universal Link, see app.json) lands on `verify/index.tsx`.
 *
 * Screens that should keep the tab bar live in `(tabs)/(details)` instead.
 */
export default function RoutesLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
