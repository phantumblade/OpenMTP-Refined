// Public GitHub data for the "made by" card in the sidebar footer. Fetched
// from the unauthenticated REST API on demand, cached for an hour in memory
// and in localStorage so the card works offline with the last known values.

export const GITHUB_USER = 'phantumblade';
export const GITHUB_REPO = 'OpenMTP-Refined';
export const GITHUB_DISPLAY_NAME = 'Andrea Perini';

const CACHE_KEY = 'openmtp.githubProfile';
const CACHE_TTL_MS = 60 * 60 * 1000;

let memoryCache = null;
let inFlight = null;

const readStoredCache = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null');
  } catch (e) {
    return null;
  }
};

const writeStoredCache = (value) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch (e) {
    // storage unavailable: memory cache is enough
  }
};

export const summarizeGithubData = (user, repo) => ({
  name: user?.name || GITHUB_DISPLAY_NAME,
  login: user?.login || GITHUB_USER,
  avatarUrl: user?.avatar_url || null,
  profileUrl: user?.html_url || `https://github.com/${GITHUB_USER}`,
  publicRepos: user?.public_repos ?? null,
  followers: user?.followers ?? null,
  following: user?.following ?? null,
  repoName: repo?.full_name || `${GITHUB_USER}/${GITHUB_REPO}`,
  repoUrl: repo?.html_url || `https://github.com/${GITHUB_USER}/${GITHUB_REPO}`,
  repoDescription: repo?.description || null,
  stars: repo?.stargazers_count ?? null,
  forks: repo?.forks_count ?? null,
  pushedAt: repo?.pushed_at || null,
});

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  return response.json();
};

// Resolves with { data, fresh }; never rejects (falls back to the cache or to
// the static identity so the card always has something to show).
export const loadGithubProfile = async () => {
  const cached = memoryCache || readStoredCache();

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    memoryCache = cached;

    return { data: cached.data, fresh: true };
  }

  if (!inFlight) {
    inFlight = Promise.all([
      fetchJson(`https://api.github.com/users/${GITHUB_USER}`),
      fetchJson(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}`),
    ])
      .then(([user, repo]) => {
        memoryCache = {
          fetchedAt: Date.now(),
          data: summarizeGithubData(user, repo),
        };
        writeStoredCache(memoryCache);

        return { data: memoryCache.data, fresh: true };
      })
      .catch(() => ({
        data: cached?.data || summarizeGithubData(null, null),
        fresh: false,
      }))
      .finally(() => {
        inFlight = null;
      });
  }

  return inFlight;
};
