import { mixins } from '../../../styles/js';

// height of the sticky "Sort by" bar at the top of the list
const SORT_BAR_HEIGHT = 56;

export const styles = (theme) => ({
  root: {
    width: '100%',
    ...mixins({ theme }).noselect,
  },
  tableWrapper: {
    position: 'relative',
    ...mixins({ theme }).noOutline,
    // window minus toolbar, footer and the 64px search bar above this area
    height: `calc(100vh - 184px)`,
    overflowY: 'auto',
    overflowX: 'auto',
    // the scrollbar runs only beside the files, not over the sticky sort bar
    '&::-webkit-scrollbar-track:vertical': {
      marginTop: SORT_BAR_HEIGHT,
    },
    borderBottom: `solid 1px ${theme.palette.fileExplorerThinLineDividerColor}`,
    borderLeft: `solid 1px ${theme.palette.fileExplorerThinLineDividerColor}`,
    [`&.onHoverDropZone`]: {
      backgroundColor: theme.palette.fileDrop,
    },
    [`&.statusBarActive`]: {
      height: `calc(100vh - 214px) !important`,
    },
  },
});
