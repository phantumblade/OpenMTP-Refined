#!/usr/bin/env bash
# Local test build for macOS: builds the app, ad-hoc signs it so Gatekeeper
# doesn't report it as "damaged", then packages DMG + ZIP from the signed app.
# Output: dist/mac-<arch>/OpenMTP.app and dist/openmtp-<version>-mac-<arch>.dmg
set -euo pipefail

cd "$(dirname "$0")/.."

ARCH_DIR="mac-$(uname -m | sed 's/x86_64/x64/')"
APP="dist/${ARCH_DIR}/OpenMTP.app"

export CSC_IDENTITY_AUTO_DISCOVERY=false
export ELECTRON_NOTARIZE=NO

yarn build-no-verify
npx electron-builder --config electron-builder-config.js build --mac --dir --publish never

codesign --force --deep --sign - --entitlements ./build/entitlements.mac.plist "$APP"
codesign --verify --deep --strict "$APP"

# macOS 26 draws bundle icons that don't fill the standard squircle (like our
# tilted one) inside a grey container, but leaves Finder custom icons alone.
# Attach app.icns as a custom icon so the tilted design shows as intended.
set_custom_icon() {
  osascript -l JavaScript - "$PWD/app/app.icns" "$1" <<'JXA' >/dev/null
ObjC.import('AppKit');
function run(argv) {
  const image = $.NSImage.alloc.initWithContentsOfFile(argv[0]);
  if (!$.NSWorkspace.sharedWorkspace.setIconForFileOptions(image, argv[1], 0)) {
    throw new Error('Unable to set custom icon on ' + argv[1]);
  }
}
JXA
}

# The DMG gets the cleanly signed bundle: Finder icon metadata would break the
# signature for downloaded copies. The app attaches the icon to itself at first
# launch (app/helpers/customAppIcon.js); the local install gets it right away.
npx electron-builder --config electron-builder-config.js build --mac dmg zip \
  --prepackaged "$APP" --publish never

# Install as the only copy in /Applications so Spotlight/Launchpad always open
# the latest build (the DMG and ZIP in dist/ still contain it).
LSREGISTER=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
INSTALLED=/Applications/OpenMTP.app

osascript -e 'quit app id "io.github.phantumblade.openmtp"' 2>/dev/null || true
for _ in $(seq 1 20); do
  pgrep -f "OpenMTP.app/Contents/MacOS/OpenMTP" >/dev/null || break
  sleep 0.5
done

rm -rf "$INSTALLED"
ditto "$APP" "$INSTALLED"
set_custom_icon "$INSTALLED"
"$LSREGISTER" -u "$PWD/$APP" 2>/dev/null || true
rm -rf "$APP"
"$LSREGISTER" -f "$INSTALLED"

echo
echo "Installed: $INSTALLED"
ls -1 dist/*.dmg
