export const styles = (theme) => ({
  wrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 118px)',
    gridAutoRows: 'min-content',
    alignContent: 'start',
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
    background:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.06)',
    color: theme.palette.text.secondary,
    marginLeft: 4,
  },
  sectionDividerLine: {
    flex: 1,
    height: 1,
    background: theme.palette.fileExplorerThinLineDividerColor,
    marginLeft: 8,
  },
});
