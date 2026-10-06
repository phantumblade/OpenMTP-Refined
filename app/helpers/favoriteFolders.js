import path from 'path';

export const FAVORITE_FOLDERS_MAX = 5;

// Drops malformed or duplicate entries (e.g. from a hand-edited settings file)
// and enforces the maximum number of favourites.
export const normalizeFavoriteFolders = (list) => {
  if (!Array.isArray(list)) {
    return [];
  }

  const seen = new Set();

  return list
    .filter((item) => {
      if (!item || typeof item.path !== 'string' || item.path === '') {
        return false;
      }

      if (seen.has(item.path)) {
        return false;
      }

      seen.add(item.path);

      return true;
    })
    .slice(0, FAVORITE_FOLDERS_MAX)
    .map((item) => ({
      path: item.path,
      name:
        typeof item.name === 'string' && item.name !== ''
          ? item.name
          : path.basename(item.path) || item.path,
    }));
};

export const isFavoriteFolder = (list, folderPath) =>
  normalizeFavoriteFolders(list).some((item) => item.path === folderPath);

export const isFavoriteFoldersFull = (list) =>
  normalizeFavoriteFolders(list).length >= FAVORITE_FOLDERS_MAX;

export const addFavoriteFolder = (list, { path: folderPath, name }) => {
  const current = normalizeFavoriteFolders(list);

  if (
    typeof folderPath !== 'string' ||
    folderPath === '' ||
    isFavoriteFolder(current, folderPath) ||
    current.length >= FAVORITE_FOLDERS_MAX
  ) {
    return current;
  }

  return normalizeFavoriteFolders([...current, { path: folderPath, name }]);
};

export const removeFavoriteFolder = (list, folderPath) =>
  normalizeFavoriteFolders(list).filter((item) => item.path !== folderPath);
