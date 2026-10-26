# Discover — Test Documentation

Jest **unit tests** for the Discover feature (formatting, route/query-key builders,
the debounce hook, and the two React Query data hooks). 25 tests across five files.

## Running

```bash
npm test                              # whole project
npx jest src/features/discover        # discover only
npm run test:coverage                 # with coverage (src/features/discover/**)
```

## Setup

| Piece | File | Notes |
|---|---|---|
| Runner / preset | `package.json` → `jest` | `jest-expo` preset, `@/` → `src/` alias, `transformIgnorePatterns` allows RN/expo/nativewind/moti/clerk/lucide |
| Global mocks | `jest.setup.js` | `react-native-reanimated`, `moti`, `lucide-react-native`, `expo-router` |
| Babel | `babel.config.js` | drops the NativeWind babel transform under Jest (detected via `api.caller` = `babel-jest`) |

The two data-hook suites mock `@/lib/api`'s `useApi` so no Clerk/token/network is involved — they assert the hook's *wiring* (URL built, query key, returned data), not the transport.

---

## 1. Formatting — `utils/__tests__/format.test.ts` (5 tests)

| Target | Cases |
|---|---|
| `formatRewardPoints` | `50 → "50 pts"` · `0 → "0 pts"` · thousands separators (`12500`, `1000000`) · sub-1000 no separator |
| `DISCOVER_PLACEHOLDER_IMAGE` | is an `https://` URL |

## 2. Routes & keys — `api/__tests__/routes.test.ts` (11 tests)

| Target | Cases |
|---|---|
| `DISCOVER_ROUTES` | `feed` and `products` paths are correct |
| `discoverKeys` | stable `feed` key · `products(filters)` embeds filters · `products()` defaults to `{}` |
| `buildDiscoverProductsPath` | no filters → bare path · `section` · `search` · space → `+` encoding · `page`+`limit` · all combined (stable order) · falsy `search:''`/`page:0` omitted |

## 3. Debounce hook — `hooks/__tests__/useDebouncedValue.test.tsx` (4 tests)

Uses `jest.useFakeTimers()` + `renderHook`.

| Case | Asserts |
|---|---|
| initial value | returned immediately |
| after delay | value updates only once the full delay elapses (349ms → old, +1ms → new) |
| rapid changes | timer resets; only the last value wins |
| custom delay | honours a non-default `delayMs` |

## 4. Feed hook — `api/__tests__/getDiscoverFeed.test.tsx` (2 tests)

`useApi().get` mocked; hook rendered inside a `QueryClientProvider`.

| Case | Asserts |
|---|---|
| success | calls `GET /api/v1/discover`, `data` equals the feed |
| failure | `isError` true, error propagated |

## 5. Products hook — `api/__tests__/getDiscoverProducts.test.tsx` (3 tests)

`useApi().getPage` mocked.

| Case | Asserts |
|---|---|
| no filters | calls `/api/v1/discover/products`, returns `{ data, meta }` |
| with filters | builds `/api/v1/discover/products?search=ptv&page=2` |
| `enabled: false` | stays idle, `getPage` never called |

### What is intentionally *not* covered

- **Screen/component rendering** (`DiscoverScreen`, cards, `HeroBanner`, `SearchResultsSection`) — these are UI composition over the units tested here; covered better by an integration/e2e pass than unit tests.
- **The real network / Clerk token** — `useApi` is mocked, so token attachment and the ngrok base URL are out of scope (they belong to a `lib/api` test).
