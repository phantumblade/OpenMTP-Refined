const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const {
  INSTALL_SCRIPT,
  bundlePathFromExecutable,
  parseSha256Digest,
  pickAsset,
  pickUpdate,
  versionFromTag,
} = require('../../app/helpers/appUpdateRelease');
const { finderInfoHasCustomIcon } = require('../../app/helpers/finderInfo');

const SHA = 'd8f9d4c5f4ea5dbdaa621894c53c36546e12a491970014ca148e3cc90c9240b1';
const asset = (name, digest = `sha256:${SHA}`) => ({
  name,
  digest,
  state: 'uploaded',
  size: 10,
  browser_download_url: `https://example.invalid/${name}`,
});
const release = (tag, assets, extra = {}) => ({
  tag_name: tag,
  name: `OpenMTP Refined ${tag}`,
  draft: false,
  prerelease: false,
  body_html: '<p>notes</p>',
  assets,
  ...extra,
});

function verifyReleasePicking() {
  assert.strictEqual(versionFromTag('v4.0.1'), '4.0.1');
  assert.strictEqual(versionFromTag('OpenMTP-4.1.0-beta.2'), '4.1.0-beta.2');
  assert.strictEqual(versionFromTag('latest'), null);
  assert.strictEqual(parseSha256Digest(`sha256:${SHA.toUpperCase()}`), SHA);
  assert.strictEqual(parseSha256Digest('md5:abc'), null);

  // the build for this Mac, ZIP preferred; never the other architecture
  const assets = [
    asset('OpenMTP-Refined-4.0.1-arm64.dmg'),
    asset('OpenMTP-Refined-4.0.1-arm64.zip'),
    asset('OpenMTP-Refined-4.0.1-x64.dmg'),
    asset('OpenMTP-Refined-4.0.1-arm64.dmg.blockmap'),
  ];

  assert.strictEqual(
    pickAsset(assets, 'arm64').name,
    'OpenMTP-Refined-4.0.1-arm64.zip'
  );
  assert.strictEqual(
    pickAsset(assets, 'x64').name,
    'OpenMTP-Refined-4.0.1-x64.dmg'
  );
  assert.strictEqual(pickAsset([asset('OpenMTP.dmg')], 'x64'), null);
  assert.strictEqual(
    pickAsset([asset('OpenMTP-4.0.1-universal.dmg')], 'x64').name,
    'OpenMTP-4.0.1-universal.dmg'
  );
  assert.strictEqual(
    pickAsset([{ ...asset('a-arm64.dmg'), state: 'starter' }], 'arm64'),
    null
  );

  const releases = [
    release('v4.0.0', [asset('OpenMTP-Refined-4.0.0-arm64.dmg')]),
    release('v4.2.0', [asset('OpenMTP-Refined-4.2.0-arm64.dmg')], {
      draft: true,
    }),
    release(
      'v4.1.0-beta.1',
      [asset('OpenMTP-Refined-4.1.0-beta.1-arm64.dmg')],
      {
        prerelease: true,
      }
    ),
    release('v4.0.2', [asset('OpenMTP-Refined-4.0.2-arm64.dmg', null)]),
    release('v4.0.1', [asset('OpenMTP-Refined-4.0.1-arm64.dmg')]),
  ];
  const options = { currentVersion: '4.0.0', arch: 'arm64' };

  // drafts, unverifiable assets and (by default) betas are skipped
  const update = pickUpdate(releases, options);

  assert.strictEqual(update.version, '4.0.1');
  assert.strictEqual(update.asset.sha256, SHA);
  assert.strictEqual(update.releaseNotes, '<p>notes</p>');
  assert.strictEqual(
    pickUpdate(releases, { ...options, allowPrerelease: true }).version,
    '4.1.0-beta.1'
  );
  assert.strictEqual(pickUpdate(releases, { ...options, arch: 'x64' }), null);
  assert.strictEqual(
    pickUpdate(releases, { ...options, currentVersion: '4.0.1' }),
    null
  );
  assert.strictEqual(pickUpdate(undefined, options), null);

  assert.strictEqual(
    bundlePathFromExecutable(
      '/Applications/OpenMTP.app/Contents/MacOS/OpenMTP'
    ),
    '/Applications/OpenMTP.app'
  );
  assert.strictEqual(bundlePathFromExecutable('/usr/bin/electron'), null);
}

const makeBundle = (dir, version) => {
  fs.mkdirSync(path.join(dir, 'Contents', 'MacOS'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Contents', 'version.txt'), version);
};
const bundleVersion = (dir) =>
  fs.readFileSync(path.join(dir, 'Contents', 'version.txt'), 'utf8');

const runInstaller = (root, args) => {
  const script = path.join(root, 'install.sh');

  fs.writeFileSync(script, INSTALL_SCRIPT);

  return spawnSync('/bin/sh', [script, ...args], { encoding: 'utf8' });
};

function verifyInstallScript() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'openmtp-update-'));
  const applications = path.join(root, 'Applications');
  const target = path.join(applications, 'OpenMTP.app');
  const work = path.join(root, 'work');
  const source = path.join(work, 'OpenMTP.app');
  const exited = spawnSync('true').pid;

  try {
    makeBundle(target, '4.0.0');
    makeBundle(source, '4.0.1');

    // swaps the bundles, leaves nothing behind, removes the work folder
    const ok = runInstaller(root, [String(exited), target, source, '0', work]);

    assert.strictEqual(ok.status, 0, ok.stdout + ok.stderr);
    assert.strictEqual(bundleVersion(target), '4.0.1');
    assert.deepStrictEqual(fs.readdirSync(applications), ['OpenMTP.app']);
    assert.ok(!fs.existsSync(work));

    // a missing new version keeps the installed one untouched
    const failed = runInstaller(root, [
      String(exited),
      target,
      path.join(root, 'missing.app'),
      '0',
      '',
    ]);

    assert.notStrictEqual(failed.status, 0);
    assert.strictEqual(bundleVersion(target), '4.0.1');
    assert.deepStrictEqual(fs.readdirSync(applications), ['OpenMTP.app']);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

// the installer waits for the app to quit before replacing it
function verifyInstallWaitsForQuit() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'openmtp-update-'));
  const target = path.join(root, 'Applications', 'OpenMTP.app');
  const source = path.join(root, 'work', 'OpenMTP.app');
  const script = path.join(root, 'install.sh');

  makeBundle(target, '4.0.0');
  makeBundle(source, '4.0.1');
  fs.writeFileSync(script, INSTALL_SCRIPT);

  const app = spawn('sleep', ['1']);
  const installer = spawn('/bin/sh', [
    script,
    String(app.pid),
    target,
    source,
    '0',
    '',
  ]);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // the "app" is still running: nothing replaced yet
        assert.strictEqual(bundleVersion(target), '4.0.0');
      } catch (e) {
        reject(e);
      }
    }, 400);

    installer.on('exit', (code) => {
      try {
        assert.strictEqual(code, 0);
        assert.strictEqual(bundleVersion(target), '4.0.1');
        fs.rmSync(root, { recursive: true, force: true });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
}

// the Finder flag that makes the tilted icon show, as `xattr -px` prints it
function verifyCustomIconFlag() {
  const finderInfo = (byte8) =>
    `00 00 00 00 00 00 00 00 ${byte8} 00 00 00 00 00 00 00\n${'00 '.repeat(
      16
    )}`;

  assert.strictEqual(finderInfoHasCustomIcon(finderInfo('04')), true);
  assert.strictEqual(finderInfoHasCustomIcon(finderInfo('44')), true);
  // copied bundle: other flags kept, custom icon flag gone
  assert.strictEqual(finderInfoHasCustomIcon(finderInfo('40')), false);
  assert.strictEqual(finderInfoHasCustomIcon(''), false);
  assert.strictEqual(finderInfoHasCustomIcon(undefined), false);
}

async function main() {
  verifyCustomIconFlag();
  verifyReleasePicking();
  verifyInstallScript();
  await verifyInstallWaitsForQuit();

  // eslint-disable-next-line no-console
  console.log('App update invariants: ok');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
