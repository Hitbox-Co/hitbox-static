import { router, useLocalSearchParams } from 'expo-router'
import { Check } from 'lucide-react-native'
import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View, type TextInputProps } from 'react-native'

import {
    addressErrorMessage,
    useAddresses,
    useCreateAddress,
    useDeleteAddress,
    useSetDefaultAddress,
    useUpdateAddress,
} from '@/features/addresses/api/addresses'
import { AddressLabel } from '@/features/addresses/types/address'
import { validationFieldErrors } from '@/lib/api-errors'
import { CheckoutShell, PageIntro, PrimaryAction, SecondaryLink, SectionHeading } from '../components/CheckoutParts'
import { checkoutActions } from '../store/checkoutStore'

interface FormState {
    recipientName: string
    phone: string
    countryCode: string
    line1: string
    line2: string
    city: string
    state: string
    postalCode: string
}

const REQUIRED: (keyof FormState)[] = ['recipientName', 'line1', 'city', 'postalCode', 'countryCode']
const LABELS: AddressLabel[] = ['Home', 'Work', 'Other']

const EMPTY: FormState = {
    recipientName: '',
    phone: '',
    countryCode: 'IN',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
}

/**
 * 03 · Delivery address (Figma): add a new address, or edit one (`?edit=<id>`).
 * Saved to the buyer's address book (`/users/me/addresses`). The server checks
 * state and postal code against the country — India and the US strictly, since the
 * billing country decides the invoice's tax — and its messages show under each field.
 */
export default function AddressScreen() {
    const { edit } = useLocalSearchParams<{ edit?: string }>()
    const { data: addresses } = useAddresses()
    const editing = edit ? addresses?.find((a) => a.id === edit) : undefined

    const create = useCreateAddress()
    const update = useUpdateAddress()
    const remove = useDeleteAddress()
    const setDefault = useSetDefaultAddress()

    const [form, setForm] = useState<FormState>(() =>
        editing
            ? {
                recipientName: editing.recipientName,
                phone: editing.phone ?? '',
                countryCode: editing.countryCode,
                line1: editing.line1,
                line2: editing.line2 ?? '',
                city: editing.city,
                state: editing.state ?? '',
                postalCode: editing.postalCode,
            }
            : EMPTY,
    )
    const [label, setLabel] = useState<AddressLabel>(editing?.label ?? 'Home')
    const [makeDefault, setMakeDefault] = useState(!editing?.isDefault)
    const [submitted, setSubmitted] = useState(false)
    const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
    const busy = create.isPending || update.isPending || remove.isPending

    const set = (key: keyof FormState) => (value: string) => {
        setForm((f) => ({ ...f, [key]: value }))
        setServerErrors((e) => (e[key] ? { ...e, [key]: '' } : e))
    }
    const error = (key: keyof FormState) =>
        serverErrors[key] || (submitted && REQUIRED.includes(key) && !form[key].trim() ? 'Required' : '')

    const onSave = async () => {
        setSubmitted(true)
        if (REQUIRED.some((key) => !form[key].trim())) return
        const body = {
            label,
            recipientName: form.recipientName.trim(),
            line1: form.line1.trim(),
            line2: form.line2.trim() || null,
            city: form.city.trim(),
            state: form.state.trim() || null,
            postalCode: form.postalCode.trim(),
            countryCode: form.countryCode.trim().toUpperCase(),
            phone: form.phone.trim() || null,
        }
        try {
            const saved = editing
                ? await update.mutateAsync({ id: editing.id, patch: body })
                : await create.mutateAsync({ ...body, usage: 'BOTH' })
            if (makeDefault && !saved.isDefault) await setDefault.mutateAsync(saved.id)
            checkoutActions.selectAddress(saved.id)
            router.back()
        } catch (err) {
            const fields = validationFieldErrors(err)
            if (Object.keys(fields).length) setServerErrors(fields)
            else Alert.alert("Couldn't save address", addressErrorMessage(err))
        }
    }

    const onDelete = () => {
        if (!editing) return
        Alert.alert('Delete this address?', 'Orders you already placed are not affected.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await remove.mutateAsync(editing.id)
                        checkoutActions.selectAddress(null)
                        router.back()
                    } catch (err) {
                        Alert.alert("Couldn't delete address", addressErrorMessage(err))
                    }
                },
            },
        ])
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <PrimaryAction label={busy ? 'Saving…' : 'Save & use this address'} onPress={onSave} disabled={busy} />
                    {editing && <SecondaryLink label="Delete address" danger onPress={onDelete} />}
                    <SecondaryLink label="Cancel" danger onPress={() => router.back()} />
                </>
            }
        >
            <PageIntro title="Delivery address" subtitle="Also used as your billing address for the invoice." />

            <View className="flex-row gap-2">
                {LABELS.map((l) => {
                    const selected = l === label
                    return (
                        <TouchableOpacity
                            key={l}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            onPress={() => setLabel(l)}
                            className={`rounded-[30px] border px-4 py-2 ${selected ? 'border-[#111827] bg-[#111827]' : 'border-[#e5e7eb] bg-white'}`}
                        >
                            <Text className={`font-syne-semibold text-xs ${selected ? 'text-white' : 'text-[#374151]'}`}>{l}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            <View className="gap-[14px]">
                <SectionHeading title="Contact details" />
                <Field label="Full name" value={form.recipientName} onChangeText={set('recipientName')} error={error('recipientName')} autoComplete="name" />
                <Field label="Phone number (optional)" value={form.phone} onChangeText={set('phone')} error={error('phone')} keyboardType="phone-pad" autoComplete="tel" />
            </View>

            <View className="gap-[14px]">
                <SectionHeading title="Address" />
                <Field
                    label="Country code (e.g. IN, US)"
                    value={form.countryCode}
                    onChangeText={set('countryCode')}
                    error={error('countryCode')}
                    autoCapitalize="characters"
                    maxLength={2}
                />
                <Field label="Street address" value={form.line1} onChangeText={set('line1')} error={error('line1')} autoComplete="street-address" />
                <Field label="Apartment, suite, etc. (optional)" value={form.line2} onChangeText={set('line2')} error={error('line2')} />
                <Field label="City" value={form.city} onChangeText={set('city')} error={error('city')} />
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Field
                            label={['IN', 'US'].includes(form.countryCode.toUpperCase()) ? 'State code (e.g. KA, NY)' : 'State (optional)'}
                            value={form.state}
                            onChangeText={set('state')}
                            error={error('state')}
                            autoCapitalize="characters"
                        />
                    </View>
                    <View className="flex-1">
                        <Field
                            label="PIN / ZIP code"
                            value={form.postalCode}
                            onChangeText={set('postalCode')}
                            error={error('postalCode')}
                            autoComplete="postal-code"
                        />
                    </View>
                </View>
            </View>

            {!editing?.isDefault && (
                <TouchableOpacity
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: makeDefault }}
                    activeOpacity={0.8}
                    onPress={() => setMakeDefault((v) => !v)}
                    className="flex-row items-center gap-[10px]"
                >
                    <View
                        className={`size-[18px] items-center justify-center rounded border ${makeDefault ? 'border-[#2563eb] bg-[#2563eb]' : 'border-[#bfdbfe] bg-white'}`}
                    >
                        {makeDefault && <Check size={12} color="#fff" strokeWidth={3} />}
                    </View>
                    <Text className="font-syne text-xs text-[#111827]">Save as my default address</Text>
                </TouchableOpacity>
            )}
        </CheckoutShell>
    )
}

function Field({
    label,
    value,
    onChangeText,
    error,
    ...rest
}: {
    label: string
    value: string
    onChangeText: (value: string) => void
    error?: string
} & Omit<TextInputProps, 'value' | 'onChangeText'>) {
    return (
        <View className="gap-[6px]">
            <Text className="font-syne-medium text-[11px] text-[#374151]">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#9ca3af"
                className={`h-[46px] rounded border bg-white px-[14px] font-syne text-[13px] text-[#111827] ${error ? 'border-[#e11d48]' : 'border-[#dbeafe]'}`}
                {...rest}
            />
            {!!error && <Text className="font-syne-medium text-[10px] text-[#e11d48]">{error}</Text>}
        </View>
    )
}
