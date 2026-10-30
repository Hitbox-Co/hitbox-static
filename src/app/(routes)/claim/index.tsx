import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';

import TapClaimScreen from '@/features/nfc-claim/screens/TapClaimScreen';
import { toTapUrl } from '@/lib/tap-url';

/** The Claim section's tap outcome. u / e / c arrive as route params from the Scan screen. */
export default function ClaimRoute() {
    const params = useLocalSearchParams<{ u?: string; b?: string; e?: string; c?: string }>();
    const tap = toTapUrl(params);

    // A malformed link cannot be claimed; nothing was sent, so there is nothing to spend.
    useEffect(() => {
        if (!tap) router.replace('/item-not-authenticated' as never);
    }, [tap]);

    return tap ? <TapClaimScreen tap={tap} /> : null;
}
