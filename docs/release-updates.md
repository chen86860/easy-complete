# Release Signing and Sparkle Updates

GitHub tag releases build a Developer ID signed, notarized ARM64 DMG and attach a Sparkle appcast.

## Required GitHub Secrets

Code signing:

- `APPLE_CERTIFICATE_P12_BASE64`: base64-encoded Developer ID Application `.p12`
- `APPLE_CERTIFICATE_PASSWORD`: password for the `.p12`
- `APPLE_SIGNING_IDENTITY`: codesign identity, for example `Developer ID Application: Example Inc (TEAMID)`
- `KEYCHAIN_PASSWORD`: optional temporary CI keychain password

Sparkle:

- `SPARKLE_PUBLIC_ED_KEY`: Sparkle EdDSA public key, embedded in `Info.plist`
- `SPARKLE_PRIVATE_ED_KEY`: Sparkle EdDSA private key, used only in CI to sign `appcast.xml`

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

Each release's generated `appcast.xml` points its enclosure at that tag's DMG:

```text
https://github.com/<owner>/<repo>/releases/download/<tag>/Easy-Complete-arm64.dmg
```

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
SPARKLE_PRIVATE_ED_KEY="..." \
SPARKLE_DOWNLOAD_URL_PREFIX="https://github.com/chen86860/easy-complete/releases/download/v2.0.6/" \
./scripts/generate-sparkle-appcast.sh dist/Easy-Complete-arm64.dmg
```
