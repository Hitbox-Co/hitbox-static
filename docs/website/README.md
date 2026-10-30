# Two files for the existing hitboxcollectibles.com

Makes a tag's link behave like this:

| Phone state | What a tap does |
|---|---|
| HitBox app installed | opens the app → claims the item |
| App not installed | opens `https://hitboxcollectibles.com/verify?b=&e=&c=` in the browser → your existing website |

Same link either way. The phone decides, using the two files below. Nothing else on the website changes: keep whatever your site already shows at `/verify`.

## Add these two files to the website

| File | Served at | Notes |
|---|---|---|
| `.well-known/assetlinks.json` | `https://hitboxcollectibles.com/.well-known/assetlinks.json` | Android. Already filled in for package `com.subratadasdev1.hitboxstatic`. |
| `.well-known/apple-app-site-association` | `https://hitboxcollectibles.com/.well-known/apple-app-site-association` | iOS. **Replace** the `appIDs` value with `<Apple Team ID>.<iOS bundle id>`. |

Requirements for all of them:
- served over **https**, with **no redirect** (not even http→https or www→non-www on these paths);
- `Content-Type: application/json` for the two `.well-known` files (the iOS one has **no file extension**);
- also serve the same files on `www.hitboxcollectibles.com` if you use it.

## Android fingerprint

`assetlinks.json` contains the SHA-256 of the **debug** keystore, because both the debug and
release builds are signed with it today (`android/app/build.gradle`). That is fine for testing.
**Before shipping:** sign releases with a real keystore (and Play App Signing), then add that
certificate's SHA-256 to the `sha256_cert_fingerprints` list. Keep the debug one too while testing.

## Checking it worked

Android (after installing the build; verification runs at install, can take a minute):

```bash
adb shell pm get-app-links com.subratadasdev1.hitboxstatic
# hitboxcollectibles.com: verified

# re-run verification without reinstalling:
adb shell pm verify-app-links --re-verify com.subratadasdev1.hitboxstatic
```

If it says `none` or `1024`, the file is missing, redirected, wrong type, or the fingerprint
doesn't match the build's signing key.

iOS: needs `ios.bundleIdentifier` in `app.json` and a rebuild (Associated Domains capability).
