import { Stack } from "expo-router";
import React from "react";

/** Lets Discover push its own screens (see-all) while keeping the tab bar. */
export default function DiscoverLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}
