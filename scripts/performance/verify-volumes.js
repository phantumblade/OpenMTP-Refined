const assert = require('assert');
const {
  groupVolumes,
  parseVolumes,
  volumeForPath,
} = require('../../app/helpers/volumes');
const { formatStorageSize } = require('../../app/helpers/diskSpace');

function main() {
  // what osascript prints: the startup disk, an external SSD, a USB stick,
  // a network share and a broken entry
  const volumes = parseVolumes(
    JSON.stringify([
      {
        path: '/Volumes/SSD_2TB',
        name: 'SSD_2TB',
        totalBytes: 2000397864960,
        availableBytes: 1491627728896,
        importantBytes: 1492186843619,
        isInternal: false,
        isRemovable: false,
        isEjectable: false,
        isRoot: false,
        isLocal: true,
      },
      {
        path: '/',
        name: 'Macintosh HD',
        totalBytes: 494384795648,
        availableBytes: 90774851584,
        importantBytes: 94646264558,
        isInternal: true,
        isRoot: true,
        isLocal: true,
      },
      {
        path: '/Volumes/KEY',
        name: 'KEY',
        totalBytes: 32e9,
        availableBytes: 10e9,
        importantBytes: null,
        isInternal: false,
        isRemovable: true,
        isEjectable: true,
        isLocal: true,
      },
      {
        path: '/Volumes/Share',
        name: 'Share',
        totalBytes: 4e12,
        availableBytes: 1e12,
        isLocal: false,
      },
      { path: '/Volumes/Empty', name: 'Empty', totalBytes: 0 },
    ])
  );

  // startup disk first, then the others by name; empty volumes dropped
  assert.deepStrictEqual(
    volumes.map((volume) => [volume.name, volume.kind]),
    [
      ['Macintosh HD', 'internal'],
      ['KEY', 'removable'],
      ['Share', 'network'],
      ['SSD_2TB', 'external'],
    ]
  );

  // free space as Finder shows it (purgeable space included)
  assert.strictEqual(volumes[0].freeBytes, 94646264558);
  // without the Finder figure, the plain one
  assert.strictEqual(volumes[1].freeBytes, 10e9);

  const { mac, other } = groupVolumes(volumes);

  assert.deepStrictEqual(
    mac.map((volume) => volume.name),
    ['Macintosh HD']
  );
  assert.deepStrictEqual(
    other.map((volume) => volume.name),
    ['KEY', 'Share', 'SSD_2TB']
  );

  // the drive holding a folder
  assert.strictEqual(
    volumeForPath(volumes, '/Volumes/SSD_2TB/Progetti').name,
    'SSD_2TB'
  );
  assert.strictEqual(
    volumeForPath(volumes, '/Volumes/SSD_2TB').name,
    'SSD_2TB'
  );
  assert.strictEqual(
    volumeForPath(volumes, '/Users/alex').name,
    'Macintosh HD'
  );
  assert.strictEqual(
    volumeForPath(volumes, '/Volumes/SSD_2TB copy').name,
    'Macintosh HD'
  );

  assert.deepStrictEqual(parseVolumes('not json'), []);
  assert.deepStrictEqual(parseVolumes(''), []);

  // Finder precision: two decimals from GB up
  assert.strictEqual(
    formatStorageSize(94646264558, 'it', { precise: true }),
    '94,65 GB'
  );
  assert.strictEqual(
    formatStorageSize(1492186843619, 'it', { precise: true }),
    '1,49 TB'
  );
  assert.strictEqual(
    formatStorageSize(2000397864960, 'en', { precise: true }),
    '2 TB'
  );
  assert.strictEqual(formatStorageSize(94646264558, 'en'), '94.6 GB');

  // eslint-disable-next-line no-console
  console.log('Volume list invariants: ok');
}

main();
