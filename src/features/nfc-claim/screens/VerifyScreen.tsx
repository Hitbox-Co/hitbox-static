import { router } from 'expo-router';
import {
    AlertTriangle,
    BadgeCheck,
    CheckCircle2,
    Info,
    RefreshCw,
    ScanLine,
    ShieldAlert,
    ShieldCheck,
} from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiRequestError } from '@/lib/api';
import { useLedger } from '../api/useLedger';
import { useVerifyTag } from '../api/useVerifyTag';
import { LedgerEntry, VerifyResult } from '../types/claim';

function errorCodeOf(err: unknown): string | null {
    return err instanceof ApiRequestError ? err.error.code : null;
}

/**
 * Read-only authenticity check for a tag — no sign-in, nothing claimed.
 * Shows: is it genuine, who owns it (userId), and the full provenance ledger.
 */
export default function VerifyScreen({ tagId }: { tagId: string }) {
    const verify = useVerifyTag(tagId);
    const ledger = useLedger(tagId, verify.isSuccess);

    const code = errorCodeOf(verify.error);

    const v = verify.data;

    return (
        <SafeAreaView className="flex-1 bg-[#050507]">
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center my-2">
                    <View className="flex items-center justify-center w-full mb-5">

                        <Image
                            source={require("@/assets/images/HitBoxLogo.png")}
                            resizeMode="contain"
                            style={{
                                width: 50,
                                height: 50,
                            }}
                        />

                    </View>
                    <Text className="text-neutral-500 text-[11px] font-bold uppercase tracking-widest mt-1">
                        Authenticity check
                    </Text>
                </MotiView>

                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-3.5 mt-2 mb-5 flex-row items-center">
                    <ScanLine color="#208AEF" size={22} />
                    <View className="ml-3">
                        <Text className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">NFC Tag</Text>
                        <Text className="text-white text-base font-bold tracking-wide">{tagId}</Text>
                    </View>
                </MotiView>

                {verify.isPending && (
                    <View className="items-center mt-16">
                        <ActivityIndicator size="large" color="#208AEF" />
                        <Text className="text-neutral-300 mt-4 text-base font-medium">Verifying on the ledger…</Text>
                    </View>
                )}

                {v && <ResultCard v={v} />}

                {code === 'CLAIMS_TAG_NOT_FOUND' && (
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-4">
                        <View className="bg-[#2A1414] p-5 rounded-full mb-4 border" style={{ borderColor: '#7A1C1C' }}>
                            <ShieldAlert color="#FF3B30" size={56} />
                        </View>
                        <Text className="text-2xl font-black text-white mb-2 text-center">Product is not registered</Text>
                        <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-5">
                            This NFC tag isn&apos;t linked to any HitBox product, so it can&apos;t be verified.
                        </Text>
                        <View className="mt-5 bg-[#0F0F13] border border-[#1F1F24] rounded-xl px-4 py-3">
                            <Text className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Scanned tag</Text>
                            <Text className="text-neutral-200 text-sm font-bold tracking-wide">{tagId}</Text>
                        </View>
                    </MotiView>
                )}

                {verify.isError && code !== 'CLAIMS_TAG_NOT_FOUND' && (
                    <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-6">
                        <View className="bg-[#2A1414] p-5 rounded-full mb-4 border" style={{ borderColor: '#7A1C1C' }}>
                            <AlertTriangle color="#FF3B30" size={56} />
                        </View>
                        <Text className="text-2xl font-black text-white mb-2">Couldn&apos;t verify</Text>
                        <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4">
                            {(verify.error as Error)?.message ?? 'Could not reach the server.'}
                        </Text>
                        <Text className="text-[12px] text-neutral-500 mt-3 uppercase tracking-wider">{code ?? 'ERROR'}</Text>
                    </MotiView>
                )}

                {(ledger.data?.length ?? 0) > 0 && <LedgerCard entries={ledger.data as LedgerEntry[]} />}
            </ScrollView>

            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-5 mb-2">
                {/* Unclaimed → offer to go claim it */}
                {v && !v.claimed && (
                    <TouchableOpacity
                        onPress={() => router.push(`/claim/${tagId}` as never)}
                        activeOpacity={0.85}
                        className="bg-primary rounded-xl h-14 flex-row gap-2 items-center justify-center mb-3"
                    >
                        <BadgeCheck color="#FFF" size={20} />
                        <Text className="text-white text-base font-bold">Claim this product</Text>
                    </TouchableOpacity>
                )}

                {verify.isError && code !== 'CLAIMS_TAG_NOT_FOUND' && (
                    <TouchableOpacity onPress={() => void verify.refetch()} activeOpacity={0.85}
                        className="bg-primary rounded-xl h-14 flex-row gap-2 items-center justify-center mb-3">
                        <RefreshCw color="#FFF" size={18} />
                        <Text className="text-white text-base font-bold">Try again</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}
                    className="bg-transparent border border-[#2A2A32] rounded-xl h-14 items-center justify-center">
                    <Text className="text-neutral-200 text-base font-bold">Done</Text>
                </TouchableOpacity>
            </MotiView>
        </SafeAreaView>
    );
}

function ResultCard({ v }: { v: VerifyResult }) {
    const ownerName = v.owner?.displayName ?? v.owner?.username ?? v.owner?.id ?? null;
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-1">
            <View
                className="p-5 rounded-full mb-4 border"
                style={{ borderColor: v.claimed ? '#F2B807' : '#28C76F', backgroundColor: '#12121a' }}
            >
                {v.claimed ? <Info color="#F2B807" size={56} /> : <CheckCircle2 color="#28C76F" size={56} />}
            </View>

            <View className="flex-row items-center mb-1">
                <ShieldCheck color="#28C76F" size={18} />
                <Text className="text-[#28C76F] font-black text-sm ml-1.5">GENUINE HITBOX PRODUCT</Text>
            </View>
            <Text className="text-2xl font-black text-white mb-1 text-center px-4">{v.name}</Text>
            <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4 mb-5">
                {v.claimed
                    ? `Currently owned by ${ownerName ?? 'a collector'}.`
                    : 'Not claimed yet — this item is still available.'}
            </Text>

            <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4">
                <Row label="Product Id" value={v.productCode} />
                <Row label="Status" value={v.claimedStatus} />
                <Row label="State" value={v.state} />
                <Row label="Owner" value={ownerName ?? '— unclaimed —'} />
                {v.owner?.id ? <Row label="User ID" value={v.owner.id} /> : null}
                <Row label="Ledger records" value={String(v.ledgerLength)} />
                <Row label="Verified at" value={new Date(v.verifiedAt).toLocaleString()} />
            </View>
        </MotiView>
    );
}

function LedgerCard({ entries }: { entries: LedgerEntry[] }) {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 150 }}
            className="mt-5"
        >
            <View className="flex-row items-center mb-3">
                <ShieldCheck color="#208AEF" size={18} />
                <Text className="text-white font-bold text-base ml-2">Blockchain Ledger</Text>
                <Text className="text-neutral-500 text-xs font-medium ml-2">
                    {entries.length} record{entries.length === 1 ? '' : 's'}
                </Text>
            </View>

            {entries.map((e) => {
                const isClaim = e.txType === 'CLAIM';
                const accent = isClaim ? '#28C76F' : e.txType === 'MINT' ? '#208AEF' : '#F2B807';
                return (
                    <View key={`${e.sequenceNo}-${e.hash}`} className="bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-3.5 mb-2.5">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="rounded-md px-2 py-0.5" style={{ backgroundColor: accent + '22', borderWidth: 1, borderColor: accent }}>
                                <Text className="text-[11px] font-black" style={{ color: accent }}>#{e.sequenceNo} {e.txType}</Text>
                            </View>
                            <Text className="text-[11px] text-neutral-500 font-medium">{new Date(e.dateTime).toLocaleString()}</Text>
                        </View>
                        <LedgerRow label="Product Id" value={e.productId} />
                        <LedgerRow label="Tag #" value={e.tag ?? '—'} />
                        <LedgerRow label="Owner Id" value={e.ownerId} highlight={isClaim} />
                        <LedgerRow label="Hash #" value={`${e.hash.slice(0, 24)}…`} />
                        {e.previousHash ? <LedgerRow label="Prev Hash" value={`${e.previousHash.slice(0, 24)}…`} /> : null}
                        <LedgerRow label="Claim History" value={e.claimHistory ? 'Yes' : 'No'} />
                        <LedgerRow label="P2P Trading" value={e.peerToPeerTrading ? 'Yes' : 'No'} />
                    </View>
                );
            })}
        </MotiView>
    );
}

function LedgerRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
    return (
        <View className="flex-row items-start py-[3px]">
            <Text className="text-[11px] text-neutral-500 font-medium w-24">{label}</Text>
            <Text className={`text-[12px] flex-1 text-right ${highlight ? 'text-[#28C76F] font-black' : 'text-neutral-200 font-semibold'}`} numberOfLines={1}>
                {value}
            </Text>
        </View>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-center py-2">
            <Text className="text-[13px] text-neutral-500 font-medium w-28">{label}</Text>
            <Text className="text-[14px] text-neutral-100 font-semibold flex-1 text-right" numberOfLines={1}>{value}</Text>
        </View>
    );
}
