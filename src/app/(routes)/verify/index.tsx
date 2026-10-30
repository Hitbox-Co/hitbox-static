import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';

import TapEntryScreen from '@/features/nfc-claim/screens/TapEntryScreen';
import { toTapUrl } from '@/lib/tap-url';

/**
 * Where a tag's own link opens the app:
 *   https://hitboxcollectibles.com/verify?u=<UID>&e=<32 hex>&c=<16 hex>
 * (an Android App Link / iOS Universal Link — see app.json). The query string
 * arrives as route params.
 */
export default function VerifyEntryRoute() {
    const params = useLocalSearchParams<{ u?: string; b?: string; e?: string; c?: string }>();
    const tap = toTapUrl(params);

    useEffect(() => {
        if (!tap) router.replace('/item-not-authenticated' as never);
    }, [tap]);

    return tap ? <TapEntryScreen tap={tap} /> : null;
}
