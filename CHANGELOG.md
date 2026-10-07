# Changelog

All notable changes to this fork will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version 4.0.0 is the first release of the fork with its own version number.

## 4.0.0 — 2026-10-06

First public release of OpenMTP Refined, with a downloadable DMG for Apple
Silicon Macs.

### Added

- Material 3 Expressive design system: Google color scheme generated from the
  brand color (light and dark), Material Symbols icons, shape and motion
  tokens, M3 buttons, dialogs, tabs, switches, menus, tooltips and snackbars.
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
- The DMG ships a cleanly signed app; on macOS 26 the app applies its tilted
  icon as a Finder custom icon at first launch and shows it in the Dock.
- Reorganized toolbar, footer, sidebar and connection guidance.
- Improved device identity and disconnect-state handling.
- Reworked transfer preparation, retry and recovery states.
- Expanded file, folder, volume and media icon coverage.
- Assigned the fork its independent `io.github.phantumblade.openmtp`
  application identifier, with non-destructive settings migration.

### Fixed

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
