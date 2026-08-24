---
name: OpenMTP Refined
description: A calm dual-pane workbench for reliable Mac and Android file transfers.
colors:
  accent-blue: "#007AF5"
  accent-blue-strong: "#006AD9"
  light-canvas: "#FFFFFF"
  light-surface-subtle: "#F5F6F8"
  light-surface-bar: "#FBFBFB"
  light-text-primary: "#1D1D1F"
  light-text-secondary: "#00000099"
  light-divider: "#0000001F"
  light-selection: "#006AD91F"
  light-selection-hover: "#006AD914"
  light-focus-ring: "#006AD96B"
  dark-canvas: "#242424"
  dark-surface-subtle: "#292A2D"
  dark-surface-bar: "#313131"
  dark-text-primary: "#FFFFFF"
  dark-text-secondary: "#FFFFFFA6"
  dark-divider: "#FFFFFF1F"
  dark-selection: "#529CFF33"
  dark-selection-hover: "#529CFF24"
  dark-selection-border: "#72ADFF"
  dark-focus-ring: "#72ADFF85"
  success: "#2E9D62"
  error: "#F33950"
  warning: "#F57C00"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.25
  heading:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  control-sm: "6px"
  control: "7px"
  field: "9px"
  item: "10px"
  popover: "12px"
  dialog: "14px"
  pill: "999px"
spacing:
  xxs: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.light-canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "3px 9px"
    height: "26px"
  search-field:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 10px"
    height: "36px"
  filter-popover:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-text-primary}"
    rounded: "{rounded.popover}"
    padding: "16px"
    width: "310px"
  file-tile:
    backgroundColor: "{colors.light-canvas}"
    textColor: "{colors.light-text-primary}"
    rounded: "{rounded.item}"
    padding: "5px"
    width: "118px"
    height: "155px"
  selected-file-tile:
    backgroundColor: "{colors.light-selection}"
    textColor: "{colors.light-text-primary}"
    rounded: "{rounded.item}"
    padding: "5px"
    width: "118px"
    height: "155px"
---

# Design System: OpenMTP Refined

## Overview

**Creative North Star: "The Dual Workbench"**

OpenMTP Refined is a focused two-device workspace. The Mac and Android panes are peers, each with the same navigation grammar, while connection and transfer state remain unmistakable. The interface should feel familiar to a macOS user without pretending to be Finder: compact, precise, and optimized for long file-management sessions.

Visual personality is restrained and functional. Neutral surfaces carry almost the entire interface; blue is reserved for actions, focus, selection, and live state. Rounded geometry softens the dense workspace, but it must never turn operational controls into decorative cards.

The system explicitly rejects dated generic icons, ambiguous controls, decorative animation, silent transfer states, and light/dark inconsistencies. Every visual change must improve orientation, confidence, or speed.

**Key Characteristics:**

- Symmetric dual-pane structure with clear source and destination context.
- Finder-familiar hierarchy, density, keyboard behavior, and file affordances.
- Restrained blue accent used only for interaction and state.
- Compact controls with generous focus targets and unambiguous selected states.
- Equivalent light, dark, keyboard, loading, error, and reduced-motion behavior.

**The Transfer Direction Rule.** A transfer action must always identify its source, destination, item count, and current phase before destructive or time-consuming work begins.

**The Two-Pane Parity Rule.** A component used on both sides must keep the same geometry, state vocabulary, and interaction model. Device-specific differences may change content, never basic behavior.

## Colors

The palette is a restrained cool-neutral system with one interaction blue and semantic colors used only when meaning requires them. The frontmatter tokens are normative; light and dark roles must be mapped semantically rather than selected by raw value inside components.

### Primary

- **Transfer Blue** (`accent-blue`): primary actions, interactive icons, active filters, links, and progress.
- **Selection Blue** (`accent-blue-strong` / `dark-selection-border`): selected borders, keyboard focus anchors, and current-location emphasis.

### Neutral

- **Canvas** (`light-canvas` / `dark-canvas`): main content and popover surfaces.
- **Quiet Surface** (`light-surface-subtle` / `dark-surface-subtle`): status areas, device badges, and contextual grouping.
- **Structural Bar** (`light-surface-bar` / `dark-surface-bar`): toolbars, search rows, headers, and footers.
- **Primary Ink** (`light-text-primary` / `dark-text-primary`): filenames, titles, selected labels, and essential metrics.
- **Secondary Ink** (`light-text-secondary` / `dark-text-secondary`): metadata, secondary instructions, and inactive state descriptions.
- **Divider** (`light-divider` / `dark-divider`): one-pixel structural separation only.

### Semantic

- **Connected Green** (`success`): confirmed connection and completed operations.
- **Transfer Red** (`error`): inaccessible storage, failed transfers, and destructive warnings.
- **Attention Orange** (`warning`): recoverable conditions that require user attention.

**The One Accent Rule.** Blue is never decorative. It marks something actionable, selected, focused, transferring, or linked.

**The Semantic Pair Rule.** Never communicate state by color alone. Pair every success, warning, error, or connection color with an icon and concise text.

**The Theme Parity Rule.** A semantic role keeps the same meaning in both themes. Components consume role tokens, never theme-specific raw colors.

## Typography

**Display Font:** System sans stack, with SF Pro Text preferred on macOS.

**Body Font:** System sans stack, with SF Pro Text preferred on macOS.

**Label/Mono Font:** SF Mono, Menlo, or the platform monospace fallback for transfer diagnostics and tabular data only.

**Character:** Native, compact, and quiet. A single system family minimizes rendering cost and preserves macOS familiarity; hierarchy comes from size, weight, spacing, and placement rather than decorative type.

### Hierarchy

- **Title** (700, 18px, 1.25): dialog titles and primary task headings.
- **Heading** (700, 15px, 1.35): popover headings and compact section labels.
- **Body** (400–600, 13px, 1.45): filenames, controls, explanations, and path content.
- **Label** (600–700, 11px, 1.3): counters, table metadata, footer metrics, and compact buttons.
- **Data** (600, 11px, 1.3): speed, progress diagnostics, and identifiers using tabular numerals.

**The Operational Hierarchy Rule.** Filenames, paths, device identity, and transfer state outrank decorative or instructional copy.

**The Native Type Rule.** Never introduce a display font into the application UI. Labels, data, controls, and navigation use the system stack.

## Elevation

The workspace is flat by default. One-pixel dividers and tonal layering organize the two panes, toolbars, and status areas. Shadows are reserved for surfaces that genuinely float above the workspace or for media thumbnails that need edge separation.

### Shadow Vocabulary

- **Thumbnail Edge** (`0 1px 3px rgba(0, 0, 0, 0.2)`): previews that would otherwise disappear into the canvas.
- **Popover Lift** (`theme.shadows[10]`): date and type filter popovers only.
- **Dialog Lift** (`0 20px 70px rgba(0, 0, 0, 0.28)`): transfer and blocking workflow dialogs.
- **Feedback Lift** (`0 12px 36px rgba(0, 0, 0, 0.22)`): temporary snackbars only.

**The Flat-by-Default Rule.** A resting toolbar, footer, list row, or file tile has no decorative shadow. If every surface floats, hierarchy has failed.

**The One Floating Layer Rule.** Never stack a popover, card, and dialog elevation treatment inside one another.

## Components

### Buttons

- **Shape:** compact rounded rectangle (`control`, 7px), never a floating pill for ordinary commands.
- **Primary:** Transfer Blue container with light text; use only for the next decisive action, such as starting a transfer or applying a filter.
- **Secondary:** text or quiet tonal treatment for cancel, reset, refresh, and reversible actions.
- **Icon controls:** 36px square in toolbars, with 20px icons and a 9px corner radius.
- **Hover / Focus:** quiet neutral hover, blue active state, and a visible 2–3px focus ring. Focus never depends on shadow alone.
- **Disabled / Loading:** preserve geometry; reduce emphasis and replace the action with explicit progress feedback when work has begun.

### Chips

- **Style:** use compact pills only for device state, counts, filters, and path segments.
- **State:** inactive chips are neutral; active chips use selection tint plus blue text or border.
- **Content:** labels remain short and never repeat nearby headings.

### Cards / Containers

- **Corner Style:** file tiles use `item` (10px); popovers use `popover` (12px); dialogs use `dialog` (14px).
- **Background:** semantic canvas or quiet-surface tokens, never arbitrary one-off grays.
- **Shadow Strategy:** flat at rest; use the Elevation vocabulary only for floating layers.
- **Border:** one-pixel semantic dividers; no thick side-stripe accents.
- **Internal Padding:** 5–8px for dense file tiles, 12–16px for contextual surfaces, and 24px only for dialog breathing room.

### Inputs / Fields

- **Style:** 36px height, 9px radius, one-pixel divider border, and canvas background.
- **Focus:** selection border plus a 3px translucent focus ring.
- **Error / Disabled:** show semantic color, icon, and explanatory text; never use opacity alone for errors.
- **Search:** debounce expensive remote work, preserve text focus, and expose clear and filter actions without shifting the field.

### Navigation

- **Toolbar:** group navigation, refresh, selection, transfer, and settings actions by task. Use separators only between logical groups.
- **Breadcrumbs:** horizontally scrollable, with a 6px hover shape and a clearly emphasized current segment.
- **Sidebar:** no more than two hierarchy levels; collapsible when window width cannot support both panes.
- **Keyboard:** every toolbar action has a tooltip and shortcut when appropriate. Arrow navigation and multi-selection must remain predictable.

### File Tile and Row

- **Preview:** image and video previews are 80px with an 8px radius; non-previewable formats use the shared icon vocabulary.
- **Selection:** use the semantic selection tint. Multi-select adds a visible checkbox and a clear inset selection border without moving surrounding items.
- **Metadata:** filename is primary; type, size, and date remain secondary and consistently aligned.
- **Performance:** virtualize large directories and avoid animation or layout work proportional to the full item count.

### Transfer Dialog

- **Purpose:** explain source, destination, item count, phase, progress, speed, and recovery without ambiguity.
- **Shape:** 14px radius with true dialog elevation.
- **Progress:** preparation, transfer, and verification are distinct named phases. Never leave the user on an unexplained spinner.
- **Failure:** preserve diagnostic context and offer a specific retry or recovery action.

### Feedback and Motion

- **Duration:** 140–200ms for hover, focus, selection, and compact disclosure transitions.
- **Easing:** ease-out curves; no bounce, elastic, pulse, or decorative looping.
- **Counters:** rolling values are allowed only when they communicate changed data and must update instantly under `prefers-reduced-motion`.
- **Loading:** use stable skeletons or in-place progress without shifting the file grid.

## Do's and Don'ts

### Do:

- **Do** keep source, destination, device identity, and transfer direction visible throughout an operation.
- **Do** consume semantic theme roles for every state in both light and dark themes.
- **Do** use the shared checkbox, button, icon, popover, and focus treatments rather than styling controls locally.
- **Do** preserve familiar Finder-like navigation, keyboard shortcuts, selection, filtering, and contextual actions.
- **Do** keep motion between 140–200ms and provide an immediate reduced-motion equivalent.
- **Do** verify default, hover, focus, active, selected, disabled, loading, empty, error, and disconnected states before shipping a component.
- **Do** measure large-folder rendering and remote MTP work before adding visual effects.

### Don't:

- **Don't** ship interfaces with dated generic icons or controls whose action is ambiguous.
- **Don't** add decorative animation, pulsing buttons, bounce, or movement that slows the workflow.
- **Don't** leave transfer states silent or make the user guess whether an operation started.
- **Don't** allow a visual treatment to work in one theme and fail in the other.
- **Don't** use thick colored side borders, gradient text, decorative glassmorphism, or nested cards.
- **Don't** use blue as decoration or full-saturation color on inactive states.
- **Don't** create a one-off checkbox, input, button, icon style, or raw color when a shared semantic component exists.
- **Don't** hide a critical command exclusively in a toolbar; macOS menu commands and keyboard access must remain available.
