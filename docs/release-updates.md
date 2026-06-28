# Release Signing and Sparkle Updates

GitHub tag releases build a Developer ID signed, notarized ARM64 DMG, attach a
Sparkle appcast, and upload Sparkle delta updates when previous release assets
are available.

## Required GitHub Secrets

Code signing:

- `APPLE_CERTIFICATE_P12_BASE64`: base64-encoded Developer ID Application `.p12`
- `APPLE_CERTIFICATE_PASSWORD`: password for the `.p12`
- `APPLE_SIGNING_IDENTITY`: codesign identity, for example `Developer ID Application: Example Inc (TEAMID)`
- `KEYCHAIN_PASSWORD`: optional temporary CI keychain password

Sparkle:

- `SPARKLE_PUBLIC_ED_KEY`: Sparkle EdDSA public key, embedded in `Info.plist`
- `SPARKLE_PRIVATE_ED_KEY`: Sparkle EdDSA private key, used only in CI to sign
  `appcast.xml` and generated `.delta` update entries

Notarization, choose one:

- App Store Connect API key:
  - `APPLE_NOTARY_KEY_BASE64`: base64-encoded `.p8` key, or `APPLE_NOTARY_KEY` as raw key text
  - `APPLE_NOTARY_KEY_ID`
  - `APPLE_NOTARY_ISSUER_ID`
- Apple ID:
  - `APPLE_ID`
  - `APPLE_APP_SPECIFIC_PASSWORD`
  - `APPLE_TEAM_ID`

## Update Feed

The app embeds this feed URL at build time:

```text
https://github.com/<owner>/<repo>/releases/latest/download/appcast.xml
```

Each release uploads two DMG names:

- `Easy-Complete-arm64.dmg`: stable website/manual-download asset
- `Easy-Complete-<version>-arm64.dmg`: versioned Sparkle full-update asset

The generated `appcast.xml` points its full-update enclosure at that tag's
versioned DMG:

```text
https://github.com/<owner>/<repo>/releases/download/<tag>/Easy-Complete-<version>-arm64.dmg
```

When a previous `appcast.xml` and previous DMG assets exist, CI downloads the
recent history into `dist/sparkle`, then Sparkle's `generate_appcast` creates
signed `.delta` files for the latest update. Sparkle clients use a matching
delta when possible and fall back to the versioned full DMG when no delta is
available or applying the delta fails.

The published appcast keeps only the latest update item, but it may include up
to eight deltas from recent previous versions. Older DMGs are inputs for delta
generation; they are not re-published in the latest release.

## Local Commands

Generate a Sparkle key pair:

```bash
./build/sparkle/2.9.3/bin/generate_keys
```

Build a Sparkle-enabled app locally:

```bash
SPARKLE_PUBLIC_ED_KEY="..." ./scripts/build-app.sh
```

Sign and notarize locally:

```bash
APPLE_SIGNING_IDENTITY="Developer ID Application: Example Inc (TEAMID)" ./scripts/sign-macos-app.sh
./scripts/make-dmg.sh dist/Easy-Complete-arm64.dmg
APPLE_SIGNING_IDENTITY="Developer ID Application: Example Inc (TEAMID)" \
APPLE_NOTARY_KEY_BASE64="..." \
APPLE_NOTARY_KEY_ID="..." \
APPLE_NOTARY_ISSUER_ID="..." \
./scripts/notarize-dmg.sh dist/Easy-Complete-arm64.dmg
```

Generate appcast locally:

```bash
cp dist/Easy-Complete-arm64.dmg dist/Easy-Complete-2.0.6-arm64.dmg

SPARKLE_PRIVATE_ED_KEY="..." \
SPARKLE_DOWNLOAD_URL_PREFIX="https://github.com/chen86860/easy-complete/releases/download/v2.0.6/" \
SPARKLE_BUNDLE_VERSION="2.0.6" \
./scripts/generate-sparkle-appcast.sh dist/Easy-Complete-2.0.6-arm64.dmg
```

Generate local delta updates:

```bash
mkdir -p dist/sparkle
cp path/to/previous/appcast.xml dist/sparkle/appcast.xml
cp path/to/Easy-Complete-2.0.5-arm64.dmg dist/sparkle/
cp dist/Easy-Complete-arm64.dmg dist/Easy-Complete-2.0.6-arm64.dmg

SPARKLE_PRIVATE_ED_KEY="..." \
SPARKLE_DOWNLOAD_URL_PREFIX="https://github.com/chen86860/easy-complete/releases/download/v2.0.6/" \
SPARKLE_BUNDLE_VERSION="2.0.6" \
SPARKLE_MAXIMUM_VERSIONS=1 \
SPARKLE_MAXIMUM_DELTAS=8 \
./scripts/generate-sparkle-appcast.sh dist/Easy-Complete-2.0.6-arm64.dmg
```

Upload all generated Sparkle assets with the release:

```text
dist/Easy-Complete-arm64.dmg
dist/Easy-Complete-<version>-arm64.dmg
dist/sparkle/appcast.xml
dist/sparkle/*.delta
```
