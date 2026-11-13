import { m3Motion, m3Shape, m3Type } from '../../../styles/m3/tokens';

const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';
const EMPHASIZED_ACCELERATE = 'cubic-bezier(0.3, 0, 0.8, 0.15)';
const SPRING = 'cubic-bezier(0.42, 1.67, 0.21, 0.9)';

// Photo backup guide: an illustrated stage (phone, link, Mac drawn with
// colour roles and Material Symbols) above the step's text. Each scene
// plays once when it appears; nothing loops.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    paper: {
      width: 'min(520px, calc(100vw - 48px))',
      margin: 24,
      overflow: 'hidden',
    },
    stage: {
      display: 'grid',
      placeItems: 'center',
      height: 220,
      margin: 8,
      borderRadius: m3Shape.extraLarge - 8,
      backgroundColor: m3.primaryContainer,
      color: m3.onPrimaryContainer,
      overflow: 'hidden',
    },
    scene: {
      display: 'flex',
      alignItems: 'center',
      gap: 18,
    },
    // shared axis X: in from the side the user is heading to, out towards
    // the other; the scene travels further than the text
    sceneSlot: {
      '--shift': '40px',
      animation: `$axisIn 400ms ${EMPHASIZED_DECELERATE} both`,
    },
    fromStart: {
      '--dir': -1,
    },
    '@keyframes axisIn': {
      from: {
        opacity: 0,
        transform: 'translateX(calc(var(--shift) * var(--dir, 1)))',
      },
      to: { opacity: 1, transform: 'none' },
    },
    '@keyframes axisOut': {
      from: { opacity: 1, transform: 'none' },
      to: {
        opacity: 0,
        transform: 'translateX(calc(var(--shift) * var(--dir, 1) * -0.5))',
      },
    },
    // phone: a tall rounded slab
    phone: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: 92,
      height: 156,
      boxSizing: 'border-box',
      padding: '18px 10px 12px',
      borderRadius: 22,
      backgroundColor: m3.surfaceContainerLowest,
      boxShadow: `inset 0 0 0 4px ${m3.onPrimaryContainer}`,
    },
    phoneNotch: {
      position: 'absolute',
      top: 9,
      left: '50%',
      width: 22,
      height: 5,
      borderRadius: 3,
      backgroundColor: m3.onPrimaryContainer,
      transform: 'translateX(-50%)',
    },
    phoneIcon: {
      color: m3.primary,
    },
    photoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 30px)',
      gap: 6,
    },
    photo: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: 30,
      height: 30,
      borderRadius: 8,
    },
    photoSaved: {
      backgroundColor: m3.surfaceContainerHigh,
      color: m3.onSurfaceVariant,
    },
    // the new photos fly to the Mac one after the other and land there
    photoNew: {
      backgroundColor: m3.tertiaryContainer,
      color: m3.onTertiaryContainer,
      zIndex: 1,
      animation: `$fly 1100ms ${EMPHASIZED_DECELERATE} both`,
      animationDelay: 'calc(500ms + var(--i) * 120ms)',
    },
    '@keyframes fly': {
      '0%': { transform: 'none', opacity: 1 },
      '70%': { opacity: 1 },
      '100%': {
        transform: 'translate(var(--dx), var(--dy)) scale(0.5)',
        opacity: 0,
      },
    },
    photoBadge: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      display: 'grid',
      placeItems: 'center',
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
    },
    link: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: 64,
      height: 40,
    },
    cable: {
      position: 'absolute',
      left: -10,
      right: -10,
      top: '50%',
      height: 4,
      borderRadius: 2,
      backgroundColor: m3.onPrimaryContainer,
      transformOrigin: 'left center',
      animation: `$plug 700ms ${EMPHASIZED_DECELERATE} 300ms both`,
    },
    '@keyframes plug': {
      from: { transform: 'translateY(-50%) scaleX(0)' },
      to: { transform: 'translateY(-50%) scaleX(1)' },
    },
    cablePlug: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      animation: `$pop 450ms ${SPRING} 900ms both`,
    },
    '@keyframes pop': {
      from: { transform: 'scale(0)' },
      to: { transform: 'none' },
    },
    arrow: {
      color: m3.onPrimaryContainer,
    },
    arrowMoving: {
      animation: `$nudge 900ms ${SPRING} 400ms both`,
    },
    '@keyframes nudge': {
      from: { transform: 'translateX(-12px)', opacity: 0 },
      to: { transform: 'none', opacity: 1 },
    },
    // Mac: a screen on a thin base
    mac: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    macScreen: {
      display: 'grid',
      placeItems: 'center',
      width: 132,
      height: 86,
      boxSizing: 'border-box',
      borderRadius: 12,
      backgroundColor: m3.surfaceContainerLowest,
      boxShadow: `inset 0 0 0 4px ${m3.onPrimaryContainer}`,
    },
    macBase: {
      width: 164,
      height: 8,
      marginTop: 3,
      borderRadius: '2px 2px 8px 8px',
      backgroundColor: m3.onPrimaryContainer,
    },
    macIcon: {
      color: m3.primary,
    },
    macIconPop: {
      animation: `$pop 500ms ${SPRING} 350ms both`,
    },
    body: {
      '--shift': '24px',
      padding: '20px 24px 4px',
      animation: `$axisIn 400ms ${EMPHASIZED_DECELERATE} both`,
    },
    stepLabel: {
      ...m3Type.labelLarge,
      color: m3.primary,
      fontVariantNumeric: 'tabular-nums',
    },
    title: {
      ...m3Type.headlineSmall,
      margin: '4px 0 8px',
      fontWeight: 650,
      color: m3.onSurface,
    },
    text: {
      ...m3Type.bodyLarge,
      margin: 0,
      minHeight: 72,
      color: m3.onSurfaceVariant,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: '16px 24px 24px',
    },
    // page indicator: the current step is a wider pill
    dots: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      width: 8,
      height: 8,
      padding: 0,
      border: 'none',
      borderRadius: 4,
      backgroundColor: m3.outlineVariant,
      cursor: 'pointer',
      outline: 'none',
      transition: `width ${m3Motion.fastSpatial}, background-color ${m3Motion.defaultEffects}`,
      '&:focus-visible': { boxShadow: `0 0 0 3px ${m3.secondary}` },
    },
    dotActive: {
      width: 24,
      backgroundColor: m3.primary,
    },
    actions: {
      display: 'flex',
      gap: 8,
    },
    // last, so it wins over the enter animation of the scene and the text
    leaving: {
      animation: `$axisOut 90ms ${EMPHASIZED_ACCELERATE} both`,
    },
    '@media (prefers-reduced-motion: reduce)': {
      sceneSlot: { animation: 'none' },
      body: { animation: 'none' },
      leaving: { animation: 'none' },
      photoNew: { animation: 'none' },
      cable: { animation: 'none', transform: 'translateY(-50%)' },
      cablePlug: { animation: 'none' },
      arrowMoving: { animation: 'none' },
      macIconPop: { animation: 'none' },
    },
  };
};
