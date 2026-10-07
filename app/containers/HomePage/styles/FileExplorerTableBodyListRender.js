export const tableCellFileExplorerTableRowsRender = {
  borderBottom: `unset`,
  [`&.checkboxCell`]: {
    width: 50,
  },
  [`&.nameCell`]: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
  },
  [`&.sizeCell`]: {
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
    width: `auto`,
    minWidth: 100,
  },
  [`&.dateAddedCell`]: {
    whiteSpace: `nowrap`,
    overflow: `hidden`,
    textOverflow: `ellipsis`,
    width: `auto`,
    minWidth: 100,
    paddingRight: 10,
  },
};

export const styles = (theme) => {
  return {
    tableRowSelected: {
      backgroundColor: `${theme.palette.m3.secondaryContainer} !important`,
      '& td': { color: theme.palette.m3.onSecondaryContainer },
    },
    tableCell: tableCellFileExplorerTableRowsRender,
    fileTypeIconWrapper: {
      position: 'relative',
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 2,
      textAlign: 'center',
    },
    // folder closed to OpenMTP (macOS permission)
    lockBadge: {
      position: 'absolute',
      right: -4,
      bottom: 2,
      display: 'grid',
      placeItems: 'center',
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.palette.m3.secondaryContainer,
      color: theme.palette.m3.onSecondaryContainer,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    },
    fileTypeIcon: {
      verticalAlign: `middle`,
      height: 20,
      width: 'auto',
    },
    truncate: {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      maxWidth: 310,
      whiteSpace: 'nowrap',
    },
  };
};
