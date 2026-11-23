import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import { Camera, X } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { CheckoutShell, GroupedCard, PageIntro, PrimaryAction, SectionHeading } from '@/features/checkout/components/CheckoutParts'
import { formatMoney } from '@/features/checkout/utils/money'
import { useOrder } from '@/features/orders/api/getOrders'
import { paymentErrorMessage } from '../api/errors'
import { uploadReturnPhoto, useRequestRefund, useReturnEvidenceUploadUrl } from '../api/refunds'
import { EvidenceMimeType, RefundReasonCode } from '../types/payments'

const REASONS: { code: RefundReasonCode; label: string }[] = [
    { code: 'DEFECTIVE_ITEM', label: 'Item is defective' },
    { code: 'DEFECTIVE_TAG', label: 'NFC tag is defective' },
    { code: 'NOT_AS_DESCRIBED', label: 'Not as described' },
    { code: 'NOT_DELIVERED', label: 'Never arrived' },
    { code: 'BUYER_CHANGED_MIND', label: 'Changed my mind' },
    { code: 'OTHER', label: 'Something else' },
]

const MAX_PHOTOS = 8
const MIN_RETURN_REASON = 20

const ALLOWED_MIME: EvidenceMimeType[] = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

/**
 * Request a refund. Two shapes, chosen by the order's status:
 * - delivered / shipped → a **return**: 20+ char description and 1–8 photos
 *   (`physicalReturnRequired: true`); money moves only after the item is back;
 * - paid but not shipped → **cancel & refund** (`physicalReturnRequired: false`),
 *   no photos.
 */
export default function RefundScreen({ orderId }: { orderId?: string }) {
    const { data: order, isLoading } = useOrder(orderId)
    const requestRefund = useRequestRefund()
    const getUploadUrl = useReturnEvidenceUploadUrl()

    const [reasonCode, setReasonCode] = useState<RefundReasonCode>('DEFECTIVE_ITEM')
    const [reason, setReason] = useState('')
    const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([])
    const [busy, setBusy] = useState(false)

    if (isLoading || !order) {
        return (
            <CheckoutShell showBag={false}>
                <PageIntro title="Request a refund" />
                <View className="mt-24 items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </CheckoutShell>
        )
    }

    const isReturn = order.status === 'SHIPPED' || order.status === 'DELIVERED'
    const trimmed = reason.trim()
    const reasonOk = isReturn ? trimmed.length >= MIN_RETURN_REASON : trimmed.length >= 1
    const canSubmit = reasonOk && (!isReturn || photos.length >= 1) && !busy

    const pickPhotos = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            selectionLimit: MAX_PHOTOS - photos.length,
            quality: 0.8,
        })
        if (res.canceled) return
        setPhotos((prev) => [...prev, ...res.assets].slice(0, MAX_PHOTOS))
    }

    const onSubmit = async () => {
        setBusy(true)
        try {
            const evidenceAssetIds: string[] = []
            if (isReturn) {
                // One upload URL + one PUT per photo; the size is part of the signature.
                for (const photo of photos) {
                    const blob = await (await fetch(photo.uri)).blob()
                    const mime = (ALLOWED_MIME.includes(photo.mimeType as EvidenceMimeType)
                        ? photo.mimeType
                        : 'image/jpeg') as EvidenceMimeType
                    const upload = await getUploadUrl.mutateAsync({
                        orderId: order.id,
                        fileName: photo.fileName ?? `photo-${evidenceAssetIds.length + 1}.jpg`,
                        mimeType: mime,
                        sizeBytes: blob.size,
                    })
                    await uploadReturnPhoto(upload, photo.uri)
                    evidenceAssetIds.push(upload.assetId)
                }
            }
            await requestRefund.mutateAsync({
                orderId: order.id,
                reasonCode,
                reason: trimmed,
                physicalReturnRequired: isReturn,
                evidenceAssetIds,
            })
            Alert.alert(
                isReturn ? 'Return requested' : 'Refund requested',
                isReturn ? 'Send the item back so we can approve your refund.' : 'We will review your request shortly.',
                [{ text: 'OK', onPress: () => router.back() }],
            )
        } catch (err) {
            Alert.alert("Couldn't send your request", paymentErrorMessage(err))
        } finally {
            setBusy(false)
        }
    }

    return (
        <CheckoutShell
            showBag={false}
            footer={
                <PrimaryAction
                    label={busy ? 'Sending…' : isReturn ? 'Request return' : 'Cancel & refund'}
                    onPress={onSubmit}
                    disabled={!canSubmit}
                />
            }
        >
            <PageIntro
                title={isReturn ? 'Return item' : 'Cancel & refund'}
                subtitle={`${order.product.name} · ${formatMoney(order.amount, order.currency)}`}
            />

            <View className="gap-[10px]">
                <SectionHeading title="Reason" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {REASONS.map((r) => {
                        const selected = r.code === reasonCode
                        return (
                            <TouchableOpacity
                                key={r.code}
                                accessibilityRole="radio"
                                accessibilityState={{ selected }}
                                onPress={() => setReasonCode(r.code)}
                                className={`rounded-[30px] border px-4 py-2 ${selected ? 'border-[#111827] bg-[#111827]' : 'border-[#e5e7eb] bg-white'}`}
                            >
                                <Text className={`font-syne-semibold text-xs ${selected ? 'text-white' : 'text-[#374151]'}`}>{r.label}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            <View className="gap-[10px]">
                <SectionHeading title="Tell us what happened" />
                <TextInput
                    value={reason}
                    onChangeText={setReason}
                    multiline
                    maxLength={1000}
                    placeholder={isReturn ? 'Describe the problem (at least 20 characters)' : 'Why are you cancelling?'}
                    placeholderTextColor="#9ca3af"
                    className="min-h-[110px] rounded border border-[#e5e7eb] bg-white p-3 font-syne text-xs text-[#111827]"
                    style={{ textAlignVertical: 'top' }}
                />
                {isReturn && (
                    <Text className="font-syne text-[10px] text-[#6b7280]">{`${trimmed.length}/${MIN_RETURN_REASON} characters minimum`}</Text>
                )}
            </View>

            {isReturn && (
                <View className="gap-[10px]">
                    <SectionHeading title={`Photos (${photos.length}/${MAX_PHOTOS})`} />
                    <View className="flex-row flex-wrap gap-2">
                        {photos.map((p, i) => (
                            <View key={p.uri} style={{ width: 72, height: 72, borderRadius: 4, overflow: 'hidden' }}>
                                <Image source={{ uri: p.uri }} style={{ width: '100%', height: '100%' }} />
                                <TouchableOpacity
                                    accessibilityLabel="Remove photo"
                                    onPress={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                                    className="absolute right-1 top-1 size-5 items-center justify-center rounded-full bg-black/70"
                                >
                                    <X size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {photos.length < MAX_PHOTOS && (
                            <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityLabel="Add photos"
                                onPress={pickPhotos}
                                className="size-[72px] items-center justify-center rounded border border-dashed border-[#9ca3af]"
                            >
                                <Camera size={20} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text className="font-syne text-[10px] leading-[15px] text-[#6b7280]">
                        Add at least one clear photo of the item. Money is refunded after the item reaches us and passes inspection.
                    </Text>
                </View>
            )}

            <GroupedCard className="gap-1">
                <Text className="font-syne text-[11px] leading-[16px] text-[#6b7280]">
                    {isReturn
                        ? 'Once requested, only HitBox support can move your refund on. Banks usually take 5–10 business days after we send the money.'
                        : "Your order hasn't shipped, so no return is needed. Banks usually take 5–10 business days after we send the money."}
                </Text>
            </GroupedCard>
        </CheckoutShell>
    )
}
