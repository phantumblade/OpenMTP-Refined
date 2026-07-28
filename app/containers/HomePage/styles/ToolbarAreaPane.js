import styled, { keyframes } from 'styled-components';
import { variables, mixins } from '../../../styles/js';
import { getCurrentThemePalette } from '../../App/styles';

export const styles = (theme) => {
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
    deviceBadge: {
      display: 'flex',
      alignItems: 'center',
      minWidth: 0,
      maxWidth: 235,
      marginLeft: 8,
      padding: '5px 9px',
      borderRadius: 8,
      backgroundColor: theme.palette.statusSurface,
      border: `1px solid ${theme.palette.divider}`,
    },
    deviceBadgeIcon: {
      flex: '0 0 auto',
      marginRight: 6,
      fontSize: 18,
      color: theme.palette.text.secondary,
    },
    deviceBadgeText: {
      display: 'flex',
      minWidth: 0,
      alignItems: 'baseline',
      gap: 5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    deviceBrand: {
      flex: '0 0 auto',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: theme.palette.text.secondary,
    },
    deviceModel: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: 12,
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    deviceStatusDot: {
      flex: '0 0 auto',
      width: 7,
      height: 7,
      marginLeft: 7,
      borderRadius: '50%',
      backgroundColor: theme.palette.text.disabled,
    },
    deviceStatusConnected: {
      backgroundColor: '#2e9d62',
      boxShadow: '0 0 0 3px rgba(46, 157, 98, 0.13)',
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
    toolbarDivider: {
      width: 1,
      height: 22,
      margin: '0 5px',
      backgroundColor: theme.palette.divider,
    },
  };
};

const animateLazyLoaderOverLay = keyframes`
  0% {
    opacity: 1;
    position: absolute;
  }
  100% {
    opacity: 0;
    top: -9999px;
    left: -9999px;
    display: none;
    position: unset;
    z-index: -9999;
  }
`;

export const LazyLoaderOverlay = ({ appThemeMode }) => {
  const { background } = getCurrentThemePalette(appThemeMode);

  return styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    background-color: ${background.paper};
    animation: ${animateLazyLoaderOverLay} 0s 3s forwards;
  `;
};
