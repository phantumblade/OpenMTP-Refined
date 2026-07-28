const assert = require('assert');
const path = require('path');
const { performance } = require('perf_hooks');
const {
  findNameMatch,
  searchFileTreeBreadthFirst,
  sortSearchResults,
} = require('../../app/helpers/fileSearch');
const { DEVICE_TYPE } = require('../../app/enums');

async function main() {
  const exact = findNameMatch('Fotografia', 'fotografia');
  const prefix = findNameMatch('Fotografia_2026', 'foto');
  const substring = findNameMatch('Vacanze_Fotografia', 'foto');
  const fuzzy = findNameMatch('Trentino_Movieland', 'trmv');
  const accentInsensitive = findNameMatch('Università', 'universita');

  assert.strictEqual(exact.rank, 0);
  assert.strictEqual(prefix.rank, 1);
  assert.strictEqual(substring.rank, 2);
  assert.strictEqual(fuzzy.rank, 3);
  assert.ok(accentInsensitive);
  assert.strictEqual(findNameMatch('Fotografia', 'xyz'), null);

  const rootPath = '/search-root';
  const rootNodes = [
    {
      name: 'Projects',
      path: path.join(rootPath, 'Projects'),
      isFolder: true,
    },
    {
      name: 'Photos',
      path: path.join(rootPath, 'Photos'),
      isFolder: true,
    },
  ];
  const tree = new Map([
    [
      path.join(rootPath, 'Projects'),
      [
        {
          name: 'photo_index.json',
          path: path.join(rootPath, 'Projects', 'photo_index.json'),
          isFolder: false,
        },
      ],
    ],
    [
      path.join(rootPath, 'Photos'),
      [
        {
          name: 'Photo',
          path: path.join(rootPath, 'Photos', 'Photo'),
          isFolder: true,
        },
      ],
    ],
    [
      path.join(rootPath, 'Photos', 'Photo'),
      [
        {
          name: 'photo.jpg',
          path: path.join(rootPath, 'Photos', 'Photo', 'photo.jpg'),
          isFolder: false,
        },
      ],
    ],
  ]);

  const bfsResult = await searchFileTreeBreadthFirst({
    rootPath,
    rootNodes,
    query: 'photo',
    deviceType: DEVICE_TYPE.local,
    listFiles: async (directoryPath) => tree.get(directoryPath) || [],
  });

  assert.strictEqual(bfsResult.cancelled, false);
  assert.strictEqual(bfsResult.results.length, 4);
  assert.strictEqual(bfsResult.results[0].name, 'Photo');
  assert.strictEqual(bfsResult.results[0].isFolder, true);
  assert.strictEqual(bfsResult.results[1].name, 'Photos');
  assert.ok(
    bfsResult.results.find((result) => result.name === 'photo.jpg').depth === 2
  );

  const limitedResult = await searchFileTreeBreadthFirst({
    rootPath,
    rootNodes,
    query: 'photo',
    deviceType: DEVICE_TYPE.local,
    listFiles: async (directoryPath) => tree.get(directoryPath) || [],
    maxDirectories: 1,
  });

  assert.strictEqual(limitedResult.directoriesScanned, 1);
  assert.strictEqual(limitedResult.truncated, true);

  const ranked = sortSearchResults(bfsResult.results);

  for (let index = 1; index < ranked.length; index += 1) {
    assert.ok(ranked[index - 1].match.rank <= ranked[index].match.rank);
  }

  const benchmarkNames = Array.from(
    { length: 100000 },
    (_, index) => `IMG_${String(index).padStart(6, '0')}_Trentino_Movieland.jpg`
  );
  const benchmarkStart = performance.now();
  let benchmarkMatches = 0;

  benchmarkNames.forEach((name) => {
    if (findNameMatch(name, 'trmov')) {
      benchmarkMatches += 1;
    }
  });

  const benchmarkElapsed = performance.now() - benchmarkStart;

  assert.strictEqual(benchmarkMatches, benchmarkNames.length);

  // eslint-disable-next-line no-console
  console.log(
    `File search: ${
      benchmarkNames.length
    } fuzzy comparisons in ${benchmarkElapsed.toFixed(2)} ms`
  );
  // eslint-disable-next-line no-console
  console.log('File search invariants: ok');
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
