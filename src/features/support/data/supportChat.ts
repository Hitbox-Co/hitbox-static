import type { SupportTopic } from '../types/support'

/**
 * Scripted support chat.
 *
 * There is no model behind this and it doesn't pretend otherwise — it is a
 * triage front-end for the channels in `support.ts`. It asks what the problem
 * is, gives the one or two things worth trying first, then hands the user to
 * email or phone with the conversation already written into the message.
 *
 * Keeping it scripted means no API key ships in the bundle and every answer is
 * one we chose deliberately, rather than something generated about a product the
 * model knows nothing about.
 */

export const CHAT_GREETING =
    "Hi! I'm the HitBox support assistant. I can point you to the right place — what do you need help with?"

/** Sits above the thread so nobody mistakes this for a live human. */
export const CHAT_DISCLAIMER =
    'This is an automated assistant, not a live agent. Pick a topic and it will connect you to the support team.'

export const CHAT_FALLBACK =
    "Thanks — I've noted that down. I can't resolve it here, but the support team can. Send it over by email and your message above comes with it."

/** Offered as buttons under the fallback reply and on the closing message. */
export const CHAT_FALLBACK_CHANNELS = ['email']

export const SUPPORT_TOPICS: SupportTopic[] = [
    {
        id: 'claim',
        label: "Can't claim an item",
        reply:
            "Let's check the basics first: the tag has to be unclaimed, and you need to be signed in — the claim is recorded against your account. Open Scan from the tab bar and hold the top-back of your phone against the tag. If it says the product isn't registered, the tag isn't linked to a HitBox item yet and the team will need to look it up.",
        channelIds: ['email'],
        emailSubject: 'HitBox support — cannot claim an item',
    },
    {
        id: 'nfc',
        label: 'NFC tag not scanning',
        reply:
            "Two things catch most cases: NFC has to be switched on in system settings, and the tag needs the top-back of the phone rather than the middle. The Scan screen will tell you if NFC is off and can open the setting for you. If it still won't read, the tag itself may be faulty — worth emailing us the product code.",
        channelIds: ['email'],
        emailSubject: 'HitBox support — NFC tag not scanning',
    },
    {
        id: 'account',
        label: 'Sign-in or account',
        reply:
            "If you're locked out, try signing in with the same method you registered with — email, or Google/Apple/Facebook. A brand-new account can also take a moment to finish setting up. For anything involving your email address or deleting an account, we need to handle it over email so we can verify it's you.",
        channelIds: ['email'],
        emailSubject: 'HitBox support — account and sign-in',
    },
    {
        id: 'collection',
        label: 'Item missing from my collection',
        reply:
            "Claimed items land in My Collections automatically. If one is missing, pull down on that screen to refresh first — the shelf may just be showing cached data. If it's still absent, send us the product code and roughly when you claimed it and we'll trace it in the ledger.",
        channelIds: ['email'],
        emailSubject: 'HitBox support — item missing from collection',
    },
    {
        id: 'human',
        label: 'I want to talk to a person',
        reply:
            "Of course. Email reaches the team directly, and this conversation is attached automatically so you won't have to explain it again. Someone will reply as soon as they can.",
        channelIds: ['email'],
        emailSubject: 'HitBox support request',
    },
]
