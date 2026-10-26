import { useAuth } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
    AlertTriangle,
    Award,
    CheckCircle2,
    Info,
    RefreshCw,
    ScanLine,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react-native';
import { View as MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SignInPopup from '@/components/auth/SignInPopup';
import { useMe } from '@/features/profile/api/getProfile';
import { ApiRequestError } from '@/lib/api';
import { useConfirmClaim } from '../api/useConfirmClaim';
import { useLedger } from '../api/useLedger';
import { useProductByTag } from '../api/useProductByTag';
import { useVerifyTag } from '../api/useVerifyTag';
import { ClaimResult, LedgerEntry, ValidateResult } from '../types/claim';
import ProductVerifiedScreen from './ProductVerifiedScreen';
import SucessfulClaimScreen from './SucessfulClaimScreen';

WebBrowser.maybeCompleteAuthSession();

/** Pulls the backend error code out of a thrown ApiRequestError. */
function errorCodeOf(err: unknown): string | null {
    return err instanceof ApiRequestError ? err.error.code : null;
}

/**
 * Entry point for a tapped tag (`/claim/:tagId`) — the state machine
 * that decides which screen the user sees.
 *
 * On mount it **verifies the tag against the backend** with the public reads
 * (`GET /verify/:tagId` + `GET /products/tag/:tagId`), so a tap always resolves
 * whether or not the user is signed in:
 *
 *   verified & UNCLAIMED  → `ProductVerifiedScreen`  (Claim button lives there)
 *   claim succeeded       → `SucessfulClaimScreen`
 *   already claimed       → owned card (yours / someone else's)
 *   tag not registered    → not-registered card
 *   server / network fail → error card + retry
 *
 * Claiming — and the ledger write — happens **only** when that Claim button is
 * pressed (`POST /claims/:tagId/confirm`).
 */
export default function ClaimScreen({ tagId }: { tagId: string }) {
    const { isLoaded, isSignedIn } = useAuth();
    const signedIn = isLoaded && !!isSignedIn;

    // Sign-in popup, opened only when a signed-out user presses Claim.
    const [askSignIn, setAskSignIn] = useState(false);

    // PUBLIC reads — these run on every tap, signed in or not.
    const verify = useVerifyTag(tagId);
    const product = useProductByTag(tagId);
    const ledger = useLedger(tagId, verify.isSuccess);
    const confirm = useConfirmClaim(tagId);
    // Only to distinguish "you own this" from "someone else owns this".
    const me = useMe();

    // Re-verify whenever the screen regains focus (ownership can change).
    useFocusEffect(
        useCallback(() => {
            void verify.refetch();
            void product.refetch();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [tagId]),
    );

    const code = errorCodeOf(verify.error) ?? errorCodeOf(product.error);
    const notRegistered =
        code === 'CLAIMS_TAG_NOT_FOUND' || code === 'PRODUCTS_NOT_FOUND';

    const claimed = confirm.data?.outcome === 'CLAIMED' ? confirm.data : null;
    const busy = verify.isPending && product.isPending;

    const ownerId = verify.data?.owner?.id ?? product.data?.ownerId ?? null;
    const claimedByYou = !!ownerId && !!me.data?.id && ownerId === me.data.id;
    const isClaimed = verify.data?.claimed ?? product.data?.claimedStatus === 'CLAIMED';

    /**
     * The existing owned/error cards below were written against `ValidateResult`,
     * so the public reads are adapted into that shape — no UI rewrite needed.
     */
    const v: ValidateResult | null = verify.data
        ? {
            tagId,
            screen: !isClaimed
                ? 'CLAIMABLE'
                : claimedByYou
                    ? 'ALREADY_CLAIMED_BY_YOU'
                    : 'ALREADY_CLAIMED',
            claimedByYou,
            product: {
                id: verify.data.productId,
                productCode: verify.data.productCode,
                name: verify.data.name,
                tagId,
                priceInDollars: product.data?.priceInDollars ?? '0',
                rewardPoints: product.data?.rewardPoints ?? 0,
                state: verify.data.state,
                imageUrl: product.data?.images?.[0]?.url ?? null,
            },
            owner: verify.data.owner,
            claimedAt: product.data?.claimedAt ?? null,
        }
        : null;

    /** POST /claims/:tagId/confirm — the claim + ledger write. */
    const performClaim = async () => {
        try {
            await confirm.mutateAsync();
        } catch {
            // Rendered by the claim error line / ErrorCard.
        }
    };

    /**
     * Claim button → ask a signed-out user to sign in **over this screen** rather
     * than pushing `/(auth)/login`: that route finishes by replacing to the
     * discover tab, which would drop the verified tag the user just tapped.
     * `SignInPopup` keeps this screen mounted and hands control back here.
     */
    const handleClaim = async () => {
        if (!signedIn) {
            setAskSignIn(true);
            return;
        }
        await performClaim();
    };

    const signInPopup = (
        <SignInPopup
            open={askSignIn}
            onOpenChange={setAskSignIn}
            title="Sign in to claim"
            description={
                v?.product.name
                    ? `Sign in to claim "${v.product.name}" and add it to your collection.`
                    : 'Sign in to claim this item and add it to your collection.'
            }
            /**
             * Signed in → back on this same product page, re-verified with the
             * new session. The claim is *not* fired automatically: nothing is
             * claimed until the user presses Claim themselves, and the button
             * subtitle now reads "Add this item to my collection".
             *
             */
            onSignedIn={() => {
                void verify.refetch();
                void product.refetch();
            }}
        />
    );

    // ── Claim succeeded → the success screen, nothing else ──────────────────
    if (claimed) return <SucessfulClaimScreen result={claimed} />;

    // ── Verified AND unclaimed → the verified screen (owns the Claim button) ──
    if (!busy && !notRegistered && v?.screen === 'CLAIMABLE') {
        return (
            <>
                <ProductVerifiedScreen
                    product={{
                        name: v.product.name,
                        productCode: v.product.productCode,
                        tagId,
                        imageUrl: v.product.imageUrl,
                        priceInDollars: product.data?.priceInDollars ?? null,
                        rewardPoints: product.data?.rewardPoints ?? null,
                        rarity: product.data?.rarity
                            ? product.data.rarity.charAt(0) + product.data.rarity.slice(1).toLowerCase()
                            : null,
                        ledgerLength: verify.data?.ledgerLength ?? null,
                    }}
                    onClaim={handleClaim}
                    isClaiming={confirm.isPending}
                    signedIn={signedIn}
                    claimError={
                        confirm.isError
                            ? ((confirm.error as Error)?.message ?? 'Claim failed. Please try again.')
                            : null
                    }
                />
                {signInPopup}
            </>
        );
    }

    // ── Everything else: loading, not registered, already claimed, errors ────
    return (
        <SafeAreaView className="flex-1 bg-[#050507]">
            <StatusBar barStyle="light-content" />
            <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} className="items-center my-2">
                    <View className="flex items-center justify-center w-full">

                        <Image
                            source={require("@/assets/images/HitBoxLogo.png")}
                            resizeMode="contain"
                            style={{
                                width: 40,
                                height: 40,
                            }}
                        />

                    </View>
                </MotiView>

                {/* The scanned tag */}
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-3.5 mt-2 mb-5 flex-row items-center">
                    <ScanLine color="#208AEF" size={22} />
                    <View className="ml-3">
                        <Text className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">NFC Tag</Text>
                        <Text className="text-white text-base font-bold tracking-wide">{tagId}</Text>
                    </View>
                </MotiView>



                {/* Verifying the tap against the backend */}
                {busy && (
                    <View className="items-center mt-16">
                        <ActivityIndicator size="large" color="#208AEF" />
                        <Text className="text-neutral-300 mt-4 text-base font-medium">
                            Verifying this item…
                        </Text>
                    </View>
                )}

                {!busy && notRegistered && <NotRegisteredCard tagId={tagId} />}

                {/* Already claimed — by you, or by someone else */}
                {!busy && !notRegistered && v && (
                    <>
                        {v.screen === 'ALREADY_CLAIMED_BY_YOU' && <OwnedCard v={v} mine />}
                        {v.screen === 'ALREADY_CLAIMED' && <OwnedCard v={v} />}
                    </>
                )}

                {/* Verify itself failed (server / network) */}
                {!busy && !notRegistered && !v && verify.isError && (
                    <ErrorCard
                        code={code ?? 'ERROR'}
                        message={(verify.error as Error)?.message ?? 'Could not reach the server.'}
                    />
                )}

                {/* Blockchain ledger — whenever we have a verified product */}
                {!busy && !notRegistered && (ledger.data?.length ?? 0) > 0 && (
                    <LedgerCard entries={ledger.data as LedgerEntry[]} />
                )}
            </ScrollView>

            {/* Actions */}
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-5 mb-2">
                {!busy && verify.isError && !notRegistered && (
                    <TouchableOpacity
                        onPress={() => {
                            void verify.refetch();
                            void product.refetch();
                        }}
                        activeOpacity={0.85}
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

            {signInPopup}
        </SafeAreaView>
    );
}

/** Tag carries no product — nothing to verify or claim. */
function NotRegisteredCard({ tagId }: { tagId: string }) {
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-4">
            <View className="bg-[#2A1414] p-5 rounded-full mb-4 border" style={{ borderColor: '#7A1C1C' }}>
                <ShieldAlert color="#FF3B30" size={56} />
            </View>
            <Text className="text-2xl font-black text-white mb-2 text-center">Product is not registered</Text>
            <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-5">
                This NFC tag isn&apos;t linked to any HitBox product, so it can&apos;t be verified or claimed.
            </Text>
            <View className="mt-5 bg-[#0F0F13] border border-[#1F1F24] rounded-xl px-4 py-3">
                <Text className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">Scanned tag</Text>
                <Text className="text-neutral-200 text-sm font-bold tracking-wide">{tagId}</Text>
            </View>
        </MotiView>
    );
}

function ProductBox({ v }: { v: ValidateResult }) {
    return (
        <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-2xl p-4">
            {v.product.imageUrl ? (
                <Image source={{ uri: v.product.imageUrl }} style={{ width: '100%', height: 180, borderRadius: 14 }} contentFit="cover" transition={200} />
            ) : (
                <View className="w-full h-[180px] rounded-2xl bg-[#15151b] items-center justify-center">
                    <ScanLine color="#3A3A44" size={48} />
                </View>
            )}
            <Text className="text-white text-xl font-black mt-4">{v.product.name}</Text>
            <Text className="text-neutral-500 text-xs font-medium mt-0.5">Code {v.product.productCode}</Text>
            <View className="flex-row items-center justify-between mt-3">
                <Text className="text-primary text-2xl font-black">${v.product.priceInDollars}</Text>
                {v.product.rewardPoints > 0 && (
                    <View className="flex-row items-center bg-[#1A1508] border border-[#3A2E0A] rounded-full px-3 py-1.5">
                        <Award color="#F2B807" size={15} />
                        <Text className="text-[#F2B807] font-bold text-xs ml-1.5">+{v.product.rewardPoints} pts</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

function ReviewCard({ v }: { v: ValidateResult }) {
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400 }}>
            <View className="flex-row items-center mb-4">
                <ShieldCheck color="#28C76F" size={20} />
                <Text className="text-[#28C76F] font-bold text-sm ml-2">Genuine • Unclaimed — ready to claim</Text>
            </View>
            <ProductBox v={v} />
        </MotiView>
    );
}

/** Already claimed — "you already own this item", or names the other owner. */
function OwnedCard({ v, mine = false }: { v: ValidateResult; mine?: boolean }) {
    const color = mine ? '#28C76F' : '#F2B807';
    const ownerName = v.owner?.displayName ?? v.owner?.username ?? v.owner?.id ?? 'another collector';
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-2">
            <View className="p-5 rounded-full mb-4 border" style={{ borderColor: color, backgroundColor: '#12121a' }}>
                {mine ? <CheckCircle2 color={color} size={56} /> : <Info color={color} size={56} />}
            </View>
            <Text className="text-2xl font-black text-white mb-1 text-center px-4">
                {mine ? 'You already own this item' : 'Already claimed'}
            </Text>
            <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4 mb-4">
                {mine
                    ? `"${v.product.name}" is already in your collection.`
                    : `"${v.product.name}" is already claimed by ${ownerName}.`}
            </Text>

            <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4 mb-4">
                <Row label="Owner" value={ownerName + (mine ? ' (you)' : '')} />
                {v.owner?.id ? <Row label="User ID" value={v.owner.id} /> : null}
                {v.claimedAt ? <Row label="Claimed" value={new Date(v.claimedAt).toLocaleString()} /> : null}
            </View>

            <ProductBox v={v} />
        </MotiView>
    );
}

function SuccessCard({ r }: { r: ClaimResult }) {
    return (
        <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'timing', duration: 400 }} className="items-center mt-4">
            <View className="bg-[#08301C] p-5 rounded-full mb-4 border" style={{ borderColor: '#1C7A4A' }}>
                <CheckCircle2 color="#28C76F" size={64} />
            </View>
            <Text className="text-2xl font-black text-white mb-1">Product Claimed!</Text>
            <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4 mb-5">{r.message}</Text>
            <View className="w-full bg-[#0F0F13] border border-[#1F1F24] rounded-xl p-4">
                <Row label="Product" value={r.product.name} />
                <Row label="Owner" value={`${r.owner?.displayName ?? r.owner?.username ?? 'you'} (you)`} />
                {r.owner?.id ? <Row label="User ID" value={r.owner.id} /> : null}
                {r.claim ? <Row label="Claim code" value={r.claim.claimCode} /> : null}
            </View>
        </MotiView>
    );
}

function ErrorCard({ code, message }: { code: string; message: string }) {
    return (
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} className="items-center mt-6">
            <View className="bg-[#2A1414] p-5 rounded-full mb-4 border" style={{ borderColor: '#7A1C1C' }}>
                <AlertTriangle color="#FF3B30" size={56} />
            </View>
            <Text className="text-2xl font-black text-white mb-2">Something went wrong</Text>
            <Text className="text-[15px] text-neutral-300 text-center font-medium leading-5 px-4">{message}</Text>
            <Text className="text-[12px] text-neutral-500 mt-3 uppercase tracking-wider">{code}</Text>
        </MotiView>
    );
}

/** Blockchain ledger: Product Id · Tag # · Owner Id · DateTime · Hash · Claim History. */
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
            <Text
                className={`text-[12px] flex-1 text-right ${highlight ? 'text-[#28C76F] font-black' : 'text-neutral-200 font-semibold'}`}
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row items-center py-2">
            <Text className="text-[13px] text-neutral-500 font-medium w-24">{label}</Text>
            <Text className="text-[14px] text-neutral-100 font-semibold flex-1 text-right" numberOfLines={1}>{value}</Text>
        </View>
    );
}
