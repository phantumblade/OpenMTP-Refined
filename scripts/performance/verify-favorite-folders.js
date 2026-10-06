const assert = require('assert');
const {
  FAVORITE_FOLDERS_MAX,
  addFavoriteFolder,
  isFavoriteFolder,
  isFavoriteFoldersFull,
  normalizeFavoriteFolders,
  removeFavoriteFolder,
} = require('../../app/helpers/favoriteFolders');

function main() {
  assert.strictEqual(FAVORITE_FOLDERS_MAX, 5);

  // Missing or corrupted settings never break the sidebar.
  assert.deepStrictEqual(normalizeFavoriteFolders(undefined), []);
  assert.deepStrictEqual(normalizeFavoriteFolders('oops'), []);
  assert.deepStrictEqual(
    normalizeFavoriteFolders([null, {}, { path: '' }, { path: 42 }]),
    []
  );

  // The name falls back to the folder's base name.
  let list = addFavoriteFolder([], { path: '/Users/me/Progetti' });

  assert.deepStrictEqual(list, [
    { path: '/Users/me/Progetti', name: 'Progetti' },
  ]);
  assert.ok(isFavoriteFolder(list, '/Users/me/Progetti'));
  assert.ok(!isFavoriteFolder(list, '/Users/me'));

  // Adding the same folder twice is a no-op.
  assert.strictEqual(
    addFavoriteFolder(list, { path: '/Users/me/Progetti', name: 'Altro' })
      .length,
    1
  );

  // Order is preserved and the list stops at the maximum.
  for (let i = 1; i <= 10; i += 1) {
    list = addFavoriteFolder(list, { path: `/tmp/f${i}`, name: `f${i}` });
  }

  assert.strictEqual(list.length, FAVORITE_FOLDERS_MAX);
  assert.ok(isFavoriteFoldersFull(list));
  assert.deepStrictEqual(
    list.map((item) => item.name),
    ['Progetti', 'f1', 'f2', 'f3', 'f4']
  );

  // Removing frees a slot.
  list = removeFavoriteFolder(list, '/tmp/f2');
  assert.strictEqual(list.length, FAVORITE_FOLDERS_MAX - 1);
  assert.ok(!isFavoriteFoldersFull(list));
  assert.ok(!isFavoriteFolder(list, '/tmp/f2'));
  list = addFavoriteFolder(list, { path: '/tmp/f9', name: 'f9' });
  assert.strictEqual(list[list.length - 1].path, '/tmp/f9');

  // Hand-edited files with duplicates or too many entries are cleaned up.
  const dirty = [
    { path: '/a' },
    { path: '/a', name: 'dup' },
    { path: '/b' },
    { path: '/c' },
    { path: '/d' },
    { path: '/e' },
    { path: '/f' },
  ];

  assert.deepStrictEqual(
    normalizeFavoriteFolders(dirty).map((item) => item.path),
    ['/a', '/b', '/c', '/d', '/e']
  );

  // eslint-disable-next-line no-console
  console.log('Favorite folders invariants: ok');
}

main();
