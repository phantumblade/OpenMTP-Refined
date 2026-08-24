const assert = require('assert');
const {
  FILE_DATE_FIELD,
  filterFileNodesByDate,
  isFileDateFilterActive,
  isFileDateFilterValid,
} = require('../../app/helpers/fileDateFilter');
const { getFileIcon } = require('../../app/helpers/fileExplorerIcons');

const nodes = [
  {
    name: 'Fotografia',
    path: '/Fotografia',
    isFolder: true,
    dateCreated: '2024-01-01T10:00:00.000Z',
    dateModified: '2024-01-01T10:00:00.000Z',
  },
  {
    name: 'first.jpg',
    path: '/first.jpg',
    isFolder: false,
    dateCreated: '2026-08-01T08:00:00.000Z',
    dateModified: '2026-08-08T11:00:00.000Z',
  },
  {
    name: 'second.dng',
    path: '/second.dng',
    isFolder: false,
    dateCreated: '2026-08-08T18:00:00.000Z',
    dateModified: '2026-08-09T09:00:00.000Z',
  },
  {
    name: 'unknown.jpg',
    path: '/unknown.jpg',
    isFolder: false,
  },
];

const creationResult = filterFileNodesByDate(nodes, {
  field: FILE_DATE_FIELD.created,
  from: '2026-08-08',
  to: '2026-08-08',
});

assert.deepStrictEqual(
  creationResult.map((item) => item.name),
  ['Fotografia', 'second.dng']
);

const modifiedResult = filterFileNodesByDate(nodes, {
  field: FILE_DATE_FIELD.modified,
  from: '2026-08-08',
  to: '',
});

assert.deepStrictEqual(
  modifiedResult.map((item) => item.name),
  ['Fotografia', 'first.jpg', 'second.dng']
);

assert.strictEqual(
  isFileDateFilterValid({ from: '2026-08-09', to: '2026-08-08' }),
  false
);
assert.strictEqual(isFileDateFilterActive({ from: '', to: '' }), false);
assert.strictEqual(
  getFileIcon({ name: 'photo.JPG' }, 'light'),
  'catppuccin/latte/image.svg'
);
assert.strictEqual(
  getFileIcon({ name: 'negative.dng' }, 'dark'),
  'catppuccin/mocha/dng.svg'
);
assert.notStrictEqual(
  getFileIcon({ name: 'photo.jpg' }, 'light'),
  getFileIcon({ name: 'negative.dng' }, 'light')
);

// eslint-disable-next-line no-console
console.log('Date filter and JPG/DNG icon invariants: ok');
