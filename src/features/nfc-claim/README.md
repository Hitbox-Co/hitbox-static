# NFC tap-to-claim (frontend)

Tap a tag → read the URL it carries → send three values to the server → show
what comes back. **The app never decrypts anything and never holds a key.**

## What a tag carries

On every tap an NTAG 424 DNA chip writes a fresh, single-use URL:

```
https://hitboxcollectibles.com/verify?u=<UID, 14 hex>&e=<32 hex>&c=<16 hex>
```

| Param | Meaning |
|---|---|
| `u` | The chip's UID (14 hex), written once as plain text when the tag is programmed. Every chip has its own keys; `u` is only a lookup hint (the server also checks the UID inside `e`). |
| `b` | Older batch-key tags carry this instead of `u`: the key set's short code (e.g. `786`) or its long `nks…` code. A lookup label, not a secret. Exactly one of `u` / `b`. |
| `e` | Encrypted tag data. Opaque to the app. |
| `c` | The tap's MAC. Opaque to the app. |

The chip's counter rises on every tap, so **a URL is good for exactly one
request**. The app therefore sends each tap once and keeps the answer
(`useClaimTap` / `useVerifyTap`: one-shot queries keyed by `e`, no retry, no
refetch). A network failure is answered with "tap again", never a resend.

## Flow

```text
Scan tab ── Claim mode ── signed in? ──no──▶ "Sign in to claim" (BEFORE the tap)
   │                         │yes
   │                         ▼
   │               tap ▶ readTapUrl() ▶ /claim?b&e&c ▶ POST /api/v1/claim
   │
   └─ Verify mode ── tap ▶ /verify/check?u&e&c ▶ GET /api/v1/verify?u&e&c   (no login)

App closed / link opened from outside ▶ /verify?u&e&c  (App Link / Universal Link)
   signed in  → claim            signed out → "Sign in & claim" or "Just verify"
```

Results (`TapClaimScreen`): `CLAIMED` → success screen · `ALREADY_CLAIMED` →
"you own this" / "claimed by <owner>" (owner is `null` when they keep it
private) · `CLAIMED_BY_OTHER_JUST_NOW` · `UNAVAILABLE` · `verified: false` →
the `/item-not-authenticated` help screen. The server never says *why* a tap
failed (forged, replayed, retired…) and the app cannot show it.

Verify (`TapVerifyScreen`) shows "Authentic", the product and the owner. It
spends the tap's URL, so it offers no Claim button — claiming needs a fresh tap.

## Files

| File | Purpose |
|---|---|
| `src/lib/tap-url.ts` | `parseTapUrl` / `toTapUrl` — pure format check of `b`/`e`/`c`. Host must be hitboxcollectibles.com, path `/verify`. |
| `src/lib/nfc.ts` | NFC init, enable prompt, `readTag(tag)`, `startTagListener` (reports a tap, or a problem with the tag) |
| `src/lib/ndef-tap.ts` | pure NDEF → tap URL: URI record, absolute URI, Smart Poster; names what is wrong when it can't |
| `api/routes.ts` | `CLAIM_ROUTES.claim`, `buildVerifyTapPath`, `claimKeys` |
| `api/useClaimTap.ts`, `api/useVerifyTap.ts` | the one-shot requests |
| `screens/ScanScreen.tsx` | Claim/Verify toggle, sign-in-before-tap, live listener, paste-a-link box |
| `screens/TapClaimScreen.tsx` | claim outcome |
| `screens/TapVerifyScreen.tsx` | authenticity result |
| `screens/TapEntryScreen.tsx` | landing for a link opened from outside the app |
| `src/app/(routes)/claim/index.tsx`, `verify/index.tsx`, `verify/check.tsx` | route wrappers (b/e/c arrive as params) |

## Running it

`react-native-nfc-manager` is a native module: it does **not** run in Expo Go,
and NFC needs real hardware. Build a dev client (`npm run android`). Emulators
have no NFC radio — use the Scan screen's **paste a tag link** box.

`EXPO_PUBLIC_API_URL` must be reachable from the phone.

## Deep links

See AGENTS.md §8. In short: the chip's https link must be a **verified** App
Link (Android) / Universal Link (iOS), which needs two files on
hitboxcollectibles.com (`/.well-known/assetlinks.json` and
`/.well-known/apple-app-site-association`); until they are served, a tap with
the app closed opens the website instead.
