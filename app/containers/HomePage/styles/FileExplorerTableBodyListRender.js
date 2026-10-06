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
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 2,
      textAlign: 'center',
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
