import { Image } from 'expo-image';
import { AlertTriangle, Award, CheckCircle2, Info, ScanLine, ShieldCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Text, View } from 'react-native';

import { formatMoneyFromUsd } from '@/lib/currency';
import { ClaimOwner, TapProduct } from '../types/claim';

/** Pieces shared by the claim and verify result screens (light, per the Figma). */

export function ownerNameOf(owner: ClaimOwner | null): string | null {
    return owner?.displayName ?? owner?.handle ?? null;
}

/** "ULTRA_RARE" / "RARE" → "ULTRA RARE" / "RARE", or null for a drop with no rarity. */
export function rarityLabelOf(rarity: string | null | undefined): string | null {
    return rarity ? rarity.replace(/_/g, ' ').toUpperCase() : null;
}

export function Row({ label, value }: { label: string; value: string }) {
    return (
        <View className="h-[37px] flex-row items-center justify-between border-b border-[#dbeafe]">
            <Text className="font-syne text-xs text-[#6b7280]">{label}</Text>
            <Text numberOfLines={1} className="ml-4 shrink font-syne-medium text-xs text-[#111827]">{value}</Text>
        </View>
    );
}

/** The product a tap resolved to: image, name, code, price and rarity. */
export function ProductBox({ product, serial }: { product: TapProduct; serial?: number }) {
    const rarity = rarityLabelOf(product.rarity);
    return (
        <View className="w-full rounded border border-[#dbeafe] bg-white p-3">
            {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={{ width: '100%', height: 180, borderRadius: 4 }} contentFit="cover" transition={200} />
            ) : (
                <View className="h-[180px] w-full items-center justify-center rounded bg-[#eef2ff]">
                    <ScanLine color="#93c5fd" size={48} />
                </View>
            )}
            <Text className="mt-4 font-syne-bold text-xl text-[#111827]">{product.name}</Text>
            <Text className="mt-[2px] font-syne text-[11px] text-[#6b7280]">
                Code {product.groupCode}{serial != null ? ` · #${serial}` : ''}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
                {product.priceInDollars ? (
                    <Text className="font-syne-bold text-2xl text-[#111827]">{formatMoneyFromUsd(product.priceInDollars)}</Text>
                ) : <View />}
                {rarity ? (
                    <View className="flex-row items-center gap-[6px] rounded border border-[#bfdbfe] bg-[#eff6ff] px-[10px] py-[6px]">
                        <Award color="#2563eb" size={13} />
                        <Text className="font-syne-bold text-[10px] text-[#2563eb]">{rarity}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

type Tone = 'good' | 'warn' | 'bad';
const TONES: Record<Tone, { color: string; border: string; bg: string }> = {
    good: { color: '#0fab48', border: '#86efac', bg: '#ecfdf3' },
    warn: { color: '#d97706', border: '#fcd34d', bg: '#fffaed' },
    bad: { color: '#dc2626', border: '#fecaca', bg: '#fef2f2' },
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
    const { color, border, bg } = TONES[tone];
    const Icon = tone === 'good' ? CheckCircle2 : tone === 'warn' ? Info : AlertTriangle;
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center px-5 pt-2">
            <View className="mb-4 rounded-full border p-5" style={{ borderColor: border, backgroundColor: bg }}>
                <Icon color={color} size={48} />
            </View>
            <Text className="mb-2 px-2 text-center font-orbitron-black text-[22px] leading-[26px] tracking-[-0.4px] text-[#111827]">
                {title}
            </Text>
            <Text className="mb-5 px-3 text-center font-syne text-[13px] leading-[20px] text-[#6b7280]">{body}</Text>
            {children}
        </MotiView>
    );
}

/** Green "genuine" banner shown above a verified item. */
export function GenuineBanner({ label }: { label: string }) {
    return (
        <View className="mb-4 flex-row items-center gap-2 self-center rounded border border-[#005a21] bg-[rgba(100,255,157,0.38)] px-[10px] py-[6px]">
            <Text className="font-syne-bold text-[10px] text-[#005a21]">{label}</Text>
            <ShieldCheck color="#005a21" size={15} />
        </View>
    );
}
