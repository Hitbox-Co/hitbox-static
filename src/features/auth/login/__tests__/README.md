# Login — Test Documentation

Jest test suite for the **login** section (email/password, phone OTP, Google/Apple SSO)
plus the shared Clerk error helpers. 58 tests across five files.

## Running

```bash
npm test                                    # whole project
npx jest src/features/auth/login            # login schemas + components
npx jest src/features/auth/login src/features/auth/utils   # + the Clerk helpers
npm run test:coverage                       # with coverage (src/features/auth/**)
```

## Setup

| Piece | File | Notes |
|---|---|---|
| Runner / preset | `package.json` → `jest` | `jest-expo` preset, `@/` → `src/` alias, `transformIgnorePatterns` allows RN/expo/nativewind/moti/clerk/lucide |
| Global mocks | `jest.setup.js` | `react-native-reanimated`, `moti`, `lucide-react-native`, `expo-router` |
| Babel | `babel.config.js` | drops the NativeWind babel transform under Jest (detected via `api.caller` = `babel-jest`); its `_ReactNativeCSSInterop` global otherwise breaks `jest.mock()` factories |

Per-suite mocks (`@clerk/clerk-expo`, `@/components/ui/dialog`, `expo-web-browser`, `expo-linking`, icon components) live in each component test file. `expo-router` is mocked globally, so `router.replace` is the same jest.fn() a test imports and asserts on.

---

## 1. Schemas — `schemas/__tests__/LoginSchema.test.ts` (~30 tests)

Pure unit tests over the three Zod schemas.

| Schema | Cases |
|---|---|
| **loginSchema** (email+password) | valid ✓ · empty email → "required" ✗ · invalid formats (`plainaddress`, `missing@tld`, `@no-local`, spaces) ✗ · valid formats (`a@b.co`, dotted, `+tag`) ✓ · missing email ✗ · password `<6` ✗ · exactly 6 (boundary) ✓ · missing password ✗ · both-invalid reports both |
| **phoneSchema** | E.164-ish valid: `+15555550100`, `15555550100`, `+919876543210`, `12` ✓ · empty → "required" ✗ · leading-zero, dashes, space, letters, single-digit ✗ · `>15` digits ✗ |
| **otpSchema** | exactly 6 chars ✓ · `5`/`7`/empty length ✗ · missing field ✗ |

## 2. Clerk helpers — `utils/__tests__/clerk.test.ts` (8 tests)

`@clerk/clerk-expo`'s `isClerkAPIResponseError` is mocked so both branches are exercised.

| Function | Cases |
|---|---|
| **getClerkErrorMessage** | Clerk error → prefers `longMessage` · falls back to `message` · default fallback when empty · plain `Error` → its `.message` · unknown value → custom / default fallback |
| **isAccountNotFound** | Clerk error w/ `form_identifier_not_found` → true · other code → false · non-Clerk error → false |

## 3. EmailLogin — `components/__tests__/EmailLogin.test.tsx` (7 tests)

`useSignIn` and the Dialog primitives are mocked; the real react-hook-form + Zod run.

| Group | Test | Asserts |
|---|---|---|
| Validation | empty submit | required errors, `signIn.create` **not** called |
| | invalid email | "Invalid email address", `create` not called |
| Sign-in | success | `create({identifier,password})`, `setActive({session})`, dialog closed, `router.replace('/(tabs)/discover')` |
| | needs 2FA | non-`complete` status → "Additional verification is required…", no `setActive` |
| | account not found | `form_identifier_not_found` → "No account found with this email…" |
| | generic Clerk error | surfaces `longMessage` |
| | not loaded | `isLoaded=false` → `create` not called |

## 4. PhoneNumberLogin — `components/__tests__/PhoneNumberLogin.test.tsx` (7 tests)

`useSignIn` + `useSignUp` + Dialog mocked. Covers the two-step phone→OTP flow and the sign-up fallback.

| Group | Test | Asserts |
|---|---|---|
| Phone step | empty number | "Phone number is required", `signIn.create` not called |
| | existing account | `create({identifier:'+1…'})` → `prepareFirstFactor({phone_code})` → advances to OTP |
| | no phone_code factor | "SMS sign-in is not available for this account." |
| | number has no account | `form_identifier_not_found` → `signUp.create` + `preparePhoneNumberVerification` → OTP |
| OTP step | verify (sign-in) | `attemptFirstFactor({code})`, `setActive`, `router.replace('/(tabs)/discover')` |
| | OTP ≠ 6 digits | "Verification code must be exactly 6 digits", `attemptFirstFactor` not called |
| | verify (sign-up) | new number → `attemptPhoneNumberVerification({code})`, `setActive` |

## 5. SSO buttons — `components/__tests__/AlternativeSignInOptionSection.test.tsx` (5 tests)

`useSSO`, `expo-web-browser`, `expo-linking` and the icon SVGs are mocked.

| Test | Asserts |
|---|---|
| renders | "Continue with Google" / "Continue with Apple" present |
| Google flow | `startSSOFlow({strategy:'oauth_google'})`, created session → `router.replace('/(tabs)/discover')` |
| Apple flow | `startSSOFlow({strategy:'oauth_apple'})` |
| cancelled | no `createdSessionId` → no navigation |
| error | rejected flow → error message shown |

### What is intentionally *not* covered

- **The real OAuth browser redirect** — `startSSOFlow` opens an external browser and returns via deep link; that's an e2e/Detox concern. Only the app-side handling of its *result* is unit-tested.
- **Dialog open/close animation & the country-picker dropdown** — the Dialog is mocked to render its content inline, so visibility toggling and the portal aren't exercised.
- **Password show/hide toggle press** — the eye button has no accessible label.
