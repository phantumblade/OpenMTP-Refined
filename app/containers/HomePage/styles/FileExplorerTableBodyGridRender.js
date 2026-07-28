import { mixins } from '../../../styles/js';

export const styles = (theme) => ({
  wrapper: {},
  itemWrapper: {
    position: 'relative',
    boxSizing: 'border-box',
    width: 118,
    height: 155,
    padding: 5,
    borderRadius: 10,
    transition: 'background-color 180ms ease, transform 180ms ease',
    cursor: 'default',
    outline: 'none',
    '&:focus-visible': {
      boxShadow: `0 0 0 3px ${theme.palette.focusRing}`,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  itemContent: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  itemCheckBox: {
    position: 'absolute',
    zIndex: 3,
    top: 1,
    left: 1,
    padding: 3,
    borderRadius: 7,
    backgroundColor: theme.palette.statusSurface,
    border: `1px solid ${theme.palette.divider}`,
    '& svg': {
      fontSize: 21,
    },
  },
  fileTypeIcon: {
    width: 'auto',
    height: 80,
  },
  filePreview: {
    width: 80,
    height: 80,
    objectFit: 'cover',
    borderRadius: 8,
    boxShadow: theme.shadows[1],
    transition: 'width 180ms ease, height 180ms ease, opacity 180ms ease',
  },
  fileTypeIconWrapper: {
    ...mixins({ theme }).center,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  itemSelected: {
    backgroundColor: `${theme.palette.selectionBg} !important`,
  },
  itemMultiSelect: {
    padding: 11,
    '& $fileTypeIcon, & $filePreview': {
      maxWidth: 68,
      width: 'auto',
      height: 68,
    },
    '& $fileTypeIconWrapper': {
      paddingTop: 8,
      paddingBottom: 12,
    },
  },
  itemSelectedMulti: {
    backgroundColor: 'transparent !important',
    '& $filePreview, & $fileTypeIcon': {
      opacity: 0.82,
    },
    '& $fileTypeIconWrapper': {
      borderRadius: 10,
      boxShadow: `inset 0 0 0 2px ${theme.palette.selectionBorder}`,
    },
  },
  videoPreviewWrapper: {
    position: 'relative',
    display: 'flex',
  },
  videoPreviewLoading: {
    backgroundColor: theme.palette.action.hover,
  },
  videoPlayBadge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    display: 'flex',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    color: theme.palette.secondary.contrastText,
    backgroundColor: 'rgba(18, 22, 31, 0.72)',
    backdropFilter: 'blur(4px)',
    '& svg': {
      fontSize: 18,
    },
  },
  itemFileName: {
    wordBreak: `break-all`,
    textAlign: `center`,
  },
  itemFileNameWrapper: {
    marginLeft: 12,
    marginRight: 12,
    marginTop: -8,
    textAlign: `center`,
  },
});
