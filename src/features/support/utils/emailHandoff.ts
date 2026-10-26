import { SUPPORT_EMAIL } from '../data/support'
import type { ChatMessage } from '../types/support'

/** Keeps the mailto: URL well short of the length some mail clients truncate at. */
const MAX_BODY_CHARS = 1500

/** "You: ..." / "Support: ..." — readable in a plain-text email body. */
function transcriptOf(messages: ChatMessage[]): string {
    return messages
        // The disclaimer is UI furniture, not part of the conversation.
        .filter((m) => m.author !== 'system')
        .map((m) => `${m.author === 'user' ? 'You' : 'Support assistant'}: ${m.text}`)
        .join('\n\n')
}

/**
 * Builds the `mailto:` that hands a chat off to the support inbox, carrying the
 * conversation with it — the point of the chat is that the user doesn't have to
 * retype what they already explained.
 *
 * Trimmed from the front when long: the most recent exchange is the useful part,
 * and an over-length mailto: gets silently cut off by some mail apps.
 */
export function buildSupportEmailHref(subject: string, messages: ChatMessage[]): string {
    let transcript = transcriptOf(messages)

    if (transcript.length > MAX_BODY_CHARS) {
        transcript = `…(earlier messages trimmed)\n\n${transcript.slice(-MAX_BODY_CHARS)}`
    }

    const body = transcript
        ? `\n\n---\nConversation from the in-app support chat:\n\n${transcript}`
        : ''

    const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    return `mailto:${SUPPORT_EMAIL}?${params}`
}
