import { alphaHex, m3Shape, m3Type } from '../../../styles/m3/tokens';

const EMPHASIZED_DECELERATE = 'cubic-bezier(0.05, 0.7, 0.1, 1)';
const SPRING = 'cubic-bezier(0.42, 1.67, 0.21, 0.9)';

// The update card in the app colour (primary container), its icon and the
// button filled with the card's content colour so they stand out in light
// and dark themes. Enter: the card rises, the shape turns a little and the
// arrow drops in, once.
export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    card: {
      margin: '0 12px 8px',
      padding: '16px 16px 12px',
      borderRadius: m3Shape.extraLarge,
      backgroundColor: m3.primaryContainer,
      color: m3.onPrimaryContainer,
      transformOrigin: 'bottom center',
      animation: `$cardIn 560ms ${EMPHASIZED_DECELERATE} 120ms both`,
    },
    '@keyframes cardIn': {
      from: { opacity: 0, transform: 'translateY(16px) scale(0.94)' },
      to: { opacity: 1, transform: 'none' },
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    shape: {
      flexShrink: 0,
      color: m3.onPrimaryContainer,
      animation: `$turn 700ms ${SPRING} 260ms both`,
    },
    '@keyframes turn': {
      from: { transform: 'rotate(-40deg) scale(0.6)' },
      to: { transform: 'none' },
    },
    icon: {
      color: m3.primaryContainer,
      animation: `$drop 600ms ${SPRING} 420ms both`,
    },
    '@keyframes drop': {
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: 1, transform: 'none' },
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    },
    label: {
      ...m3Type.labelMedium,
      fontWeight: 650,
      opacity: 0.8,
    },
    title: {
      ...m3Type.titleMedium,
      fontWeight: 700,
      overflowWrap: 'anywhere',
    },
    description: {
      ...m3Type.bodyMedium,
      margin: '10px 0 0',
    },
    progress: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 12,
      '& > :first-child': { flex: 1, minWidth: 0 },
    },
    percent: {
      ...m3Type.labelLarge,
      fontWeight: 650,
      fontVariantNumeric: 'tabular-nums',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    notes: {
      marginLeft: -12,
      color: `${m3.onPrimaryContainer} !important`,
    },
    install: {
      backgroundColor: `${m3.onPrimaryContainer} !important`,
      color: `${m3.primaryContainer} !important`,
      '&:focus-visible': {
        boxShadow: `0 0 0 3px ${alphaHex(m3.onPrimaryContainer, 0.4)}`,
      },
    },
    '@media (prefers-reduced-motion: reduce)': {
      card: { animation: 'none' },
      shape: { animation: 'none' },
      icon: { animation: 'none' },
    },
  };
};
