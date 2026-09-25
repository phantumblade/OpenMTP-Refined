import path from 'path';
import { DEVICE_TYPE } from '../enums';

export const FILE_SEARCH_MIN_QUERY_LENGTH = 2;
export const FILE_SEARCH_DEBOUNCE_MS = 1000;
export const FILE_SEARCH_MAX_RESULTS = 200;

// eslint-disable-next-line no-control-regex
const ASCII_ONLY_REGEX = /^[\x00-\x7f]*$/;

/**
 * Normalises a string for accent and case insensitive matching while keeping
 * a map from every normalised character back to its original index, so the
 * UI can highlight the matched characters. O(n) in the length of the value.
 */
function normalizedCharacters(value) {
  const source = value == null ? '' : String(value);

  // Fast path: ASCII has no combining marks and lowercases 1:1, so the
  // index map is the identity and no per-character normalisation is needed.
  if (ASCII_ONLY_REGEX.test(source)) {
    return { text: source.toLowerCase(), originalIndexes: null };
  }

  const characters = [];
  const originalIndexes = [];

  Array.from(source).forEach((character, originalIndex) => {
    const normalized = character
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLocaleLowerCase();

    Array.from(normalized).forEach((normalizedCharacter) => {
      characters.push(normalizedCharacter);
      originalIndexes.push(originalIndex);
    });
  });

  return { text: characters.join(''), originalIndexes };
}

function originalIndexAt(normalizedName, index) {
  return normalizedName.originalIndexes
    ? normalizedName.originalIndexes[index]
    : index;
}

function buildMatch(rank, positions) {
  const uniquePositions = [...new Set(positions)];

  return {
    rank,
    positions: uniquePositions,
    span: uniquePositions[uniquePositions.length - 1] - uniquePositions[0],
  };
}

/**
 * Returns a matcher bound to a pre-normalised query, so a search over N names
 * normalises the query once instead of N times.
 * Each call is O(|name| + |query|).
 */
export function createNameMatcher(query) {
  const normalizedQuery = normalizedCharacters(query).text.trim();

  return (name) => {
    if (!normalizedQuery) {
      return null;
    }

    const normalizedName = normalizedCharacters(name);
    const contiguousIndex = normalizedName.text.indexOf(normalizedQuery);

    if (contiguousIndex !== -1) {
      const positions = [];

      for (
        let index = contiguousIndex;
        index < contiguousIndex + normalizedQuery.length;
        index += 1
      ) {
        positions.push(originalIndexAt(normalizedName, index));
      }

      const rank =
        normalizedName.text === normalizedQuery
          ? 0
          : contiguousIndex === 0
          ? 1
          : 2;

      return buildMatch(rank, positions);
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
        fuzzyPositions.push(originalIndexAt(normalizedName, nameIndex));
        queryIndex += 1;
      }
    }

    if (queryIndex !== normalizedQuery.length) {
      return null;
    }

    return buildMatch(3, fuzzyPositions);
  };
}

export function findNameMatch(name, query) {
  return createNameMatcher(query)(name);
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

const searchResultScore = (result) =>
  typeof result.score === 'number' ? result.score : scoreSearchResult(result);

const compareSearchResults = (left, right) => {
  const scoreDifference = searchResultScore(left) - searchResultScore(right);

  if (scoreDifference !== 0) {
    return scoreDifference;
  }

  return left.name.localeCompare(right.name, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

/** O(n log n); scores are precomputed on results built by the search. */
export function sortSearchResults(results) {
  return [...results].sort(compareSearchResults);
}

function createSearchResult(item, rootPath, depth, match) {
  const parentPath = path.dirname(item.path);
  const relativeParentPath = path.relative(rootPath, parentPath);
  const result = {
    ...item,
    depth,
    match,
    parentPath,
    relativeParentPath: relativeParentPath || '.',
  };

  result.score = scoreSearchResult(result);

  return result;
}

/** Appends matches to `target` in place (no spread, safe for huge folders). */
function collectMatches({ nodes, matchName, rootPath, depth, target }) {
  for (let index = 0; index < nodes.length; index += 1) {
    const item = nodes[index];
    const match = item && item.name ? matchName(item.name) : null;

    if (match) {
      target.push(createSearchResult(item, rootPath, depth, match));
    }
  }

  return target;
}

/**
 * Breadth first search over the directory tree.
 *
 * Complexity: every directory is dequeued at most once (visited set + O(1)
 * head-index dequeue), every entry is matched once, so the traversal is
 * O(V + E) plus O((K + m) log (K + m)) per batch to keep only the best K
 * results, where m is the number of new matches in the batch.
 */
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
  const matchName = createNameMatcher(query);
  const visitedPaths = new Set([rootPath]);
  const queue = [];
  let queueHead = 0;
  let directoriesScanned = 0;
  let maxDepthReached = false;
  const safeRootNodes = Array.isArray(rootNodes) ? rootNodes : [];
  let results = collectMatches({
    nodes: safeRootNodes,
    matchName,
    rootPath,
    depth: 0,
    target: [],
  });
  const pendingDirectories = () => queue.length - queueHead;

  safeRootNodes.forEach((item) => {
    if (item && item.isFolder && !item.symlink) {
      queue.push({ path: item.path, depth: 1 });
      visitedPaths.add(item.path);
    }
  });

  onProgress({
    results: sortSearchResults(results).slice(0, maxResults),
    directoriesScanned,
    pendingDirectories: pendingDirectories(),
  });

  while (
    pendingDirectories() > 0 &&
    directoriesScanned < directoryLimit &&
    Date.now() - startedAt < timeLimit
  ) {
    if (isCancelled()) {
      return { cancelled: true, results: [] };
    }

    const remainingDirectoryBudget = directoryLimit - directoriesScanned;
    const batchSize = Math.min(
      concurrency,
      remainingDirectoryBudget,
      pendingDirectories()
    );
    const batch = queue.slice(queueHead, queueHead + batchSize);

    queueHead += batchSize;

    // Release consumed entries now and then so memory stays O(pending).
    if (queueHead > 1024 && queueHead * 2 > queue.length) {
      queue.splice(0, queueHead);
      queueHead = 0;
    }

    // eslint-disable-next-line no-await-in-loop
    const directoryListings = await Promise.all(
      batch.map(async (directory) => {
        if (directory.depth > maxDepth || isCancelled()) {
          return { directory, nodes: [] };
        }

        try {
          const nodes = await listFiles(directory.path);

          return { directory, nodes: Array.isArray(nodes) ? nodes : [] };
        } catch (_) {
          // An unreadable folder must not abort the whole search.
          return { directory, nodes: [] };
        }
      })
    );

    directoriesScanned += batch.length;

    for (const { directory, nodes } of directoryListings) {
      collectMatches({
        nodes,
        matchName,
        rootPath,
        depth: directory.depth,
        target: results,
      });

      for (const item of nodes) {
        if (
          item &&
          item.isFolder &&
          !item.symlink &&
          !visitedPaths.has(item.path)
        ) {
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
      pendingDirectories: pendingDirectories(),
    });
  }

  return {
    cancelled: false,
    directoriesScanned,
    results: sortSearchResults(results).slice(0, maxResults),
    truncated:
      pendingDirectories() > 0 ||
      maxDepthReached ||
      Date.now() - startedAt >= timeLimit,
  };
}
