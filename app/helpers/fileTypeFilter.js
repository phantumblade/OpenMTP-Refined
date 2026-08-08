export const NO_FILE_EXTENSION = '__no_extension__';

export const getFileExtension = (item) => {
  if (item.isFolder) {
    return null;
  }

  const explicitExtension = String(item.extension || '')
    .replace(/^\./, '')
    .trim()
    .toLowerCase();

  if (explicitExtension) {
    return explicitExtension;
  }

  const name = String(item.name || '');
  const separatorIndex = name.lastIndexOf('.');

  if (separatorIndex <= 0 || separatorIndex === name.length - 1) {
    return NO_FILE_EXTENSION;
  }

  return name.slice(separatorIndex + 1).toLowerCase();
};

export const isFileTypeFilterActive = (extensions = []) =>
  extensions.length > 0;

export const filterFileNodesByType = (nodes = [], extensions = []) => {
  if (!isFileTypeFilterActive(extensions)) {
    return nodes;
  }

  const selectedExtensions = new Set(extensions);

  return nodes.filter(
    (item) => item.isFolder || selectedExtensions.has(getFileExtension(item))
  );
};

export const getFileTypeOptions = (nodes = [], selectedExtensions = []) => {
  const counts = new Map();

  nodes.forEach((item) => {
    const extension = getFileExtension(item);

    if (extension) {
      counts.set(extension, (counts.get(extension) || 0) + 1);
    }
  });

  selectedExtensions.forEach((extension) => {
    if (!counts.has(extension)) {
      counts.set(extension, 0);
    }
  });

  return Array.from(counts, ([id, count]) => ({ id, count })).sort((a, b) => {
    if (a.id === NO_FILE_EXTENSION) {
      return 1;
    }

    if (b.id === NO_FILE_EXTENSION) {
      return -1;
    }

    return a.id.localeCompare(b.id);
  });
};
