import { m3Type } from '../../../styles/m3/tokens';
import { connectedButtonGroup } from '../../../styles/m3/connectedButtonGroup';

// "Sort by" as a Material 3 Expressive connected button group; the press
// (pinch, widen, spring back) is shared with the other connected groups.
const EMPHASIZED = 'cubic-bezier(0.2, 0, 0, 1)';
const SPRING = 'cubic-bezier(0.42, 1.67, 0.21, 0.9)';

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
    ...connectedButtonGroup(m3),
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
