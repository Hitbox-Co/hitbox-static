import { router } from 'expo-router';
import { BadgeCheck, ScanLine } from 'lucide-react-native';
import { MotiView } from 'moti';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { ClaimResult } from '../types/claim';
import NfcShell from './NfcShell';
import { ownerNameOf, rarityLabelOf } from './TapCards';

/**
 * An item you already own — the "Owned product · Provenance" layout from the
 * Figma, filled from the claim result: artwork, name, ownership badges, the
 * ledger entry and the two provenance steps the server really records (the tag
 * was authenticated, the item is registered to its owner).
 *
 * The Figma's "Purchase complete" row is not shown: the app has no purchase
 * record to draw it from.
 */
export default function OwnedProvenance({ result }: { result: ClaimResult }) {
    const { product, sku } = result;
    const rarity = rarityLabelOf(product.rarity);
    const owner = ownerNameOf(result.owner) ?? 'you';
    const claimedOn = result.claimedAt
        ? new Date(result.claimedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <NfcShell withTabBar={false}>
            <MotiView
                from={{ opacity: 0, translateY: 12 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="gap-5 px-5 pb-6 pt-3"
            >
                {/* Authenticated artwork */}
                <View
                    style={{
                        height: 400,
                        borderRadius: 24,
                        overflow: 'hidden',
                        backgroundColor: '#111827',
                        shadowColor: '#3b82f6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.13,
                        shadowRadius: 16,
                        elevation: 5,
                    }}
                >
                    {product.imageUrl ? (
                        <Image source={{ uri: product.imageUrl }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <ScanLine size={56} color="#3b82f6" />
                        </View>
                    )}
                    <View className="absolute left-[14px] top-[15px] rounded-full border border-[rgba(59,130,246,0.4)] bg-[rgba(30,64,175,0.55)] px-[10px] py-[6px]">
                        <Text className="font-syne-bold text-[8px] tracking-[0.5px] text-[#93c5fd]">NFC CLAIMED</Text>
                    </View>
                </View>

                {/* Identity */}
                <View className="gap-[10px]">
                    <Text className="font-orbitron-black text-[30px] leading-[34px] text-[#111827]">{product.name}</Text>
                    <Text className="font-syne text-[11px] tracking-[0.4px] text-[#6b7280]">
                        {[product.groupCode, rarity].filter(Boolean).join(' · ')}
                    </Text>
                </View>

                {/* Badges */}
                <View className="flex-row flex-wrap items-center gap-[6px]">
                    <View className="flex-row items-center gap-[7px] rounded border border-[#005a21] bg-[rgba(100,255,157,0.38)] px-[10px] py-[6px]">
                        <Text className="font-syne-bold text-[10px] text-[#005a21]">VERIFIED OWNERSHIP</Text>
                        <BadgeCheck size={15} color="#005a21" />
                    </View>
                    {rarity && (
                        <View className="rounded border border-[#bfdbfe] bg-[#eff6ff] px-[10px] py-[6px]">
                            <Text className="font-syne-bold text-[10px] text-[#2563eb]">{rarity}</Text>
                        </View>
                    )}
                </View>

                {/* Ledger entry */}
                <View className="gap-[10px] rounded border border-[#dbeafe] bg-white p-4">
                    <View className="self-start rounded-full border border-[rgba(255,183,3,0.19)] bg-[#fffaed] px-[10px] py-[5px]">
                        <Text className="font-syne-bold text-[9px] tracking-[0.6px] text-[#d97706]">PROVENANCE LEDGER</Text>
                    </View>
                    <Text className="font-syne-bold text-xl text-[#111827]">{sku.skuCode}</Text>
                    <Text className="font-syne text-[11px] leading-[18px] text-[#6b7280]">
                        {`Unique to ${product.name}. NFC verification records physical possession; purchase alone does not.`}
                    </Text>
                </View>

                {/* Provenance */}
                <View className="rounded border border-[#dbeafe] bg-white p-4">
                    <Text className="font-orbitron text-base text-[#111827]">Provenance</Text>

                    <View className="mt-3 flex-row items-center justify-between gap-3 py-2">
                        <View className="flex-1 gap-1">
                            <Text className="font-syne-bold text-[13px] text-[#111827]">NFC authenticated</Text>
                            <Text className="font-syne text-[11px] text-[#6b7280]">Physical possession verified</Text>
                        </View>
                        <ScanLine size={18} color="#2563eb" />
                    </View>

                    <View className="mt-3 flex-row items-center justify-between gap-3 py-2">
                        <View className="flex-1 gap-1">
                            <Text className="font-syne-bold text-[13px] text-[#2563eb]">{`Registered to ${owner}`}</Text>
                            <Text className="font-syne text-[11px] text-[#6b7280]">
                                {[`${sku.skuCode} · current owner`, claimedOn].filter(Boolean).join(' · ')}
                            </Text>
                        </View>
                        <BadgeCheck size={18} color="#f5b301" />
                    </View>

                    <Text className="mt-3 font-syne text-[10px] leading-[15px] text-[#6b7280]">
                        Recorded in the HitBox provenance ledger when this tag was claimed.
                    </Text>
                </View>

                {/* Actions */}
                <View className="items-center gap-5 pt-2">
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.85}
                        onPress={() => router.replace('/(tabs)/collections' as never)}
                        className="h-12 w-[240px] items-center justify-center rounded-[30px] border border-[#2563eb] bg-[#111827]"
                    >
                        <Text className="font-syne-bold text-[13px] text-white">View all Owned</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.85}
                        onPress={() => router.replace('/(tabs)/discover' as never)}
                        className="h-12 w-[240px] items-center justify-center rounded-[30px] border border-[#2563eb] bg-white"
                    >
                        <Text className="font-syne-bold text-[13px] text-[#2563eb]">Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </MotiView>
        </NfcShell>
    );
}
