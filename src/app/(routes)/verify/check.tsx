import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';

import TapVerifyScreen from '@/features/nfc-claim/screens/TapVerifyScreen';
import { toTapUrl } from '@/lib/tap-url';

/** Read-only authenticity check. u / e / c arrive as route params. */
export default function VerifyCheckRoute() {
    const params = useLocalSearchParams<{ u?: string; b?: string; e?: string; c?: string }>();
    const tap = toTapUrl(params);

    useEffect(() => {
        if (!tap) router.replace('/item-not-authenticated' as never);
    }, [tap]);

    return tap ? <TapVerifyScreen tap={tap} /> : null;
}
