import { Image } from 'expo-image';
import { AlertTriangle, Award, CheckCircle2, Info, ScanLine, ShieldCheck } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React from 'react';
import { Text, View } from 'react-native';

import { formatMoneyFromUsd } from '@/lib/currency';
import { ClaimOwner, TapProduct } from '../types/claim';

/** Pieces shared by the claim and verify result screens. */

export function ownerNameOf(owner: ClaimOwner | null): string | null {
    return owner?.displayName ?? owner?.handle ?? null;
}

export function Row({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-center py-2">
            <Text className="text-[13px] text-neutral-500 font-medium w-28">{label}</Text>
            <Text className="text-[14px] text-neutral-100 font-semibold flex-1 text-right" numberOfLines={1}>{value}</Text>
        </View>
    );
}

/** The product a tap resolved to: image, name, code, price and rarity. */
export function ProductBox({ product, serial }: { product: TapProduct; serial?: number }) {
    return (
        <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-2xl p-4">
            {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={{ width: '100%', height: 180, borderRadius: 14 }} contentFit="cover" transition={200} />
            ) : (
                <View className="w-full h-[180px] rounded-2xl bg-[#15151b] items-center justify-center">
                    <ScanLine color="#3A3A44" size={48} />
                </View>
            )}
            <Text className="text-white text-xl font-black mt-4">{product.name}</Text>
            <Text className="text-neutral-500 text-xs font-medium mt-0.5">
                Code {product.groupCode}{serial != null ? ` · #${serial}` : ''}
            </Text>
            <View className="flex-row items-center justify-between mt-3">
                {product.priceInDollars ? (
                    <Text className="text-primary text-2xl font-black">{formatMoneyFromUsd(product.priceInDollars)}</Text>
                ) : <View />}
                {product.rarity ? (
                    <View className="flex-row items-center bg-[#1A1508] border border-[#3A2E0A] rounded-full px-3 py-1.5">
                        <Award color="#F2B807" size={15} />
                        <Text className="text-[#F2B807] font-bold text-xs ml-1.5">
                            {product.rarity.charAt(0) + product.rarity.slice(1).toLowerCase()}
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

type Tone = 'good' | 'warn' | 'bad';
const TONES: Record<Tone, { color: string; border: string }> = {
    good: { color: '#28C76F', border: '#28C76F' },
    warn: { color: '#F2B807', border: '#F2B807' },
    bad: { color: '#FF3B30', border: '#7A1C1C' },
};

/** A centred icon, headline and sentence — the shape every non-success outcome shares. */
export function NoticeCard({
    tone,
    title,
    body,
    children,
}: {
    tone: Tone;
    title: string;
    body: string;
    children?: React.ReactNode;
}) {
    const { color, border } = TONES[tone];
    const Icon = tone === 'good' ? CheckCircle2 : tone === 'warn' ? Info : AlertTriangle;
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-2">
            <View className="p-5 rounded-full mb-4 border" style={{ borderColor: border, backgroundColor: '#12121a' }}>
                <Icon color={color} size={56} />
            </View>
            <Text className="text-2xl font-black text-white mb-1 text-center px-4">{title}</Text>
            <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4 mb-4">{body}</Text>
            {children}
        </MotiView>
    );
}

/** Green "genuine" banner shown above a verified item. */
export function GenuineBanner({ label }: { label: string }) {
    return (
        <View className="flex-row items-center mb-4">
            <ShieldCheck color="#28C76F" size={20} />
            <Text className="text-[#28C76F] font-bold text-sm ml-2">{label}</Text>
        </View>
    );
}
