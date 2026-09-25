const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { performance } = require('perf_hooks');
const {
  arrayEquality,
  niceBytes,
  percentage,
  replaceBulk,
} = require('../../app/utils/funcs');
const {
  calculateGridWindow,
  calculateListWindow,
} = require('../../app/utils/virtualWindow');
const {
  findNameMatch,
  searchFileTreeBreadthFirst,
} = require('../../app/helpers/fileSearch');
const { writeFileAtomicSync } = require('../../app/helpers/fileOps');
const { DEVICE_TYPE } = require('../../app/enums');

async function main() {
  // niceBytes never renders NaN/undefined units.
  assert.strictEqual(niceBytes(0), '0 Bytes');
  assert.strictEqual(niceBytes(undefined), '0 Bytes');
  assert.strictEqual(niceBytes(-5), '0 Bytes');
  assert.strictEqual(niceBytes(Number.NaN), '0 Bytes');
  assert.strictEqual(niceBytes(0.5), '0.5 Bytes');
  assert.strictEqual(niceBytes(1024), '1 KB');
  assert.strictEqual(niceBytes(1536), '1.5 KB');
  assert.ok(/YB$/.test(niceBytes(1024 ** 10)));

  // percentage is clamped and safe for zero byte files.
  assert.strictEqual(percentage(0, 0), 0);
  assert.strictEqual(percentage(5, 0), 0);
  assert.strictEqual(percentage(50, 200), 25);
  assert.strictEqual(percentage(300, 200), 100);
  assert.strictEqual(percentage(undefined, 10), 0);

  // replaceBulk with nothing to replace is a no-op.
  assert.strictEqual(replaceBulk('abc', [], []), 'abc');
  assert.strictEqual(
    replaceBulk('error: stat failed: x', ['error:', 'stat failed:'], ['', '']),
    '  x'
  );

  // arrayEquality is an order independent multiset comparison.
  assert.strictEqual(arrayEquality(['a', 'b', 'a'], ['a', 'a', 'b']), true);
  assert.strictEqual(arrayEquality(['a', 'b', 'b'], ['a', 'a', 'b']), false);
  assert.strictEqual(arrayEquality([1, 2], [1, 2, 3]), false);
  assert.strictEqual(arrayEquality(null, []), false);

  // Unmeasured DOM values never leak NaN into the virtual window.
  const listWindow = calculateListWindow({
    itemCount: 100,
    scrollOffset: undefined,
    viewportSize: Number.NaN,
    itemSize: 40,
  });

  Object.values(listWindow).forEach((value) =>
    assert.ok(Number.isFinite(value), `list window: ${value}`)
  );
  const gridWindow = calculateGridWindow({
    itemCount: 100,
    scrollOffset: Number.NaN,
    viewportSize: 600,
    containerSize: undefined,
    itemWidth: 118,
    itemHeight: 120,
  });

  Object.values(gridWindow).forEach((value) =>
    assert.ok(Number.isFinite(value), `grid window: ${value}`)
  );

  // Non ASCII names still highlight the original characters.
  const accented = findNameMatch('Università', 'versita');

  assert.deepStrictEqual(accented.positions, [3, 4, 5, 6, 7, 8, 9]);
  assert.strictEqual(findNameMatch('Photo', ''), null);
  assert.strictEqual(findNameMatch(undefined, 'ph'), null);

  // BFS stays linear on very wide trees and survives failing folders.
  const rootPath = '/wide';
  const folderCount = 20000;
  const rootNodes = Array.from({ length: folderCount }, (_, index) => ({
    name: `folder_${index}`,
    path: `${rootPath}/folder_${index}`,
    isFolder: true,
  }));
  const bfsStart = performance.now();
  const wideResult = await searchFileTreeBreadthFirst({
    rootPath,
    rootNodes,
    query: 'needle',
    deviceType: DEVICE_TYPE.local,
    maxDirectories: folderCount,
    timeoutMs: 60000,
    listFiles: async (directoryPath) => {
      if (directoryPath.endsWith('_13')) {
        throw new Error('EACCES');
      }

      if (directoryPath.endsWith('_7')) {
        return null;
      }

      return directoryPath.endsWith('_19999')
        ? [
            {
              name: 'needle.txt',
              path: `${directoryPath}/needle.txt`,
              isFolder: false,
            },
          ]
        : [];
    },
  });
  const bfsElapsed = performance.now() - bfsStart;

  assert.strictEqual(wideResult.directoriesScanned, folderCount);
  assert.strictEqual(wideResult.truncated, false);
  assert.strictEqual(wideResult.results.length, 1);
  assert.strictEqual(wideResult.results[0].name, 'needle.txt');

  // Atomic writes replace the file and leave no temp files behind.
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openmtp-atomic-'));
  const settingsPath = path.join(tempDir, 'settings.json');

  writeFileAtomicSync(settingsPath, JSON.stringify({ a: 1 }));
  writeFileAtomicSync(settingsPath, JSON.stringify({ a: 2 }));
  assert.deepStrictEqual(JSON.parse(fs.readFileSync(settingsPath, 'utf8')), {
    a: 2,
  });
  assert.deepStrictEqual(fs.readdirSync(tempDir), ['settings.json']);
  fs.rmSync(tempDir, { recursive: true, force: true });

  // eslint-disable-next-line no-console
  console.log(
    `Search BFS: ${folderCount} directories in ${bfsElapsed.toFixed(2)} ms`
  );
  // eslint-disable-next-line no-console
  console.log('Utility hardening invariants: ok');
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
