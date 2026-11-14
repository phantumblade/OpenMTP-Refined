import semver from 'semver';

// Every user-facing change, tagged with the version it arrived in and how
// much it matters (weight). The What's new panel shows only what is new for
// the version the user comes from, so it can't go stale: when a feature
// ships, add it here (English key, Italian in i18n) with the new version.
// - title: card / featured heading; chip: the short label used as a chip
// - description: shown when the item is the featured one or a card
// - action: 'backupGuide' adds "How it works" (photo backup)
export const WHATS_NEW_ITEMS = [
  // 4.1.5
  {
    since: '4.1.5',
    weight: 15,
    icon: 'blur_on',
    title: 'A lighter Sort by bar',
    chip: 'A lighter Sort by bar',
    description:
      'The Sort by bar floats over the files on a soft blur, like the bar at the bottom of each pane.',
  },
  {
    since: '4.1.5',
    weight: 40,
    icon: 'verified_user',
    title: 'Permissions that stay',
    chip: 'Permissions that stay',
    description:
      'The folders and disks you allow stay allowed after an update: macOS no longer asks again each time.',
  },
  // 4.1.4
  {
    since: '4.1.4',
    weight: 60,
    icon: 'hard_drive',
    title: 'Every drive in the side menu',
    chip: 'Every drive in the side menu',
    description:
      'The side menu lists the Mac’s own disk and every drive plugged in, with the free space exactly as Finder shows it. Click one to open it.',
  },
  {
    since: '4.1.4',
    weight: 20,
    icon: 'system_update_alt',
    title: 'Updates in the OpenMTP menu',
    chip: 'Updates in the OpenMTP menu',
    description:
      'When a new version is ready, the OpenMTP menu in the menu bar says so and installs it with one click.',
  },
  // 4.1.3
  {
    since: '4.1.3',
    weight: 65,
    icon: 'filter_alt',
    title: 'Counters that filter',
    chip: 'Counters that filter',
    description:
      'The bottom of each pane is now one row: where you are, and the counts of folders and files. Press a count to see only folders or only files.',
  },
  // 4.1.2
  {
    since: '4.1.2',
    weight: 55,
    icon: 'auto_awesome',
    title: 'What’s new, made for you',
    chip: 'What’s new made for you',
    description:
      'This panel now shows only what changed since the version you had, laid out to fit: one card or a whole grid.',
  },
  // 4.1.1
  {
    since: '4.1.1',
    weight: 60,
    icon: 'notifications',
    title: 'Updates you can’t miss',
    chip: 'Update badge in the side menu',
    description:
      'A badge on the menu button and a card in the side menu tell you when a new version is ready, to install with one click.',
  },
  // 4.1.0
  {
    since: '4.1.0',
    weight: 100,
    icon: 'add_photo_alternate',
    title: 'Photo backup in one click',
    chip: 'Photo backup',
    description:
      'Copies to a Mac folder the phone’s new photos and videos, keeping its sub-folders. What is already on the Mac is skipped and never overwritten.',
    action: 'backupGuide',
  },
  {
    since: '4.1.0',
    weight: 90,
    icon: 'swap_vert',
    title: 'Transfers panel',
    chip: 'Transfers panel',
    description:
      'The copy in progress, the files ready to paste and the history of past copies, a click away in the phone pane.',
  },
  {
    since: '4.1.0',
    weight: 85,
    icon: 'system_update',
    title: 'Automatic updates',
    chip: 'Automatic updates',
    description:
      'OpenMTP finds new versions by itself, checks they are genuine and installs them when you want.',
  },
  {
    since: '4.1.0',
    weight: 80,
    icon: 'picture_in_picture_alt',
    title: 'Copies in the background',
    chip: 'Copies in the background',
    description:
      'A long copy shrinks into a floating pill, and macOS tells you when it ends.',
  },
  {
    since: '4.1.0',
    weight: 75,
    icon: 'palette',
    title: 'Your app colour',
    chip: 'Your app colour',
    description:
      'Blue, purple, pink, red, orange, yellow or green, or the macOS accent colour: the whole app follows it.',
  },
  {
    since: '4.1.0',
    weight: 70,
    icon: 'animation',
    title: 'Material 3 Expressive',
    chip: 'Material 3 Expressive',
    description:
      'Google Sans Flex, livelier colours and spring motion in buttons, switches, menus and tiles.',
  },
  {
    since: '4.1.0',
    weight: 50,
    icon: 'format_size',
    title: 'Adjustable interface size',
    chip: 'Adjustable interface size',
    description:
      'Icons and text from 80% to 130%, or fitted to the screen on small laptops.',
  },
  {
    since: '4.1.0',
    weight: 40,
    icon: 'summarize',
    title: 'Summary at the end of a copy',
    chip: 'Summary at the end of a copy',
    description: 'Items, size, time taken and average speed of each copy.',
  },
  {
    since: '4.1.0',
    weight: 35,
    icon: 'donut_large',
    title: 'Free space next to the device',
    chip: 'Free space next to the device',
    description: 'Each pane shows its device and how much space is left.',
  },
  {
    since: '4.1.0',
    weight: 30,
    icon: 'view_column',
    title: 'Two-column Settings',
    chip: 'Two-column Settings',
    description: 'Related settings side by side in a wide window.',
  },
  {
    since: '4.1.0',
    weight: 25,
    icon: 'ads_click',
    title: 'Panels close with a click outside',
    chip: 'Panels close with a click outside',
    description:
      'Settings, messages and this panel close with a click outside.',
  },
  // 4.0.0: only for a first install (nobody updates from an older version
  // of this fork)
  {
    since: '4.0.0',
    weight: 95,
    icon: 'cable',
    title: 'A connection that just works',
    chip: 'A reliable connection',
    description:
      'OpenMTP frees the phone from the macOS services that hold on to it, and tells you why and what to do if something goes wrong.',
  },
  {
    since: '4.0.0',
    weight: 45,
    icon: 'star',
    title: 'Favorite folders',
    chip: 'Favorite folders',
    description: 'Keep up to 5 folders one click away in the side menu.',
  },
  {
    since: '4.0.0',
    weight: 44,
    icon: 'filter_alt',
    title: 'Filters by date and type',
    chip: 'Filters by date and type',
    description:
      'Find yesterday’s photos or only the videos, with dates in your language’s format.',
  },
  {
    since: '4.0.0',
    weight: 42,
    icon: 'folder_managed',
    title: 'You decide which folders OpenMTP opens',
    chip: 'Folder access you control',
    description:
      'Before macOS asks for Desktop, Documents or Downloads, OpenMTP explains why.',
  },
];

// featured + up to 4 cards fill the grid; the rest become chips
const MAX_CARDS = 4;
const MAX_CHIPS = 8;

const byWeight = (a, b) =>
  b.weight - a.weight || semver.rcompare(a.since, b.since);

/**
 * What the panel shows when updating from [from] to [to] (or, with no
 * valid [from], on a first install).
 *
 * @return {{mode: 'update'|'welcome', from, to, featured, cards, chips,
 *   multipleVersions: boolean, count: number}}
 */
export const selectWhatsNew = ({ from, to, items = WHATS_NEW_ITEMS } = {}) => {
  const current = semver.valid(semver.coerce(to)) || '0.0.0';
  const previous = semver.valid(from) ? from : null;
  const available = items.filter((item) => semver.lte(item.since, current));
  const fresh = previous
    ? available.filter((item) => semver.gt(item.since, previous))
    : available;
  const sorted = [...fresh].sort(byWeight);
  const [featured = null, ...rest] = sorted;
  const cards = rest.slice(0, MAX_CARDS);
  const chips = rest.slice(MAX_CARDS, MAX_CARDS + MAX_CHIPS);

  return {
    mode: previous ? 'update' : 'welcome',
    from: previous,
    to: current,
    featured,
    cards,
    chips,
    count: sorted.length,
    multipleVersions: new Set(fresh.map(({ since }) => since)).size > 1,
  };
};

// Grid shape for [cards] cards next to the featured one, so every row is
// full: columns in a wide window and how many the featured card spans.
export const whatsNewLayout = (cardCount) => {
  switch (cardCount) {
    case 0:
      return { columns: 1, featuredSpan: 1, width: 640 };
    case 1:
      return { columns: 3, featuredSpan: 2, width: 960 };
    case 2:
      return { columns: 2, featuredSpan: 2, width: 860 };
    case 3:
      return { columns: 3, featuredSpan: 3, width: 1080 };
    default:
      return { columns: 3, featuredSpan: 2, width: 1080 };
  }
};
