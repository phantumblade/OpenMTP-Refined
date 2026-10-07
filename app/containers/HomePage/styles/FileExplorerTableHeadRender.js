import { alphaHex, m3Shape, m3State, m3Type } from '../../../styles/m3/tokens';

// Compose ConnectedButtonGroupSmallTokens: 40dp, 2dp between buttons, full
// outer corners, 8dp inner corners (4dp pressed); the checked button turns
// fully round. Colours follow ToggleButtonDefaults (surface container /
// primary when checked).
const SPRING = 'cubic-bezier(0.42, 1.67, 0.21, 0.9)';
const EMPHASIZED = 'cubic-bezier(0.2, 0, 0, 1)';

export const styles = (theme) => {
  const { m3 } = theme.palette;

  return {
    tableHeadCell: {
      border: `unset`,
      backgroundColor: theme.palette.tableHeaderFooterBgColor,
      position: 'sticky',
      top: 0,
      zIndex: 10,
    },
    bar: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 56,
      padding: '0 16px',
    },
    caption: {
      ...m3Type.labelLarge,
      color: m3.onSurfaceVariant,
      whiteSpace: 'nowrap',
    },
    group: {
      display: 'flex',
      gap: 2,
    },
    button: {
      ...m3Type.labelLarge,
      display: 'inline-flex',
      alignItems: 'center',
      height: 40,
      padding: '0 16px',
      border: 'none',
      borderRadius: m3Shape.small,
      backgroundColor: m3.surfaceContainer,
      color: m3.onSurfaceVariant,
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      outline: 'none',
      transition: `border-radius 300ms ${SPRING}, background-color 200ms linear, color 200ms linear, box-shadow 150ms linear`,
      '&:first-child': {
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
      },
      '&:last-child': {
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
      },
      '&:hover': {
        boxShadow: `inset 0 0 0 100px ${alphaHex(
          m3.onSurfaceVariant,
          m3State.hover
        )}`,
      },
      '&:active:not($buttonActive)': {
        borderRadius: m3Shape.extraSmall,
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
    },
    buttonActive: {
      borderRadius: '20px !important',
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      '&:hover': {
        boxShadow: `inset 0 0 0 100px ${alphaHex(m3.onPrimary, m3State.hover)}`,
      },
    },
    arrow: {
      display: 'inline-flex',
      justifyContent: 'flex-end',
      width: 0,
      marginLeft: 0,
      overflow: 'hidden',
      opacity: 0,
      transform: 'scale(0.4)',
      transition: `width 250ms ${EMPHASIZED}, margin-left 250ms ${EMPHASIZED}, opacity 150ms linear, transform 300ms ${SPRING}`,
      '& > span': {
        transition: `transform 350ms ${SPRING}`,
      },
      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
    },
    arrowShown: {
      width: 18,
      marginLeft: 6,
      opacity: 1,
      transform: 'none',
    },
    arrowDown: {
      '& > span': { transform: 'rotate(180deg)' },
    },
  };
};
