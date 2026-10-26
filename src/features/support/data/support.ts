import type { SupportChannel } from '../types/support'

/**
 * The support channels rendered by `SupportScreen`.
 *
 * Email only for now. The India and US phone lines were removed — they were
 * placeholder numbers rather than real support lines. The `phone` channel kind
 * is still supported end to end (see `SupportContactCard` and
 * `ChatChannelActions`), so adding a real line back is a matter of appending an
 * entry here — nothing else needs to change.
 */
export const SUPPORT_EMAIL = 'Hitboxcollectibles.admin@gmail.com'

export const SUPPORT_CHANNELS: SupportChannel[] = [
    {
        id: 'email',
        kind: 'email',
        title: 'Email Support',
        value: SUPPORT_EMAIL,
        href: `mailto:${SUPPORT_EMAIL}`,
        actionLabel: 'Send Email',
        accessibilityLabel: `Send an email to ${SUPPORT_EMAIL}`,
    },
]

export const SUPPORT_HEADING = 'Need Help?'

export const SUPPORT_SUBHEADING =
    "Our support team is here to help. Send us an email and we'll get back to you as soon as possible."
