import React from 'react'

import LegalDocument from '../components/LegalDocument'
import { PRIVACY_POLICY_META, PRIVACY_POLICY_SECTIONS } from '../data/privacyPolicy'

/**
 * Read-only rendering of the privacy policy. Reached from the "Privacy Policy"
 * link in the email registration form — the checkbox in that form stays the
 * acceptance control, so this screen only ever reads and returns.
 */
export default function PrivacyPolicyScreen() {
    return <LegalDocument meta={PRIVACY_POLICY_META} sections={PRIVACY_POLICY_SECTIONS} />
}
