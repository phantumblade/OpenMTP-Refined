import { m3Motion, m3State, m3Type } from '../../../styles/m3/tokens';

// Material 3 Expressive connected button group, pressed like AnalogIA's:
// 2dp gaps, full outer corners and 8dp inner corners; the pressed button
// pinches its inner corners to 4dp and widens while its neighbours give
// way, then springs back. The chosen field turns fully round in the app
// colour; pressing it again shows the plain shape for a moment before it
// flips the direction. Tonal (secondary container) at rest.
const PRESS = '119ms cubic-bezier(0.2, 0, 0, 1)';
// pressing is quick and plain (no overshoot); the release springs back
const PRESSING = [
  `border-radius ${PRESS}`,
  `padding ${PRESS}`,
  `background-color 200ms linear`,
  `color 200ms linear`,
].join(', ');
const EMPHASIZED = 'cubic-bezier(0.2, 0, 0, 1)';
const SPRING = 'cubic-bezier(0.42, 1.67, 0.21, 0.9)';
const OUTER = 20;
const INNER = 8;
const PINCHED = 4;

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
    // the caption gives way first when the pane is narrow (e.g. Italian at
    // the minimum window width), so the sort buttons are never cut off
    caption: {
      ...m3Type.labelLarge,
      flexShrink: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: m3.onSurfaceVariant,
      whiteSpace: 'nowrap',
    },
    // while a button is pressed (the group is :active too) it widens and
    // the others give up the same room, so the group keeps its width
    group: {
      display: 'flex',
      flexShrink: 0,
      gap: 2,
      '&:active > $button': {
        padding: '0 12px',
        transition: PRESSING,
      },
      '& > $button:active': {
        padding: '0 28px',
      },
      '@media (max-width: 1000px)': {
        '&:active > $button': { padding: '0 9px' },
        '& > $button:active': { padding: '0 21px' },
      },
      '@media (prefers-reduced-motion: reduce)': {
        '&:active > $button, & > $button:active': { padding: '0 16px' },
      },
    },
    button: {
      ...m3Type.labelLarge,
      position: 'relative',
      isolation: 'isolate',
      overflow: 'hidden',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '1 0 auto',
      height: 40,
      padding: '0 16px',
      border: 'none',
      borderRadius: INNER,
      backgroundColor: m3.secondaryContainer,
      color: m3.onSecondaryContainer,
      fontFamily: 'inherit',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      outline: 'none',
      // released: shape and width spring back
      transition: [
        `border-radius ${m3Motion.fastSpatial}`,
        `padding ${m3Motion.fastSpatial}`,
        `background-color ${m3Motion.defaultEffects}`,
        `color ${m3Motion.defaultEffects}`,
      ].join(', '),
      // state layer in the content colour (hover 8%, pressed 10%)
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        backgroundColor: 'currentColor',
        opacity: 0,
        transition: `opacity ${m3Motion.fastEffects}`,
      },
      '&:hover::before': { opacity: m3State.hover },
      '&:first-child': {
        borderTopLeftRadius: OUTER,
        borderBottomLeftRadius: OUTER,
      },
      '&:last-child': {
        borderTopRightRadius: OUTER,
        borderBottomRightRadius: OUTER,
      },
      // pressed: the inner corners pinch
      '&:active': {
        borderRadius: PINCHED,
      },
      '&:active::before': { opacity: m3State.pressed },
      '&:first-child:active': {
        borderTopLeftRadius: OUTER,
        borderBottomLeftRadius: OUTER,
      },
      '&:last-child:active': {
        borderTopRightRadius: OUTER,
        borderBottomRightRadius: OUTER,
      },
      '&:focus-visible': {
        outline: `3px solid ${m3.secondary}`,
        outlineOffset: 2,
      },
      // two panes side by side in a small window: tighter buttons
      '@media (max-width: 1000px)': {
        padding: '0 12px',
      },
      '@media (prefers-reduced-motion: reduce)': {
        transition: 'none',
      },
    },
    // chosen field: fully round in the app colour; pressed again it shows
    // the unselected shape until released
    buttonActive: {
      borderRadius: OUTER,
      backgroundColor: m3.primary,
      color: m3.onPrimary,
      '&:active': { borderRadius: INNER },
      '&:first-child:active': {
        borderRadius: `${OUTER}px ${INNER}px ${INNER}px ${OUTER}px`,
      },
      '&:last-child:active': {
        borderRadius: `${INNER}px ${OUTER}px ${OUTER}px ${INNER}px`,
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
