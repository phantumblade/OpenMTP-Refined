import semver from 'semver';

// Where OpenMTP Refined looks for new versions: the fork's GitHub releases.
// Releasing an update = publishing a release tagged vX.Y.Z with the DMG or
// ZIP attached, named with its architecture (e.g. *-arm64.dmg, *-x64.zip).
export const UPDATE_REPOSITORY = {
  owner: 'phantumblade',
  repo: 'OpenMTP-Refined',
};

// appId in electron-builder-config.js: an update must be this very app
export const UPDATE_BUNDLE_ID = 'io.github.phantumblade.openmtp';

// An update error whose message is meant for the user.
export class UpdateError extends Error {}

const ARCH_TOKENS = {
  arm64: ['arm64', 'aarch64'],
  x64: ['x64', 'x86_64', 'amd64', 'intel'],
};
const UNIVERSAL_TOKENS = ['universal'];

const hasToken = (name, tokens) =>
  tokens.some((token) =>
    new RegExp(`(^|[^a-z0-9])${token}([^a-z0-9]|$)`).test(name)
  );

export const versionFromTag = (tag) => {
  const cleaned = semver.clean(String(tag || ''));

  if (cleaned) {
    return cleaned;
  }

  const match = /\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?/.exec(String(tag || ''));

  return match && semver.valid(match[0]) ? match[0] : null;
};

// GitHub reports each release asset's checksum as "sha256:<hex>"
export const parseSha256Digest = (digest) => {
  const match = /^sha256:([a-f0-9]{64})$/i.exec(String(digest || ''));

  return match ? match[1].toLowerCase() : null;
};

/**
 * The DMG or ZIP built for [arch] ('arm64' or 'x64'), else a universal one.
 * Assets that don't name an architecture are ignored: installing the Apple
 * silicon build on an Intel Mac would leave an app that can't start.
 */
export const pickAsset = (assets, arch) => {
  const installable = (Array.isArray(assets) ? assets : []).filter(
    (asset) =>
      asset &&
      /\.(zip|dmg)$/i.test(asset.name || '') &&
      (!asset.state || asset.state === 'uploaded')
  );
  const byFormat = (list) =>
    // a ZIP is smaller to unpack than mounting a disk image
    list.find((asset) => /\.zip$/i.test(asset.name)) || list[0] || null;
  const named = (tokens) =>
    installable.filter((asset) => hasToken(asset.name.toLowerCase(), tokens));

  return (
    byFormat(named(ARCH_TOKENS[arch] || [])) ||
    byFormat(named(UNIVERSAL_TOKENS))
  );
};

/**
 * The newest release above [currentVersion] that can be installed on this
 * Mac and verified, or null.
 *
 * @return {null|{version, releaseName, releaseNotes, asset: {name, url, size, sha256}}}
 */
export const pickUpdate = (
  releases,
  { currentVersion, allowPrerelease = false, arch }
) => {
  const candidates = (Array.isArray(releases) ? releases : [])
    .filter((release) => release && !release.draft)
    .map((release) => {
      const version = versionFromTag(release.tag_name);
      const asset = version ? pickAsset(release.assets, arch) : null;

      return { release, version, asset };
    })
    .filter(
      ({ release, version, asset }) =>
        version &&
        semver.gt(version, currentVersion) &&
        (allowPrerelease ||
          (!release.prerelease && !semver.prerelease(version))) &&
        asset &&
        // without GitHub's checksum the download can't be verified
        parseSha256Digest(asset.digest)
    )
    .sort((a, b) => semver.rcompare(a.version, b.version));

  if (candidates.length < 1) {
    return null;
  }

  const { release, version, asset } = candidates[0];

  return {
    version,
    releaseName: release.name || `v${version}`,
    // HTML rendered by GitHub, sanitised again by the update window
    releaseNotes: release.body_html || '',
    asset: {
      name: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
      sha256: parseSha256Digest(asset.digest),
    },
  };
};

// The installed bundle from the running executable (.app/Contents/MacOS/x).
export const bundlePathFromExecutable = (execPath) => {
  const match = /^(.*?\.app)\/Contents\/MacOS\/[^/]+$/.exec(
    String(execPath || '')
  );

  return match ? match[1] : null;
};

/**
 * Runs after OpenMTP has quit: replaces the installed bundle with the new
 * one and optionally relaunches it.
 * Arguments: <app pid> <installed .app> <new .app> <relaunch 1|0> <work dir>
 * The new bundle is first copied next to the installed one, then the two are
 * swapped with renames inside the same folder, so any failure leaves the
 * previous version in place.
 */
export const INSTALL_SCRIPT = `#!/bin/sh
pid="$1"
target="$2"
source="$3"
relaunch="$4"
workdir="$5"

log() { printf '%s %s\\n' "$(date '+%Y-%m-%dT%H:%M:%S')" "$*"; }

# never touch a running app: wait up to two minutes for it to quit
i=0
while kill -0 "$pid" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 1200 ]; then
    log "OpenMTP did not quit, update cancelled"
    exit 1
  fi
  sleep 0.1
done

parent=$(dirname "$target")
name=$(basename "$target")
staged="$parent/.$name.update-new-$$"
backup="$parent/.$name.update-old-$$"

copy="cp -R"
if command -v ditto >/dev/null 2>&1; then
  copy="ditto"
fi

rm -rf "$staged"
if ! $copy "$source" "$staged" || [ ! -d "$staged" ]; then
  log "could not copy the new version"
  rm -rf "$staged"
  exit 1
fi

if ! mv "$target" "$backup"; then
  log "could not move the installed version"
  rm -rf "$staged"
  exit 1
fi
if ! mv "$staged" "$target"; then
  log "could not move the new version in place, restoring"
  mv "$backup" "$target"
  rm -rf "$staged"
  exit 1
fi
rm -rf "$backup"

# downloaded and checked by OpenMTP itself: don't let Gatekeeper ask again
if command -v xattr >/dev/null 2>&1; then
  xattr -dr com.apple.quarantine "$target" 2>/dev/null
fi

# the copy drops the Finder custom icon of the bundle: put the tilted icon
# back, as scripts/build-local-mac.sh does (macOS 26 boxes the bundle icon)
icon="$target/Contents/Resources/icon.icns"
darwin=$(uname -r | cut -d. -f1)
if [ -f "$icon" ] && [ "$darwin" -ge 25 ] 2>/dev/null && command -v osascript >/dev/null 2>&1; then
  osascript -l JavaScript - "$icon" "$target" >/dev/null 2>&1 <<'JXA'
ObjC.import('AppKit');
function run(argv) {
  const image = $.NSImage.alloc.initWithContentsOfFile(argv[0]);
  $.NSWorkspace.sharedWorkspace.setIconForFileOptions(image, argv[1], 0);
}
JXA
fi
lsregister=/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister
if [ -x "$lsregister" ]; then
  "$lsregister" -f "$target" >/dev/null 2>&1
fi
if [ -n "$workdir" ]; then
  rm -rf "$workdir"
fi

log "installed $target"

if [ "$relaunch" = "1" ] && command -v open >/dev/null 2>&1; then
  open "$target"
fi

exit 0
`;
