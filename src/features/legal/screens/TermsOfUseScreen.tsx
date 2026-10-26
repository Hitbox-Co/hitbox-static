import React from 'react'

import LegalDocument from '../components/LegalDocument'
import { TERMS_OF_USE_META, TERMS_OF_USE_SECTIONS } from '../data/termsOfUse'

/**
 * Read-only rendering of the terms of use. Reached from the "Terms and
 * Conditions" link in the email registration form — the checkbox in that form
 * stays the acceptance control, so this screen only ever reads and returns.
 */
export default function TermsOfUseScreen() {
    return <LegalDocument meta={TERMS_OF_USE_META} sections={TERMS_OF_USE_SECTIONS} />
}
