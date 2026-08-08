const assert = require('assert');
const {
  NO_FILE_EXTENSION,
  filterFileNodesByType,
  getFileExtension,
  getFileTypeOptions,
} = require('../../app/helpers/fileTypeFilter');
const {
  FILE_DATE_FIELD,
  filterFileNodesByDate,
} = require('../../app/helpers/fileDateFilter');

const dateSortedNodes = [
  { name: 'Fotografia', path: '/Fotografia', isFolder: true },
  {
    name: 'newest.dng',
    path: '/newest.dng',
    extension: '.dng',
    isFolder: false,
    dateModified: '2026-08-08T18:00:00.000Z',
  },
  {
    name: 'middle.jpg',
    path: '/middle.jpg',
    extension: '.JPG',
    isFolder: false,
    dateModified: '2026-08-08T12:00:00.000Z',
  },
  {
    name: 'older.dng',
    path: '/older.dng',
    isFolder: false,
    dateModified: '2026-08-07T18:00:00.000Z',
  },
  {
    name: 'README',
    path: '/README',
    isFolder: false,
    dateModified: '2026-08-08T10:00:00.000Z',
  },
];

assert.strictEqual(getFileExtension(dateSortedNodes[1]), 'dng');
assert.strictEqual(getFileExtension(dateSortedNodes[2]), 'jpg');
assert.strictEqual(getFileExtension(dateSortedNodes[4]), NO_FILE_EXTENSION);

const typeFiltered = filterFileNodesByType(dateSortedNodes, ['dng', 'jpg']);

assert.deepStrictEqual(
  typeFiltered.map((item) => item.name),
  ['Fotografia', 'newest.dng', 'middle.jpg', 'older.dng']
);

const dateThenTypeFiltered = filterFileNodesByType(
  filterFileNodesByDate(dateSortedNodes, {
    field: FILE_DATE_FIELD.modified,
    from: '2026-08-08',
    to: '2026-08-08',
  }),
  ['dng']
);

assert.deepStrictEqual(
  dateThenTypeFiltered.map((item) => item.name),
  ['Fotografia', 'newest.dng']
);

assert.deepStrictEqual(getFileTypeOptions(dateSortedNodes), [
  { id: 'dng', count: 2 },
  { id: 'jpg', count: 1 },
  { id: NO_FILE_EXTENSION, count: 1 },
]);

// eslint-disable-next-line no-console
console.log('File type filter composition and ordering invariants: ok');
