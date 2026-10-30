# HitBox Mobile App — Project Guide

> **Read this file before writing any code.** It describes the whole frontend:
> stack, folder conventions, routing, data layer, and the backend contract.
> Verified against the tree on **2026-08-24** (`develop`).

## ⚠️ Expo HAS CHANGED

This project is on **Expo SDK 56 / React Native 0.85 / React 19**. APIs moved.
Check the exact versioned docs at <https://docs.expo.dev/versions/v56.0.0/>
before using any Expo or React Native API — do not rely on pre-SDK-50 memory.

---

## 1. What this is

`hitbox-static` is the **React Native (Expo) mobile client** for HitBox — a
platform for physical collectibles that carry an **NFC tag**. A user taps a tag
to verify authenticity and **claim** first ownership; claimed items land in their
collection and every claim is written to a provenance ledger.

It talks to a separate backend repo (`hitbox-backend`, a modular-monolith Express
API). **This repo contains no server code and no database.**

| Concern | Owner |
|---|---|
| UI, navigation, client state | this repo |
| Identity, sessions, OAuth, password policy | **Clerk** (`@clerk/clerk-expo`) |
| Products, claims, collections, ledger | **backend** `/api/v1/*` |

---

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Runtime | Expo SDK `~56.0.17`, RN `0.85.3`, React `19.2.3` | new architecture; `reactCompiler` on |
| Navigation | **expo-router** `~56.2.16` | file-based; `src/app/**` **is** the route table |
| Styling | **NativeWind v4** (Tailwind) | `className` on RN components; `src/global.css` |
| Server state | **TanStack Query v5** | every network read/write goes through it |
| Forms | react-hook-form + **Zod** (`zod` v4) | `zodResolver` |
| Auth | `@clerk/clerk-expo` + `expo-secure-store` token cache | |
| Animation | `moti` + `react-native-reanimated` v4 | |
| Icons | `lucide-react-native` | |
| NFC | `react-native-nfc-manager` `^3.17.2` | **native module — cannot run in Expo Go** |
| Location | `expo-location` | used **once**, for display currency (§6) |
| UI primitives | `@rn-primitives/*` → `src/components/ui/*` (32 files) | shadcn-style, RN port |
| Tests | Jest + `jest-expo` + `@testing-library/react-native` | 19 suites (§13) |

**Path aliases** (`tsconfig.json`): `@/*` → `./src/*`, `@/assets/*` → `./assets/*`.
Always import with `@/…`, never long relative chains.

---

## 3. Folder structure

```text
hitbox-static/
├── AGENTS.md / CLAUDE.md      # this guide (CLAUDE.md just does `@AGENTS.md`)
├── app.json                   # Expo config: scheme `hitboxstatic`, plugins
├── babel.config.js            # NativeWind preset; skips it under Jest
├── jest.setup.js              # global test mocks (moti, lucide, router, reanimated)
├── metro.config.js            # withNativeWind
├── tailwind.config.js         # design tokens (primary, background, card…)
├── android/                   # prebuilt native project (committed, hand-edited — see §8)
└── src/
    ├── app/                   # ROUTES ONLY — thin wrappers, no business logic
    ├── features/              # all real code, one folder per domain (12)
    ├── components/            # cross-feature shared components
    │   ├── ui/                # 32 design-system primitives
    │   ├── auth/              # SignInPopup + its email/phone/SSO forms
    │   └── icons/             # brand SVGs (Google, Apple, Facebook…)
    ├── lib/                   # app-wide infrastructure (api, nfc, currency, utils)
    ├── hooks/                 # generic hooks (color scheme, theme, tab scroll reset)
    ├── constants/theme.ts
    └── global.css
```

### The one rule that matters

**`src/app/**` files are route wrappers only.** They read route params and render
a screen from `src/features/*/screens/`. All logic, data fetching, and UI live in
`src/features/`. Example:

```tsx
// src/app/(routes)/claim/index.tsx
export default function ClaimRoute() {
    const params = useLocalSearchParams<{ b?: string; e?: string; c?: string }>();
    const tap = toTapUrl(params);
    return tap ? <TapClaimScreen tap={tap} /> : null;
}
```

### Feature folder convention

Every feature in `src/features/<name>/` follows the same shape. Put new code in
the matching slot — do **not** invent new layouts:

```text
features/<name>/
├── api/            # TanStack Query hooks, one file per endpoint
│   ├── routes.ts   # URL builders + query keys (the ONLY place URLs are written)
│   └── getX.ts     # useX() → useQuery / useMutation
├── types/<name>.ts # DTOs mirroring the backend response shapes
├── screens/        # full screens (rendered by src/app wrappers)
├── components/     # presentational pieces for this feature
├── hooks/          # feature-local hooks
├── utils/          # formatters, mappers
├── validation/     # Zod schemas
├── __tests__/      # colocated per folder (api/__tests__, utils/__tests__, …)
└── data/           # static content — see §12.7 before adding one
```

---

## 4. Routes (`src/app`)

```text
_layout.tsx                 ClerkProvider → QueryClientProvider → Stack → PortalHost
index.tsx                   redirect: signed in → /(tabs)/discover, else → /(auth)/register
sso-callback.tsx            Clerk OAuth landing — WAITS for the session (see §7)

(auth)/                     login / registration — navigable in any auth state
  register/index.tsx        ⚠️ renders Step2Screen, NOT step 1 (see §14)
  register/step2.tsx        social + email choice — the same screen as index.tsx
  register/details.tsx      full form → Clerk sign-up + email OTP
  login/index.tsx
  forget-password/index.tsx
  item-not-authenticated.tsx   "couldn't read the tag" help screen

(tabs)/                     bottom tab bar — custom `tabBar`, see below
  discover/index.tsx        public feed
  discover/[productId].tsx  product detail (duplicate of the marketplace one — see below)
  discover/see-all.tsx      paginated section list
  marketplace/index.tsx     public listings
  marketplace/[tourId]/     product detail (carries a PRODUCT id despite the name)
  marketplace/see-all.tsx
  collections/index.tsx     🔒 gated — the user's shelf
  collections/view-collection/
  profile/index.tsx         🔒 gated
  scan.tsx                  NFC scan entry point — the ONLY place scanning runs
  (details)/                pushed routes that KEEP the tab bar
    settings/index.tsx
    edit-profile/index.tsx
    notifications.tsx
    collection-highlights.tsx
    support/index.tsx, support/chat.tsx
    artists/[artistId]/index.tsx

(routes)/                   pushed full-screen routes, NO tab bar
  claim/index.tsx           Claim section's tap outcome   (params: u, e, c)
  verify/index.tsx          a chip's own link opens here  (params: u, e, c)
  verify/check.tsx          read-only authenticity check  (params: u, e, c)
  privacy-policy.tsx
  terms-of-use.tsx
```

### The tab bar

`(tabs)/_layout.tsx` renders a **custom `tabBar`** (`LiquidGlassTabBar`): a
floating blurred pill with five items — Discover, My Collections, **Scan**
(raised gradient button), Marketplace, Profile. Consequences worth knowing:

- **Route protection is not `Tabs.Protected`.** Collections and Profile stay
  *visible* while signed out; the custom button intercepts the press, opens
  `SignInPopup`, and replays the navigation via `onSignedIn`. See `GATED_TABS`.
- **`NESTED_TABS`** makes re-pressing the active tab pop its nested stack
  (`router.dismissTo`). Without it, a product detail pushed on the Marketplace
  stack stays there and the tab looks dead.
- **`(details)` is registered with `href: null`** so it never renders a sixth
  button.
- Tab buttons carry `accessibilityLabel`s (`"Discover"`, `"Scan NFC Tag"`, …) —
  the only reliable selectors for UI tests, because the labels also appear as
  screen headings.

### Two things that look like mistakes and are not

- **`(tabs)/scan.tsx` sits directly under `(tabs)`, not in `(details)`** — it owns
  a button in the bottom bar. Both are group segments, so the URL is `/scan`
  either way and the NFC deep link is unaffected.
- **Product detail is mounted twice**, at `discover/[productId]` and
  `marketplace/[tourId]`. Deliberate: pushing the marketplace route from a
  Discover card would navigate into another tab's stack and switch the active
  tab. A card opens the copy belonging to its own tab.

Adding a route: create the file under `src/app/`, then **restart the dev server**
so expo-router regenerates `.expo/types/router.d.ts` (typed routes are on —
`router.push('/new/route')` won't typecheck until it does).

---

## 5. Features

| Feature | Backend module | State |
|---|---|---|
| `discover` | `/api/v1/discover` | ✅ fully wired (feed, search, infinite) |
| `marketplace` | `/api/v1/marketplace` | ✅ fully wired (feed, listings, infinite) |
| `collections` | `/api/v1/collections` | ✅ wired (some legacy `data/*.js` remains) |
| `products` | `/api/v1/products` | ✅ detail screen wired |
| `profile` | `/api/v1/users` | ✅ wired incl. avatar upload |
| `nfc-claim` | `/api/v1/claim`, `/api/v1/verify?b=&e=&c=` | ✅ wired (tap-URL flow) |
| `auth` | Clerk + `/api/v1/auth` | ✅ email, phone OTP, Google/Apple/Facebook SSO |
| `notifications` | — | local `data/notices.ts`; `api/routes.ts` holds only a query key, **no endpoint yet** |
| `support` | — | scripted assistant + email handoff, from `data/` |
| `legal` | — | privacy policy / terms from `data/` |
| `settings` | — | UI only |
| `artists` | — | UI only (no backend endpoint yet) |

---

## 6. Data layer

### `src/lib/api.ts` — the only fetch wrapper

`useApi()` returns `{ get, getPage, post, patch, delete }`. It:

- prefixes `EXPO_PUBLIC_API_URL`
- attaches the Clerk session JWT as `Authorization: Bearer <token>`
- sends `ngrok-skip-browser-warning: true` (harmless on non-ngrok hosts)
- unwraps the backend's `{ data }` envelope — **`get` returns `data` directly**
- `getPage<T>()` keeps `{ data, meta }` for paginated lists
- throws **`ApiRequestError`** carrying `{ status, error: { code, message } }`

It also exports the shared DTO vocabulary (`ProductCategory`, `ProductRarity`,
`MarketplaceStatus`, `AuthPrincipal`, …) that feature types build on.

```ts
const api = useApi();
const me   = await api.get<Me>('/api/v1/users/me');             // → data
const page = await api.getPage<Item>('/api/v1/collections/me');  // → { data, meta }
```

### Pattern for a new endpoint

1. Add the URL builder + query key to `features/<name>/api/routes.ts`.
2. Add the DTO to `features/<name>/types/<name>.ts` (mirror the backend exactly).
3. Add a hook in `features/<name>/api/getX.ts` using `useApi()` + `useQuery`.
4. Consume it in a screen. Never call `fetch` directly in a component.

### Error handling

The backend always returns `{ error: { code, message, details } }`. Branch on
**`code`**, never on message text:

```ts
if (err instanceof ApiRequestError && err.error.code === 'USERS_USERNAME_TAKEN') { … }
```

`src/lib/queries.ts` exports `retryAuthAware` — retries `AUTH_ACCOUNT_NOT_FOUND`
up to 5× (the Clerk webhook may not have created the local user row yet), fails
fast on other 4xx. Use it on authed queries. It also owns the cross-feature query
keys (`authMe`, `me`, `user(id)`); feature-specific keys live in each
`api/routes.ts`.

### Display currency (`src/lib/currency.ts`)

`_layout.tsx` awaits `initCurrency()` **inside the launch spinner** (self-limited
to 4s) because `formatPrice` reads the resolved currency *synchronously* — a price
rendered before it lands would be stuck in USD until something re-rendered it.

⚠️ **Display only.** The API returns `priceInDollars`; the price *is* USD.
Conversion uses a **hardcoded rate snapshot** matched to a lat/lon box, so a shown
price drifts from the real rate, and a future checkout would charge USD. The
durable fix is per-region prices from the backend.

---

## 7. Auth (Clerk)

- `ClerkProvider` wraps everything in `src/app/_layout.tsx` with the SecureStore
  token cache. Publishable key: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- `RootNavigator` holds the navigator behind a spinner until **both** Clerk's
  `isLoaded` and `initCurrency()` settle, so a signed-in user is never bounced on
  cold start.
- **Sign-in paths:** email+password, phone SMS OTP (auto-signs-up unknown
  numbers), and Google / Apple / Facebook via `useSSO`.
- **Registration** (`features/auth/register`) → `signUp.create` + email OTP.
  Because the Clerk instance has username/name attributes disabled, those fields
  travel in **`unsafeMetadata`**; several profile components read them as a
  fallback.
- **`SignInPopup`** (`src/components/auth/`) is the inline sign-in surface used by
  the gated tabs and the claim button. It keeps the calling screen mounted and
  hands control back through `onSignedIn`. Android's back button dismisses the
  whole dialog — it does *not* step back from the email sub-form to the options
  list; that is what the chevron in its header is for.
- **SSO redirect:** use `Linking.createURL('/')` with **no hardcoded scheme** —
  it resolves to `exp://…` in Expo Go and `hitboxstatic://` in a real build.
  Hardcoding the scheme breaks Expo Go.
- **`sso-callback.tsx` must not redirect to login.** Clerk finishes the session
  *after* the browser returns, so `isSignedIn` is false on first render — the
  route polls for up to 15s, then falls through to `/(tabs)/discover`. Bouncing
  to login here caused a sign-in loop.
- Post-login return path: pass `?returnTo=<path>`; the login components honour it.

### Backend user rows

A Clerk user only exists in the backend once its `user.created` webhook is
processed. Until then authed calls return **401 `AUTH_ACCOUNT_NOT_FOUND`** — this
is expected, not a bug; that's what `retryAuthAware` absorbs.

---

## 8. NFC claim flow (the core feature)

**The app reads a tag's URL and forwards three values. It never decrypts
anything and never holds a key** — the server does all of that.

Every chip writes a fresh, single-use URL on each tap:

```text
https://hitboxcollectibles.com/verify?u=<UID, 14 hex>&e=<32 hex>&c=<16 hex>
```

`u` is the chip's own UID, written once as plain text when the tag is programmed
(every chip has its own keys); it is only a lookup hint — the server also checks
the UID inside `e`. Older batch-key tags carry `b` instead of `u` (the key set's
short code, e.g. `786`, or its long `nks…` code); exactly one of `u` / `b` is
expected. `e` and `c` are opaque to the app.
The chip's counter rises on every tap, so **a URL works for exactly one
request**. `useClaimTap` / `useVerifyTap` are therefore one-shot queries keyed
by `e` (no retry, no refetch): a remounted screen reuses its tap's answer
instead of resending the URL and being refused as a replay, and a network
failure means "tap again", never "resend".

**Scanning is scoped to the Scan tab** (`useIsFocused`) — there is deliberately
no app-wide tag listener, and `_layout.tsx` does not touch the NFC stack.

```text
Scan tab, Claim mode ── signed in? ─no─▶ "Sign in to claim" BEFORE the tap
                            │yes
                            ▼
                tap ▶ readTapUrl ▶ /claim?u&e&c ▶ POST /api/v1/claim ▶ outcome

Scan tab, Verify mode ── tap ▶ /verify/check?u&e&c ▶ GET /api/v1/verify?u&e&c (public)

Link opened from outside ▶ /verify?u&e&c ▶ TapEntryScreen
        signed in → claim · signed out → "Sign in & claim" | "Just check it's genuine"
```

- **`src/lib/nfc.ts`** — `readTag(tag)` hands `TagEvent.ndefMessage` to
  `src/lib/ndef-tap.ts` and returns a tap URL or the specific reason there is
  none. It does not read the chip's UID, on purpose: the UID is the
  anti-counterfeiting secret. Android delivers the NDEF message read at
  discovery (the chip's mirrored `e`/`c` for that tap are in it); iOS delivers
  the first NDEF message of the session, or an empty list for a tag without NDEF.
- **`src/lib/ndef-tap.ts`** — pure and unit-tested. Reads a URL from a URI record
  (scheme prefix expanded), an absolute-URI record, or a Smart Poster, and when it
  cannot, says why: no NDEF / no link / another site / wrong path / missing
  params / **static** (an all-zero `e`/`c`: SDM mirroring is off) / **repeated**
  (the same `e` as the previous tap: the chip is not counting). The Scan screen
  shows that inline, because a badly written tag is the one failure the app can
  name precisely — unlike a tap the server refused.
- **`src/lib/tap-url.ts`** — `parseTapUrl` / `toTapUrl`: format check only (host
  hitboxcollectibles.com over https, path `/verify`, `u` 14 hex (upper-cased),
  `e` 32 hex, `c` 16 hex; or, for a batch-key tag, `b` a 3–20 char short code or
  an `nks…` code in place of `u`). A well-formed URL can still be
  fake; the server decides.
- **`ScanScreen`** — Claim/Verify toggle (`?mode=verify` opens it in Verify
  mode), asks for sign-in *before* the tap in Claim mode (a tap made while signed
  out could not be claimed), and has a **paste a tag link** box that takes the
  same path as a real tap — the only way to exercise the flow on an emulator.
- **`TapClaimScreen`** — `CLAIMED` → `SucessfulClaimScreen`; `ALREADY_CLAIMED`
  → owned card (`owner` is null when someone else keeps it private);
  `CLAIMED_BY_OTHER_JUST_NOW`; `UNAVAILABLE`; `verified: false` →
  `/item-not-authenticated`. The server never says *why* a tap failed.
- **`TapVerifyScreen`** — "Authentic" + product + owner. It spends the URL, so it
  cannot offer a Claim button: claiming needs a fresh tap.
- **`verify` then `claim` of one tap is impossible by design** — call one or the
  other with a given `u/e/c`.

### Opening the app from a tag (deep links)

With the app closed, tapping a chip hands its https link to the OS. Two
manifest filters catch it (`android/app/src/main/AndroidManifest.xml`, mirrored
for future prebuilds in `app.json` `android.intentFilters` / `ios.associatedDomains`):

1. `VIEW` + `autoVerify` for `https://hitboxcollectibles.com/verify` (and `www`)
   — a verified App Link;
2. `android.nfc.action.NDEF_DISCOVERED` for the same URL — hand-added, because
   expo's `intentFilters` cannot express a non-`android.intent.action.` action,
   so `expo prebuild --clean` drops it.

**Neither works until the website serves**
`https://hitboxcollectibles.com/.well-known/assetlinks.json` (Android: package +
SHA-256 of the signing certificate) and
`/.well-known/apple-app-site-association` (iOS: Team ID + bundle id, path
`/verify`). Until then the link opens the website. The Android package that
installs today is `com.subratadasdev1.hitboxstatic` (see §11 for the mismatch
with `app.json`).

A deep link delivered to an app that is **already starting** can be lost — the
`index.tsx` redirect races it. Force-stop first when testing:

```bash
adb shell am force-stop com.subratadasdev1.hitboxstatic
adb shell am start -a android.intent.action.VIEW -d "https://hitboxcollectibles.com/verify?u=<14hex>&e=<32hex>&c=<16hex>"
```

(`hitboxstatic://…` links are not used for tags any more.)

---

## 9. Backend contract

Base URL from **`EXPO_PUBLIC_API_URL`**; all routes under `/api/v1`.
🔒 = needs a Clerk session JWT.

| Endpoint | Auth | Used by |
|---|---|---|
| `GET /discover`, `/discover/products` | public | discover (`section`, `search`, `page`, `limit`) |
| `GET /marketplace`, `/marketplace/listings` | public | marketplace (`category`, `search`, `sort`, `page`, `limit`) |
| `GET /products/:id`, `/products/code/:code` | public | products |
| `GET /verify?u=&e=&c=` | public | nfc-claim — authenticity of a tap, never claims |
| `POST /claim` | 🔒 | nfc-claim — **the claim + ledger write**, body `{ u, e, c, visibility? }` |
| `GET /users/me`, `PATCH /users/me`, `GET /users/:id` | 🔒 | profile |
| `GET /collections/me`, `/collections/me/stats` | 🔒 | collections |
| `PATCH /collections/me/:productId` | 🔒 | visibility toggle |
| `GET /auth/me` | 🔒 | session probe |

### Notes on the tap endpoints

- `/claims/:tagId`, `/claims/:tagId/confirm` and `/verify/:tagId` (the raw-UID
  routes) are **deprecated on the backend** and no longer used by the app.
- A tap that fails answers **HTTP 200** `{ verified: false, … }` whatever the
  cause; only malformed input is a 4xx (422) and a missing session a 401.
- Tap routes have their own limits on top of the global one: 30 req/min per IP
  (both), 15 req/min per user (`POST /claim`). Not specially handled in the
  client yet.
- Every `/api/v1/*` route is also **rate limited to 100 req / 60 s per IP** →
  `429 RATE_LIMITED`.

---

## 10. Environment

`.env` at the repo root (git-ignored). Only `EXPO_PUBLIC_*` vars reach the app.

```dotenv
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
EXPO_PUBLIC_API_URL=https://hitbox-backend-qa.up.railway.app
```

- Must be **publicly reachable from the phone** — `localhost` / `127.0.0.1` point
  at the *device*, not your PC, and always fail.
- **Baked in at build time.** Changing `.env` requires a restart (dev) or a full
  rebuild (release). You cannot patch it on-device.
- Do **not** set `NODE_ENV=test` in `.env` — it makes `expo start` skip the
  NativeWind babel transform and every style silently disappears.

---

## 11. Commands

```bash
npm start                  # dev server
npm run start:tunnel       # dev server over a public tunnel (phone off-LAN)
npm run android            # build + install a dev build (required for NFC)
npm test                   # jest
npx tsc --noEmit           # typecheck — run before finishing any change
```

### Release APK (Android, from Windows)

```bash
cd android
JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-17.0.19.10-hotspot" \
ANDROID_HOME="C:/Users/<you>/AppData/Local/Android/Sdk" \
./gradlew assembleRelease -PreactNativeArchitectures=x86_64
# → android/app/build/outputs/apk/release/app-release.apk
```

`-PreactNativeArchitectures=x86_64` builds only the emulator ABI, which is much
faster; drop it for a physical device.

Three traps, all verified the hard way:

1. **Gradle must run on JDK 17** — not 21, not 25. RN 0.85's Gradle plugin
   declares `kotlin { jvmToolchain(17) }`; on any other JDK, Gradle resolves a
   toolchain through the foojay resolver that RN pins at `0.5.0`, which
   references `JvmVendorSpec.IBM_SEMERU` — removed in Gradle 9. Symptom:
   `Class org.gradle.jvm.toolchain.JvmVendorSpec does not have member field …`.
   Installing JDK 17 is not enough; `JAVA_HOME` must point at it.
2. **The repo path must be short.** Reanimated's generated object files already
   reach ~248 of Windows' 260-char limit from a deep path. The compiler then
   appends more, writes fail silently, CMake regenerates, and ninja aborts with
   `manifest 'build.ninja' still dirty after 100 tries`. Cleaning `.cxx` does
   **not** help — build from a short path such as `C:\dev\hitbox-static`.
   (Being outside OneDrive also stops sync from touching build files mid-compile.)
3. **First build downloads the NDK (~3 GB)** and takes 20–40 minutes. Warm
   incremental builds are ~4 min (release) / ~7 min (debug).

The release build type is signed with the **debug keystore**, so the APK installs
for testing but Play Store will reject it.

⚠️ **`app.json` says `com.anonymous.hitboxstatic` but the committed
`android/app/build.gradle` says `com.subratadasdev1.hitboxstatic`.** The gradle
value is what installs, and `expo prebuild` would overwrite it from `app.json`.
Reconcile these before shipping.

---

## 12. Conventions & gotchas

1. **Typecheck before finishing.** `npx tsc --noEmit`. Test files may report
   pre-existing jest-type errors; source must be clean.
2. **Never hardcode a URL in a component.** URLs live in `api/routes.ts`.
3. **Match the surrounding style** — comment density, naming, formatting. This
   codebase uses explanatory comments for *why*, not *what*, and is unusually
   good at it. Read the comment above a workaround before changing it.
4. **`flex-1` all the way down.** A screen missing it on `SafeAreaView` or its
   container renders blank — a plain `View` has no intrinsic height.
5. **NFC and SSO cannot be tested in Expo Go.** Both need a dev/release build;
   Expo Go has no NFC native module and doesn't own the `hitboxstatic://` scheme.
   Emulators have no NFC radio at all — use the Scan screen's manual entry.
6. **Decimals arrive as strings** (`priceInDollars: "89.99"`). Format, don't
   assume `number` — and format through `lib/currency.ts`, not `toFixed`.
7. **`data/` holds two different things.** Legacy mock `.js` files under
   `collections/` and `discover/` are being replaced by `api/` hooks — don't add
   new ones. But `legal/`, `support/`, `notifications/` and
   `profile/collectionHighlights.ts` are *real* static content with no endpoint
   behind them; those are fine.
8. **Tab screens stay mounted**, so a tab hands back exactly as the user left it.
   `hooks/use-tab-scroll-reset.ts` resets scroll + filters on refocus; it uses
   `useIsFocused()` rather than `useFocusEffect()` because these screens sit in a
   Stack nested inside Tabs and `useFocusEffect` binds to the *inner* navigator.
9. Some names are historical: `marketplace/[tourId]` carries a *product* id, and
   `nfc-claim` components are still `Step3*` / `Step4*`. Don't rename without
   being asked.

---

## 13. Testing

### Unit / component (Jest)

19 suites, colocated in `__tests__/` next to what they cover — Zod schemas, Clerk
error mapping, query hooks (`getDiscoverFeed`, `getMarketplaceListings`,
`getProfile`, `updateProfile`), URL builders (`routes.test.ts`), formatters and
`useDebouncedValue`. `jest.setup.js` mocks moti, lucide, expo-router and
reanimated globally.

```bash
npm test                   # all
npm test -- discover       # one area
npm run test:coverage      # collectCoverageFrom: marketplace, collections, discover, auth
```

`api/routes.ts` files are the highest-value thing to test: they are pure, and a
wrong query string is otherwise invisible until a screen renders empty.

### End-to-end (Maestro)

A 56-flow Maestro suite exists **on the `test` branch** (commit `a186a38`, under
`.maestro/`) and is **not merged into `develop`**. It was written against the
navigation model *before* Scan became a tab, so roughly six flows still drive the
old floating `ScanFab` (`src/components/ScanFab.tsx`, now unused) and a
`(routes)/scan` route that no longer exists. Port them to the Scan tab button
(`accessibilityLabel: "Scan NFC Tag"`) before trusting a run.

```bash
git checkout test -- .maestro     # bring it into the working tree
maestro test .maestro             # needs a release build installed on a device
```

Four Maestro behaviours that cost real debugging time, all documented in that
suite's README:

- Text selectors are **full-string regexes**, case-insensitive — `"Already have an
  account"` never matches the node `"Already have an account?"`, and `?` is a
  quantifier. Use `".*x.*"`.
- **`hideKeyboard` presses BACK on Android**, popping the route or dismissing the
  open dialog. Use `- pressKey: Enter`.
- A **declared `env:` default overrides `-e` on the command line** *and* the value
  a caller passes via `runFlow`. Leave required parameters undeclared.
- `scrollUntilVisible` swipes down the middle of the screen, where the feeds'
  horizontal `FlatList`s swallow the pan. Swipe the left edge instead.

---

## 14. Known drift and dead code

Verified on 2026-08-24. Each is a real inconsistency, not a style preference.

| Item | Detail |
|---|---|
| **Deep links need website files** | §8 — the App Link / Universal Link filters are in, but do nothing until hitboxcollectibles.com serves `assetlinks.json` and `apple-app-site-association`. The NDEF filter is hand-added and lost on `expo prebuild --clean`; making it durable needs a small config plugin using `withAndroidManifest`. |
| **No ledger on the tap screens** | The old claim screen showed the provenance ledger via `GET /ledger/:tagId`, which needs the raw UID — something the app no longer has. Needs a backend ledger-by-item route. |
| **iOS has no `bundleIdentifier`** | `app.json` sets `ios.associatedDomains` but no `ios.bundleIdentifier`; Universal Links need one. |
| **Registration step 1 is unreachable** | `register/index.tsx` renders `Step2Screen` with the `Step1Screen` import commented out, so `/register` and `/register/step2` are the same screen. `Step1Screen.tsx` plus five `Step1*.tsx` components are dead. `Step1Hero.tsx` even exports a component named `Step2Hero`. |
| **`src/lib/session-user.ts` is dead** | An `X-Demo-User` header scheme from before Clerk. Nothing imports it. |
| **`src/components/ScanFab.tsx` is unused** | Kept but not rendered (`_layout.tsx` explains why). It still imports `TabBarBaseHeight`, which the new tab bar no longer uses. |
| **`components/app-tabs.tsx`** | An unused `NativeTabs` experiment referencing routes (`index`, `profile`) that don't exist at that level. |
