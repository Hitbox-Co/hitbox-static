import { router, useLocalSearchParams } from 'expo-router'
import { Check } from 'lucide-react-native'
import React, { useState } from 'react'
import { Text, TextInput, TouchableOpacity, View, type TextInputProps } from 'react-native'

import { CheckoutShell, PageIntro, PrimaryAction, SecondaryLink, SectionHeading } from '../components/CheckoutParts'
import { checkoutActions, useCheckoutState } from '../store/checkoutStore'
import { DeliveryAddress } from '../types/checkout'

type FormState = Omit<DeliveryAddress, 'id' | 'label'>
const REQUIRED: (keyof FormState)[] = ['fullName', 'email', 'phone', 'street', 'city', 'state', 'zip']

const EMPTY: FormState = {
    fullName: '',
    email: '',
    phone: '',
    country: 'United States',
    street: '',
    unit: '',
    city: '',
    state: '',
    zip: '',
}

/**
 * 03 · Delivery address (Figma): add a new address, or edit one (`?edit=<id>`).
 * Saving makes it the delivery address and returns to Delivery. Held in the
 * in-memory checkout store only, until there is an address API.
 */
export default function AddressScreen() {
    const { edit } = useLocalSearchParams<{ edit?: string }>()
    const { addresses } = useCheckoutState()
    const editing = edit ? addresses.find((a) => a.id === edit) : undefined

    const [form, setForm] = useState<FormState>(() => {
        if (!editing) return EMPTY
        const { id: _id, label: _label, ...rest } = editing
        return rest
    })
    const [makeDefault, setMakeDefault] = useState(true)
    const [submitted, setSubmitted] = useState(false)

    const set = (key: keyof FormState) => (value: string) => setForm((f) => ({ ...f, [key]: value }))
    const invalid = (key: keyof FormState) => submitted && REQUIRED.includes(key) && !form[key].trim()

    const onSave = () => {
        setSubmitted(true)
        if (REQUIRED.some((key) => !form[key].trim())) return
        checkoutActions.saveAddress({
            ...form,
            id: editing?.id ?? `addr-${Date.now()}`,
            label: editing?.label ?? 'Home',
        })
        router.back()
    }

    return (
        <CheckoutShell
            footer={
                <>
                    <PrimaryAction label="Save & use this address" onPress={onSave} />
                    <SecondaryLink label="Cancel" danger onPress={() => router.back()} />
                </>
            }
        >
            <PageIntro title="Delivery address" subtitle="Where should your next drop land?" />

            <View className="gap-[14px]">
                <SectionHeading title="Contact details" />
                <Field label="Full name" value={form.fullName} onChangeText={set('fullName')} error={invalid('fullName')} autoComplete="name" />
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Field
                            label="Email address"
                            value={form.email}
                            onChangeText={set('email')}
                            error={invalid('email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>
                    <View className="flex-1">
                        <Field
                            label="Phone number"
                            value={form.phone}
                            onChangeText={set('phone')}
                            error={invalid('phone')}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                        />
                    </View>
                </View>
            </View>

            <View className="gap-[14px]">
                <SectionHeading title="Shipping address" />
                <Field label="Country / region" value={form.country} onChangeText={set('country')} />
                <Field label="Street address" value={form.street} onChangeText={set('street')} error={invalid('street')} autoComplete="street-address" />
                <Field label="Apartment, suite, etc. (optional)" value={form.unit} onChangeText={set('unit')} />
                <Field label="City" value={form.city} onChangeText={set('city')} error={invalid('city')} />
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <Field label="State" value={form.state} onChangeText={set('state')} error={invalid('state')} />
                    </View>
                    <View className="flex-1">
                        <Field
                            label="ZIP code"
                            value={form.zip}
                            onChangeText={set('zip')}
                            error={invalid('zip')}
                            keyboardType="number-pad"
                            autoComplete="postal-code"
                        />
                    </View>
                </View>
            </View>

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
                <Text className="font-syne text-xs text-[#111827]">Save as my default delivery address</Text>
            </TouchableOpacity>
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
    error?: boolean
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
            {error && <Text className="font-syne-medium text-[10px] text-[#e11d48]">Required</Text>}
        </View>
    )
}
