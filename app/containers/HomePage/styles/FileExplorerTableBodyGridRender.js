import { mixins } from '../../../styles/js';
import {
  alphaHex,
  m3Motion,
  m3Shape,
  m3State,
} from '../../../styles/m3/tokens';

export const styles = (theme) => ({
  wrapper: {},
  itemWrapper: {
    position: 'relative',
    boxSizing: 'border-box',
    width: 118,
    height: 155,
    padding: 5,
    borderRadius: m3Shape.large,
    // M3 Expressive: selection morphs the shape with the spatial spring,
    // colours change with the effects spring
    transition: `background-color ${m3Motion.defaultEffects}, border-radius ${m3Motion.fastSpatial}`,
    cursor: 'default',
    outline: 'none',
    '&:hover': {
      backgroundColor: alphaHex(theme.palette.m3.onSurface, m3State.hover),
    },
    // M3 focus indicator, keyboard focus only
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.m3.secondary}`,
      outlineOffset: 2,
    },
    '& $fileTypeIconWrapper': {
      transition: `transform ${m3Motion.fastSpatial}`,
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
  // folder closed to OpenMTP (macOS permission)
  lockBadge: {
    position: 'absolute',
    left: 'calc(50% + 14px)',
    bottom: 10,
    zIndex: 1,
    display: 'grid',
    placeItems: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.palette.m3.secondaryContainer,
    color: theme.palette.m3.onSecondaryContainer,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
  },
  fileTypeIconWrapper: {
    ...mixins({ theme }).center,
    position: 'relative',
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  itemSelected: {
    borderRadius: m3Shape.extraLarge,
    backgroundColor: `${theme.palette.m3.secondaryContainer} !important`,
    '& $itemFileName': {
      color: theme.palette.m3.onSecondaryContainer,
      fontWeight: 600,
    },
    '& $fileTypeIconWrapper': {
      transform: 'scale(1.05)',
    },
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
    borderRadius: m3Shape.extraLarge,
    backgroundColor: `${theme.palette.m3.secondaryContainer} !important`,
    '& $itemFileName': {
      color: theme.palette.m3.onSecondaryContainer,
      fontWeight: 600,
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
