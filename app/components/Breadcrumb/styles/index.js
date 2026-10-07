import { mixins } from '../../../styles/js';
import { alphaHex, m3State } from '../../../styles/m3/tokens';

export const styles = (theme) => {
  return {
    root: {
      width: '100%',
      height: '100%',
    },

    rootBreadcrumbs: {
      width: '100%',
      height: '100%',
    },

    breadcrumb: {
      padding: '8px 14px',
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      overflowY: 'hidden',
      whiteSpace: 'nowrap',
      scrollbarWidth: 'thin',
      ...mixins({ theme }).resetUl,
      '&::-webkit-scrollbar': {
        height: 4,
      },
      '&::-webkit-scrollbar-thumb': {
        borderRadius: 4,
        backgroundColor: alphaHex(theme.palette.m3.onSurfaceVariant, 0.38),
      },
    },

    breadcrumbLi: {
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 13,
      maxWidth: 240,
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      flexShrink: 0,
    },

    breadcrumbLiA: {
      cursor: 'pointer',
      color: theme.palette.text.secondary,
      textDecoration: 'none',
      padding: '3px 8px',
      borderRadius: 6,
      transition: 'background-color 150ms ease, color 150ms ease',
      '&:hover': {
        color: theme.palette.m3.primary,
        backgroundColor: alphaHex(theme.palette.m3.onSurface, m3State.hover),
      },
    },

    breadcrumbActiveA: {
      fontWeight: 700,
      color: theme.palette.m3.onSecondaryContainer,
      backgroundColor: theme.palette.m3.secondaryContainer,
      cursor: 'default',
    },

    breadcrumbSeperator: {
      fontSize: 16,
      color: theme.palette.text.disabled,
      margin: '0 2px',
      verticalAlign: 'middle',
    },
  };
};
