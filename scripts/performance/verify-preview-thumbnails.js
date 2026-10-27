const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { quickLookOutputDir } = require('../../app/helpers/previewLoadManager');

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'openmtp-thumbs-'));
  const first = path.join(root, 'Trip', 'IMG_0001.DNG');
  const second = path.join(root, 'Home', 'IMG_0001.DNG');

  fs.mkdirSync(path.dirname(first), { recursive: true });
  fs.mkdirSync(path.dirname(second), { recursive: true });
  fs.writeFileSync(first, 'first');
  fs.writeFileSync(second, 'second');

  try {
    // same file name in two folders: two thumbnails, not one shared image
    assert.notStrictEqual(
      quickLookOutputDir(first),
      quickLookOutputDir(second)
    );

    // stable while the file is unchanged, so the cache is actually reused
    assert.strictEqual(quickLookOutputDir(first), quickLookOutputDir(first));

    // an edited file gets a fresh thumbnail instead of the stale one
    const before = quickLookOutputDir(first);

    fs.writeFileSync(first, 'first, edited and longer');
    fs.utimesSync(first, new Date(), new Date(Date.now() + 5000));
    assert.notStrictEqual(quickLookOutputDir(first), before);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }

  // eslint-disable-next-line no-console
  console.log('Preview thumbnail cache invariants: ok');
}

main();
