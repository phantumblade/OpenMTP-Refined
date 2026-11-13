import { variables, mixins } from '../../../styles/js';
import {
  alphaHex,
  m3Elevation,
  m3Motion,
  m3Shape,
  m3Type,
} from '../../../styles/m3/tokens';

// The header gives way in steps as the window narrows, always dropping whole
// parts (never cutting a label): first the free-space amount, then the name
// (it stays in the pane's status bar and in the tooltip), then the ring.
const COMPACT_SPACE = '@media (max-width: 1400px)';
const COMPACT_NAME = '@media (max-width: 1200px)';
const COMPACT_TOOLBAR = '@media (max-width: 1000px)';

export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {
      ...mixins({ theme }).appDragEnable,
    },
    grow: {
      flexGrow: 1,
    },
    toolbarInnerWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginLeft: 'auto',
      paddingLeft: 8,
      paddingRight: 8,
      [COMPACT_TOOLBAR]: { gap: 4, paddingLeft: 4, paddingRight: 6 },
    },
    // M3 Expressive toolbar: each group of actions sits in its own pill
    toolbarGroup: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      padding: 4,
      borderRadius: 22,
      backgroundColor: m3.surfaceContainer,
      [COMPACT_TOOLBAR]: { gap: 0, padding: 2, borderRadius: 18 },
    },
    toolbar: {
      width: `auto`,
      height: variables().sizes.toolbarHeight,
      minHeight: variables().sizes.toolbarHeight,
      borderBottom: `1px solid ${theme.palette.fileExplorerThinLineDividerColor}`,
    },
    lazyLoaderOverLay: {
      position: `absolute`,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 9999,
    },
    appBar: {},
    // icon buttons: round at rest, squarer while pressed, and a filled
    // rounded square when toggled on (M3 Expressive icon button shapes)
    navBtns: {
      '& button': {
        width: 36,
        height: 36,
        padding: 8,
        borderRadius: 18,
        color: m3.onSurfaceVariant,
        transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.fastEffects}, color ${m3Motion.fastEffects}`,
        '&:hover': {
          backgroundColor: alphaHex(m3.onSurfaceVariant, 0.08),
          color: m3.onSurface,
        },
        '&:active': {
          borderRadius: 10,
          backgroundColor: alphaHex(m3.onSurfaceVariant, 0.12),
        },
        '&.Mui-disabled': {
          color: alphaHex(m3.onSurface, 0.38),
        },
        '&.Mui-focusVisible': {
          outline: `3px solid ${theme.palette.focusRing}`,
          outlineOffset: 1,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        [COMPACT_TOOLBAR]: { width: 32, height: 32, padding: 6 },
      },
    },
    activeNavBtn: {
      borderRadius: '12px !important',
      backgroundColor: `${m3.primary} !important`,
      color: `${m3.onPrimary} !important`,
    },
    // M3 modal navigation drawer: large end corners, level 1 elevation
    drawerPaper: {
      overflow: 'hidden',
      borderRadius: `0 ${m3Shape.large}px ${m3Shape.large}px 0`,
      backgroundColor: m3.surfaceContainerLow,
      boxShadow: m3Elevation.level1,
    },
    drawerPaperRight: {
      overflow: 'hidden',
      borderRadius: `${m3Shape.large}px 0 0 ${m3Shape.large}px`,
      backgroundColor: m3.surfaceContainerLow,
      boxShadow: m3Elevation.level1,
    },
    // phone status button (M3 Expressive tonal XS button)
    deviceButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      maxWidth: 360,
      height: 40,
      marginLeft: 8,
      padding: '0 16px 0 12px',
      border: 'none',
      borderRadius: 20,
      backgroundColor: m3.surfaceContainerHighest,
      color: m3.onSurfaceVariant,
      fontFamily: 'inherit',
      cursor: 'pointer',
      outline: 'none',
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}`,
      '&:hover:not(:disabled)': {
        backgroundColor: m3.surfaceContainerHigh,
      },
      '&:active:not(:disabled)': {
        borderRadius: m3Shape.medium,
      },
      '&:focus-visible': {
        boxShadow: `0 0 0 3px ${m3.secondary}`,
      },
      '&:disabled': {
        cursor: 'default',
      },
      [COMPACT_NAME]: { padding: '0 12px' },
      [COMPACT_TOOLBAR]: { marginLeft: 4, padding: '0 10px' },
    },
    deviceButtonConnected: {
      backgroundColor: m3.primaryContainer,
      color: m3.onPrimaryContainer,
      '&:hover:not(:disabled)': {
        backgroundColor: m3.primaryFixedDim,
      },
    },
    deviceButtonIcon: {
      flexShrink: 0,
    },
    deviceButtonText: {
      display: 'flex',
      minWidth: 0,
      alignItems: 'baseline',
      gap: 6,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      [COMPACT_NAME]: { display: 'none' },
    },
    deviceBrand: {
      ...m3Type.labelLarge,
      flexShrink: 0,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      opacity: 0.8,
    },
    // free space next to the name: ring + amount; the amount gives way
    // first when the pane gets narrow
    deviceSpace: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0,
      marginLeft: 4,
      paddingLeft: 10,
      borderLeft: `1px solid ${alphaHex(m3.onSurfaceVariant, 0.24)}`,
      [COMPACT_NAME]: { marginLeft: 0, paddingLeft: 0, borderLeft: 'none' },
      [COMPACT_TOOLBAR]: { display: 'none' },
    },
    deviceSpaceRing: {
      flexShrink: 0,
    },
    deviceSpaceText: {
      ...m3Type.labelMedium,
      whiteSpace: 'nowrap',
      fontVariantNumeric: 'tabular-nums',
      [COMPACT_SPACE]: { display: 'none' },
    },
    deviceModel: {
      ...m3Type.labelLarge,
      fontWeight: 650,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    noAppDrag: {
      ...mixins({ theme }).appDragDisable,
    },
    navBtnIcons: {
      height: 20,
      width: `20px !important`,
      ...mixins({ theme }).noDrag,
      ...mixins({ theme }).noselect,
    },
    navBtnImages: {
      height: 27,
      width: `27px !important`,
    },
    imageBtn: {
      padding: `10px !important`,
      background: '#fff',
      [`&:hover`]: {
        background: `rgba(255, 255, 255, 0.85) !important`,
      },
    },
    disabledNavBtns: {
      backgroundColor: 'transparent !important',
    },
    invertedNavBtns: {
      [`&:hover`]: {
        filter: `invert(100)`,
      },
      [`&:not(:hover)`]: {
        filter: `invert(100)`,
        background: `#f9f9f952`,
      },
    },
    menuButton: {
      width: 40,
      height: 40,
      marginLeft: 8,
      borderRadius: 20,
      [COMPACT_TOOLBAR]: { width: 36, height: 36, marginLeft: 4 },
      color: m3.onSurfaceVariant,
      outline: 'none !important',
      boxShadow: 'none !important',
      transition: `border-radius ${m3Motion.fastSpatial}, background-color ${m3Motion.fastEffects}`,
      '&:hover': {
        backgroundColor: alphaHex(m3.onSurfaceVariant, 0.08),
        color: m3.onSurface,
      },
      '&:active': {
        borderRadius: 12,
      },
      '&:focus, &:active, &.Mui-focusVisible': {
        outline: 'none !important',
        boxShadow: 'none !important',
      },
    },
    // Thin, non-blocking progress bar under the pane toolbar.
    loadingBarSlot: {
      position: 'relative',
      height: 0,
      zIndex: 2,
    },
    loadingBar: {
      position: 'absolute',
      top: 0,
      left: 12,
      right: 12,
    },
  };
};
