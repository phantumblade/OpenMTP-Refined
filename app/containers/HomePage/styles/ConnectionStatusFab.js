import {
  alphaHex,
  m3Elevation,
  m3Shape,
  m3State,
  m3Type,
} from '../../../styles/m3/tokens';

// Extended FAB (Compose ExtendedFabSmallTokens): 56dp, 16dp corners, 16dp
// side padding, 24dp icon, level 3 elevation; error container colours since
// it reports a problem. It opens into an extra-large-corner card.
const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';

export const styles = (theme) => {
  const { m3 } = theme.palette;

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
    fab: {
      ...m3Type.labelLarge,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      maxWidth: '100%',
      height: 56,
      padding: '0 16px',
      border: 'none',
      borderRadius: m3Shape.large,
      backgroundColor: m3.errorContainer,
      color: m3.onErrorContainer,
      boxShadow: m3Elevation.level3,
      fontFamily: 'inherit',
      fontSize: 15,
      cursor: 'pointer',
      outline: 'none',
      transformOrigin: 'bottom center',
      animation: `$fabIn 350ms ${EMPHASIZED_DECELERATE} both`,
      transition: 'box-shadow 150ms linear',
      '&:hover': {
        boxShadow: `${m3Elevation.level3}, inset 0 0 0 100px ${alphaHex(
          m3.onErrorContainer,
          m3State.hover
        )}`,
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    '@keyframes fabIn': {
      from: { opacity: 0, transform: 'translateY(16px) scale(0.6)' },
      to: { opacity: 1, transform: 'none' },
    },
    face: {
      flexShrink: 0,
      color: m3.error,
    },
    fabLabel: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: 600,
    },
    fabChevron: {
      flexShrink: 0,
      marginLeft: -4,
      opacity: 0.8,
    },
    card: {
      width: '100%',
      maxWidth: 560,
      padding: '16px 16px 20px 20px',
      boxSizing: 'border-box',
      borderRadius: m3Shape.extraLarge,
      backgroundColor: m3.errorContainer,
      color: m3.onErrorContainer,
      boxShadow: m3Elevation.level3,
      transformOrigin: 'bottom center',
      animation: `$cardIn 400ms ${EMPHASIZED_DECELERATE} both`,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
    '@keyframes cardIn': {
      from: {
        opacity: 0,
        transform: 'scale(0.85)',
        clipPath: 'inset(70% 20% 0 20% round 16px)',
      },
      to: {
        opacity: 1,
        transform: 'none',
        clipPath: 'inset(0 0 0 0 round 28px)',
      },
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    cardTitle: {
      ...m3Type.titleMedium,
      flex: 1,
      margin: 0,
      fontWeight: 600,
    },
    close: {
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      width: 40,
      height: 40,
      border: 'none',
      borderRadius: 20,
      backgroundColor: 'transparent',
      color: m3.onErrorContainer,
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: alphaHex(m3.onErrorContainer, m3State.hover),
      },
    },
    cardBody: {
      ...m3Type.bodyMedium,
      margin: '8px 0 0 58px',
      '& ol': {
        margin: '8px 0 0',
        paddingLeft: 20,
      },
      '& li': { margin: '2px 0' },
    },
    cardActions: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      margin: '14px 0 0 58px',
    },
  };
};
