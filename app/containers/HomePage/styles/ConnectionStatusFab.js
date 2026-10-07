import {
  alphaHex,
  m3Elevation,
  m3Shape,
  m3State,
  m3Type,
} from '../../../styles/m3/tokens';

// Large extended FAB (Compose ExtendedFabLargeTokens): 28dp corners, 24dp
// padding, level 3 elevation; error container colours since it reports a
// problem. It carries the whole message, so it never needs to be opened.
// Enter: grow from the bottom edge with the emphasized decelerate curve;
// exit: the same path back, faster, with emphasized accelerate.
const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';
const EMPHASIZED_ACCELERATE = 'cubic-bezier(0.3, 0, 0.8, 0.15)';
const STATUS_ENTER_MS = 450;

export const STATUS_EXIT_MS = 200;

const hidden = {
  opacity: 0,
  transform: 'translateY(24px) scale(0.8)',
  clipPath: 'inset(40% 15% 0 15% round 28px)',
};
const shown = {
  opacity: 1,
  transform: 'none',
  clipPath: 'inset(-24px -24px -24px -24px round 28px)',
};

export const styles = (theme) => {
  const { m3 } = theme.palette;

  const card = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    width: '100%',
    maxWidth: 600,
    minHeight: 96,
    padding: '20px 12px 20px 20px',
    boxSizing: 'border-box',
    borderRadius: m3Shape.extraLarge,
    backgroundColor: m3.errorContainer,
    color: m3.onErrorContainer,
    boxShadow: m3Elevation.level3,
    transformOrigin: 'bottom center',
  };

  return {
    // zero-height sticky strip at the bottom of the scrolling pane
    dock: {
      position: 'sticky',
      bottom: 0,
      zIndex: 5,
      display: 'flex',
      justifyContent: 'center',
      height: 0,
      pointerEvents: 'none',
    },
    anchor: {
      position: 'absolute',
      bottom: 20,
      display: 'flex',
      justifyContent: 'center',
      width: 'calc(100% - 48px)',
      pointerEvents: 'none',
      '& > *': { pointerEvents: 'auto' },
    },
    card: {
      ...card,
      animation: `$statusIn ${STATUS_ENTER_MS}ms ${EMPHASIZED_DECELERATE} both`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    cardLeaving: {
      ...card,
      pointerEvents: 'none',
      animation: `$statusOut ${STATUS_EXIT_MS}ms ${EMPHASIZED_ACCELERATE} both`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    '@keyframes statusIn': { from: hidden, to: shown },
    '@keyframes statusOut': { from: shown, to: hidden },
    face: {
      flexShrink: 0,
      color: m3.error,
    },
    content: {
      flex: 1,
      minWidth: 0,
      alignSelf: 'center',
    },
    title: {
      ...m3Type.titleMedium,
      margin: 0,
      fontSize: 17,
      fontWeight: 600,
    },
    body: {
      ...m3Type.bodyMedium,
      marginTop: 4,
      '& ol': {
        margin: '8px 0 0',
        paddingLeft: 20,
      },
      '& li': { margin: '2px 0' },
    },
    actions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
    },
    close: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      marginTop: -8,
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onErrorContainer,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: alphaHex(m3.onErrorContainer, m3State.hover),
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
    },
  };
};
