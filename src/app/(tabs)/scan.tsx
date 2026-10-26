import React from 'react';

import ScanScreen from '@/features/nfc-claim/screens/ScanScreen';

/**
 * Scan lives directly under `(tabs)` rather than in `(tabs)/(details)` because
 * it owns a button in the bottom bar. The URL is `/scan` either way — both are
 * group segments — so existing links and the NFC deep link are unaffected.
 */
export default function Scan() {
    return <ScanScreen />;
}
