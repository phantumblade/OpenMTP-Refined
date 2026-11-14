import {
  alphaHex,
  m3Motion,
  m3Shape,
  m3State,
  m3Type,
} from '../../../styles/m3/tokens';
import { connectedButtonGroup } from '../../../styles/m3/connectedButtonGroup';

// The pane footer: one row floating over the bottom of the files, on a
// lightly blurred translucent surface (the files show through, blurred,
// while they scroll under it; the scroll area keeps room for it so the last
// row ends above it). Path field on the left, items ready to paste, and the
// counters as a connected button group that filters the view.
export const PANE_FOOTER_HEIGHT = 56;
// how far above the row the blur fades out
const FADE = 32;

// room the scroll area keeps under its last row: the row and its fade
export const PANE_FOOTER_SPACE = PANE_FOOTER_HEIGHT + FADE;

// a band that is fully applied at the bottom and fades to nothing at the top
const fadeMask = (solidFrom) => {
  const mask = `linear-gradient(to top, #000 0%, #000 ${solidFrom}%, transparent 100%)`;

  return { maskImage: mask, WebkitMaskImage: mask };
};

export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 6,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: PANE_FOOTER_HEIGHT,
      padding: '0 10px',
      boxSizing: 'border-box',
      isolation: 'isolate',
      color: m3.onSurface,
      // Progressive blur: two blurred layers reaching above the row, each
      // fading out towards the top, so the files go from sharp to softly
      // blurred with no edge. The lighter one reaches higher; the stronger
      // one, with the tint, sits behind the row.
      '&::before, &::after': {
        content: '""',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        pointerEvents: 'none',
      },
      '&::before': {
        top: -FADE,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        ...fadeMask(40),
      },
      '&::after': {
        top: -FADE / 2,
        backdropFilter: 'blur(7px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(7px) saturate(1.3)',
        backgroundColor: alphaHex(m3.surfaceContainerLow, 0.62),
        ...fadeMask(55),
      },
    },

    // path field: the device, then the folders down to the current one
    pathField: {
      flex: '1 1 auto',
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      height: 40,
      padding: '0 6px',
      borderRadius: 20,
      backgroundColor: alphaHex(m3.surfaceContainerHighest, 0.78),
    },
    deviceIcon: {
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
    },
    crumbs: {
      flex: '1 1 auto',
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      // safety net: a long name never runs over its neighbours
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      listStyle: 'none',
      whiteSpace: 'nowrap',
    },
    crumbItem: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    crumb: {
      ...m3Type.labelLarge,
      height: 30,
      padding: '0 8px',
      border: 'none',
      borderRadius: 15,
      backgroundColor: 'transparent',
      color: m3.onSurfaceVariant,
      fontFamily: 'inherit',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      outline: 'none',
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.fastEffects}, color ${m3Motion.fastEffects}`,
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurface, m3State.hover),
        color: m3.onSurface,
      },
      '&:active': { borderRadius: m3Shape.small },
      '&:focus-visible': { boxShadow: `inset 0 0 0 2px ${m3.secondary}` },
    },
    crumbCurrent: {
      color: m3.onSurface,
      fontWeight: 750,
      cursor: 'default',
      '&:hover': { backgroundColor: 'transparent' },
      '&:active': { borderRadius: 15 },
    },
    crumbEnter: {
      animation: '$crumbIn 420ms cubic-bezier(0.05, 0.7, 0.1, 1) both',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    '@keyframes crumbIn': {
      from: { opacity: 0, transform: 'translateX(-8px)' },
      to: { opacity: 1, transform: 'none' },
    },
    separator: {
      flexShrink: 0,
      color: m3.onSurfaceVariant,
      opacity: 0.7,
    },
    // hidden folders, behind "…"
    crumbMore: { display: 'none' },
    crumbMid: {},
    crumbRoot: {},

    // items ready to paste: a chip in the pane they come from, a button in
    // the other one
    clip: {
      ...m3Type.labelLarge,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 40,
      padding: '0 14px 0 10px',
      border: 'none',
      borderRadius: 12,
      backgroundColor: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
      fontFamily: 'inherit',
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    },
    clipAction: {
      backgroundColor: m3.tertiary,
      color: m3.onTertiary,
      cursor: 'pointer',
      outline: 'none',
      transition: `border-radius ${m3Motion.fastSpatial}`,
      '&:active:not(:disabled)': { borderRadius: m3Shape.small },
      '&:focus-visible': { boxShadow: `0 0 0 3px ${m3.secondary}` },
      '&:disabled': { opacity: 0.6, cursor: 'default' },
    },
    clipLabel: {},

    // the counters, pressed like every connected group in the app
    ...connectedButtonGroup(m3, {
      names: {
        group: 'filters',
        button: 'filter',
        active: 'filterActive',
      },
      paddingX: 14,
      narrowPaddingX: 12,
      count: 3,
    }),
    filterIcon: { flexShrink: 0 },
    filterAllIcon: {},
    filterCount: {
      fontSize: 17,
      fontWeight: 750,
      lineHeight: '22px',
      marginLeft: 6,
      fontVariantNumeric: 'tabular-nums',
    },
    filterLabel: {
      ...m3Type.labelMedium,
      marginLeft: 5,
      fontWeight: 600,
      opacity: 0.88,
    },
    slot: {
      display: 'inline-flex',
      alignItems: 'center',
      minWidth: '0.6em',
    },

    // Steps the row takes, measured, until the path fits: the counters drop
    // their labels, the middle folders step behind "…", "Root" too, and as
    // a last step the device icon and the "all" icon go
    fitLabels: {
      '& $filterLabel, & $clipLabel': { display: 'none' },
    },
    fitMid: {
      '& $crumbMid': { display: 'none' },
      '& $crumbMore': { display: 'inline-flex' },
    },
    fitRoot: {
      '& $crumbRoot': { display: 'none' },
    },
    fitCompact: {
      gap: 8,
      padding: '0 8px',
      '& $deviceIcon, & $filterAllIcon': { display: 'none' },
      '& $pathField': { paddingLeft: 8 },
    },
  };
};
