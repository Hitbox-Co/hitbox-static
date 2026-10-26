# Marketplace — Test Documentation

Jest **unit tests** for the Marketplace feature (price/points formatting,
route + query-key builders, the search-debounce hook, and the two React Query
data hooks). 24 tests across five files.

## Running

```bash
npm test                                # whole project
npx jest src/features/marketplace       # marketplace only
npm run test:coverage                   # with coverage (src/features/marketplace/**)
```

## Setup

| Piece | File | Notes |
|---|---|---|
| Runner / preset | `package.json` → `jest` | `jest-expo` preset, `@/` → `src/` alias, `transformIgnorePatterns` allows RN/expo/nativewind/moti/clerk/lucide |
| Global mocks | `jest.setup.js` | `react-native-reanimated`, `moti`, `lucide-react-native`, `expo-router` |
| Babel | `babel.config.js` | drops the NativeWind babel transform under Jest (detected via `api.caller` = `babel-jest`) |

The two data-hook suites mock `@/lib/api`'s `useApi` — the marketplace feeds are public (no auth), so no Clerk mock is needed. They assert the hook wiring (URL built, query key, enable-gating), not the transport.

---

## 1. Formatting — `utils/__tests__/format.test.ts` (7 tests)

| Target | Cases |
|---|---|
| `formatPrice` | decimal-string → `$89.99` · thousands + padded cents (`1250.5 → $1,250.50`, `1000000 → $1,000,000.00`) · `0 → $0.00` · non-numeric → `$`-prefixed raw (`N/A → $N/A`) |
| `formatRewardPoints` | `4500 → "4,500 pts"`, `0 → "0 pts"` |
| `MARKETPLACE_PLACEHOLDER_IMAGE` | is an `https://` URL |

## 2. Routes & keys — `api/__tests__/routes.test.ts` (9 tests)

| Target | Cases |
|---|---|
| `MARKETPLACE_ROUTES` | `feed` and `listings` paths |
| `marketplaceKeys` | stable `all`/`feed` · `listings(filters)` embeds filters, defaults `{}` |
| `buildMarketplaceListingsPath` | bare path · `category` · `search` (URL-encoded) · `sort` · `page`+`limit` · all combined (stable order) · falsy `page:0`/empty `search` omitted |

## 3. Debounce hook — `hooks/__tests__/useDebouncedValue.test.tsx` (3 tests)

Uses `jest.useFakeTimers()` + `renderHook`.

| Case | Asserts |
|---|---|
| initial value | returned immediately |
| after delay | updates only once the full delay elapses (349ms → old, +1ms → new) |
| rapid changes | timer resets; only the last value wins |

## 4. Feed hook — `api/__tests__/getMarketplaceFeed.test.tsx` (2 tests)

`useApi().get` mocked; rendered inside a `QueryClientProvider`.

| Case | Asserts |
|---|---|
| success | calls `GET /api/v1/marketplace`, `data` equals `{ featured, newListings }` |
| failure | `isError` true, error propagated |

## 5. Listings hook — `api/__tests__/getMarketplaceListings.test.tsx` (3 tests)

`useApi().getPage` mocked.

| Case | Asserts |
|---|---|
| no filters | calls `/api/v1/marketplace/listings`, returns `{ data, meta }` |
| with filters | builds `?category=cards&search=ptv&page=2` |
| `enabled: false` | stays idle, `getPage` never called |

### What is intentionally *not* covered

- **Screen/component rendering** (`MarketPlace`, `ListingsSection`, `ListingsResultsSection`, `CategorySection`, `TourScreen` product detail) — UI composition over the units here; better covered by integration/e2e.
- **The real network / Clerk token** — `useApi` is mocked; token attachment + base URL belong to a `lib/api` test.
- **Category-tab → API `category` mapping in the screen** — screen-level state wiring, out of unit scope.
