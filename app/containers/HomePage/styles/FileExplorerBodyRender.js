import { mixins } from '../../../styles/js';
import {
  PANE_FOOTER_HEIGHT,
  PANE_FOOTER_SPACE,
} from './FileExplorerTableFooterRender';

// height of the sticky "Sort by" bar at the top of the list
const SORT_BAR_HEIGHT = 56;

export const styles = (theme) => ({
  root: {
    position: 'relative',
    width: '100%',
    ...mixins({ theme }).noselect,
  },
  // The files run down to the bottom of the window, under the pane footer,
  // which floats over them blurred; the list keeps the footer's room after
  // its last row, so nothing stays hidden under it.
  tableWrapper: {
    position: 'relative',
    ...mixins({ theme }).noOutline,
    // down to the bottom of the window: everything but the toolbar and the
    // search bar above this area
    height: `calc(100vh - 130px)`,
    boxSizing: 'border-box',
    paddingBottom: PANE_FOOTER_SPACE,
    overflowY: 'auto',
    overflowX: 'auto',
    '--pane-footer-height': `${PANE_FOOTER_HEIGHT}px`,
    // the scrollbar runs only beside the files: not over the sticky sort bar
    // and not under the footer
    '&::-webkit-scrollbar-track:vertical': {
      marginTop: SORT_BAR_HEIGHT,
      marginBottom: PANE_FOOTER_HEIGHT,
    },
    borderLeft: `solid 1px ${theme.palette.fileExplorerThinLineDividerColor}`,
    [`&.onHoverDropZone`]: {
      backgroundColor: theme.palette.fileDrop,
    },
  },
});
