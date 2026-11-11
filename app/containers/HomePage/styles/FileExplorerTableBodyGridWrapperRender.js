// Opening a folder: its tiles rise in one after the other (M3 emphasized
// decelerate). Only the first tiles are staggered; the rest arrive together.
const ENTER_STAGGER_TILES = 28;
const ENTER_STAGGER_MS = 14;

export const GRID_ENTER_MS = 380 + ENTER_STAGGER_TILES * ENTER_STAGGER_MS;

const enterDelays = {};

for (let index = 1; index <= ENTER_STAGGER_TILES; index += 1) {
  enterDelays[`& > [role="option"]:nth-child(${index})`] = {
    animationDelay: `${(index - 1) * ENTER_STAGGER_MS}ms`,
  };
}

export const styles = (theme) => ({
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 118px)',
    gridAutoRows: 'min-content',
    alignContent: 'start',
  },
  wrapperEntering: {
    '& > [role="option"]': {
      animation: `$tileIn 380ms cubic-bezier(0.05, 0.7, 0.1, 1) both`,
      animationDelay: `${ENTER_STAGGER_TILES * ENTER_STAGGER_MS}ms`,
    },
    ...enterDelays,
    '@media (prefers-reduced-motion: reduce)': {
      '& > [role="option"]': { animation: 'none' },
    },
  },
  '@keyframes tileIn': {
    from: { opacity: 0, transform: 'translateY(16px) scale(0.92)' },
    to: { opacity: 1, transform: 'none' },
  },
  virtualSpacer: {
    gridColumn: '1 / -1',
    width: '100%',
  },
  gridTableCell: {
    paddingLeft: `5px !important`,
    paddingRight: `5px !important`,
    border: 0,
  },
  sectionHeader: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 8px 6px 8px',
    cursor: 'pointer',
    userSelect: 'none',
    width: '100%',
    '&:hover $sectionTitle': {
      color: theme.palette.secondary.main,
    },
  },
  sectionTitleBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 700,
    fontSize: 12,
    color: theme.palette.text.primary,
  },
  sectionTitle: {
    transition: 'color 0.15s ease',
  },
  sectionArrow: {
    fontSize: 10,
    color: theme.palette.text.secondary,
    width: 14,
    display: 'inline-block',
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: 10,
    background: theme.palette.m3.surfaceContainerHighest,
    color: theme.palette.m3.onSurfaceVariant,
    marginLeft: 4,
  },
  sectionDividerLine: {
    flex: 1,
    height: 1,
    background: theme.palette.fileExplorerThinLineDividerColor,
    marginLeft: 8,
  },
});
