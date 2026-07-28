import path from 'path';
import { DEVICE_TYPE } from '../enums';

export const FILE_SEARCH_MIN_QUERY_LENGTH = 2;
export const FILE_SEARCH_DEBOUNCE_MS = 1000;
export const FILE_SEARCH_MAX_RESULTS = 200;

function normalizedCharacters(value) {
  const characters = [];
  const originalIndexes = [];

  Array.from(value || '').forEach((character, originalIndex) => {
    const normalized = character
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();

    Array.from(normalized).forEach((normalizedCharacter) => {
      characters.push(normalizedCharacter);
      originalIndexes.push(originalIndex);
    });
  });

  return { text: characters.join(''), originalIndexes };
}

export function findNameMatch(name, query) {
  const normalizedName = normalizedCharacters(name);
  const normalizedQuery = normalizedCharacters(query).text.trim();

  if (!normalizedQuery) {
    return null;
  }

  const contiguousIndex = normalizedName.text.indexOf(normalizedQuery);

  if (contiguousIndex !== -1) {
    const positions = [];

    for (
      let index = contiguousIndex;
      index < contiguousIndex + normalizedQuery.length;
      index += 1
    ) {
      positions.push(normalizedName.originalIndexes[index]);
    }

    const uniquePositions = [...new Set(positions)];
    const rank =
      normalizedName.text === normalizedQuery
        ? 0
        : contiguousIndex === 0
        ? 1
        : 2;

    return {
      rank,
      positions: uniquePositions,
      span: uniquePositions[uniquePositions.length - 1] - uniquePositions[0],
    };
  }

  const fuzzyPositions = [];
  let queryIndex = 0;

  for (
    let nameIndex = 0;
    nameIndex < normalizedName.text.length &&
    queryIndex < normalizedQuery.length;
    nameIndex += 1
  ) {
    if (normalizedName.text[nameIndex] === normalizedQuery[queryIndex]) {
      fuzzyPositions.push(normalizedName.originalIndexes[nameIndex]);
      queryIndex += 1;
    }
  }

  if (queryIndex !== normalizedQuery.length) {
    return null;
  }

  const uniquePositions = [...new Set(fuzzyPositions)];

  return {
    rank: 3,
    positions: uniquePositions,
    span: uniquePositions[uniquePositions.length - 1] - uniquePositions[0],
  };
}

export function scoreSearchResult(result) {
  const typePenalty = result.isFolder ? 0 : 12;

  return (
    result.match.rank * 100000 +
    result.depth * 100 +
    typePenalty +
    result.match.span
  );
}

export function sortSearchResults(results) {
  return [...results].sort((left, right) => {
    const scoreDifference = scoreSearchResult(left) - scoreSearchResult(right);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return left.name.localeCompare(right.name, undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });
}

function createSearchResult(item, rootPath, depth, match) {
  const parentPath = path.dirname(item.path);
  const relativeParentPath = path.relative(rootPath, parentPath);

  return {
    ...item,
    depth,
    match,
    parentPath,
    relativeParentPath: relativeParentPath || '.',
  };
}

function collectMatches({ nodes, query, rootPath, depth }) {
  return nodes.reduce((matches, item) => {
    const match = findNameMatch(item.name, query);

    if (match) {
      matches.push(createSearchResult(item, rootPath, depth, match));
    }

    return matches;
  }, []);
}

export async function searchFileTreeBreadthFirst({
  rootPath,
  rootNodes = [],
  query,
  deviceType,
  listFiles,
  isCancelled = () => false,
  onProgress = () => {},
  maxResults = FILE_SEARCH_MAX_RESULTS,
  maxDepth = 24,
  maxDirectories,
  timeoutMs,
}) {
  const isMtp = deviceType === DEVICE_TYPE.mtp;
  const concurrency = isMtp ? 1 : 6;
  const directoryLimit = maxDirectories ?? (isMtp ? 400 : 2000);
  const timeLimit = timeoutMs ?? (isMtp ? 20000 : 15000);
  const startedAt = Date.now();
  const visitedPaths = new Set([rootPath]);
  const queue = [];
  let directoriesScanned = 0;
  let maxDepthReached = false;
  let results = collectMatches({
    nodes: rootNodes,
    query,
    rootPath,
    depth: 0,
  });

  rootNodes.forEach((item) => {
    if (item.isFolder && !item.symlink) {
      queue.push({ path: item.path, depth: 1 });
      visitedPaths.add(item.path);
    }
  });

  onProgress({
    results: sortSearchResults(results).slice(0, maxResults),
    directoriesScanned,
    pendingDirectories: queue.length,
  });

  while (
    queue.length > 0 &&
    directoriesScanned < directoryLimit &&
    Date.now() - startedAt < timeLimit
  ) {
    if (isCancelled()) {
      return { cancelled: true, results: [] };
    }

    const remainingDirectoryBudget = directoryLimit - directoriesScanned;
    const batch = queue.splice(
      0,
      Math.min(concurrency, remainingDirectoryBudget)
    );
    // eslint-disable-next-line no-await-in-loop
    const directoryListings = await Promise.all(
      batch.map(async (directory) => {
        if (directory.depth > maxDepth || isCancelled()) {
          return { directory, nodes: [] };
        }

        try {
          const nodes = await listFiles(directory.path);

          return { directory, nodes: nodes || [] };
        } catch (_) {
          return { directory, nodes: [] };
        }
      })
    );

    directoriesScanned += batch.length;

    for (const { directory, nodes } of directoryListings) {
      results.push(
        ...collectMatches({
          nodes,
          query,
          rootPath,
          depth: directory.depth,
        })
      );

      for (const item of nodes) {
        if (item.isFolder && !item.symlink && !visitedPaths.has(item.path)) {
          if (directory.depth < maxDepth) {
            visitedPaths.add(item.path);
            queue.push({ path: item.path, depth: directory.depth + 1 });
          } else {
            maxDepthReached = true;
          }
        }
      }
    }

    results = sortSearchResults(results).slice(0, maxResults);
    onProgress({
      results,
      directoriesScanned,
      pendingDirectories: queue.length,
    });
  }

  return {
    cancelled: false,
    directoriesScanned,
    results: sortSearchResults(results).slice(0, maxResults),
    truncated:
      queue.length > 0 ||
      maxDepthReached ||
      Date.now() - startedAt >= timeLimit,
  };
}
