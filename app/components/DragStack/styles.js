import { m3Elevation, m3Motion, m3Type } from '../../styles/m3/tokens';

// The dragged selection as a fanned stack of its own icons (Material 3
// Expressive): up to three cards, a count badge and a label that says what
// a drop will do. It straightens up over a pane that accepts the files.
export const STACK_SIZE = 88;

export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    root: {
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1500,
      width: 0,
      height: 0,
      pointerEvents: 'none',
      willChange: 'transform',
    },
    stack: {
      position: 'absolute',
      left: -STACK_SIZE / 2,
      top: -STACK_SIZE / 2,
      width: STACK_SIZE,
      height: STACK_SIZE,
    },
    card: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      borderRadius: 24,
      backgroundColor: m3.surfaceContainerHighest,
      boxShadow: m3Elevation.level2,
      transition: `transform ${m3Motion.defaultSpatial}, border-radius ${m3Motion.fastSpatial}`,
      '& img': {
        width: 60,
        height: 60,
        objectFit: 'contain',
        borderRadius: 8,
      },
      '&:nth-child(1)': {
        transform: 'rotate(-9deg) translate(-7px, 3px) scale(0.92)',
      },
      '&:nth-child(2)': {
        transform: 'rotate(7deg) translate(7px, 2px) scale(0.95)',
      },
      '&:nth-child(3)': {
        backgroundColor: m3.surfaceContainerHigh,
      },
    },
    cardEmpty: { visibility: 'hidden' },
    // over a pane that takes the files: the stack squares up
    over: {
      '& $card:nth-child(1)': {
        transform: 'rotate(-4deg) translate(-4px, 6px) scale(0.9)',
      },
      '& $card:nth-child(2)': {
        transform: 'rotate(3deg) translate(4px, 4px) scale(0.93)',
      },
      '& $card:nth-child(3)': {
        transform: 'translateY(-3px)',
        borderRadius: 28,
      },
      '& $label': {
        backgroundColor: m3.primary,
        color: m3.onPrimary,
      },
    },
    blocked: {
      '& $label': {
        backgroundColor: m3.surfaceContainerHighest,
        color: m3.onSurfaceVariant,
      },
    },
    // dropped: the cards fold into one round shape
    folded: {
      '& $card': {
        transform: 'none !important',
        borderRadius: '50% !important',
      },
      '& $count, & $label': {
        opacity: 0,
      },
    },
    count: {
      ...m3Type.labelLarge,
      position: 'absolute',
      right: -14,
      top: -14,
      zIndex: 2,
      minWidth: 30,
      height: 30,
      padding: '0 8px',
      display: 'grid',
      placeItems: 'center',
      boxSizing: 'border-box',
      borderRadius: 15,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      fontSize: 15,
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      boxShadow: `0 0 0 3px ${m3.surface}`,
      transition: 'opacity 120ms linear',
    },
    label: {
      ...m3Type.labelLarge,
      position: 'absolute',
      left: 0,
      top: STACK_SIZE / 2 + 10,
      transform: 'translateX(-50%)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 32,
      padding: '0 12px 0 10px',
      borderRadius: 16,
      backgroundColor: m3.inverseSurface,
      color: m3.inverseOnSurface,
      fontWeight: 650,
      whiteSpace: 'nowrap',
      boxShadow: m3Elevation.level2,
      transition: `background-color ${m3Motion.defaultEffects}, color ${m3Motion.defaultEffects}, opacity 120ms linear`,
    },
  };
};
