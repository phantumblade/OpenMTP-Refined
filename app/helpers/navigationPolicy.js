// Every OpenMTP window runs with Node integration, so a page must never
// navigate away from the app itself: a file dropped outside the drop zone
// (Electron opens it as a page) or a stray link would otherwise run with
// full access to the Mac. Links meant for the browser or the mail app are
// handed to macOS instead.

const EXTERNAL_PROTOCOLS = ['http:', 'https:', 'mailto:'];

const parseUrl = (value) => {
  try {
    return new URL(String(value));
  } catch (_) {
    return null;
  }
};

const withoutHash = (parsed) => {
  const copy = new URL(parsed.href);

  copy.hash = '';

  return copy.href;
};

// The app page itself, with any hash route (`app.html#faqsPage`).
export const isAppPageUrl = (targetUrl, appUrl) => {
  const target = parseUrl(targetUrl);
  const app = parseUrl(appUrl);

  if (!target || !app) {
    return false;
  }

  return withoutHash(target) === withoutHash(app);
};

export const isExternalUrl = (targetUrl) => {
  const target = parseUrl(targetUrl);

  return !!target && EXTERNAL_PROTOCOLS.includes(target.protocol);
};

/**
 * @return {'allow'|'external'|'block'}
 */
export const navigationDecision = (targetUrl, appUrl) => {
  if (isAppPageUrl(targetUrl, appUrl)) {
    return 'allow';
  }

  return isExternalUrl(targetUrl) ? 'external' : 'block';
};
