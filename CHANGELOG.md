# Changelog

All notable changes to this fork will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version 4.0.0 is the first release of the fork with its own version number.

## Unreleased

### Added

- The bottom of each pane is one row instead of two: the path in a field
  with the device, the items ready to paste, and the counts of everything,
  folders and files as a connected button group. Pressing a count shows
  only the folders or only the files (another folder starts with everything
  shown again). The row floats over the files on a blur that fades in from
  the top, with no edge or dividing line; the list keeps its room so the last row is never
  hidden. When the pane is narrow the row drops the labels, then puts the
  middle folders behind "…" (a menu lists them), never cutting a name.

### Changed

- "Sort by" and the new counters share one connected button group, so they
  press exactly the same way.
- When a count gains or loses digits (opening a folder, going back up), its
  button resizes smoothly instead of jumping; the items-ready chip does too.

- The update card in the side menu shows "Install and Relaunch" across the
  card with "What's new" under it, instead of two buttons wrapping unevenly.
- New README in English and Italian (README.it.md) with screenshots of 4.1.2.

## 4.1.2 — 2026-11-13

### Changed

- The What's new panel adapts to the version you update from: it shows only
  what is new for you, the most important change featured and the others as
  cards and chips in a grid sized to their number (one change: a single
  card in a narrower panel). Coming from several versions back, each card
  says which version it arrived in; a first install gets a welcome with the
  best of the app. Nothing new: no panel.

## 4.1.1 — 2026-11-13

### Added

- A new version shows inside the app: a badge on the menu button, like
  Android's notification badges ("1" when the update is waiting, a dot
  while it downloads), and at the bottom of the side menu a card with the
  version, the download progress, "What's new" and "Install and Relaunch".

## 4.1.0 — 2026-11-13

### Added

- Expressive look. Google Sans Flex is the interface font and Vibrant the
  default colour style; settings saved by an older version move to them once
  and can be changed back in Settings.
- App colour: the whole palette can be built from blue, purple, pink, red,
  orange, yellow or green, or follow the macOS accent colour.
- Pane header: the actions sit in grouped pills, and a chip shows the device
  with its free space (the phone, and the Mac volume of the current folder)
  instead of the text in the window title.
- Transfers panel (new button in the phone pane): the running copy, the items
  ready to be pasted and the history of past copies, with a shortcut to the
  destination folder. The history is kept in the app's profile folder and
  stores no file names.
- A copy can continue in the background: the dialog shrinks into a floating
  pill, and macOS shows a notification when the copy ends.
- Photo backup: one button copies to a Mac folder the photos and videos of
  the phone's camera folder (DCIM) that the folder doesn't have yet, keeping
  the phone's sub-folders. Files already on the Mac are never overwritten.
- The transfer dialog ends with a summary: items, size, time, average speed.
- "How it works" for photo backup: a four-step illustrated guide, from the
  Transfers panel and from the What's new panel.
- The Transfers history is grouped by day; each copy shows the destination
  device, the direction, items and size, and chips for the destination
  folder (click to open it), the time taken and the average speed. Sizes
  use the app language's number format, like Finder.
- Interface size in Settings → General: a Material 3 Expressive slider
  from 80% to 130% scales icons, text and spacing together, or "Fit to the
  screen" picks a smaller size on small laptop screens. It applies before
  the window first appears, so there is no jump at launch.
- The What's new panel shows this version's changes as a grid of cards that
  uses the window's width (one to three columns), with the photo backup
  featured.
- File tiles lift on hover, squeeze when pressed and rise in one after the
  other when a folder opens.
- While OpenMTP stays open it looks for a new version every 6 hours too
  (before, only at launch), downloading and verifying it in the background
  like the check at launch.
- Updates from this fork's GitHub releases. When it opens, OpenMTP looks for
  a newer version, downloads it in the background, checks its SHA-256 against
  the one GitHub publishes and asks to install and relaunch, or installs it
  when you quit. "Check For Updates" checks right away and shows what's new
  first; "Install Update from File…" installs a DMG, ZIP or app you already
  have (e.g. a local build). Ad-hoc signed builds can't use Electron's own
  updater, so OpenMTP replaces its app bundle itself after quitting, keeping
  the previous version if anything goes wrong.
- Color style in Settings → General: "Classic" keeps the current calm
  tonal colours, "Vibrant" uses the 2025 colour spec of Material 3
  Expressive, with saturated containers and surfaces tinted by the brand
  blue (deep navy in dark mode). Both follow light/dark mode and macOS
  "Increase contrast", and switch instantly.
- Menu style in Settings → General, the two colour styles of Material 3
  Expressive menus: "Standard" keeps the right-click menu on the window's
  surface colour, "Vibrant" fills it with the orange of the app icon
  (tertiary container) and marks the selected item in a deeper orange.

### Removed

- The unused telemetry and update libraries inherited from upstream
  (Sentry, Mixpanel, electron-ga, electron-updater) and their Sentry build
  tooling: the fork never sent data, and the app now ships 35 fewer packages
  and 15 fewer known dependency advisories.

### Fixed

- Every app colour now colours the whole interface: dialog buttons, the
  selected item of select menus and the vibrant right-click menu are in the
  chosen colour instead of blue or the icon's orange.
- A toggled toolbar button (multi-select) showed a filled square without its
  icon.
- The bar under the pane toolbar that marked the focused pane is gone.
- Settings, confirmations and messages close with a click outside them,
  like the What's new panel.
- Select menus open below their field, unfolding like the right-click menu,
  instead of covering it.
- Switches move with the M3 Expressive spring: the handle slides, grows and
  settles, and the check grows in with it.
- The "Sort by" buttons press like a Material 3 Expressive connected group:
  the pressed button pinches its inner corners and widens while the others
  make room, then springs back.
- Settings use two columns in a wide window (app colour next to colour
  style, theme next to menu style, hidden files next to grid view).
- The photo backup card was hard to read in dark themes: without a phone
  it showed a disabled button that vanished on the bright card; it now says
  "Connect the phone to start" in the card's own text colour, and the start
  button and icon use that colour as their fill in both themes.
- Select menus (language, font) really animate now: their opening
  keyframes came out empty, so they popped in.
- Going back with the path bar now plays the same entrance of the files as
  opening a folder (it showed them all at once).
- The photo backup guide changes step on a shared axis: the old step slides
  out before the new one slides in from the side you are heading to.
- The wavy progress bar no longer draws its track under the moving wave while
  a copy is being checked or prepared.
- The rename, new folder, replace and delete dialogs, the storage and MTP
  mode pickers, the window title ("Kalam Mode") and the "Root" folder of the
  path bar were still in English with the app in Italian. The dialogs now
  name their action ("Delete permanently?" with Delete and Cancel instead of
  Yes and No), the MTP mode picker describes the modes as Settings does, and
  a name error lists the characters that aren't allowed.
- Consistent Italian texts: "telefono" everywhere instead of a mix with
  "smartphone", sentence case instead of English-style capitals ("Cavo USB
  per i dati"), the same quotation marks around every button and option
  name, and Acquisizione Immagine called by its macOS name.
- The app menu, the update windows and every update message are now in
  Italian when the app is, and the menu switches language right away.
- Vibrant colour style, dark mode: the settings and welcome lists no longer
  show pure black rows (meant for phone OLED screens) in the navy dialog.
- Connecting a phone can no longer hang if the phone never stops sending the
  reply another app asked for: OpenMTP stops waiting for it after 30 seconds.
- Small windows (down to the 880×640 minimum): the date filter no longer
  runs off the bottom of the window, so its calendar and the Apply button
  stay reachable (the middle of the panel scrolls instead).
- The phone connection screen gets a compact layout in windows up to 820
  pixels high (e.g. a 13" MacBook), so "Try connection again" is no longer
  hidden under the error card.
- The "Sort by" bar no longer gets cut off in Italian when both panes share a
  small window.
- The connection screen animations stop drawing while they are at rest: on
  the idle "no phone" screen the app now uses about a third of the CPU it did.
- Legacy MTP mode: folders with more than about 12,000 files failed to open
  (the listing outgrew a 1 MB output limit), and transfer progress could
  skip updates when a line arrived split in two.
- Legacy MTP mode now refreshes the phone's storages when reloading, as it
  was meant to.
- The mouse back/forward buttons sometimes sent the focussed pane to its
  parent folder instead of the previous one, because the other pane handled
  the click as well.
- Grid thumbnails of RAW photos and videos: two files with the same name in
  different folders showed the same picture, and an edited file kept its old
  thumbnail. A stuck QuickLook process is now stopped after six seconds.
- Dark mode: the check mark of selected items in selection dialogs and the
  item count on the "Transfer here" button were almost invisible, and the
  release notes box had a black border.
- Update dialogs ("network error", "no internet connection") were shown only
  once per session; later ones were silently dropped.
- The "unable to load profile" window never appeared when OpenMTP could not
  create its settings and log files.
- The phone library's results, progress updates and folder listings were
  never freed, so memory use kept growing during long sessions.
- A phone that doesn't answer is no longer retried several times by two
  layers at once, which could make the connection screen wait minutes for
  the same error.

### Security

- Legacy MTP mode now runs mtp-cli without a shell. The escaping added
  earlier still let a name with a backslash before `$(` (e.g.
  `a\$(command)`) run a command on the Mac; file names are now passed as
  plain arguments, so no name can be run, while mtp-cli receives exactly the
  same text as before for every ordinary name.
- Legacy MTP mode: a file or folder on the phone named like
  `$(command)` ran that command on the Mac when opened or copied. File names
  are now passed to the shell literally.
- Windows can no longer leave the app page: dropping a file outside the drop
  zone used to open it as a page with full access to the Mac. Web and mail
  links open in the browser and the mail app.

## 4.0.0 — 2026-10-06

First public release of OpenMTP Refined, with a downloadable DMG for Apple
Silicon Macs.

### Added

- Material 3 Expressive design system: Google color scheme generated from the
  brand blue, with a warm tertiary from the app icon's orange for favorites
  and selected menu items (light and dark), Material Symbols icons, shape and motion
  tokens, M3 buttons, dialogs, tabs, switches, menus, tooltips and snackbars.
  Every surface, divider, selection and text colour comes from an M3 colour
  role, and macOS "Increase contrast" switches to the M3 high contrast scheme.
- Morphing loading indicator and wavy progress bar ported from Jetpack
  Compose, with smoothed transfer progress. The connection screen's shape
  morphs into the loading indicator and back instead of being swapped, and
  each morph hands over to the next without the snap Compose has.
- Redesigned phone connection screen: actions, step-by-step guide and a
  full-width status banner, with an animated face for error states.
- Plain-language explanations for connection errors (locked phone, File
  Transfer not enabled, phone busy in another app, no response, multiple or
  different phones).
- Favorite folders (up to 5 in the sidebar, marked with a star).
- Date filter with modified/created field, quick ranges, a calendar range
  picker and the date format of the app language; file type filter with chips.
- Redesigned settings dialog with tabs, icons and grouped sections, plus a
  choice of interface font (including Faculty Glyphic).
- GitHub card in the sidebar footer with the project's links and statistics,
  next to the app icon and version.
- Folder access: OpenMTP explains each macOS-protected folder (Desktop,
  Documents, Downloads, external disks) before macOS asks, lets the user
  allow or close it, shows a lock on closed folders, never scans them while
  searching, and lists every choice in Settings → Privacy.
- "This Mac" card in the side menu with the disk of the open folder and its
  free space, measured like Finder.
- The app starts in the Mac's language (Italian or English) and the first
  launch shows only the welcome dialog, without opening Settings behind it.
- Right-click menu rebuilt as a Material 3 Expressive menu: grouped
  sections, icons and keyboard shortcuts (replaces the native macOS menu).
- Sorting as a Material 3 connected button group: the active field shows an
  arrow that flips to reverse the order and moves smoothly to the new field.
- Connection problems appear as an extended FAB floating at the bottom of the
  phone pane, opening into a card with the explanation and actions.
- Every dialog opens and closes with the Material 3 motion (slide and grow,
  500ms in / 150ms out, as in Material Web).
- Welcome dialog listing what's new in 4.0 as Material 3 segmented lists
  grouped by topic, in Italian and English.
- Verification scripts for favorites, USB owners, error messages, the loading
  indicator and date formats.

- Italian application localization.
- File and folder search with bounded breadth-first traversal.
- Virtualized grid and list rendering.
- Shared preview loading and thumbnail reuse.
- Explicit multi-selection mode and keyboard navigation.
- Transfer progress dialog with diagnostic session identifiers.
- Animated numeric status values with reduced-motion support.
- Native MTP operation coordinator and related Go test.
- Performance verification scripts.

### Changed

- Version bumped to 4.0.0.
- Phone connection: single in-flight initialization, releasing the phone from
  the macOS services that claim it (ptpcamerad, Image Capture) before each
  attempt, and USB hotplug events ignored right after a connection attempt.
- Device button in the toolbar now offers refresh and storage actions.
- Search bar and results restyled as the Material 3 search bar and docked
  search view, with the searched folder shown above the results.
- The connection screen keeps its height while connecting; the new text
  fades in instead of pushing the layout.
- Side menu rebuilt as a Material 3 navigation drawer (pill items, secondary
  container indicator, section headlines, MTP mode chip).
- Selection, grid and list styling follow Material 3.
- The DMG opens in a Material 3 install window (background, bilingual hint,
  wavy arrow) and the app inside already shows its tilted icon; Gatekeeper
  still offers "Open Anyway" for it. The app also re-applies the icon at
  first launch if it is missing.
- Reorganized toolbar, footer, sidebar and connection guidance.
- Improved device identity and disconnect-state handling.
- Reworked transfer preparation, retry and recovery states.
- Expanded file, folder, volume and media icon coverage.
- Assigned the fork its independent `io.github.phantumblade.openmtp`
  application identifier, with non-destructive settings migration.

### Fixed

- Phones with many files now connect reliably right after being plugged in.
  macOS starts listing every file on the phone as soon as it appears; the
  phone stays busy until that list is done, and OpenMTP used to give up and
  reset the USB connection, which started the listing again. OpenMTP now
  waits for the phone instead, and explains the wait on screen.
- The search bar sits above the scrolling area, so the scrollbar no longer
  runs past it and the column headers keep their size while scrolling.
- Phone connection: macOS restarts ptpcamerad within a second and it took
  the phone back before OpenMTP had claimed it (the native layer ignores a
  failed claim, so the session then timed out). OpenMTP now keeps it away for
  the whole connection attempt.
- Side menu content no longer sits under the window buttons; its hover
  highlight glides to the item under the pointer.
- Search bar hover no longer flashes, and the results open and close with the
  Material 3 docked search animation.
- Opening ~/Pictures asked for Photos library access, which browsing the
  folder does not need; the request and its entitlement are gone.
- Side menu actions for the phone (storage, MTP mode) that did nothing when
  opened from the Mac pane are removed there.
- Endless loading when a connection attempt was slow or interrupted.
- Phone status button truncating "Connecting to your phone…".
- Connection screen overflowing narrow panes.
- Webpack builds on Node.js 17 and newer.
- Stale phone contents remaining visible after a disconnect.
- Transfer operations appearing inactive while preparation was running.
- Several selection and large-directory responsiveness problems.

### Security

- Automatic publishing to the upstream repository is disabled in this fork
  until an independent release target is configured.
