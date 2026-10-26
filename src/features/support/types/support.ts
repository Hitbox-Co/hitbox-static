/** Shapes for the Support / Contact Us section. */

/** Decides which icon the card shows and how the value is read out. */
export type SupportChannelKind = 'email' | 'phone'

export interface SupportChannel {
    id: string
    kind: SupportChannelKind
    /** Card heading, e.g. "Email Support". */
    title: string
    /** Human-readable address or number, shown as written. */
    value: string
    /**
     * What `Linking.openURL` receives — `mailto:` or `tel:`. Kept separate from
     * `value` because the dialer needs an unformatted number (`tel:+919876543210`)
     * while the card shows the spaced version.
     */
    href: string
    /** Label on the card's action button. */
    actionLabel: string
    /** Screen-reader label for the action button. */
    accessibilityLabel: string
}

/** Who said it. `system` is used for the opening note, styled differently. */
export type ChatAuthor = 'user' | 'agent' | 'system'

export interface ChatMessage {
    id: string
    author: ChatAuthor
    text: string
    /** Channel buttons rendered under an agent message, by `SupportChannel.id`. */
    channelIds?: string[]
}

/** A tappable suggestion under the latest agent message. */
export interface SupportTopic {
    id: string
    /** Chip label, and what gets echoed as the user's message. */
    label: string
    /** The agent's reply once picked. */
    reply: string
    /** Which contact channels this topic should offer. */
    channelIds: string[]
    /** Prefills the email subject when escalating from this topic. */
    emailSubject: string
}
