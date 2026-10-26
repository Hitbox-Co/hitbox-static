import { router } from 'expo-router'
import { ChevronLeft, Send } from 'lucide-react-native'
import React, { useRef, useState } from 'react'
import {
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ChatBubble from '../components/ChatBubble'
import ChatChannelActions from '../components/ChatChannelActions'
import SupportTopicChips from '../components/SupportTopicChips'
import {
    CHAT_DISCLAIMER,
    CHAT_FALLBACK,
    CHAT_FALLBACK_CHANNELS,
    CHAT_GREETING,
    SUPPORT_TOPICS,
} from '../data/supportChat'
import type { ChatMessage, SupportChannel, SupportTopic } from '../types/support'
import { buildSupportEmailHref } from '../utils/emailHandoff'

/** Ids only need to be unique within one session. */
let nextId = 0
const makeId = () => `msg-${nextId++}`

const OPENING: ChatMessage[] = [
    { id: 'system-disclaimer', author: 'system', text: CHAT_DISCLAIMER },
    { id: 'agent-greeting', author: 'agent', text: CHAT_GREETING },
]

/**
 * Support chat — a triage front-end for the email and phone channels.
 *
 * The assistant is scripted (see `data/supportChat.ts`), so nothing here calls
 * out to a model and no API key ships in the bundle. Its job is to ask what's
 * wrong, offer the first thing worth trying, then hand off to a real channel —
 * with the conversation written into the email body so the user doesn't have to
 * explain it twice.
 */
export default function SupportChatScreen() {
    const [messages, setMessages] = useState<ChatMessage[]>(OPENING)
    const [draft, setDraft] = useState('')
    // Cleared once the user picks a topic or types; the composer covers the rest.
    const [topicsVisible, setTopicsVisible] = useState(true)
    // Which channels the newest agent turn is offering, and the email subject.
    const [offer, setOffer] = useState<{ channelIds: string[]; emailSubject: string } | null>(null)

    const scrollRef = useRef<ScrollView>(null)
    const scrollToEnd = () =>
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))

    const goBack = () => {
        if (router.canGoBack()) router.back()
        else router.replace('/support')
    }

    const append = (entries: ChatMessage[]) => {
        setMessages((current) => [...current, ...entries])
        scrollToEnd()
    }

    const pickTopic = (topic: SupportTopic) => {
        setTopicsVisible(false)
        setOffer({ channelIds: topic.channelIds, emailSubject: topic.emailSubject })
        append([
            { id: makeId(), author: 'user', text: topic.label },
            { id: makeId(), author: 'agent', text: topic.reply },
        ])
    }

    const send = () => {
        const text = draft.trim()
        if (!text) return

        setDraft('')
        setTopicsVisible(false)
        setOffer({
            channelIds: CHAT_FALLBACK_CHANNELS,
            emailSubject: 'HitBox support request',
        })
        append([
            { id: makeId(), author: 'user', text },
            { id: makeId(), author: 'agent', text: CHAT_FALLBACK },
        ])
    }

    /**
     * Hand-off. Email carries the transcript; phones just dial. Built at press
     * time so the body reflects everything said up to this point.
     */
    const openChannel = (channel: SupportChannel) => {
        const href =
            channel.kind === 'email'
                ? buildSupportEmailHref(offer?.emailSubject ?? 'HitBox support request', messages)
                : channel.href

        Linking.openURL(href).catch(() => {
            append([
                {
                    id: makeId(),
                    author: 'agent',
                    text:
                        channel.kind === 'email'
                            ? `No email app is set up on this device. You can reach us at ${channel.value}.`
                            : `No phone app is available on this device. The number is ${channel.value}.`,
                },
            ])
        })
    }

    const canSend = draft.trim().length > 0

    return (
        <View className="flex-1 bg-background">
            <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="flex-1"
                >
                    {/* Header bar — same treatment as the support and legal screens */}
                    <View className="flex-row items-center gap-3 px-5 py-4 border-b border-white/10">
                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                            onPress={goBack}
                            hitSlop={8}
                            className="w-10 h-10 rounded-full bg-white/10 items-center justify-center active:opacity-60"
                        >
                            <ChevronLeft size={22} color="#fff" />
                        </TouchableOpacity>

                        <View className="flex-1">
                            <Text className="text-white text-lg font-bold" numberOfLines={1}>
                                Support chat
                            </Text>
                            <Text className="text-neutral-500 text-[11px] font-medium">
                                Automated assistant
                            </Text>
                        </View>
                    </View>

                    <ScrollView
                        ref={scrollRef}
                        className="flex-1"
                        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={scrollToEnd}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.map((message) => (
                            <ChatBubble key={message.id} message={message} />
                        ))}

                        {offer && (
                            <ChatChannelActions channelIds={offer.channelIds} onOpen={openChannel} />
                        )}

                        {topicsVisible && (
                            <SupportTopicChips topics={SUPPORT_TOPICS} onPick={pickTopic} />
                        )}
                    </ScrollView>

                    {/* Composer */}
                    <View className="flex-row items-end gap-2 px-5 pt-3 pb-4 border-t border-white/10">
                        <TextInput
                            value={draft}
                            onChangeText={setDraft}
                            placeholder="Describe your issue…"
                            placeholderTextColor="#525252"
                            multiline
                            accessibilityLabel="Message support"
                            className="flex-1 max-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white text-sm"
                            onSubmitEditing={send}
                        />

                        <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                            disabled={!canSend}
                            onPress={send}
                            activeOpacity={0.8}
                            className={`w-11 h-11 rounded-full items-center justify-center bg-primary ${canSend ? 'active:opacity-80' : 'opacity-40'}`}
                        >
                            <Send size={18} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    )
}
