import { variables, mixins } from '../../../styles/js';
import { m3Motion, m3Shape, m3Type } from '../../../styles/m3/tokens';

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
      marginLeft: 'auto',
      paddingRight: 7,
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
    navBtns: {
      paddingLeft: 1,
      '& button': {
        width: 36,
        height: 36,
        padding: 8,
        borderRadius: 9,
        color: theme.palette.text.primary,
        transition: 'background-color 160ms ease, color 160ms ease',
        '&:hover': {
          backgroundColor: theme.palette.toolbarButtonHover,
          color: theme.palette.secondary.main,
        },
        '&.Mui-focusVisible': {
          outline: `3px solid ${theme.palette.focusRing}`,
          outlineOffset: 1,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      },
    },
    activeNavBtn: {
      backgroundColor: `${theme.palette.toolbarButtonActive} !important`,
      color: `${theme.palette.secondary.main} !important`,
    },
    // phone status button (M3 Expressive tonal XS button)
    deviceButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      maxWidth: 360,
      height: 32,
      marginLeft: 8,
      padding: '0 14px 0 8px',
      border: 'none',
      borderRadius: 16,
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
        borderRadius: m3Shape.small,
      },
      '&:focus-visible': {
        boxShadow: `0 0 0 3px ${m3.secondary}`,
      },
      '&:disabled': {
        cursor: 'default',
      },
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
    deviceModel: {
      ...m3Type.labelLarge,
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
    focussedFileExplorer: {
      width: '100%',
      height: 5,
      marginTop: -5,
      overflow: 'hidden',
      background: 'rgba(0, 176, 255, 0.22)',
    },
    menuButton: {
      width: 38,
      height: 38,
      marginLeft: 7,
      borderRadius: 9,
      color: theme.palette.text.primary,
      outline: 'none !important',
      boxShadow: 'none !important',
      '&:hover': {
        backgroundColor: theme.palette.toolbarButtonHover,
        color: theme.palette.secondary.main,
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
    toolbarDivider: {
      width: 1,
      height: 22,
      margin: '0 5px',
      backgroundColor: theme.palette.divider,
    },
  };
};
