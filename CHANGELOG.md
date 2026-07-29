# Changelog

All notable changes to this fork will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The fork currently uses the upstream OpenMTP version while its independent
release scheme is being defined.

## Unreleased

### Added

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

- Reorganized toolbar, footer, sidebar and connection guidance.
- Improved device identity and disconnect-state handling.
- Reworked transfer preparation, retry and recovery states.
- Expanded file, folder, volume and media icon coverage.
- Assigned the fork its independent `io.github.phantumblade.openmtp`
  application identifier, with non-destructive settings migration.

### Fixed

- Stale phone contents remaining visible after a disconnect.
- Transfer operations appearing inactive while preparation was running.
- Several selection and large-directory responsiveness problems.

### Security

- Automatic publishing to the upstream repository is disabled in this fork
  until an independent release target is configured.
